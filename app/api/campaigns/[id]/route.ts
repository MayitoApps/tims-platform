import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { requireAuthSession, requireAdminSession } from '@/lib/auth';
import { MarketingCampaign, isUserAdmin, matchesUserIdentity } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const { id } = await params;
    const updates: Partial<MarketingCampaign> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
    if (!isUserAdmin(session) && session.role !== 'marketing') {
      const existing = await sql`SELECT lead_owner FROM marketing_campaigns WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: 'Campaña no encontrada' }, { status: 404 });
      }
      if (!matchesUserIdentity(session, undefined, existing[0].lead_owner)) {
        return NextResponse.json({ success: false, error: 'No puedes modificar campañas de otro compañero.' }, { status: 403 });
      }
    }

    await sql`
      UPDATE marketing_campaigns
      SET
        title = COALESCE(${updates.title ?? null}, title),
        hotel_target = COALESCE(${updates.hotelTarget ?? null}, hotel_target),
        hotel_targets = COALESCE(${updates.hotelTargets ? JSON.stringify(updates.hotelTargets) : null}::jsonb, hotel_targets),
        type = COALESCE(${updates.type ?? null}, type),
        status = COALESCE(${updates.status ?? null}, status),
        budget = COALESCE(${updates.budget ?? null}, budget),
        spent = COALESCE(${updates.spent ?? null}, spent),
        start_date = COALESCE(${updates.startDate ?? null}, start_date),
        end_date = COALESCE(${updates.endDate ?? null}, end_date),
        channels = COALESCE(${updates.channels ? JSON.stringify(updates.channels) : null}::jsonb, channels),
        external_links = COALESCE(${updates.externalLinks ? JSON.stringify(updates.externalLinks) : null}::jsonb, external_links),
        lead_owner = COALESCE(${updates.leadOwner ?? null}, lead_owner),
        description = COALESCE(${updates.description ?? null}, description),
        checklist = COALESCE(${updates.checklist ? JSON.stringify(updates.checklist) : null}::jsonb, checklist),
        comments = COALESCE(${updates.comments ? JSON.stringify(updates.comments) : null}::jsonb, comments)
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
    const auth = await requireAdminSession();
    if (auth.errorResponse) return auth.errorResponse;

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
