export type IssueDTO = {
  title: string;
  cover_image: string;
  cover_image_alt?: string;
  pdf_file?: string;
  hijri_date?: string;
  gregorian_date?: string;
  user_id?: number;
  issue_number?: number;
  status: 'draft' | 'published';
  slug: string;
  updated_at: string;
  created_at: string;
  views?: number;
  id: number;
  published_date?: string | null;
  published_time?: string | null;
};

export type CreateIssueResponse = {
  message: string;
  issue: IssueDTO;
};

export type CreateIssuePayload = {
  title: string;
  slug?: string;
  hijri_date?: string;
  gregorian_date?: string;
  status?: 'draft' | 'published';
  cover_image?: File;
  cover_image_alt?: File;
  pdf_file?: File;
  published_at?: string;
};

export type GetIssuesResponse =
  | { issues: IssueDTO[] }
  | { data: IssueDTO[] }
  | IssueDTO[];

export type ArticleDTO = {
  id: number;
  user_id: number;
  issue_id: number;
  title: string;
  slug: string;
  keywords?: string | null;
  content?: string | null;
  author_name?: string | null;
  featured_image?: string | null;
  gregorian_date?: string | null;
  hijri_date?: string | null;
  references?: string | null;
  status: string;
  published_at?: string | null;
  views_count?: number;
  className?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type IssueDetailDTO = {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  issue_number: number;
  cover_image: string;
  cover_image_alt?: string;
  pdf_file?: string;
  hijri_date?: string;
  gregorian_date?: string;
  views_count?: number;
  status: string;
  published_at?: string | null;
  published_date?: string | null;
  published_time?: string | null;
  is_featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  articles: ArticleDTO[];
};

export type DeleteIssueResponse = {
  message: string;
};

export type UpdateIssuePayload = {
  title?: string;
  slug?: string;
  cover_image?: File;
  cover_image_alt?: File;
  pdf_file?: File;
  hijri_date?: string;
  gregorian_date?: string;
  status?: 'draft' | 'published';
  issue_number?: number;
  is_featured?: boolean;
  sort_order?: number;
  published_at?: string;
};

export type UpdateIssueResponse = {
  message: string;
  issue: IssueDTO;
};

export type PublishIssueResponse = {
  message: string;
  issue: IssueDTO;
};

export type UnpublishIssueResponse = {
  message: string;
  issue: IssueDTO;
};
