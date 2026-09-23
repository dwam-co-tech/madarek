import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
  AdminArticlesResponse,
  CreateTopicPayload,
  DeleteTopicResponse,
  Topic,
  TopicArticle,
  TopicResponse,
  UpdateTopicPayload,
} from './topics.model';

export class TopicRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'TopicRequestError';
  }
}

const fieldMessages: Record<string, string> = {
  name: 'يرجى إدخال اسم صالح لا يتجاوز 255 حرفاً.',
  slug: 'الرابط غير صالح أو مستخدم ضمن التصنيف نفسه. استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط.',
  category: 'التصنيف غير صالح. اختر أحد التصنيفات الأربعة المتاحة.',
  article_ids: 'تحقق من المقالات المحددة: يجب أن تكون موجودة وغير محذوفة وألا تتكرر.',
};

function safeError(status: number, data: unknown): TopicRequestError {
  const body = data && typeof data === 'object' ? data as { errors?: unknown } : {};
  const rawErrors = body.errors && typeof body.errors === 'object'
    ? body.errors as Record<string, unknown>
    : {};
  const errors: Record<string, string[]> = {};

  for (const field of Object.keys(rawErrors)) {
    const normalized = field.startsWith('article_ids.') ? 'article_ids' : field;
    errors[field] = [fieldMessages[normalized] ?? 'يرجى مراجعة البيانات المدخلة.'];
  }

  const firstError = Object.keys(errors)[0];
  const message = status === 401
    ? 'انتهت جلسة الدخول. سيتم توجيهك لتسجيل الدخول مرة أخرى.'
    : status === 403
      ? 'ليس لديك صلاحية لإدارة شجرة المواضيع.'
      : status === 404
        ? 'الموضوع أو المقال المطلوب غير موجود.'
        : status === 422
          ? (firstError ? errors[firstError][0] : 'يرجى مراجعة البيانات المدخلة.')
          : 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.';

  if (status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('madarek:unauthorized'));
  }
  return new TopicRequestError(message, status, errors);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new TopicRequestError('تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.', 0);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw safeError(response.status, data);
  return data as T;
}

export const getTopics = () => request<Topic[]>('/api/admin/topics');
export const getTopic = (id: number) => request<TopicResponse>(`/api/admin/topics/${id}`);

export const createTopic = (payload: CreateTopicPayload) => request<TopicResponse>('/api/admin/topics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

export const updateTopic = (id: number, payload: UpdateTopicPayload) => request<TopicResponse>(`/api/admin/topics/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

export const deleteTopic = (id: number) => request<DeleteTopicResponse>(`/api/admin/topics/${id}`, {
  method: 'DELETE',
});

export async function getAllAdminArticles(): Promise<TopicArticle[]> {
  const first = await request<AdminArticlesResponse>('/api/admin/articles?page=1');
  const articles = [...first.data];
  for (let page = 2; page <= first.last_page; page += 1) {
    const next = await request<AdminArticlesResponse>(`/api/admin/articles?page=${page}`);
    articles.push(...next.data);
  }
  return articles;
}
