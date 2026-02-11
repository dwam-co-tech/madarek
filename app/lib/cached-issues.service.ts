import { cacheService } from './cache.service';
import * as issuesService from './issues.service';
import type { IssueDTO, IssueDetailDTO, ArticleDTO } from './issues.model';

const CACHE_KEYS = {
  PUBLISHED_ISSUES: 'issues:published',
  ISSUE_DETAIL: (id: string | number) => `issue:${id}`,
  ISSUE_ARTICLES: (id: string | number) => `issue:${id}:articles`,
};

const CACHE_TTL = {
  PUBLISHED_ISSUES: 10 * 60 * 1000, // 10 minutes
  ISSUE_DETAIL: 15 * 60 * 1000, // 15 minutes
  ISSUE_ARTICLES: 10 * 60 * 1000, // 10 minutes
};

export async function getPublishedIssues(): Promise<IssueDTO[]> {
  const cached = cacheService.get<IssueDTO[]>(CACHE_KEYS.PUBLISHED_ISSUES);
  if (cached) return cached;

  const data = await issuesService.getPublishedIssues();
  cacheService.set(CACHE_KEYS.PUBLISHED_ISSUES, data, CACHE_TTL.PUBLISHED_ISSUES);
  return data;
}

export async function getIssue(id: number | string): Promise<IssueDetailDTO> {
  const key = CACHE_KEYS.ISSUE_DETAIL(id);
  const cached = cacheService.get<IssueDetailDTO>(key);
  if (cached) return cached;

  const data = await issuesService.getIssue(id);
  cacheService.set(key, data, CACHE_TTL.ISSUE_DETAIL);
  return data;
}

export async function getIssueArticles(id: number | string): Promise<ArticleDTO[]> {
  const key = CACHE_KEYS.ISSUE_ARTICLES(id);
  const cached = cacheService.get<ArticleDTO[]>(key);
  if (cached) return cached;

  const data = await issuesService.getIssueArticles(id);
  cacheService.set(key, data, CACHE_TTL.ISSUE_ARTICLES);
  return data;
}

export function clearIssueCache(id?: number | string): void {
  if (id) {
    cacheService.clear(CACHE_KEYS.ISSUE_DETAIL(id));
    cacheService.clear(CACHE_KEYS.ISSUE_ARTICLES(id));
  } else {
    cacheService.clearPattern('^issue:');
    cacheService.clear(CACHE_KEYS.PUBLISHED_ISSUES);
  }
}
