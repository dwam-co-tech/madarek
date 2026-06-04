import { cacheService } from './cache.service';
import * as issuesService from './issues.service';
import type { IssueDTO, IssueDetailDTO, ArticleDTO, IssueSection } from './issues.model';

const CACHE_KEYS = {
  PUBLISHED_ISSUES: 'issues:published',
  ISSUE_DETAIL: (id: string | number) => `issue:${id}`,
  ISSUE_ARTICLES: (id: string | number) => `issue:${id}:articles`,
  ISSUE_SECTIONS: (id: string | number) => `issue:${id}:sections`,
  SECTION_ARTICLES: (issueId: string | number, sectionId: string | number) => `issue:${issueId}:section:${sectionId}:articles`,
};

const CACHE_TTL = {
  PUBLISHED_ISSUES: 10 * 60 * 1000, // 10 minutes
  ISSUE_DETAIL: 15 * 60 * 1000, // 15 minutes
  ISSUE_ARTICLES: 10 * 60 * 1000, // 10 minutes
  ISSUE_SECTIONS: 10 * 60 * 1000, // 10 minutes
  SECTION_ARTICLES: 10 * 60 * 1000, // 10 minutes
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

export async function getIssueSections(issueId: number | string): Promise<IssueSection[]> {
  const key = CACHE_KEYS.ISSUE_SECTIONS(issueId);
  const cached = cacheService.get<IssueSection[]>(key);
  if (cached) return cached;

  const data = await issuesService.getIssueSections(issueId);
  cacheService.set(key, data, CACHE_TTL.ISSUE_SECTIONS);
  return data;
}

export async function getSectionArticles(issueId: number | string, sectionId: number | string): Promise<ArticleDTO[]> {
  const key = CACHE_KEYS.SECTION_ARTICLES(issueId, sectionId);
  const cached = cacheService.get<ArticleDTO[]>(key);
  if (cached) return cached;

  const data = await issuesService.getSectionArticles(issueId, sectionId);
  cacheService.set(key, data, CACHE_TTL.SECTION_ARTICLES);
  return data;
}

export function clearIssueCache(id?: number | string): void {
  if (id) {
    cacheService.clear(CACHE_KEYS.ISSUE_DETAIL(id));
    cacheService.clear(CACHE_KEYS.ISSUE_ARTICLES(id));
    cacheService.clear(CACHE_KEYS.ISSUE_SECTIONS(id));
    cacheService.clearPattern(`^issue:${id}:section:`);
  } else {
    cacheService.clearPattern('^issue:');
    cacheService.clear(CACHE_KEYS.PUBLISHED_ISSUES);
  }
}
