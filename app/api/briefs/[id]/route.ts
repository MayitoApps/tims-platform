import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { requireAuthSession, requireAdminSession } from '@/lib/auth';
import { CreativeBrief, isUserAdmin, matchesUserIdentity } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const { id } = await params;
    const updates: Partial<CreativeBrief> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
    if (!isUserAdmin(session)) {
      const existing = await sql`SELECT author FROM creative_briefs WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: 'Brief no encontrado' }, { status: 404 });
      }
      if (!matchesUserIdentity(session, undefined, existing[0].author)) {
        return NextResponse.json({ success: false, error: 'No puedes modificar briefs de otro compañero.' }, { status: 403 });
      }
    }

    await sql`
      UPDATE creative_briefs
      SET
        title = COALESCE(${updates.title ?? null}, title),
        hotel_target = COALESCE(${updates.hotelTarget ?? null}, hotel_target),
        category = COALESCE(${updates.category ?? null}, category),
        objective = COALESCE(${updates.objective ?? null}, objective),
        target_audience = COALESCE(${updates.targetAudience ?? null}, target_audience),
        key_message = COALESCE(${updates.keyMessage ?? null}, key_message),
        deliverables = COALESCE(${updates.deliverables ? JSON.stringify(updates.deliverables) : null}::jsonb, deliverables)
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id, updates });
  } catch (error) {
    console.error('Error updating brief in DB:', error);
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
    await sql`DELETE FROM creative_briefs WHERE id = ${id};`;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting brief from DB:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
