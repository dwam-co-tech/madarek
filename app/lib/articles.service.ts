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
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl(`/api/articles/${id}`), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل تحديث المقال';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as UpdateArticleResponse;
}
