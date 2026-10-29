import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { MarketingCampaign } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<MarketingCampaign> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
    await sql`
      UPDATE marketing_campaigns
      SET
        title = COALESCE(${updates.title ?? null}, title),
        hotel_target = COALESCE(${updates.hotelTarget ?? null}, hotel_target),
        type = COALESCE(${updates.type ?? null}, type),
        status = COALESCE(${updates.status ?? null}, status),
        budget = COALESCE(${updates.budget ?? null}, budget),
        start_date = COALESCE(${updates.startDate ?? null}, start_date),
        end_date = COALESCE(${updates.endDate ?? null}, end_date),
        channels = COALESCE(${updates.channels ? JSON.stringify(updates.channels) : null}::jsonb, channels),
        description = COALESCE(${updates.description ?? null}, description)
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id, updates });
  } catch (error) {
    console.error('Error updating campaign in DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id });
    }

    await ensureTables();
    await sql`DELETE FROM marketing_campaigns WHERE id = ${id};`;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting campaign from DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
