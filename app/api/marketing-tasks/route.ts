import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToMarketingTask } from '@/lib/db';
import { INITIAL_MARKETING_TASKS } from '@/lib/initial-data';
import { MarketingTask } from '@/lib/types';


export async function GET() {
  const sql = getDb();

  if (!sql) {
    return NextResponse.json({
      source: 'local',
      tasks: INITIAL_MARKETING_TASKS
    });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM marketing_tasks
      ORDER BY due_date ASC, created_at DESC;
    `;

    const tasks = rows.map(mapRowToMarketingTask);
    return NextResponse.json({
      source: 'postgres',
      tasks
    });
  } catch (error) {
    console.error('Error fetching marketing tasks from DB:', error);
    return NextResponse.json({
      source: 'local_fallback',
      tasks: INITIAL_MARKETING_TASKS
    });
  }
}

export async function POST(request: Request) {
  try {
    const task: MarketingTask = await request.json();
    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', task });
    }

    await ensureTables();
    await sql`
      INSERT INTO marketing_tasks (
        id, code, title, hotel_target, category, stage, priority,
        requested_by, assigned_to, due_date, description, asset_url, created_at
      ) VALUES (
        ${task.id}, ${task.code}, ${task.title}, ${task.hotelTarget},
        ${task.category}, ${task.stage}, ${task.priority},
        ${task.requestedBy}, ${task.assignedTo}, ${task.dueDate},
        ${task.description || ''}, ${task.assetUrl || null}, ${task.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        hotel_target = EXCLUDED.hotel_target,
        category = EXCLUDED.category,
        stage = EXCLUDED.stage,
        priority = EXCLUDED.priority,
        requested_by = EXCLUDED.requested_by,
        assigned_to = EXCLUDED.assigned_to,
        due_date = EXCLUDED.due_date,
        description = EXCLUDED.description,
        asset_url = EXCLUDED.asset_url,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true, source: 'postgres', task });
  } catch (error) {
    console.error('Error saving marketing task to DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

