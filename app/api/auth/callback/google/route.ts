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

  // Validación de estado Anti-CSRF
  const storedState = request.cookies.get('tims_oauth_state')?.value;
  if (storedState && state && storedState !== state) {
    console.error('Alerta de seguridad: Discrepancia en el parámetro state de OAuth (posible CSRF).');
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

    // 3. Registrar / Actualizar perfil en Postgres para recopilar la base de usuarios
    try {
      const { getDb, ensureTables } = await import('@/lib/db');
      const { isAdminEmail } = await import('@/lib/types');
      const { getInitials } = await import('@/lib/auth');
      const sql = getDb();
      if (sql) {
        await ensureTables();
        const role = isAdminEmail(userData.email)
          ? 'admin'
          : userData.email.includes('sales') || userData.email.includes('comercial')
          ? 'sales'
          : 'marketing';
        const initials = getInitials(userData.name || userData.email);

        await sql`
          INSERT INTO user_profiles (id, name, email, avatar, role, initials, last_login)
          VALUES (
            ${userData.sub || `usr-${Date.now()}`},
            ${userData.name || userData.email.split('@')[0]},
            ${userData.email},
            ${userData.picture || null},
            ${role},
            ${initials},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            avatar = EXCLUDED.avatar,
            role = EXCLUDED.role,
            initials = EXCLUDED.initials,
            last_login = CURRENT_TIMESTAMP;
        `;
      }
    } catch (dbErr) {
      console.error('Error guardando perfil de usuario en base de datos:', dbErr);
    }

    // 4. Crear sesión en cookie segura
    await createSessionCookie({
      id: userData.sub,
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      avatar: userData.picture
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

