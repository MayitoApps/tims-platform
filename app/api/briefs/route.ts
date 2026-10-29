import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToBrief } from '@/lib/db';
import { INITIAL_BRIEFS } from '@/lib/initial-data';
import { CreativeBrief } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', briefs: INITIAL_BRIEFS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM creative_briefs
      ORDER BY date ASC, created_at DESC;
    `;
    const briefs = rows.map(mapRowToBrief);
    return NextResponse.json({ source: 'postgres', briefs });
  } catch (error) {
    console.error('Error fetching briefs from DB:', error);
    return NextResponse.json({ source: 'local_fallback', briefs: INITIAL_BRIEFS });
  }
}

export async function POST(request: Request) {
  try {
    const brief: CreativeBrief = await request.json();
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
