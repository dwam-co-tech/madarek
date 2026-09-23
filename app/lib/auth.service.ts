import { buildApiUrl } from './api';
import type { AuthResponse, User, LogoutResponse } from './auth.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
export const ADMIN_LAST_ACTIVITY_KEY = 'admin_last_activity_at';
export const ADMIN_INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;
const ADMIN_COOKIE_MAX_AGE = ADMIN_INACTIVITY_TIMEOUT / 1000;

export async function checkAuth(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(buildApiUrl('/api/user'), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (res.ok) {
      const user = await res.json() as User;
      if (user.role !== 'admin' && user.role !== 'author') {
        clearAuth();
        return null;
      }
      setAuthUser(user);
      return user;
    } else if (res.status === 401 || res.status === 403) {
      clearAuth();
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(buildApiUrl('/api/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status >= 500) throw new Error('حدث خطأ في الخادم. حاول مرة أخرى لاحقًا.');
    if (res.status === 404) throw new Error('خدمة تسجيل الدخول غير متاحة.');
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
  if (auth.user.role !== 'admin' && auth.user.role !== 'author') {
    throw new Error('لا تملك صلاحية الدخول إلى لوحة الإدارة.');
  }
  setAuth(auth);
  return auth;
}

export function setAuth(auth: AuthResponse) {
  try {
    localStorage.setItem(TOKEN_KEY, auth.token);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(Date.now()));
  } catch { }
  document.cookie = `admin_token=true; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `admin_role=${encodeURIComponent(auth.user.role)}; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
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

export function setAuthUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch { }
  if (user) {
    document.cookie = `admin_role=${encodeURIComponent(user.role)}; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_LAST_ACTIVITY_KEY);
  } catch { }
  document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function logout(): Promise<LogoutResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(buildApiUrl('/api/logout'), {
      method: 'POST',
      headers,
    });
  } catch {
    clearAuth();
    return { message: 'تم تسجيل الخروج محليًا.' } as LogoutResponse;
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch { }
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

export function getLastAdminActivity(): number | null {
  try {
    const value = Number(localStorage.getItem(ADMIN_LAST_ACTIVITY_KEY));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function recordAdminActivity(at = Date.now()): void {
  try {
    localStorage.setItem(ADMIN_LAST_ACTIVITY_KEY, String(at));
  } catch { }
  if (getAuthToken()) {
    document.cookie = `admin_token=true; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
    const user = getAuthUser();
    if (user) {
      document.cookie = `admin_role=${encodeURIComponent(user.role)}; path=/; max-age=${ADMIN_COOKIE_MAX_AGE}; samesite=lax`;
    }
  }
}
