'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CalendarClock, FileClock, Pencil, Send } from 'lucide-react';
import styles from '../bank-components/notificationBank.module.css';
import { Alert, Badge, BooleanBadge, ConfirmModal, DetailItem, DispatchLink, formatDate, Loading, PageHeader, safeJson, TARGET_LABELS } from '../bank-components/shared';
import { getBankNotification, sendNotificationNow } from '@/app/lib/notification-bank.service';
import type { BankNotification, DispatchActionResult } from '@/app/lib/notification-bank.model';

export default function NotificationDetailsPage() {
  const params = useParams<{ id: string }>();
  const [notification, setNotification] = useState<BankNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentDispatch, setSentDispatch] = useState<DispatchActionResult | null>(null);

  const load = () => {
    setLoading(true);
    getBankNotification(params.id)
      .then(setNotification)
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب الإشعار'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [params.id]);

  const sendNow = async () => {
    setBusy(true);
    try {
      const result = await sendNotificationNow(params.id);
      setSentDispatch(result);
      setConfirmSend(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إرسال الإشعار');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Notification Bank"
        title={notification?.title ?? 'تفاصيل الإشعار'}
        actions={
          <>
            <Link className={styles.secondaryButton} href={`/md-dash/notifications/${params.id}/edit`}><Pencil size={18} /> تعديل</Link>
            <Link className={styles.secondaryButton} href="/md-dash/notifications/bank-schedule"><CalendarClock size={18} /> جدول نشر البنك</Link>
            <Link className={styles.secondaryButton} href={`/md-dash/notifications/${params.id}/dispatches`}><FileClock size={18} /> سجلات الإرسال</Link>
            {notification?.status === 'active' && <button className={styles.button} type="button" onClick={() => setConfirmSend(true)}><Send size={18} /> إرسال هذا الإشعار الآن</button>}
          </>
        }
      />
      <Alert message={error} />
      {sentDispatch && (
        <div className={styles.success}>
          {sentDispatch.duplicate ? 'محاولة الإرسال موجودة مسبقا لنفس مفتاح التكرار' : 'تم إنشاء محاولة الإرسال'} رقم {sentDispatch.dispatch.id}. <DispatchLink id={sentDispatch.dispatch.id} />
        </div>
      )}
      {loading ? <Loading /> : notification && (
        <>
          <div className={styles.detailsGrid}>
            <DetailItem label="الحالة" value={<Badge value={notification.status} />} />
            <DetailItem label="النوع" value={notification.type || 'عام'} />
            <DetailItem label="الجمهور" value={TARGET_LABELS[notification.target_type] ?? notification.target_type} />
            <DetailItem label="Push" value={notification.send_push ? 'نعم' : 'لا'} />
            <DetailItem label="داخل التطبيق" value={notification.send_in_app ? 'نعم' : 'لا'} />
            <DetailItem label="الرابط" value={notification.link} />
            <DetailItem label="المنشئ" value={notification.creator?.name ?? notification.creator?.email ?? 'غير محدد'} />
            <DetailItem label="آخر إرسال" value={formatDate(notification.last_dispatched_at)} />
            <DetailItem label="تاريخ الإنشاء" value={formatDate(notification.created_at)} />
          </div>
          <div className={styles.detailsGrid}>
            <DetailItem label="ترتيب النشر" value={notification.bank_order ?? 'تلقائي'} />
            <DetailItem label="مفعّل في البنك" value={<BooleanBadge value={notification.bank_enabled} />} />
            <DetailItem label="مرات الإرسال" value={notification.bank_dispatched_count ?? 0} />
            <DetailItem label="آخر إرسال من البنك" value={formatDate(notification.last_bank_dispatched_at)} />
            <DetailItem label="آخر اختيار من البنك" value={formatDate(notification.last_bank_picked_at)} />
            <DetailItem label="آخر محاولة إرسال" value={notification.latest_dispatch ? `#${notification.latest_dispatch.id} - ${notification.latest_dispatch.status}` : 'لا توجد'} />
          </div>
          <div className={styles.panel}>
            <span className={styles.detailLabel}>المحتوى</span>
            <p>{notification.body}</p>
          </div>
          <div className={styles.panel}>
            <span className={styles.detailLabel}>فلاتر الجمهور</span>
            <pre className={styles.pre}>{safeJson(notification.target_filters)}</pre>
          </div>
          <div className={styles.panel}>
            <span className={styles.detailLabel}>البيانات الإضافية</span>
            <pre className={styles.pre}>{safeJson(notification.metadata)}</pre>
          </div>
        </>
      )}
      {confirmSend && (
        <ConfirmModal
          title="إرسال الإشعار الآن"
          message="سيتم إرسال هذا الإشعار الآن إلى الجمهور المستهدف. هل تريد المتابعة؟"
          confirmLabel="إرسال الآن"
          busy={busy}
          onConfirm={sendNow}
          onCancel={() => setConfirmSend(false)}
        />
      )}
    </div>
  );
}
