'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './notificationBank.module.css';
import DispatchTable from './DispatchTable';
import { Alert, ConfirmModal, Empty, Loading, PageHeader } from './shared';
import { listDispatches, listNotificationDispatches, retryDispatch } from '@/app/lib/notification-bank.service';
import type { NotificationDispatch, Paginated } from '@/app/lib/notification-bank.model';

const emptyPage: Paginated<NotificationDispatch> = {
  items: [],
  pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: null, to: null },
};

export default function DispatchLogsClient({ notificationId, title }: { notificationId?: string; title: string }) {
  const router = useRouter();
  const [data, setData] = useState(emptyPage);
  const [filters, setFilters] = useState({
    notification_id: notificationId ?? '',
    status: '',
    type: '',
    provider: '',
    scheduled_from: '',
    scheduled_to: '',
    created_from: '',
    created_to: '',
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<NotificationDispatch | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = { ...filters, page, per_page: 15 };
    const run = notificationId ? listNotificationDispatches(notificationId, params) : listDispatches(params);
    run.then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب سجلات الإرسال'))
      .finally(() => setLoading(false));
  }, [filters, notificationId, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const confirmRetry = async () => {
    if (!retryTarget) return;
    setBusy(true);
    try {
      const result = await retryDispatch(retryTarget.id);
      setRetryTarget(null);
      router.push(`/md-dash/notification-dispatches/${result.dispatch.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إعادة المحاولة');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Dispatch Logs" title={title} subtitle="عرض محاولات الإرسال، حالاتها، ونتائج المزود بدون كشف توكنات الأجهزة." />
      <div className={`${styles.panel} ${styles.dispatchFilters}`}>
        {!notificationId && <input className={styles.input} value={filters.notification_id} onChange={(e) => setFilter('notification_id', e.target.value)} placeholder="notification_id" />}
        <select className={styles.select} value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="queued">في الانتظار</option>
          <option value="processing">قيد المعالجة</option>
          <option value="sent">تم الإرسال</option>
          <option value="failed">فشل</option>
          <option value="skipped">متجاوز</option>
          <option value="partially_sent">إرسال جزئي</option>
        </select>
        <select className={styles.select} value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">كل الأنواع</option>
          <option value="scheduled">مجدول</option>
          <option value="manual">يدوي</option>
          <option value="retry">إعادة محاولة</option>
        </select>
        <input className={styles.input} value={filters.provider} onChange={(e) => setFilter('provider', e.target.value)} placeholder="provider" />
        <input className={styles.input} type="date" value={filters.scheduled_from} onChange={(e) => setFilter('scheduled_from', e.target.value)} />
        <input className={styles.input} type="date" value={filters.scheduled_to} onChange={(e) => setFilter('scheduled_to', e.target.value)} />
        <input className={styles.input} type="date" value={filters.created_from} onChange={(e) => setFilter('created_from', e.target.value)} />
        <input className={styles.input} type="date" value={filters.created_to} onChange={(e) => setFilter('created_to', e.target.value)} />
      </div>
      <Alert message={error} />
      {loading ? <Loading /> : data.items.length === 0 ? <Empty>لا توجد سجلات إرسال مطابقة.</Empty> : (
        <DispatchTable dispatches={data.items} pagination={data.pagination} onPage={setPage} onRetry={setRetryTarget} />
      )}
      {retryTarget && (
        <ConfirmModal
          title="إعادة محاولة الإرسال"
          message="سيتم إنشاء محاولة إرسال جديدة لهذا الإشعار. هل تريد المتابعة؟"
          confirmLabel="إعادة المحاولة"
          busy={busy}
          onConfirm={confirmRetry}
          onCancel={() => setRetryTarget(null)}
        />
      )}
    </div>
  );
}
