import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { CreativeBrief } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<CreativeBrief> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores autorizados pueden eliminar briefs.' },
        { status: 403 }
      );
    }

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
