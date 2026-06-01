import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
  ApiValidationError,
  BankSchedulePayload,
  BankNotification,
  DispatchActionResult,
  DispatchDetails,
  NotificationBankSchedule,
  NotificationDispatch,
  NotificationPayload,
  NotificationSchedule,
  Paginated,
  SchedulePayload,
} from './notification-bank.model';

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T; errors?: Record<string, string[]> };

function authHeaders(extra?: Record<string, string>) {
  const token = getAuthToken();
  return {
    Accept: 'application/json',
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function apiErrorMessage(status: number, data: unknown, fallback: string) {
  if (status === 401) return 'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.';
  if (status === 403) return 'لا تملك صلاحية الوصول لهذه الصفحة.';
  if (status >= 500) return 'حدث خطأ في الخادم. حاول مرة أخرى لاحقا.';
  if (typeof data === 'object' && data !== null) {
    const obj = data as { message?: unknown; error?: unknown };
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.error === 'string') return obj.error;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}, fallback = 'تعذر تنفيذ الطلب'): Promise<T> {
  const res = await fetch(buildApiUrl(path), init).catch(() => {
    throw new Error('تعذر الاتصال بالخادم');
  });
  const data = await readJson(res);
  if (!res.ok) {
    const err = new Error(apiErrorMessage(res.status, data, fallback)) as ApiValidationError;
    err.status = res.status;
    if (typeof data === 'object' && data !== null && 'errors' in data) {
      err.errors = (data as { errors?: Record<string, string[]> }).errors;
    } else if (typeof data === 'object' && data !== null && 'error' in data) {
      const details = (data as { error?: { details?: Record<string, string[]> } }).error?.details;
      if (details) err.errors = details;
    }
    throw err;
  }
  return data as T;
}

function query(params: Record<string, string | number | null | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function listBankNotifications(params: Record<string, string | number | undefined>): Promise<Paginated<BankNotification>> {
  const data = await request<ApiEnvelope<Paginated<BankNotification>>>(
    `/api/admin/notifications${query(params)}`,
    { headers: authHeaders() },
    'فشل جلب الإشعارات'
  );
  return data.data ?? { items: [], pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: null, to: null } };
}

export async function getBankNotification(id: number | string): Promise<BankNotification> {
  const data = await request<ApiEnvelope<BankNotification>>(`/api/admin/notifications/${id}`, { headers: authHeaders() }, 'فشل جلب الإشعار');
  if (!data.data) throw new Error('لم يتم العثور على الإشعار');
  return data.data;
}

export async function createBankNotification(payload: NotificationPayload): Promise<BankNotification> {
  const data = await request<ApiEnvelope<BankNotification>>(
    '/api/admin/notifications',
    { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) },
    'فشل إنشاء الإشعار'
  );
  if (!data.data) throw new Error('فشل إنشاء الإشعار');
  return data.data;
}

export async function updateBankNotification(id: number | string, payload: NotificationPayload): Promise<BankNotification> {
  const data = await request<ApiEnvelope<BankNotification>>(
    `/api/admin/notifications/${id}`,
    { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) },
    'فشل تحديث الإشعار'
  );
  if (!data.data) throw new Error('فشل تحديث الإشعار');
  return data.data;
}

export async function archiveBankNotification(id: number | string): Promise<void> {
  await request(`/api/admin/notifications/${id}`, { method: 'DELETE', headers: authHeaders() }, 'فشل أرشفة الإشعار');
}

export async function sendNotificationNow(id: number | string): Promise<DispatchActionResult> {
  const data = await request<ApiEnvelope<DispatchActionResult>>(
    `/api/admin/notifications/${id}/send-now`,
    { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({}) },
    'فشل إرسال الإشعار'
  );
  if (!data.data?.dispatch) throw new Error('لم يرجع الخادم محاولة الإرسال');
  return data.data;
}

export async function getNotificationSchedule(id: number | string): Promise<NotificationSchedule | null> {
  const data = await request<ApiEnvelope<{ notification_id: number; schedule: NotificationSchedule | null }>>(
    `/api/admin/notifications/${id}/schedule`,
    { headers: authHeaders() },
    'فشل جلب الجدول'
  );
  return data.data?.schedule ?? null;
}

export async function saveNotificationSchedule(id: number | string, payload: SchedulePayload): Promise<NotificationSchedule> {
  const data = await request<ApiEnvelope<{ notification_id: number; schedule: NotificationSchedule }>>(
    `/api/admin/notifications/${id}/schedule`,
    { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) },
    'فشل حفظ الجدول'
  );
  if (!data.data?.schedule) throw new Error('فشل حفظ الجدول');
  return data.data.schedule;
}

export async function deleteNotificationSchedule(id: number | string): Promise<void> {
  await request(`/api/admin/notifications/${id}/schedule`, { method: 'DELETE', headers: authHeaders() }, 'فشل حذف الجدول');
}

export async function getBankSchedule(): Promise<NotificationBankSchedule | null> {
  const data = await request<ApiEnvelope<{ schedule: NotificationBankSchedule | null }>>(
    '/api/admin/notifications/bank-schedule',
    { headers: authHeaders() },
    'فشل جلب جدول نشر البنك'
  );
  return data.data?.schedule ?? null;
}

export async function saveBankSchedule(payload: BankSchedulePayload): Promise<NotificationBankSchedule> {
  const data = await request<ApiEnvelope<{ schedule: NotificationBankSchedule }>>(
    '/api/admin/notifications/bank-schedule',
    { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(payload) },
    'فشل حفظ جدول نشر البنك'
  );
  if (!data.data?.schedule) throw new Error('فشل حفظ جدول نشر البنك');
  return data.data.schedule;
}

export async function deleteBankSchedule(): Promise<void> {
  await request('/api/admin/notifications/bank-schedule', { method: 'DELETE', headers: authHeaders() }, 'فشل حذف جدول نشر البنك');
}

export async function listDispatches(params: Record<string, string | number | undefined>): Promise<Paginated<NotificationDispatch>> {
  const data = await request<ApiEnvelope<Paginated<NotificationDispatch>>>(
    `/api/admin/notification-dispatches${query(params)}`,
    { headers: authHeaders() },
    'فشل جلب سجلات الإرسال'
  );
  return data.data ?? { items: [], pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: null, to: null } };
}

export async function listNotificationDispatches(id: number | string, params: Record<string, string | number | undefined>): Promise<Paginated<NotificationDispatch>> {
  const data = await request<ApiEnvelope<Paginated<NotificationDispatch>>>(
    `/api/admin/notifications/${id}/dispatches${query(params)}`,
    { headers: authHeaders() },
    'فشل جلب سجلات الإرسال'
  );
  return data.data ?? { items: [], pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: null, to: null } };
}

export async function getDispatchDetails(id: number | string): Promise<DispatchDetails> {
  const data = await request<ApiEnvelope<DispatchDetails>>(`/api/admin/notification-dispatches/${id}`, { headers: authHeaders() }, 'فشل جلب تفاصيل الإرسال');
  if (!data.data) throw new Error('لم يتم العثور على سجل الإرسال');
  return data.data;
}

export async function retryDispatch(id: number | string): Promise<DispatchActionResult> {
  const data = await request<ApiEnvelope<DispatchActionResult>>(
    `/api/admin/notification-dispatches/${id}/retry`,
    { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({}) },
    'فشل إعادة المحاولة'
  );
  if (!data.data?.dispatch) throw new Error('لم يرجع الخادم محاولة الإرسال');
  return data.data;
}
