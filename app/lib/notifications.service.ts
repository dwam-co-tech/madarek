import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
  Notification,
  SendNotificationPayload,
  SendNotificationResponse,
  ApiErrorResponse,
} from './notifications.model';

type NotificationApiRecord = {
  id: number;
  title: string;
  details?: string | null;
  description?: string | null;
  link?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
  status?: 'sent' | 'failed' | 'pending' | string;
};

function mapNotification(record: NotificationApiRecord): Notification {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? record.details ?? '',
    link: record.link ?? null,
    sent_at: record.sent_at ?? record.created_at ?? '',
    status: record.status === 'failed' ? 'failed' : 'sent',
  };
}

/**
 * Send a new notification (admin only)
 */
export async function sendNotification(payload: SendNotificationPayload): Promise<SendNotificationResponse> {
  const token = getAuthToken();
  if (!token) throw new Error('غير مصرح');

  const res = await fetch(buildApiUrl('/api/notifications'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiErrorResponse;
    throw new Error(err.message || 'حدث خطأ أثناء إرسال الإشعار');
  }

  return {
    ...data,
    notification: mapNotification((data as SendNotificationResponse & { notification: NotificationApiRecord }).notification),
  } as SendNotificationResponse;
}

/**
 * Get all notifications (admin only)
 */
export async function getNotifications(): Promise<Notification[]> {
  const token = getAuthToken();
  if (!token) throw new Error('غير مصرح');

  const res = await fetch(buildApiUrl('/api/notifications'), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }).catch(() => { throw new Error('تعذر جلب البيانات'); });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as ApiErrorResponse).message || 'تعذر جلب البيانات');
  }

  const data = await res.json();
  // handle various response shapes: { data: [] } | { notifications: [] } | []
  if (Array.isArray(data)) return (data as NotificationApiRecord[]).map(mapNotification);
  if (Array.isArray(data.data)) return (data.data as NotificationApiRecord[]).map(mapNotification);
  if (Array.isArray(data.notifications)) return (data.notifications as NotificationApiRecord[]).map(mapNotification);
  return [] as Notification[];
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(id: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('غير مصرح');

  const res = await fetch(buildApiUrl(`/api/notifications/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as ApiErrorResponse).message || 'حدث خطأ أثناء الحذف');
  }
}
