import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
  Notification,
  SendNotificationPayload,
  SendNotificationResponse,
  NotificationsListResponse,
  ApiErrorResponse,
} from './notifications.model';

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

  return data as SendNotificationResponse;
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
  if (Array.isArray(data)) return data as Notification[];
  if (Array.isArray(data.data)) return data.data as Notification[];
  if (Array.isArray(data.notifications)) return data.notifications as Notification[];
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
