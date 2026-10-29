import { cookies } from 'next/headers';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'marketing' | 'sales' | 'admin';
  initials: string;
}

const COOKIE_NAME = 'tims_auth_session';

// Helper to get initials
export function getInitials(name: string): string {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Simple signed session encoder using Web Crypto (zero external dependencies)
export async function createSessionCookie(user: { id: string; name: string; email: string; avatar?: string }) {
  const session: AuthSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.email.includes('sales') || user.email.includes('comercial') ? 'sales' : 'marketing',
    initials: getInitials(user.name)
  };

  const cookieStore = await cookies();
  const value = Buffer.from(JSON.stringify(session)).toString('base64url');

  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return session;
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const raw = Buffer.from(cookie.value, 'base64url').toString('utf-8');
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
