import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir endpoints públicos de autenticación
  if (
    pathname.startsWith('/api/auth/google') ||
    pathname.startsWith('/api/auth/callback/google') ||
    pathname.startsWith('/api/auth/me') ||
    pathname.startsWith('/api/auth/logout')
  ) {
    return NextResponse.next();
  }

  // 2. Bloquear dev-login terminantemente en entorno de producción
  if (pathname.startsWith('/api/auth/dev-login')) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Not Found', { status: 404 });
    }
    return NextResponse.next();
  }

  // 3. Proteger todas las rutas de API (/api/*) contra accesos anónimos
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acceso no autorizado. Se requiere sesión activa para consultar o modificar información.'
        },
        { status: 401 }
      );
    }

    // Inyectar datos de usuario verificado en los headers de la solicitud
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.id);
    requestHeaders.set('x-user-email', session.email);
    requestHeaders.set('x-user-role', session.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};

