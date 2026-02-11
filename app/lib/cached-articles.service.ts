import { cacheService } from './cache.service';
import * as articlesService from './articles.service';
import type { GetArticlesResponse, ArticleDetailResponse } from './articles.model';
import type { ArticleDTO } from './issues.model';

const CACHE_KEYS = {
  PUBLISHED_ARTICLES: (page: number, issueId?: number | string) => 
    `articles:published:page:${page}${issueId ? `:issue:${issueId}` : ''}`,
  ALL_PUBLISHED_ARTICLES: (issueId?: number | string) => 
    `articles:all:published${issueId ? `:issue:${issueId}` : ''}`,
  ARTICLE_DETAIL: (id: string | number) => `article:${id}`,
};

const CACHE_TTL = {
  PUBLISHED_ARTICLES: 10 * 60 * 1000, // 10 minutes
  ARTICLE_DETAIL: 15 * 60 * 1000, // 15 minutes
};

export async function getPublishedArticles(
  page = 1, 
  perPage?: number, 
  issueId?: number | string
): Promise<GetArticlesResponse> {
  const key = CACHE_KEYS.PUBLISHED_ARTICLES(page, issueId);
  const cached = cacheService.get<GetArticlesResponse>(key);
  if (cached) return cached;

  const data = await articlesService.getPublishedArticles(page, perPage, issueId);
  cacheService.set(key, data, CACHE_TTL.PUBLISHED_ARTICLES);
  return data;
}

export async function getAllPublishedArticles(issueId?: number | string): Promise<ArticleDTO[]> {
  const key = CACHE_KEYS.ALL_PUBLISHED_ARTICLES(issueId);
  const cached = cacheService.get<ArticleDTO[]>(key);
  if (cached) return cached;

  const data = await articlesService.getAllPublishedArticles(issueId);
  cacheService.set(key, data, CACHE_TTL.PUBLISHED_ARTICLES);
  return data;
}

export async function getArticleById(id: number | string): Promise<ArticleDetailResponse> {
  const key = CACHE_KEYS.ARTICLE_DETAIL(id);
  const cached = cacheService.get<ArticleDetailResponse>(key);
  if (cached) return cached;

  const data = await articlesService.getArticleById(id);
  cacheService.set(key, data, CACHE_TTL.ARTICLE_DETAIL);
  return data;
}

export function clearArticleCache(id?: number | string): void {
  if (id) {
    cacheService.clear(CACHE_KEYS.ARTICLE_DETAIL(id));
  } else {
    cacheService.clearPattern('^article');
  }
}
