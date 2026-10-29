import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await clearSession();
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'tims-platform-tau.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return NextResponse.redirect(`${protocol}://${host}`);
}
