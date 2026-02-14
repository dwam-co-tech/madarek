import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { GetArticlesResponse, ArticleDetailResponse, UpdateArticlePayload, UpdateArticleResponse } from './articles.model';
import type { ArticleDTO } from './issues.model';

export async function getPublishedArticles(page = 1, perPage?: number, issueId?: number | string): Promise<GetArticlesResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const params = new URLSearchParams({ status: 'published', page: String(page) });
  if (perPage) params.set('per_page', String(perPage));
  if (issueId !== undefined) params.set('issue_id', String(issueId));
  const res = await fetch(buildApiUrl(`/api/articles?${params.toString()}`), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    let msg = 'فشل جلب المقالات';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as GetArticlesResponse;
}

export async function getAllPublishedArticles(issueId?: number | string): Promise<ArticleDTO[]> {
  const first = await getPublishedArticles(1, undefined, issueId);
  const all: ArticleDTO[] = [...first.data];
  for (let p = 2; p <= first.last_page; p++) {
    const next = await getPublishedArticles(p, undefined, issueId);
    all.push(...next.data);
  }
  return all;
}

export async function getArticleById(id: number | string): Promise<ArticleDetailResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl(`/api/articles/${id}`), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل جلب المقال';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as ArticleDetailResponse;
}

export async function updateArticle(id: number | string, payload: UpdateArticlePayload): Promise<UpdateArticleResponse> {
  const baseHeaders: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) baseHeaders['Authorization'] = `Bearer ${token}`;
  const send = async (method: string, body: BodyInit, extraHeaders?: Record<string, string>) => {
    const res = await fetch(buildApiUrl(`/api/articles/${id}`), {
      method,
      headers: { ...baseHeaders, ...(extraHeaders ?? {}) },
      body,
    });
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { res, data };
  };
  const hasFile = (typeof payload.featured_image !== 'undefined' && payload.featured_image !== null) ||
    (typeof payload.pdf_file !== 'undefined' && payload.pdf_file !== null);
  if (hasFile) {
    const makeForm = () => {
      const form = new FormData();
      if (payload.title) form.append('title', payload.title);
      if (payload.open_title) form.append('open_title', payload.open_title);
      if (payload.keywords) form.append('keywords', payload.keywords);
      if (payload.author_name) form.append('author_name', payload.author_name);
      if (payload.gregorian_date) form.append('gregorian_date', payload.gregorian_date);
      if (payload.hijri_date) form.append('hijri_date', payload.hijri_date);
      if (Array.isArray(payload.references)) {
        for (const ref of payload.references) {
          if (ref && typeof ref === 'object' && ref.title && ref.url) {
            form.append('references[]', JSON.stringify(ref));
          }
        }
      }
      if (payload.references_tmp) form.append('references_tmp', payload.references_tmp);
      if (Array.isArray(payload.references_remove_indexes)) {
        for (const idx of payload.references_remove_indexes) {
          form.append('references_remove_indexes[]', String(idx));
        }
      }
      if (payload.status) form.append('status', payload.status);
      if (payload.className) form.append('className', payload.className);
      if (typeof payload.content === 'string') form.append('content', payload.content);
      if (payload.featured_image) form.append('featured_image', payload.featured_image);
      if (payload.pdf_file) form.append('pdf_file', payload.pdf_file);
      return form;
    };
    const attempts = [
      () => {
        const f = makeForm();
        (f as FormData).append('_method', 'PUT');
        return send('POST', f);
      },
      () => {
        const f = makeForm();
        (f as FormData).append('_method', 'PATCH');
        return send('POST', f);
      },
      () => send('PUT', makeForm()),
    ];
    for (const run of attempts) {
      const { res, data } = await run();
      if (res.ok && typeof data === 'object' && data !== null) {
        return data as UpdateArticleResponse;
      }
      if (res.status !== 405) {
        let msg = 'فشل تحديث المقال';
        if (typeof data === 'object' && data !== null) {
          const maybe = data as { message?: unknown; error?: unknown };
          if (typeof maybe.message === 'string') msg = maybe.message;
          else if (typeof maybe.error === 'string') msg = maybe.error;
        }
        throw new Error(msg);
      }
    }
    throw new Error('فشل تحديث المقال');
  } else {
    const jsonHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    const attempts = [
      () => send('PUT', JSON.stringify(payload), jsonHeaders),
      () => send('PATCH', JSON.stringify(payload), jsonHeaders),
      () => send('POST', JSON.stringify(payload), { ...jsonHeaders, 'X-HTTP-Method-Override': 'PUT' }),
    ];
    for (const run of attempts) {
      const { res, data } = await run();
      if (res.ok && typeof data === 'object' && data !== null) {
        return data as UpdateArticleResponse;
      }
      if (res.status !== 405) {
        let msg = 'فشل تحديث المقال';
        if (typeof data === 'object' && data !== null) {
          const maybe = data as { message?: unknown; error?: unknown };
          if (typeof maybe.message === 'string') msg = maybe.message;
          else if (typeof maybe.error === 'string') msg = maybe.error;
        }
        throw new Error(msg);
      }
    }
    throw new Error('فشل تحديث المقال');
  }
}

export async function recordArticleView(id: number | string): Promise<void> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    await fetch(buildApiUrl(`/api/articles/${id}/view`), {
      method: 'POST',
      headers,
    });
  } catch (error) {
    console.error('Failed to record view', error);
  }
}
