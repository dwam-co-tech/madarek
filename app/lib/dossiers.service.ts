import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { ArticleDTO } from './issues.model';
import type { CreateDossierPayload, DeleteDossierResponse, Dossier, DossierDetailResponse, DossierResponse, UpdateDossierPayload } from './dossiers.model';

export class DossierRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'DossierRequestError';
  }
}

const validationMessages: Record<string, string> = {
  title: 'يرجى إدخال عنوان صالح للملف.',
  slug: 'الرابط غير صالح أو مستخدم في هذا العدد. استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.',
  intro: 'يرجى مراجعة مقدمة الملف.',
  status: 'الحالة غير صالحة.',
  article_ids: 'تحقق من المقالات المحددة: يجب أن تنتمي إلى هذا العدد وألا تتكرر.',
  cover_image: 'صورة الغلاف غير صالحة. اختر صورة JPEG أو PNG أو WebP بالحجم المسموح.',
};

function errorFor(status: number, data: unknown): DossierRequestError {
  const body = data && typeof data === 'object' ? data as { errors?: unknown } : {};
  const errors = body.errors && typeof body.errors === 'object' ? body.errors as Record<string, unknown> : {};
  const fields = Object.keys(errors);
  const safeErrors: Record<string, string[]> = {};
  for (const field of fields) {
    const label = field.startsWith('article_ids.') ? 'article_ids' : field;
    safeErrors[field] = [validationMessages[label] ?? 'يرجى مراجعة البيانات المدخلة.'];
  }
  const message = status === 401 ? 'انتهت جلسة الدخول. يرجى تسجيل الدخول مجدداً.'
    : status === 403 ? 'ليس لديك صلاحية لإدارة ملفات هذا العدد.'
    : status === 404 ? 'العنصر المطلوب غير موجود.'
    : status === 422 ? (fields.length ? safeErrors[fields[0]][0] : 'يرجى مراجعة البيانات المدخلة.')
    : 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.';
  if (status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('madarek:unauthorized'));
  return new DossierRequestError(message, status, safeErrors);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  try {
    res = await fetch(buildApiUrl(path), {
      ...init,
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    });
  } catch {
    throw new DossierRequestError('تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.', 0);
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw errorFor(res.status, data);
  return data as T;
}

function formData(payload: CreateDossierPayload | UpdateDossierPayload): FormData {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('slug', payload.slug);
  form.append('intro', payload.intro);
  form.append('status', payload.status);
  payload.article_ids.forEach((id, index) => form.append(`article_ids[${index}]`, String(id)));
  if (payload.cover_image instanceof File) form.append('cover_image', payload.cover_image);
  if (payload.cover_image === null) form.append('cover_image', '');
  return form;
}

export const getDossiers = (issueId: number) => request<Dossier[]>(`/api/admin/issues/${issueId}/dossiers`);
export const getDossier = (id: number) => request<DossierDetailResponse>(`/api/admin/dossiers/${id}`);
export const getAdminIssueArticles = (issueId: number) => request<ArticleDTO[]>(`/api/admin/issues/${issueId}/articles`);
export const createDossier = (issueId: number, payload: CreateDossierPayload) => request<DossierResponse>(`/api/admin/issues/${issueId}/dossiers`, { method: 'POST', body: formData(payload) });
export const updateDossier = async (id: number, payload: UpdateDossierPayload) => {
  if (!(payload.cover_image instanceof File)) {
    return request<DossierResponse>(`/api/admin/dossiers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
  }
  const form = formData(payload);
  // PHP does not populate multipart PUT request files/fields; Laravel honors method spoofing.
  form.append('_method', 'PUT');
  const result = await request<DossierResponse>(`/api/admin/dossiers/${id}`, { method: 'POST', body: form });
  // Multipart cannot encode an empty PHP array. Explicitly clear associations with JSON PUT.
  if (!payload.article_ids.length) {
    return request<DossierResponse>(`/api/admin/dossiers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ article_ids: [] }),
    });
  }
  return result;
};
export const deleteDossier = (id: number) => request<DeleteDossierResponse>(`/api/admin/dossiers/${id}`, { method: 'DELETE' });
