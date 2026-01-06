export type { ArticleDTO } from './issues.model';

export type PageLink = {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
};

export type PaginatedResponse<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PageLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export type GetArticlesResponse = PaginatedResponse<import('./issues.model').ArticleDTO>;

export type ArticleDetailResponse = {
  article: import('./issues.model').ArticleDTO & { issue: import('./issues.model').IssueDTO };
};

export type UpdateArticlePayload = {
  content?: string;
  title?: string;
  keywords?: string;
  author_name?: string;
  gregorian_date?: string;
  hijri_date?: string;
  references?: string;
  status?: string;
  className?: string;
};

export type UpdateArticleResponse = {
  message: string;
  article: import('./issues.model').ArticleDTO;
};
