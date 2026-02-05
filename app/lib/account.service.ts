import { buildApiUrl } from './api';
import { getAuthToken, getAuthUser, setAuthUser } from './auth.service';
import type { UpdateEmailResponse, UpdatePasswordResponse } from './account.model';

export async function updatePassword(payload: { password: string; new_password: string; new_password_confirmation: string }): Promise<UpdatePasswordResponse> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/user/password'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    let msg = 'فشل تحديث كلمة المرور';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown; errors?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
      else if (typeof maybe.errors === 'object' && maybe.errors !== null) {
        const first = Object.values(maybe.errors as Record<string, unknown>)[0];
        if (typeof first === 'string') msg = first;
        else if (Array.isArray(first) && typeof first[0] === 'string') msg = first[0];
      }
    }
    throw new Error(msg);
  }
  const message =
    (typeof data === 'object' && data !== null
      ? (data as { message?: string }).message
      : undefined) ?? 'تم تحديث كلمة المرور بنجاح';
  return { message };
}

export async function updateEmail(payload: { password: string; new_email: string }): Promise<UpdateEmailResponse> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/user/email'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    let msg = 'فشل تحديث البريد الإلكتروني';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown; errors?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
      else if (typeof maybe.errors === 'object' && maybe.errors !== null) {
        const first = Object.values(maybe.errors as Record<string, unknown>)[0];
        if (typeof first === 'string') msg = first;
        else if (Array.isArray(first) && typeof first[0] === 'string') msg = first[0];
      }
    }
    throw new Error(msg);
  }

  const message =
    (typeof data === 'object' && data !== null
      ? (data as { message?: string }).message
      : undefined) ?? 'تم تحديث البريد الإلكتروني بنجاح';

  const returnedUser =
    typeof data === 'object' && data !== null ? (data as { user?: unknown }).user : undefined;
  if (returnedUser && typeof returnedUser === 'object' && returnedUser !== null) {
    setAuthUser(returnedUser as import('./auth.model').User);
  } else {
    const u = getAuthUser();
    if (u) setAuthUser({ ...u, email: payload.new_email });
  }

  return { message, user: (returnedUser as import('./auth.model').User | undefined) ?? undefined };
}

