import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToCommercialTask } from '@/lib/db';
import { CommercialTask } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ source: 'local', tasks: [] });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM commercial_tasks
      ORDER BY created_at DESC;
    `;
    const tasks = rows.map(mapRowToCommercialTask);
    return NextResponse.json({ source: 'postgres', tasks });
  } catch (error) {
    console.error('Error fetching commercial tasks from DB:', error);
    return NextResponse.json({ source: 'local_fallback', tasks: [] });
  }
}

export async function POST(request: Request) {
  try {
    const raw: Partial<CommercialTask> = await request.json();
    const taskId = raw.id || `ctask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = raw.createdAt || new Date().toISOString().split('T')[0];

    const task: CommercialTask = {
      ...raw,
      id: taskId,
      code: raw.code || `TK-${Date.now().toString().slice(-4)}`,
      title: raw.title || 'Nueva Tarea Comercial',
      description: raw.description || '',
      hotelTarget: raw.hotelTarget || 'Orgánico Ajusco',
      dealId: raw.dealId || undefined,
      dealTitle: raw.dealTitle || undefined,
      assignedTo: raw.assignedTo || 'Comercial',
      assignedEmail: raw.assignedEmail || undefined,
      priority: raw.priority || 'alta',
      stage: raw.stage || 'solicitud',
      dueDate: (raw.dueDate || new Date().toISOString().split('T')[0]).slice(0, 10),
      createdBy: raw.createdBy || 'Sistema',
      comments: Array.isArray(raw.comments) ? raw.comments : [],
      createdAt
    };

    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', task });
    }

    await ensureTables();
    await sql`
      INSERT INTO commercial_tasks (
        id, code, title, description, hotel_target, deal_id, deal_title,
        assigned_to, assigned_email, priority, stage, due_date,
        created_by, comments, created_at
      ) VALUES (
        ${task.id}, ${task.code}, ${task.title}, ${task.description || ''},
        ${task.hotelTarget}, ${task.dealId || null}, ${task.dealTitle || null},
        ${task.assignedTo}, ${task.assignedEmail || null}, ${task.priority || 'alta'},
        ${task.stage || 'solicitud'}, ${task.dueDate}, ${task.createdBy},
        ${JSON.stringify(task.comments || [])}::jsonb, ${task.createdAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        hotel_target = EXCLUDED.hotel_target,
        deal_id = EXCLUDED.deal_id,
        deal_title = EXCLUDED.deal_title,
        assigned_to = EXCLUDED.assigned_to,
        assigned_email = EXCLUDED.assigned_email,
        priority = EXCLUDED.priority,
        stage = EXCLUDED.stage,
        due_date = EXCLUDED.due_date,
        comments = EXCLUDED.comments,
        updated_at = CURRENT_TIMESTAMP;
    `;

    return NextResponse.json({ success: true, source: 'postgres', task });
  } catch (error) {
    console.error('Error saving commercial task to DB:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

