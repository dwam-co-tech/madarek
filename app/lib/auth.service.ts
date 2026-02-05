import { buildApiUrl } from './api';
import type { AuthResponse, User, LogoutResponse } from './auth.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl('/api/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    let msg = (data && (data.message || data.error)) || 'خطأ في تسجيل الدخول';
    if (typeof msg === 'string') {
      const m = msg.toLowerCase();
      if (m.includes('credentials do not match')) {
        msg = 'تأكد من الايميل او الباسورد';
      }
    }
    throw new Error(msg);
  }
  const auth = data as AuthResponse;
  setAuth(auth);
  return auth;
}

export function setAuth(auth: AuthResponse) {
  try {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  } catch {}
  document.cookie = 'admin_token=true; path=/; max-age=86400';
  document.cookie = `admin_role=${encodeURIComponent(auth.user.role)}; path=/; max-age=86400`;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
  document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function logout(): Promise<LogoutResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(buildApiUrl('/api/logout'), {
    method: 'POST',
    headers,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  clearAuth();
  if (!res.ok) {
    const msg =
      typeof data === 'object' && data !== null
        ?
          ((data as { message?: string; error?: string }).message ||
            (data as { message?: string; error?: string }).error ||
            'خطأ في تسجيل الخروج')
        : 'خطأ في تسجيل الخروج';
    throw new Error(msg);
  }
  const result =
    (data as LogoutResponse) ?? ({ message: 'Logged out successfully.' } as LogoutResponse);
  return result;
}
