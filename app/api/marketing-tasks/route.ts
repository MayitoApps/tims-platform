import { NextResponse } from 'next/server';
import { getDb, ensureTables, mapRowToMarketingTask } from '@/lib/db';
import { INITIAL_MARKETING_TASKS } from '@/lib/initial-data';
import { MarketingTask, isUserAdmin, matchesUserIdentity } from '@/lib/types';
import { requireAuthSession, NO_STORE_HEADERS } from '@/lib/auth';


export async function GET() {
  const auth = await requireAuthSession();
  if (auth.errorResponse) return auth.errorResponse;
  const { session } = auth;

  const sql = getDb();

  if (!sql) {
    return NextResponse.json(
      { source: 'local', tasks: INITIAL_MARKETING_TASKS },
      { headers: NO_STORE_HEADERS }
    );
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM marketing_tasks
      ORDER BY due_date ASC, created_at DESC;
    `;

    let tasks = rows.map(mapRowToMarketingTask);

    if (!isUserAdmin(session)) {
      tasks = tasks.filter(
        (t) =>
          matchesUserIdentity(session, t.assignedEmail, t.assignedTo) ||
          matchesUserIdentity(session, undefined, t.requestedBy)
      );
    }

    return NextResponse.json(
      { source: 'postgres', tasks },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error('Error fetching marketing tasks from DB:', error);
    return NextResponse.json(
      { source: 'local_fallback', tasks: INITIAL_MARKETING_TASKS },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const raw: Partial<MarketingTask> = await request.json();
    const taskId = raw.id || `mtask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = raw.createdAt || new Date().toISOString().split('T')[0];

    const task: MarketingTask = {
      ...raw,
      id: taskId,
      code: raw.code || `REQ-${Date.now().toString().slice(-4)}`,
      title: raw.title || 'Nuevo Requerimiento',
      hotelTarget: raw.hotelTarget || 'Orgánico Ajusco',
      category: raw.category || 'diseno_grafico',
      stage: raw.stage || 'backlog',
      priority: raw.priority || 'alta',
      requestedBy: raw.requestedBy || session.name || 'Marketing',
      assignedTo: raw.assignedTo || 'Diseño',
      assignedEmail: raw.assignedEmail || undefined,
      dueDate: (raw.dueDate || new Date().toISOString().split('T')[0]).slice(0, 10),
      description: raw.description || '',
      assetUrl: raw.assetUrl || undefined,
      checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
      comments: Array.isArray(raw.comments) ? raw.comments : [],
      format: raw.format || undefined,
      hotelTargets: Array.isArray(raw.hotelTargets) ? raw.hotelTargets : [],
      createdAt
    };

    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', task });
    }

    await ensureTables();
    await sql`
      INSERT INTO marketing_tasks (
        id, code, title, hotel_target, category, stage, priority,
        requested_by, assigned_to, due_date, description, asset_url, checklist,
        comments, format, hotel_targets, assigned_email, created_at
      ) VALUES (
        ${task.id}, ${task.code}, ${task.title}, ${task.hotelTarget},
        ${task.category}, ${task.stage}, ${task.priority},
        ${task.requestedBy}, ${task.assignedTo}, ${task.dueDate},
        ${task.description || ''}, ${task.assetUrl || null},
        ${JSON.stringify(task.checklist || [])}::jsonb,
        ${JSON.stringify(task.comments || [])}::jsonb,
        ${task.format || null},
        ${JSON.stringify(task.hotelTargets || [])}::jsonb,
        ${task.assignedEmail || null},
        ${task.createdAt}
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
        checklist = EXCLUDED.checklist,
        comments = EXCLUDED.comments,
        format = EXCLUDED.format,
        hotel_targets = EXCLUDED.hotel_targets,
        assigned_email = EXCLUDED.assigned_email,
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

