export type CommentStatus = 'pending' | 'approved' | 'rejected';
export type ModerationStatus = Exclude<CommentStatus, 'pending'>;

export type CommentArticle = { id: number; title: string };

export type ArticleComment = {
  id: number;
  article_id: number;
  author_name: string;
  text: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  article: CommentArticle | null;
};

export type AdminCommentListResponse = {
  current_page: number;
  data: ArticleComment[];
  last_page: number;
  per_page: number;
  total: number;
};

export type CommentResponse = { comment: ArticleComment; message?: string };
