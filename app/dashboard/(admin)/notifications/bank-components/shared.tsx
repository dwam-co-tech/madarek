'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import styles from './notificationBank.module.css';
import type { DispatchStatus, NotificationStatus, Pagination } from '@/app/lib/notification-bank.model';

export const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  active: 'نشط',
  paused: 'متوقف',
  archived: 'مؤرشف',
  queued: 'في الانتظار',
  processing: 'قيد المعالجة',
  sent: 'تم الإرسال',
  failed: 'فشل',
  skipped: 'متجاوز',
  partially_sent: 'إرسال جزئي',
};

export const TARGET_LABELS: Record<string, string> = {
  all: 'الكل',
  guests: 'الزوار',
  registered: 'المسجلون',
};

export const TYPE_LABELS: Record<string, string> = {
  scheduled: 'مجدول',
  manual: 'يدوي',
  retry: 'إعادة محاولة',
};

export const WEEKDAYS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

export function Badge({ value }: { value?: NotificationStatus | DispatchStatus | string | null }) {
  const key = value || 'neutral';
  const cls = key === 'partially_sent' ? styles.partial : (styles[key as keyof typeof styles] || styles.neutral);
  return <span className={`${styles.badge} ${cls}`}>{STATUS_LABELS[key] ?? key}</span>;
}

export function BooleanBadge({ value }: { value: boolean }) {
  return <span className={`${styles.badge} ${value ? styles.active : styles.neutral}`}>{value ? 'نعم' : 'لا'}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export function FieldError({ errors, name }: { errors?: Record<string, string[]>; name: string }) {
  const message = Object.entries(errors ?? {})
    .filter(([key]) => key === name || key.startsWith(`${name}.`))
    .flatMap(([, value]) => value)
    .filter(Boolean)[0];
  return message ? <span className={styles.errorText}>{message}</span> : null;
}

export function Alert({ message }: { message: string | null }) {
  return message ? <div className={styles.alert}>{message}</div> : null;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}

export function Loading() {
  return <div className={styles.loading}>جاري تحميل البيانات...</div>;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.iconButton} type="button" onClick={onCancel} aria-label="إغلاق" disabled={busy}>
            <X size={18} />
          </button>
        </div>
        <p className={styles.modalText}>{message}</p>
        <div className={styles.actions}>
          <button className={danger ? styles.dangerButton : styles.button} type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'جاري التنفيذ...' : confirmLabel}
          </button>
          <button className={styles.secondaryButton} type="button" onClick={onCancel} disabled={busy}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaginationBar({ pagination, onPage }: { pagination: Pagination; onPage: (page: number) => void }) {
  return (
    <div className={styles.pagination}>
      <span>
        عرض {pagination.from ?? 0} - {pagination.to ?? 0} من {pagination.total}
      </span>
      <div className={styles.actions}>
        <button className={styles.secondaryButton} type="button" disabled={pagination.current_page <= 1} onClick={() => onPage(pagination.current_page - 1)}>
          السابق
        </button>
        <span>صفحة {pagination.current_page} من {pagination.last_page}</span>
        <button className={styles.secondaryButton} type="button" disabled={pagination.current_page >= pagination.last_page} onClick={() => onPage(pagination.current_page + 1)}>
          التالي
        </button>
      </div>
    </div>
  );
}

export function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  const displayValue = value === null || value === undefined || value === '' ? 'غير محدد' : value;
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <div className={styles.detailValue}>{displayValue}</div>
    </div>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function safeJson(value: unknown) {
  if (value === null || value === undefined || value === '') return '{}';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function DispatchLink({ id }: { id: number }) {
  return <Link className={styles.secondaryButton} href={`/md-dash/notification-dispatches/${id}`}>فتح سجل الإرسال #{id}</Link>;
}
