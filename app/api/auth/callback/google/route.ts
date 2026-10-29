import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'tims-platform-tau.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}?auth_error=${encodeURIComponent(error || 'missing_code')}`);
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

    // 3. Crear sesión en cookie segura
    await createSessionCookie({
      id: userData.sub,
      name: userData.name || userData.email.split('@')[0],
      email: userData.email,
      avatar: userData.picture
    });

    // 4. Redirigir a la app autenticado
    return NextResponse.redirect(`${baseUrl}?auth_success=true`);
  } catch (err) {
    console.error('Error en autenticación OAuth:', err);
    return NextResponse.redirect(`${baseUrl}?auth_error=internal_error`);
  }
}

