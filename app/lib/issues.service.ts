import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
  CreateIssuePayload,
  CreateIssueResponse,
  IssueDTO,
  IssueDetailDTO,
  ArticleDTO,
  DeleteIssueResponse,
  UpdateIssuePayload,
  UpdateIssueResponse,
  PublishIssueResponse,
  UnpublishIssueResponse,
} from './issues.model';

function toSlug(input: string): string {
  return input.trim().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}\-]+/gu, '').toLowerCase();
}

function makeAuthHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function ensureOk(res: Response, data: unknown, fallback: string) {
  if (res.ok) return;
  let msg = fallback;
  if (typeof data === 'object' && data !== null) {
    const maybe = data as { message?: unknown; error?: unknown };
    if (typeof maybe.message === 'string') msg = maybe.message;
    else if (typeof maybe.error === 'string') msg = maybe.error;
  }
  throw new Error(msg);
}

export async function createIssue(payload: CreateIssuePayload): Promise<CreateIssueResponse> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('slug', payload.slug ?? toSlug(payload.title));
  if (payload.hijri_date) form.append('hijri_date', payload.hijri_date);
  if (payload.gregorian_date) form.append('gregorian_date', payload.gregorian_date);
  form.append('status', payload.status ?? 'draft');
  if (payload.published_at) form.append('published_at', payload.published_at);
  if (payload.cover_image) form.append('cover_image', payload.cover_image);
  if (payload.cover_image_alt) form.append('cover_image_alt', payload.cover_image_alt);
  else if (payload.cover_image) form.append('cover_image_alt', payload.cover_image);
  if (payload.pdf_file) form.append('pdf_file', payload.pdf_file);
  const res = await fetch(buildApiUrl('/api/issues'), {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: form,
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل إنشاء العدد');
  return data as CreateIssueResponse;
}

export async function getIssues(): Promise<IssueDTO[]> {
  const res = await fetch(buildApiUrl('/api/issues'), {
    method: 'GET',
    headers: makeAuthHeaders(),
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل جلب الأعداد');
  if (Array.isArray(data)) return data as IssueDTO[];
  const obj = data as { issues?: unknown; data?: unknown };
  if (Array.isArray(obj.issues)) return obj.issues as IssueDTO[];
  if (Array.isArray(obj.data)) return obj.data as IssueDTO[];
  return [];
}

export async function getPublishedIssues(): Promise<IssueDTO[]> {
  const params = new URLSearchParams({ status: 'published' });
  const res = await fetch(buildApiUrl(`/api/issues?${params.toString()}`), {
    method: 'GET',
    headers: makeAuthHeaders(),
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل جلب الأعداد المنشورة');
  if (Array.isArray(data)) return data as IssueDTO[];
  const obj = data as { issues?: unknown; data?: unknown };
  if (Array.isArray(obj.issues)) return obj.issues as IssueDTO[];
  if (Array.isArray(obj.data)) return obj.data as IssueDTO[];
  if (typeof data === 'object' && data !== null) {
    const vals = Object.values(data);
    if (Array.isArray(vals) && vals.every((v) => typeof v === 'object' && v !== null)) {
      return vals as IssueDTO[];
    }
  }
  return [];
}

export async function publishIssue(id: number | string): Promise<PublishIssueResponse> {
  const form = new FormData();
  form.append('status', 'published');
  const res = await fetch(buildApiUrl(`/api/issues/${id}/publish`), {
    method: 'POST',
    headers: makeAuthHeaders({ Accept: 'application/json' }),
    body: form,
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل نشر العدد');
  return data as PublishIssueResponse;
}

export async function unpublishIssue(id: number | string): Promise<UnpublishIssueResponse> {
  const form = new FormData();
  form.append('status', 'draft');
  const res = await fetch(buildApiUrl(`/api/issues/${id}/publish`), {
    method: 'POST',
    headers: makeAuthHeaders({ Accept: 'application/json' }),
    body: form,
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل إلغاء نشر العدد');
  return data as UnpublishIssueResponse;
}

export async function getIssue(id: number | string): Promise<IssueDetailDTO> {
  const res = await fetch(buildApiUrl(`/api/issues/${id}`), {
    method: 'GET',
    headers: makeAuthHeaders(),
  });
  const data = await parseJson(res);
  if (!res.ok || typeof data !== 'object' || data === null) {
    ensureOk(res, data, 'فشل جلب بيانات العدد');
  }
  return data as IssueDetailDTO;
}

export async function getIssueArticles(id: number | string): Promise<ArticleDTO[]> {
  const res = await fetch(buildApiUrl(`/api/issues/${id}/articles`), {
    method: 'GET',
    headers: makeAuthHeaders({ Accept: 'application/json' }),
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل جلب مقالات العدد');
  if (Array.isArray(data)) return data as ArticleDTO[];
  const obj = data as { articles?: unknown; data?: unknown };
  if (Array.isArray(obj.articles)) return obj.articles as ArticleDTO[];
  if (Array.isArray(obj.data)) return obj.data as ArticleDTO[];
  return [];
}

export async function deleteIssue(id: number | string): Promise<DeleteIssueResponse> {
  const res = await fetch(buildApiUrl(`/api/issues/${id}`), {
    method: 'DELETE',
    headers: makeAuthHeaders(),
  });
  const data = await parseJson(res);
  ensureOk(res, data, 'فشل حذف العدد');
  const result =
    (typeof data === 'object' && data !== null
      ? (data as DeleteIssueResponse)
      : ({ message: 'تم حذف العدد بنجاح' } as DeleteIssueResponse));
  return result;
}

export async function updateIssue(id: number | string, payload: UpdateIssuePayload): Promise<UpdateIssueResponse> {
  const baseHeaders: Record<string, string> = makeAuthHeaders({ Accept: 'application/json' });
  const hasFiles = Boolean(payload.cover_image || payload.cover_image_alt || payload.pdf_file);
  const makeForm = () => {
    const form = new FormData();
    if (payload.title) form.append('title', payload.title);
    if (payload.slug) form.append('slug', payload.slug);
    if (payload.hijri_date) form.append('hijri_date', payload.hijri_date);
    if (payload.gregorian_date) form.append('gregorian_date', payload.gregorian_date);
    if (payload.status) form.append('status', payload.status);
    if (payload.published_at) form.append('published_at', payload.published_at);
    if (typeof payload.issue_number === 'number') form.append('issue_number', String(payload.issue_number));
    if (typeof payload.sort_order === 'number') form.append('sort_order', String(payload.sort_order));
    if (typeof payload.is_featured === 'boolean') form.append('is_featured', String(payload.is_featured));
    if (payload.cover_image) form.append('cover_image', payload.cover_image);
    if (payload.cover_image_alt) form.append('cover_image_alt', payload.cover_image_alt);
    if (payload.pdf_file) form.append('pdf_file', payload.pdf_file);
    return form;
  };
  const send = async (method: string, body: BodyInit, extraHeaders?: Record<string, string>) => {
    const res = await fetch(buildApiUrl(`/api/issues/${id}`), {
      method,
      headers: { ...baseHeaders, ...(extraHeaders ?? {}) },
      body,
    });
    const data = await parseJson(res);
    return { res, data };
  };
  if (hasFiles) {
    const attempts = [
      () => {
        const f = makeForm();
        f.append('_method', 'PUT');
        return send('POST', f);
      },
      () => {
        const f = makeForm();
        f.append('_method', 'PATCH');
        return send('POST', f);
      },
      () => send('PUT', makeForm()),
    ];
    for (const run of attempts) {
      const { res, data } = await run();
      if (res.ok) return data as UpdateIssueResponse;
      if (res.status !== 405) {
        ensureOk(res, data, 'فشل تحديث العدد');
      }
    }
    throw new Error('فشل تحديث العدد');
  } else {
    const jsonHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const attempts = [
      () => send('PUT', JSON.stringify(payload), jsonHeaders),
      () => send('PATCH', JSON.stringify(payload), jsonHeaders),
      () => send('POST', JSON.stringify(payload), { ...jsonHeaders, 'X-HTTP-Method-Override': 'PUT' }),
    ];
    for (const run of attempts) {
      const { res, data } = await run();
      if (res.ok) return data as UpdateIssueResponse;
      if (res.status !== 405) {
        ensureOk(res, data, 'فشل تحديث العدد');
      }
    }
    throw new Error('فشل تحديث العدد');
  }
}
