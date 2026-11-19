import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';
import { getDb, ensureTables } from '@/lib/db';
import { TEAM_USERS_DIRECTORY, getDirectoryUserByEmail } from '@/lib/types';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Inicio de sesión de desarrollo deshabilitado en producción.' },
      { status: 403 }
    );
  }

  const emailParam = request.nextUrl.searchParams.get('email');
  const roleParam = request.nextUrl.searchParams.get('role') || 'admin';

  const targetUser =
    (emailParam ? getDirectoryUserByEmail(emailParam) : undefined) ||
    (roleParam === 'sales'
      ? getDirectoryUserByEmail('expansioncomercia.gohb@gmail.com')
      : getDirectoryUserByEmail('artes.grupoorganico@gmail.com')) ||
    TEAM_USERS_DIRECTORY[0];

  try {
    const sql = getDb();
    if (sql) {
      await ensureTables();
      await sql`
        INSERT INTO user_profiles (
          id, name, email, role, initials, department, last_login
        ) VALUES (
          ${targetUser.id},
          ${targetUser.name},
          ${targetUser.email},
          ${targetUser.role},
          ${targetUser.initials},
          ${targetUser.department},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          initials = EXCLUDED.initials,
          department = EXCLUDED.department,
          last_login = CURRENT_TIMESTAMP;
      `;
    }
  } catch (err) {
    console.error('Error updating user_profile in dev-login:', err);
  }

  await createSessionCookie({
    id: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    role: targetUser.role
  });

  const baseUrl = new URL('/', request.url);
  return NextResponse.redirect(baseUrl);
}

