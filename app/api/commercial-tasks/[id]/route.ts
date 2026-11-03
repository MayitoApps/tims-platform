import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { CommercialTask } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<CommercialTask> = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', id, updates });
    }

    await ensureTables();

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

