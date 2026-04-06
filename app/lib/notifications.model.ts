export interface Notification {
  id: number;
  title: string;
  description: string;
  link: string | null;
  sent_at: string;
  status: 'sent' | 'failed';
}

export interface SendNotificationPayload {
  title: string;
  details: string;
  link?: string | null;
}

export interface SendNotificationResponse {
  message: string;
  notification: Notification;
}

export interface NotificationsListResponse {
  data: Notification[];
  total?: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
