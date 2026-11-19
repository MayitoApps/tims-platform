import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { requireAuthSession, requireAdminSession } from '@/lib/auth';
import { CommercialTask, isUserAdmin, matchesUserIdentity } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const { id } = await params;
    const updates: Partial<CommercialTask> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();

    if (!isUserAdmin(session)) {
      const existing = await sql`SELECT assigned_email, assigned_to, created_by FROM commercial_tasks WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        return NextResponse.json({ success: false, error: 'Tarea no encontrada' }, { status: 404 });
      }
      const row = existing[0];
      if (
        !matchesUserIdentity(session, row.assigned_email, row.assigned_to) &&
        !matchesUserIdentity(session, undefined, row.created_by)
      ) {
        return NextResponse.json({ success: false, error: 'No puedes modificar tareas de otro compañero.' }, { status: 403 });
      }
    }

    if (Object.keys(updates).length === 1 && updates.stage) {
      await sql`
        UPDATE commercial_tasks
        SET stage = ${updates.stage}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    } else {
      await sql`
        UPDATE commercial_tasks
        SET
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description}, description),
          hotel_target = COALESCE(${updates.hotelTarget}, hotel_target),
          deal_id = COALESCE(${updates.dealId}, deal_id),
          deal_title = COALESCE(${updates.dealTitle}, deal_title),
          assigned_to = COALESCE(${updates.assignedTo}, assigned_to),
          assigned_email = COALESCE(${updates.assignedEmail}, assigned_email),
          priority = COALESCE(${updates.priority}, priority),
          stage = COALESCE(${updates.stage}, stage),
          due_date = COALESCE(${updates.dueDate}, due_date),
          comments = COALESCE(${updates.comments ? JSON.stringify(updates.comments) : null}::jsonb, comments),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error updating commercial task in DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
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
    await sql`
      DELETE FROM commercial_tasks
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting commercial task from DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

