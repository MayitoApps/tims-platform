import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || 'marketing';
  
  await createSessionCookie({
    id: role === 'sales' ? 'dev-sales-1' : 'dev-mkt-1',
    name: role === 'sales' ? 'Dirección Comercial' : 'Gerencia Marketing',
    email: role === 'sales' ? 'expansioncomercia.gohb@gmail.com' : 'marketinggrupoorganico@gmail.com'
  });

  const baseUrl = new URL('/', request.url);
  return NextResponse.redirect(baseUrl);
}

