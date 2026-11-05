import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || 'marketing';
  
  let email = 'marketinggrupoorganico@gmail.com';
  let name = 'Gerencia Marketing';

  if (role === 'sales') {
    email = 'expansioncomercia.gohb@gmail.com';
    name = 'Dirección Comercial';
  } else if (role === 'artes' || role === 'artes_admin') {
    email = 'artes.grupoorganico@gmail.com';
    name = 'Dirección de Arte y Diseño';
  }

  await createSessionCookie({
    id: `dev-${role}-1`,
    name,
    email
  });

  const baseUrl = new URL('/', request.url);
  return NextResponse.redirect(baseUrl);
}

