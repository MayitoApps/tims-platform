import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') || 'marketing';
  
  await createSessionCookie({
    id: role === 'sales' ? 'dev-sales-1' : 'dev-mkt-1',
    name: role === 'sales' ? 'Carlos Mendoza (Comercial)' : 'Elena Rostova (Marketing)',
    email: role === 'sales' ? 'carlos.mendoza@grupoorganico.com' : 'elena.rostova@grupoorganico.com'
  });

  const baseUrl = new URL('/', request.url);
  return NextResponse.redirect(baseUrl);
}

