'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import styles from '../../notifications/bank-components/notificationBank.module.css';
import { Alert, Badge, ConfirmModal, DetailItem, Empty, formatDate, Loading, PageHeader, safeJson, TYPE_LABELS } from '../../notifications/bank-components/shared';
import { getDispatchDetails, retryDispatch } from '@/app/lib/notification-bank.service';
import type { DispatchDetails } from '@/app/lib/notification-bank.model';

export default function DispatchDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [details, setDetails] = useState<DispatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmRetry, setConfirmRetry] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getDispatchDetails(params.id)
      .then(setDetails)
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب تفاصيل الإرسال'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const dispatch = details?.dispatch;
  const scheduleSource = dispatch?.notification_bank_schedule_id
    ? 'جدول البنك'
    : dispatch?.notification_schedule_id
      ? 'جدول قديم للإشعار'
      : dispatch?.type === 'manual'
        ? 'إرسال يدوي'
        : dispatch?.type === 'retry'
          ? 'إعادة محاولة'
          : 'غير محدد';

  const runRetry = async () => {
    setBusy(true);
    try {
      const next = await retryDispatch(params.id);
      setConfirmRetry(false);
      router.push(`/md-dash/notification-dispatches/${next.dispatch.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إعادة المحاولة');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Dispatch Details"
        title={`تفاصيل محاولة الإرسال #${params.id}`}
        actions={
          <>
            {dispatch?.notification_id && <Link className={styles.secondaryButton} href={`/md-dash/notifications/${dispatch.notification_id}`}>الإشعار</Link>}
            {dispatch?.can_retry && <button className={styles.button} type="button" onClick={() => setConfirmRetry(true)}><RotateCcw size={18} /> إعادة المحاولة</button>}
          </>
        }
      />
      <Alert message={error} />
      {loading ? <Loading /> : !details || !dispatch ? <Empty>لم يتم العثور على سجل الإرسال.</Empty> : (
        <>
          <div className={styles.detailsGrid}>
            <DetailItem label="الإشعار" value={dispatch.notification?.title ?? `#${dispatch.notification_id}`} />
            <DetailItem label="حالة الإشعار" value={dispatch.notification?.status ? <Badge value={dispatch.notification.status} /> : 'غير محدد'} />
            <DetailItem label="الجمهور" value={dispatch.notification?.target_type ?? 'غير محدد'} />
            <DetailItem label="الحالة" value={<Badge value={dispatch.status} />} />
            <DetailItem label="النوع" value={TYPE_LABELS[dispatch.type] ?? dispatch.type} />
            <DetailItem label="مصدر الجدولة" value={scheduleSource} />
            <DetailItem label="جدول البنك" value={dispatch.notification_bank_schedule_id ? `#${dispatch.notification_bank_schedule_id}` : 'لا يوجد'} />
            <DetailItem label="وقت جدول البنك" value={dispatch.bank_schedule_slot ? `${dispatch.bank_schedule_slot.weekday} - ${dispatch.bank_schedule_slot.send_time?.slice(0, 5)}` : 'لا يوجد'} />
            <DetailItem label="idempotency_key" value={dispatch.idempotency_key} />
            <DetailItem label="مجدول لـ" value={formatDate(dispatch.scheduled_for)} />
            <DetailItem label="بدأ" value={formatDate(dispatch.started_at)} />
            <DetailItem label="انتهى" value={formatDate(dispatch.finished_at)} />
            <DetailItem label="عدد الأهداف" value={dispatch.target_count ?? 0} />
            <DetailItem label="نجاح" value={dispatch.success_count ?? 0} />
            <DetailItem label="فشل" value={dispatch.failure_count ?? 0} />
            <DetailItem label="المزود" value={dispatch.provider} />
            <DetailItem label="تاريخ الإنشاء" value={formatDate(dispatch.created_at)} />
            <DetailItem label="يمكن إعادة المحاولة" value={dispatch.can_retry ? 'نعم' : 'لا'} />
          </div>

          {dispatch.error_message && (
            <div className={styles.alert}>
              <strong>رسالة الخطأ: </strong>
              {dispatch.error_message}
            </div>
          )}

          <div className={styles.panel}>
            <span className={styles.detailLabel}>استجابة المزود</span>
            <pre className={styles.pre}>{safeJson(dispatch.provider_response)}</pre>
          </div>

          <div className={styles.panel}>
            <span className={styles.detailLabel}>ملخص الوصول</span>
            <pre className={styles.pre}>{safeJson(details.receipts_summary)}</pre>
          </div>

          {details.receipts.items.length === 0 ? <Empty>لا توجد receipts لهذا الإرسال.</Empty> : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>المستخدم</th>
                    <th>الجهاز</th>
                    <th>الحالة</th>
                    <th>رسالة المزود</th>
                    <th>الخطأ</th>
                    <th>وقت الإرسال</th>
                    <th>تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {details.receipts.items.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.user_id ?? 'غير محدد'}</td>
                      <td>{r.user_device_token_id ?? 'غير محدد'}</td>
                      <td><Badge value={r.status} /></td>
                      <td>{r.provider_message_id ?? 'غير محدد'}</td>
                      <td>{r.error_message ?? 'لا يوجد'}</td>
                      <td>{formatDate(r.sent_at)}</td>
                      <td>{formatDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {confirmRetry && (
        <ConfirmModal
          title="إعادة محاولة الإرسال"
          message="سيتم إنشاء محاولة إرسال جديدة لهذا الإشعار. هل تريد المتابعة؟"
          confirmLabel="إعادة المحاولة"
          busy={busy}
          onConfirm={runRetry}
          onCancel={() => setConfirmRetry(false)}
        />
      )}
    </div>
  );
}
