import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToBrief } from '@/lib/db';
import { INITIAL_BRIEFS } from '@/lib/initial-data';
import { CreativeBrief, isUserAdmin, matchesUserIdentity } from '@/lib/types';
import { requireAuthSession, NO_STORE_HEADERS } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuthSession();
  if (auth.errorResponse) return auth.errorResponse;
  const { session } = auth;

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', briefs: INITIAL_BRIEFS }, { headers: NO_STORE_HEADERS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM creative_briefs
      ORDER BY date ASC, created_at DESC;
    `;
    let briefs = rows.map(mapRowToBrief);
    if (!isUserAdmin(session)) {
      briefs = briefs.filter((b) => matchesUserIdentity(session, undefined, b.author));
    }
    return NextResponse.json({ source: 'postgres', briefs }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching briefs from DB:', error);
    return NextResponse.json(
      { source: 'local_fallback', briefs: INITIAL_BRIEFS },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;

    const raw: Partial<CreativeBrief> = await request.json();
    const briefId = raw.id || `brf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const date = (raw.date || new Date().toISOString().split('T')[0]).slice(0, 10);

    const brief: CreativeBrief = {
      ...raw,
      id: briefId,
      title: raw.title || 'Nuevo Brief Creativo',
      hotelTarget: raw.hotelTarget || 'Orgánico Ajusco',
      category: raw.category || 'campana_digital',
      objective: raw.objective || '',
      targetAudience: raw.targetAudience || '',
      keyMessage: raw.keyMessage || '',
      deliverables: Array.isArray(raw.deliverables) ? raw.deliverables : [],
      author: raw.author || 'Marketing',
      date
    };

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', brief });
    }

    await ensureTables();
    await sql`
      INSERT INTO creative_briefs (
        id, title, hotel_target, category, objective, target_audience,
        key_message, deliverables, author, date
      ) VALUES (
        ${brief.id}, ${brief.title}, ${brief.hotelTarget}, ${brief.category},
        ${brief.objective}, ${brief.targetAudience}, ${brief.keyMessage},
        ${JSON.stringify(brief.deliverables || [])}::jsonb,
        ${brief.author}, ${brief.date}
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hotel_target = EXCLUDED.hotel_target,
        category = EXCLUDED.category,
        objective = EXCLUDED.objective,
        target_audience = EXCLUDED.target_audience,
        key_message = EXCLUDED.key_message,
        deliverables = EXCLUDED.deliverables;
    `;

    return NextResponse.json({ success: true, source: 'postgres', brief });
  } catch (error) {
    console.error('Error creating brief in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
