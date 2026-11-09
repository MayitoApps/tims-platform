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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, department, phone } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: 'Nombre y correo son requeridos para dar de alta.' },
        { status: 400 }
      );
    }

    const sql = getDb();
    if (!sql) {
      return NextResponse.json({ success: true, source: 'local' });
    }

    await ensureTables();
    const cleanEmail = email.toLowerCase().trim();
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    const cleanRole = role || 'sales';
    const id = `user-pre-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await sql`
      INSERT INTO user_profiles (
        id, name, email, role, initials, department, phone, created_at
      ) VALUES (
        ${id}, ${name.trim()}, ${cleanEmail}, ${cleanRole}, ${initials}, ${department || null}, ${phone || null}, CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        initials = EXCLUDED.initials,
        department = COALESCE(EXCLUDED.department, user_profiles.department),
        phone = COALESCE(EXCLUDED.phone, user_profiles.phone);
    `;

    return NextResponse.json({
      success: true,
      user: { id, name: name.trim(), email: cleanEmail, role: cleanRole, initials, department }
    });
  } catch (error) {
    console.error('Error pre-registering user in DB:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email && !id) {
      return NextResponse.json(
        { success: false, error: 'ID o correo requerido para eliminar usuario.' },
        { status: 400 }
      );
    }

    const sql = getDb();
    if (!sql) return NextResponse.json({ success: true, source: 'local' });

    await ensureTables();
    if (email) {
      await sql`DELETE FROM user_profiles WHERE LOWER(email) = LOWER(${email.trim()})`;
    } else if (id) {
      await sql`DELETE FROM user_profiles WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user from DB:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

