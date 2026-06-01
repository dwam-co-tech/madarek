export type NotificationStatus = 'draft' | 'active' | 'paused' | 'archived';
export type NotificationTargetType = 'all' | 'guests' | 'registered';
export type ScheduleStatus = 'active' | 'paused';
export type BankRotationMode = 'loop';
export type DispatchStatus = 'queued' | 'processing' | 'sent' | 'failed' | 'skipped' | 'partially_sent' | string;
export type DispatchType = 'scheduled' | 'manual' | 'retry' | string;

export type JsonMap = Record<string, unknown>;

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface ApiValidationError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
}

export interface NotificationCreator {
  id: number | null;
  name: string | null;
  email: string | null;
}

export interface NotificationScheduleSlot {
  id?: number;
  weekday: number;
  send_time: string;
}

export interface NotificationSchedule {
  id: number;
  notification_id: number;
  timezone: string;
  status: ScheduleStatus;
  starts_at: string | null;
  ends_at: string | null;
  last_checked_at?: string | null;
  slots: NotificationScheduleSlot[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationBankScheduleSlot {
  id?: number;
  notification_bank_schedule_id?: number;
  weekday: number;
  send_time: string;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationBankSchedule {
  id: number;
  timezone: string;
  status: ScheduleStatus;
  rotation_mode: BankRotationMode;
  cursor_notification_id: number | null;
  cursor_bank_order: number | null;
  cycle_started_at: string | null;
  exhausted_at: string | null;
  last_checked_at: string | null;
  metadata: JsonMap | null;
  slots: NotificationBankScheduleSlot[];
  slots_by_weekday?: Record<string, NotificationBankScheduleSlot[]>;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface NotificationSummaryDispatch {
  id: number;
  type: DispatchType;
  status: DispatchStatus;
  scheduled_for: string | null;
  started_at: string | null;
  finished_at: string | null;
  target_count: number | null;
  success_count: number | null;
  failure_count: number | null;
  provider: string | null;
  created_at: string | null;
}

export interface BankNotification {
  id: number;
  title: string;
  body: string;
  link: string | null;
  type: string | null;
  status: NotificationStatus;
  send_push: boolean;
  send_in_app: boolean;
  target_type: NotificationTargetType;
  target_filters: JsonMap | null;
  metadata: JsonMap | null;
  bank_order: number | null;
  bank_enabled: boolean;
  bank_dispatched_count: number;
  last_bank_dispatched_at: string | null;
  last_bank_picked_at: string | null;
  last_dispatched_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  creator?: NotificationCreator;
  has_schedule: boolean;
  schedule?: NotificationSchedule | null;
  latest_dispatch?: NotificationSummaryDispatch | null;
}

export interface NotificationPayload {
  title: string;
  body: string;
  link: string | null;
  type: string | null;
  status: NotificationStatus;
  send_push: boolean;
  send_in_app: boolean;
  target_type: NotificationTargetType;
  target_filters: JsonMap | null;
  metadata: JsonMap | null;
  bank_order?: number | null;
  bank_enabled?: boolean;
}

export interface SchedulePayload {
  timezone: string;
  status: ScheduleStatus;
  starts_at: string | null;
  ends_at: string | null;
  slots: Array<{ weekday: number; send_time: string }>;
}

export interface BankSchedulePayload {
  timezone: string;
  status: ScheduleStatus;
  rotation_mode: BankRotationMode;
  metadata?: JsonMap | null;
  slots: Array<{ weekday: number; send_time: string; is_active?: boolean }>;
}

export interface DispatchNotification {
  id: number;
  title: string;
  body?: string | null;
  link?: string | null;
  type?: string | null;
  status?: NotificationStatus;
  target_type?: NotificationTargetType;
}

export interface NotificationDispatch {
  id: number;
  notification_id: number;
  notification?: DispatchNotification | null;
  notification_schedule_id: number | null;
  notification_schedule_slot_id: number | null;
  notification_bank_schedule_id?: number | null;
  notification_bank_schedule_slot_id?: number | null;
  bank_schedule?: NotificationBankSchedule | null;
  bank_schedule_slot?: NotificationBankScheduleSlot | null;
  type: DispatchType;
  status: DispatchStatus;
  idempotency_key: string | null;
  scheduled_for: string | null;
  started_at: string | null;
  finished_at: string | null;
  target_count: number | null;
  success_count: number | null;
  failure_count: number | null;
  provider: string | null;
  provider_response: unknown;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
  can_retry: boolean;
  can_view_receipts: boolean;
}

export interface DispatchActionResult {
  dispatch: NotificationDispatch;
  created?: boolean;
  duplicate?: boolean;
}

export interface NotificationReceipt {
  id: number;
  notification_dispatch_id: number;
  notification_id: number;
  user_id: number | null;
  user_device_token_id: number | null;
  fcm_token_hash?: string | null;
  status: string;
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DispatchDetails {
  dispatch: NotificationDispatch;
  receipts_summary: Record<string, number>;
  receipts: Paginated<NotificationReceipt>;
}
