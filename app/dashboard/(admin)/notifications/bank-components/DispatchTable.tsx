'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import styles from './notificationBank.module.css';
import { Badge, formatDate, TYPE_LABELS } from './shared';
import type { NotificationDispatch, Pagination } from '@/app/lib/notification-bank.model';

function scheduleSource(dispatch: NotificationDispatch) {
  if (dispatch.notification_bank_schedule_id) return 'جدول البنك';
  if (dispatch.notification_schedule_id) return 'جدول قديم للإشعار';
  if (dispatch.type === 'manual') return 'إرسال يدوي';
  if (dispatch.type === 'retry') return 'إعادة محاولة';
  return 'غير محدد';
}

export default function DispatchTable({
  dispatches,
  pagination,
  onPage,
  onRetry,
}: {
  dispatches: NotificationDispatch[];
  pagination: Pagination;
  onPage: (page: number) => void;
  onRetry: (dispatch: NotificationDispatch) => void;
}) {
  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الإشعار</th>
              <th>النوع</th>
              <th>مصدر الجدولة</th>
              <th>الحالة</th>
              <th>مجدول لـ</th>
              <th>بدأ</th>
              <th>انتهى</th>
              <th>الأهداف</th>
              <th>نجاح</th>
              <th>فشل</th>
              <th>المزود</th>
              <th>تاريخ الإنشاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((d) => (
              <tr key={d.id}>
                <td>{d.notification?.title ?? `#${d.notification_id}`}</td>
                <td>{TYPE_LABELS[d.type] ?? d.type}</td>
                <td>{scheduleSource(d)}</td>
                <td><Badge value={d.status} /></td>
                <td>{formatDate(d.scheduled_for)}</td>
                <td>{formatDate(d.started_at)}</td>
                <td>{formatDate(d.finished_at)}</td>
                <td>{d.target_count ?? 0}</td>
                <td>{d.success_count ?? 0}</td>
                <td>{d.failure_count ?? 0}</td>
                <td>{d.provider ?? 'غير محدد'}</td>
                <td>{formatDate(d.created_at)}</td>
                <td>
                  <div className={styles.rowActions}>
                    <Link className={styles.secondaryButton} href={`/md-dash/notification-dispatches/${d.id}`}>التفاصيل</Link>
                    {d.can_retry && (
                      <button className={styles.iconButton} type="button" title="إعادة المحاولة" onClick={() => onRetry(d)}>
                        <RotateCcw size={17} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <span>عرض {pagination.from ?? 0} - {pagination.to ?? 0} من {pagination.total}</span>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" disabled={pagination.current_page <= 1} onClick={() => onPage(pagination.current_page - 1)}>السابق</button>
          <span>صفحة {pagination.current_page} من {pagination.last_page}</span>
          <button className={styles.secondaryButton} type="button" disabled={pagination.current_page >= pagination.last_page} onClick={() => onPage(pagination.current_page + 1)}>التالي</button>
        </div>
      </div>
    </>
  );
}
