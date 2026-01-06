import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { GetUsersResponse, AddUserPayload, AddUserResponse, UpdateUserPayload, UpdateUserResponse, DeleteUserResponse, AdminUserDTO } from './admins.model';

export async function getUsers(page = 1): Promise<GetUsersResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const params = new URLSearchParams({ page: String(page) });
  const res = await fetch(buildApiUrl(`/api/all-users?${params.toString()}`), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل جلب المستخدمين';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as GetUsersResponse;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  let msg = fallback;
  if (typeof data === 'object' && data !== null) {
    const obj = data as { message?: unknown; error?: unknown; errors?: Record<string, unknown> };
    if (typeof obj.message === 'string') msg = obj.message;
    else if (typeof obj.error === 'string') msg = obj.error;
    else if (obj.errors && typeof obj.errors === 'object') {
      const errs = obj.errors as Record<string, unknown>;
      for (const key of Object.keys(errs)) {
        const v = errs[key];
        if (Array.isArray(v) && typeof v[0] === 'string') {
          msg = v[0] as string;
          break;
        }
      }
    }
  }
  return msg;
}

function normalizeUser(data: unknown): AdminUserDTO | null {
  if (typeof data === 'object' && data !== null) {
    const obj = data as { user?: unknown };
    const cand = obj.user ?? data;
    if (typeof cand === 'object' && cand !== null) {
      const u = cand as Partial<AdminUserDTO>;
      if (typeof u.id === 'number' && typeof u.name === 'string' && typeof u.email === 'string') {
        return u as AdminUserDTO;
      }
    }
  }
  return null;
}

export async function addUser(payload: AddUserPayload): Promise<AdminUserDTO> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/add-user'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, 'فشل إضافة المستخدم'));
  }
  const user = normalizeUser(data);
  if (!user) {
    throw new Error('نجاح إضافة المستخدم بدون بيانات');
  }
  return user;
}

export async function updateUser(id: number | string, payload: UpdateUserPayload): Promise<AdminUserDTO> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const clean: Record<string, string> = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => typeof v === 'string' && v.trim() !== '')
  ) as Record<string, string>;
  const url = buildApiUrl(`/api/update-user/${id}`);
  const send = async (method: string, body: BodyInit, extraHeaders?: Record<string, string>) => {
    const res = await fetch(url, {
      method,
      headers: { ...headers, ...(extraHeaders ?? {}) },
      body,
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {}
    return { res, data };
  };
  const attempts = [
    () => send('PUT', JSON.stringify(clean)),
    () => send('PATCH', JSON.stringify(clean)),
    () => send('POST', JSON.stringify(clean), { 'X-HTTP-Method-Override': 'PUT' }),
  ];
  for (const run of attempts) {
    const { res, data } = await run();
    if (res.ok) {
      const user = normalizeUser(data);
      if (!user) {
        throw new Error('نجاح تحديث المستخدم بدون بيانات');
      }
      return user;
    }
    if (res.status !== 405) {
      throw new Error(extractErrorMessage(data, 'فشل تحديث المستخدم'));
    }
  }
  throw new Error('فشل تحديث المستخدم');
}

export async function deleteUser(id: number | string): Promise<DeleteUserResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl(`/api/delete-user/${id}`), {
    method: 'DELETE',
    headers,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, 'فشل حذف المستخدم'));
  }
  const message =
    (typeof data === 'object' && data !== null
      ? (data as { message?: string }).message
      : undefined) ?? 'تم حذف المستخدم بنجاح';
  return { message };
}
