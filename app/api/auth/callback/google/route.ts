import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'tims-platform-tau.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Validación estricta de estado Anti-CSRF
  const storedState = request.cookies.get('tims_oauth_state')?.value;
  if (!storedState || !state || storedState !== state) {
    console.error('Alerta de seguridad: Discrepancia o ausencia del parámetro state de OAuth (posible CSRF).');
    const res = NextResponse.redirect(`${baseUrl}?auth_error=csrf_validation_failed`);
    res.cookies.delete('tims_oauth_state');
    return res;
  }

  if (error || !code) {
    const res = NextResponse.redirect(`${baseUrl}?auth_error=${encodeURIComponent(error || 'missing_code')}`);
    res.cookies.delete('tims_oauth_state');
    return res;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}?auth_error=missing_credentials`);
  }

  try {
    // 1. Intercambiar código por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Error al intercambiar token:', errText);
      return NextResponse.redirect(`${baseUrl}?auth_error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();

    // 2. Obtener datos del perfil del usuario en Google
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    if (!userinfoResponse.ok) {
      return NextResponse.redirect(`${baseUrl}?auth_error=userinfo_failed`);
    }

    const userData = await userinfoResponse.json();

    // 3. Registrar / Sincronizar perfil en Postgres (reconociendo pre-alta de usuario por correo)
    const cleanEmail = String(userData.email || '').toLowerCase().trim();
    const { isAdminEmail, getDirectoryUserByEmail } = await import('@/lib/types');
    const { getInitials } = await import('@/lib/auth');
    const dirUser = getDirectoryUserByEmail(cleanEmail);

    let userRole: 'marketing' | 'sales' | 'admin' = dirUser
      ? dirUser.role
      : isAdminEmail(cleanEmail)
      ? 'admin'
      : 'sales';
    let resolvedName: string = dirUser?.name || userData.name || cleanEmail.split('@')[0];
    let resolvedInitials: string = dirUser?.initials || getInitials(resolvedName);
    let resolvedDepartment: string | null = dirUser?.department || null;

    try {
      const { getDb, ensureTables } = await import('@/lib/db');
      const sql = getDb();
      if (sql) {
        await ensureTables();

        // Verificar si el usuario ya estaba pre-registrado en la base de datos
        const existingRows = await sql`
          SELECT id, role, name, initials, department FROM user_profiles
          WHERE LOWER(email) = ${cleanEmail}
          LIMIT 1;
        `;

        if (existingRows.length > 0) {
          const existing = existingRows[0];
          resolvedName = dirUser?.name || existing.name || resolvedName;
          resolvedInitials = dirUser?.initials || existing.initials || resolvedInitials;
          resolvedDepartment = dirUser?.department || existing.department || resolvedDepartment;
          if (isAdminEmail(cleanEmail)) {
            userRole = 'admin';
          } else if (dirUser?.role) {
            userRole = dirUser.role;
          } else if (existing.role) {
            userRole = existing.role as 'marketing' | 'sales' | 'admin';
          }

          await sql`
            UPDATE user_profiles
            SET
              name = ${resolvedName},
              avatar = COALESCE(${userData.picture || null}, avatar),
              role = ${userRole},
              initials = ${resolvedInitials},
              department = COALESCE(${resolvedDepartment}, department),
              last_login = CURRENT_TIMESTAMP
            WHERE LOWER(email) = ${cleanEmail};
          `;
        } else {
          if (!dirUser && !isAdminEmail(cleanEmail)) {
            const denyRes = NextResponse.redirect(`${baseUrl}?auth_error=unauthorized_email`);
            denyRes.cookies.delete('tims_oauth_state');
            return denyRes;
          }

          await sql`
            INSERT INTO user_profiles (id, name, email, avatar, role, initials, department, last_login)
            VALUES (
              ${dirUser?.id || userData.sub || `usr-${Date.now()}`},
              ${resolvedName},
              ${cleanEmail},
              ${userData.picture || null},
              ${userRole},
              ${resolvedInitials},
              ${resolvedDepartment},
              CURRENT_TIMESTAMP
            )
            ON CONFLICT (email) DO UPDATE SET
              avatar = COALESCE(EXCLUDED.avatar, user_profiles.avatar),
              name = COALESCE(user_profiles.name, EXCLUDED.name),
              role = CASE
                WHEN ${isAdminEmail(cleanEmail)} THEN 'admin'
                ELSE COALESCE(user_profiles.role, EXCLUDED.role)
              END,
              initials = COALESCE(user_profiles.initials, EXCLUDED.initials),
              last_login = CURRENT_TIMESTAMP;
          `;
        }
      }
    } catch (dbErr) {
      console.error('Error guardando perfil de usuario en base de datos:', dbErr);
    }

    // 4. Crear sesión en cookie segura con el nombre oficial y rol sincronizado
    await createSessionCookie({
      id: dirUser?.id || userData.sub,
      name: resolvedName,
      email: cleanEmail,
      avatar: userData.picture,
      role: userRole
    });

    // 5. Redirigir a la app autenticado y limpiar cookie de estado CSRF
    const successRes = NextResponse.redirect(`${baseUrl}?auth_success=true`);
    successRes.cookies.delete('tims_oauth_state');
    return successRes;
  } catch (err) {
    console.error('Error en autenticación OAuth:', err);
    const errRes = NextResponse.redirect(`${baseUrl}?auth_error=internal_error`);
    errRes.cookies.delete('tims_oauth_state');
    return errRes;
  }
}

