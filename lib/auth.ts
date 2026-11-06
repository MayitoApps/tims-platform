import { cookies } from 'next/headers';
import { isAdminEmail } from './types';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'marketing' | 'sales' | 'admin';
  initials: string;
}

export const COOKIE_NAME = 'tims_auth_session';

const SECRET_KEY = process.env.AUTH_SECRET || 'tims-hospitality-platform-secure-jwt-hmac-secret-2026';

// Helper to get initials
export function getInitials(name: string): string {
  if (!name) return 'TM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Sign payload with HMAC-SHA256
export async function signSession(session: AuthSession): Promise<string> {
  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(session);
  const payloadBase64 = toBase64Url(enc.encode(payloadStr));

  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadBase64));
  const sigBase64 = toBase64Url(sigBuffer);

  return `${payloadBase64}.${sigBase64}`;
}

// Verify signature and parse session
export async function verifySessionToken(token?: string | null): Promise<AuthSession | null> {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadBase64, sigBase64] = parts;

  try {
    const enc = new TextEncoder();
    const key = await getHmacKey();
    const sigBytes = fromBase64Url(sigBase64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadBase64) as unknown as BufferSource
    );

    if (!isValid) return null;

    const dec = new TextDecoder();
    const payloadBytes = fromBase64Url(payloadBase64);
    const jsonStr = dec.decode(payloadBytes);
    return JSON.parse(jsonStr) as AuthSession;
  } catch {
    return null;
  }
}

// Create cryptographically signed session cookie
export async function createSessionCookie(user: { id: string; name: string; email: string; avatar?: string }) {
  const session: AuthSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: isAdminEmail(user.email)
      ? 'admin'
      : user.email.includes('sales') || user.email.includes('comercial')
      ? 'sales'
      : 'marketing',
    initials: getInitials(user.name)
  };

  const token = await signSession(session);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return session;
}

// Extract and verify active session
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  return verifySessionToken(cookie.value);
}

// Clear session cookie
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
