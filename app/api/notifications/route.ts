import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { AppNotification } from '@/lib/types';

export async function GET() {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ success: true, source: 'local', notifications: [] });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT * FROM app_notifications
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    const notifications: AppNotification[] = rows.map((r: any) => ({
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

    return NextResponse.json({ success: true, source: 'postgres', notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, notifications: [] });
  }
}

export async function POST(request: Request) {
  try {
    const notif: AppNotification = await request.json();
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

