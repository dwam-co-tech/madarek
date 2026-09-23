import type { ArticleDTO, IssueDTO } from './issues.model';

export const TOPIC_CATEGORIES = ['country', 'author', 'sect', 'subject'] as const;

export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

export const TOPIC_CATEGORY_LABELS: Record<TopicCategory, string> = {
  country: 'الدول',
  author: 'الكاتب',
  sect: 'الفرقة',
  subject: 'الموضوع',
};

export type Topic = {
  id: number;
  name: string;
  slug: string;
  category: TopicCategory;
  article_ids: number[];
  created_at?: string;
};

export type CreateTopicPayload = {
  name: string;
  slug: string;
  category: TopicCategory;
  article_ids: number[];
};

export type UpdateTopicPayload = CreateTopicPayload;

export type TopicResponse = { topic: Topic };
export type DeleteTopicResponse = { message: string };

export type TopicArticle = ArticleDTO & { issue?: IssueDTO | null };

export type AdminArticlesResponse = {
  current_page: number;
  data: TopicArticle[];
  last_page: number;
};
