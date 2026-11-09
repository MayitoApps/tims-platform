import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';
import { getDb, ensureTables } from '@/lib/db';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || 'sales';
  
  let email = 'expansioncomercia.gohb@gmail.com';
  let name = 'Fernanda Langárica';
  let initials = 'FL';
  let department = 'Dirección Comercial & Expansión';

  if (role === 'artes' || role === 'artes_admin' || role === 'admin' || role === 'mario') {
    email = 'artes.grupoorganico@gmail.com';
    name = 'Mario Avalos';
    initials = 'MA';
    department = 'Dirección de Arte & Diseño';
  }

  // Refrescar perfil y último inicio de sesión en base de datos
  try {
    const sql = getDb();
    if (sql) {
      await ensureTables();
      await sql`
        INSERT INTO user_profiles (
          id, name, email, role, initials, department, last_login
        ) VALUES (
          ${'user-' + initials.toLowerCase() + '-1'},
          ${name},
          ${email},
          'admin',
          ${initials},
          ${department},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = 'admin',
          initials = EXCLUDED.initials,
          department = EXCLUDED.department,
          last_login = CURRENT_TIMESTAMP;
      `;
    }
  } catch (err) {
    console.error('Error updating user_profile in dev-login:', err);
  }

  await createSessionCookie({
    id: `team-${role}-1`,
    name,
    email
  });

  const baseUrl = new URL('/', request.url);
  return NextResponse.redirect(baseUrl);
}

