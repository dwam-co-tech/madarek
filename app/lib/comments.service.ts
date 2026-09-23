import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { AdminCommentListResponse, CommentResponse, CommentStatus, ModerationStatus } from './comments.model';

export class CommentRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CommentRequestError';
  }
}

function translateBackendMessage(message: string | undefined, fallback: string): string {
  if (!message) return fallback;
  const normalized = message.trim().toLowerCase();
  if (normalized === 'comment moderation status updated successfully.') {
    return 'تم تحديث حالة التعليق بنجاح.';
  }
  if (normalized.includes('status') && (normalized.includes('required') || normalized.includes('must'))) {
    return 'يرجى اختيار حالة صحيحة للتعليق: قبول أو رفض.';
  }
  if (normalized.includes('status') && normalized.includes('invalid')) {
    return 'حالة التعليق غير صالحة.';
  }
  if (normalized.includes('comment') && (normalized.includes('not found') || normalized.includes('no query results'))) {
    return 'التعليق المطلوب غير موجود.';
  }
  if (normalized.includes('unauthorized') || normalized.includes('forbidden')) {
    return 'ليس لديك صلاحية لإدارة التعليقات.';
  }
  if (normalized.includes('too many')) {
    return 'تم تنفيذ عدد كبير من الطلبات. يرجى المحاولة لاحقاً.';
  }
  // Backend messages are not shown raw to dashboard users. New/unmapped
  // messages fall back to a clear Arabic explanation instead.
  return fallback;
}

function safeError(status: number, data: unknown): CommentRequestError {
  const body = data && typeof data === 'object'
    ? data as { message?: unknown; error?: unknown; errors?: Record<string, unknown> }
    : {};
  const firstFieldError = body.errors && typeof body.errors === 'object'
    ? Object.values(body.errors).flat().find((item) => typeof item === 'string')
    : undefined;
  const backendMessage = typeof firstFieldError === 'string'
    ? firstFieldError
    : typeof body.message === 'string'
      ? body.message
      : typeof body.error === 'string'
        ? body.error
        : undefined;
  const message = status === 401
    ? 'انتهت جلسة الدخول. سيتم توجيهك لتسجيل الدخول مرة أخرى.'
    : status === 403
      ? 'ليس لديك صلاحية لإدارة التعليقات.'
      : status === 404
        ? 'التعليق المطلوب غير موجود.'
        : status === 422
          ? translateBackendMessage(backendMessage, 'حالة التعليق المطلوبة غير صالحة.')
          : status >= 500
            ? 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.'
            : translateBackendMessage(backendMessage, 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.');
  if (status === 401 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('madarek:unauthorized'));
  }
  return new CommentRequestError(message, status);
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
    throw new CommentRequestError('تعذر الاتصال بالخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى.', 0);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) throw safeError(response.status, data);
  return data as T;
}

export function getAdminComments(page = 1, status: CommentStatus | 'all' = 'all', articleId?: number) {
  const params = new URLSearchParams({ page: String(page) });
  if (status !== 'all') params.set('status', status);
  if (articleId !== undefined) params.set('article_id', String(articleId));
  return request<AdminCommentListResponse>(`/api/admin/comments?${params.toString()}`);
}

export const getAdminComment = (id: number) => request<CommentResponse>(`/api/admin/comments/${id}`);

export const updateCommentStatus = async (id: number, status: ModerationStatus) => {
  const result = await request<CommentResponse>(`/api/admin/comments/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return {
    ...result,
    message: translateBackendMessage(
      result.message,
      status === 'approved' ? 'تم قبول التعليق بنجاح.' : 'تم رفض التعليق بنجاح.',
    ),
  };
};
