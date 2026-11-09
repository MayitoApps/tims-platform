import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { UserProfile } from '@/lib/types';

export async function GET(request: Request) {
  // Request header access signals dynamic execution
  request.headers.get('host');
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ success: true, source: 'local', users: [] });
  }

  try {
    await ensureTables();
    const rows = await sql`
      SELECT id, name, email, avatar, role, initials, department, phone, last_login, created_at
      FROM user_profiles
      ORDER BY last_login DESC;
    `;

    const users: (UserProfile & { lastLogin?: string })[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      avatar: r.avatar || undefined,
      role: r.role || 'sales',
      initials: r.initials,
      lastLogin: r.last_login
    }));

    return NextResponse.json(
      { success: true, source: 'postgres', users },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error fetching users from DB:', error);
    return NextResponse.json({ success: false, users: [] });
  }
}

