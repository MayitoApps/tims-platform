import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToPublication } from '@/lib/db';
import { INITIAL_PUBLICATIONS } from '@/lib/initial-data';
import { ContentPublication } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', publications: INITIAL_PUBLICATIONS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM content_publications
      ORDER BY publish_date ASC, created_at DESC;
    `;
    const publications = rows.map(mapRowToPublication);
    return NextResponse.json({ source: 'postgres', publications });
  } catch (error) {
    console.error('Error fetching publications from DB:', error);
    return NextResponse.json({ source: 'local_fallback', publications: INITIAL_PUBLICATIONS });
  }
}

export async function POST(request: Request) {
  try {
    const raw: Partial<ContentPublication> = await request.json();
    const pubId = raw.id || `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publishDate = (raw.publishDate || new Date().toISOString().split('T')[0]).slice(0, 10);

    const pub: ContentPublication = {
      ...raw,
      id: pubId,
      title: raw.title || 'Nueva Publicación',
      hotel: raw.hotel || 'Orgánico Ajusco',
      channel: raw.channel || 'instagram',
      publishDate,
      status: raw.status || 'idea',
      responsible: raw.responsible || 'Marketing',
      assetUrl: raw.assetUrl || undefined
    };

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', pub });
    }

    await ensureTables();
    await sql`
      INSERT INTO content_publications (
        id, title, hotel, channel, publish_date, status, responsible, asset_url
      ) VALUES (
        ${pub.id}, ${pub.title}, ${pub.hotel}, ${pub.channel},
        ${pub.publishDate}, ${pub.status}, ${pub.responsible}, ${pub.assetUrl || null}
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hotel = EXCLUDED.hotel,
        channel = EXCLUDED.channel,
        publish_date = EXCLUDED.publish_date,
        status = EXCLUDED.status,
        responsible = EXCLUDED.responsible,
        asset_url = EXCLUDED.asset_url;
    `;

    return NextResponse.json({ success: true, source: 'postgres', pub });
  } catch (error) {
    console.error('Error creating publication in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
