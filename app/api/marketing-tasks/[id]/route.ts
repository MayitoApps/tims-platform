import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { MarketingTask } from '@/lib/types';


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<MarketingTask> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();

    if (Object.keys(updates).length === 1 && updates.stage) {
      await sql`
        UPDATE marketing_tasks
        SET stage = ${updates.stage}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    } else if (Object.keys(updates).length === 1 && updates.checklist) {
      await sql`
        UPDATE marketing_tasks
        SET checklist = ${JSON.stringify(updates.checklist)}::jsonb, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    } else if (Object.keys(updates).length === 1 && updates.comments) {
      await sql`
        UPDATE marketing_tasks
        SET comments = ${JSON.stringify(updates.comments)}::jsonb, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    } else {
      await sql`
        UPDATE marketing_tasks
        SET
          title = COALESCE(${updates.title}, title),
          hotel_target = COALESCE(${updates.hotelTarget}, hotel_target),
          category = COALESCE(${updates.category}, category),
          stage = COALESCE(${updates.stage}, stage),
          priority = COALESCE(${updates.priority}, priority),
          requested_by = COALESCE(${updates.requestedBy}, requested_by),
          assigned_to = COALESCE(${updates.assignedTo}, assigned_to),
          due_date = COALESCE(${updates.dueDate}, due_date),
          description = COALESCE(${updates.description}, description),
          asset_url = COALESCE(${updates.assetUrl}, asset_url),
          checklist = COALESCE(${updates.checklist ? JSON.stringify(updates.checklist) : null}::jsonb, checklist),
          comments = COALESCE(${updates.comments ? JSON.stringify(updates.comments) : null}::jsonb, comments),
          format = COALESCE(${updates.format}, format),
          hotel_targets = COALESCE(${updates.hotelTargets ? JSON.stringify(updates.hotelTargets) : null}::jsonb, hotel_targets),
          assigned_email = COALESCE(${updates.assignedEmail}, assigned_email),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error updating task in DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores autorizados pueden eliminar requerimientos de marketing.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id });
    }

    await ensureTables();
    await sql`
      DELETE FROM marketing_tasks
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true, source: 'postgres', id });
  } catch (error) {
    console.error('Error deleting marketing task from DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

