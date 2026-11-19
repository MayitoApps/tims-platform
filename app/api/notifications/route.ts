import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { AppNotification, isUserAdmin, matchesUserIdentity } from '@/lib/types';
import { requireAuthSession, requireAdminSession, NO_STORE_HEADERS } from '@/lib/auth';

export async function GET() {
  const auth = await requireAuthSession();
  if (auth.errorResponse) return auth.errorResponse;
  const { session } = auth;

  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ success: true, source: 'local', notifications: [] }, { headers: NO_STORE_HEADERS });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM app_notifications
      ORDER BY created_ts DESC NULLS LAST, created_at DESC
      LIMIT 100;
    `;

    let notifications: AppNotification[] = rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      message: r.message,
      type: r.type,
      targetEmail: r.target_email || undefined,
      targetName: r.target_name || undefined,
      authorName: r.author_name || undefined,
      authorEmail: r.author_email || undefined,
      linkSection: r.link_section || 'marketing',
      targetId: r.target_id || undefined,
      createdAt: r.created_at,
      read: Boolean(r.read)
    }));

    if (!isUserAdmin(session)) {
      notifications = notifications.filter((n) =>
        matchesUserIdentity(session, n.targetEmail, n.targetName)
      );
    }

    return NextResponse.json({ success: true, source: 'postgres', notifications }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, notifications: [] }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;

    const raw: Partial<AppNotification> = await request.json();
    const notifId = raw.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = raw.createdAt || new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    const notif: AppNotification = {
      ...raw,
      id: notifId,
      title: raw.title || 'Notificación del Sistema',
      message: raw.message || '',
      type: raw.type || 'deal_created',
      targetEmail: raw.targetEmail || undefined,
      targetName: raw.targetName || undefined,
      authorName: raw.authorName || undefined,
      authorEmail: raw.authorEmail || undefined,
      linkSection: raw.linkSection || 'marketing',
      targetId: raw.targetId || undefined,
      createdAt,
      read: Boolean(raw.read)
    };

    const sql = getDb();

    if (!sql) {
      return NextResponse.json({ success: true, source: 'local', notif });
    }

    await ensureTables();
    await sql`
      INSERT INTO app_notifications (
        id, title, message, type, target_email, target_name,
        author_name, author_email, link_section, target_id, created_at, read
      ) VALUES (
        ${notif.id}, ${notif.title}, ${notif.message}, ${notif.type},
        ${notif.targetEmail || null}, ${notif.targetName || null},
        ${notif.authorName || null}, ${notif.authorEmail || null},
        ${notif.linkSection || 'marketing'}, ${notif.targetId || null},
        ${notif.createdAt}, ${Boolean(notif.read)}
      )
      ON CONFLICT (id) DO UPDATE SET
        read = EXCLUDED.read;
    `;

    return NextResponse.json({ success: true, source: 'postgres', notif });
  } catch (error) {
    console.error('Error saving notification:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuthSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { session } = auth;

    const body = await request.json();
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local' });
    }

    await ensureTables();

    if (body.all) {
      if (isUserAdmin(session)) {
        await sql`
          UPDATE app_notifications
          SET read = true;
        `;
      } else {
        await sql`
          UPDATE app_notifications
          SET read = true
          WHERE LOWER(COALESCE(target_email, '')) = LOWER(${session.email})
             OR LOWER(COALESCE(target_name, '')) = LOWER(${session.name});
        `;
      }
      return NextResponse.json({ success: true, message: 'Todas marcadas como leídas' });
    }

    if (body.id) {
      const isRead = body.read !== undefined ? Boolean(body.read) : true;
      await sql`
        UPDATE app_notifications
        SET read = ${isRead}
        WHERE id = ${body.id};
      `;
      return NextResponse.json({ success: true, id: body.id, read: isRead });
    }

    return NextResponse.json({ success: false, error: 'Parámetros no válidos' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification read status:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdminSession();
    if (auth.errorResponse) return auth.errorResponse;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local' });
    }

    await ensureTables();
    if (id) {
      await sql`DELETE FROM app_notifications WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM app_notifications WHERE read = true`;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

