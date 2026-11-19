import { NextResponse } from 'next/server';
import { getSession, NO_STORE_HEADERS } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ user: session }, { headers: NO_STORE_HEADERS });
}

