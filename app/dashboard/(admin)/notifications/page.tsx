'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, Eye, FileClock, Pencil, Plus, Send, Trash2 } from 'lucide-react';
import styles from './bank-components/notificationBank.module.css';
import { Alert, Badge, BooleanBadge, ConfirmModal, DispatchLink, Empty, formatDate, Loading, PageHeader, PaginationBar, TARGET_LABELS } from './bank-components/shared';
import { archiveBankNotification, listBankNotifications, sendNotificationNow } from '@/app/lib/notification-bank.service';
import type { BankNotification, DispatchActionResult, Paginated } from '@/app/lib/notification-bank.model';

const emptyPage: Paginated<BankNotification> = {
  items: [],
  pagination: { current_page: 1, per_page: 15, total: 0, last_page: 1, from: null, to: null },
};

export default function NotificationBankListPage() {
  const [data, setData] = useState(emptyPage);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [targetType, setTargetType] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendTarget, setSendTarget] = useState<BankNotification | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<BankNotification | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentDispatch, setSentDispatch] = useState<DispatchActionResult | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listBankNotifications({ search, status, type, target_type: targetType, page, per_page: 15 })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب الإشعارات'))
      .finally(() => setLoading(false));
  }, [page, search, status, targetType, type]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const confirmSend = async () => {
    if (!sendTarget) return;
    setBusy(true);
    try {
      const result = await sendNotificationNow(sendTarget.id);
      setSentDispatch(result);
      setSendTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل إرسال الإشعار');
    } finally {
      setBusy(false);
    }
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setBusy(true);
    try {
      await archiveBankNotification(archiveTarget.id);
      setArchiveTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل أرشفة الإشعار');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Notification Bank"
        title="بنك الإشعارات"
        subtitle="أضف رسائل البنك، وسيختار النظام الإشعار التالي تلقائيا حسب جدول نشر البنك العام."
        actions={
          <>
            <Link className={styles.secondaryButton} href="/md-dash/notifications/bank-schedule">
              <CalendarClock size={18} />
              جدول نشر البنك
            </Link>
            <Link className={styles.secondaryButton} href="/md-dash/notification-dispatches">
              <FileClock size={18} />
              سجلات الإرسال
            </Link>
            <Link className={styles.button} href="/md-dash/notifications/create">
              <Plus size={18} />
              إشعار جديد
            </Link>
          </>
        }
      />

      <div className={`${styles.panel} ${styles.filters}`}>
        <input className={styles.input} value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="بحث بالعنوان أو المحتوى" />
        <select className={styles.select} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="active">نشط</option>
          <option value="paused">متوقف</option>
          <option value="archived">مؤرشف</option>
        </select>
        <input className={styles.input} value={type} onChange={(e) => { setPage(1); setType(e.target.value); }} placeholder="النوع" />
        <select className={styles.select} value={targetType} onChange={(e) => { setPage(1); setTargetType(e.target.value); }}>
          <option value="">كل الجماهير</option>
          <option value="all">الكل</option>
          <option value="guests">الزوار</option>
          <option value="registered">المسجلون</option>
        </select>
      </div>

      <Alert message={error} />
      {sentDispatch && (
        <div className={styles.success}>
          {sentDispatch.duplicate ? 'محاولة الإرسال موجودة مسبقا لنفس مفتاح التكرار' : 'تم إنشاء محاولة الإرسال'} رقم {sentDispatch.dispatch.id}. <DispatchLink id={sentDispatch.dispatch.id} />
        </div>
      )}

      {loading ? <Loading /> : data.items.length === 0 ? <Empty>لا توجد إشعارات مطابقة.</Empty> : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الحالة</th>
                  <th>ترتيب النشر</th>
                  <th>مفعّل في البنك</th>
                  <th>مرات الإرسال</th>
                  <th>آخر إرسال من البنك</th>
                  <th>آخر اختيار من البنك</th>
                  <th>الجمهور</th>
                  <th>Push</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((n) => (
                  <tr key={n.id}>
                    <td>{n.title}</td>
                    <td><Badge value={n.status} /></td>
                    <td>{n.bank_order ?? 'تلقائي'}</td>
                    <td><BooleanBadge value={n.bank_enabled} /></td>
                    <td>{n.bank_dispatched_count ?? 0}</td>
                    <td>{formatDate(n.last_bank_dispatched_at)}</td>
                    <td>{formatDate(n.last_bank_picked_at)}</td>
                    <td>{TARGET_LABELS[n.target_type] ?? n.target_type}</td>
                    <td><BooleanBadge value={n.send_push} /></td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link className={styles.iconButton} title="عرض" href={`/md-dash/notifications/${n.id}`}><Eye size={17} /></Link>
                        <Link className={styles.iconButton} title="تعديل" href={`/md-dash/notifications/${n.id}/edit`}><Pencil size={17} /></Link>
                        <Link className={styles.iconButton} title="سجلات الإرسال" href={`/md-dash/notifications/${n.id}/dispatches`}><FileClock size={17} /></Link>
                        {n.status === 'active' && (
                          <button className={styles.iconButton} title="إرسال هذا الإشعار الآن" type="button" onClick={() => setSendTarget(n)}><Send size={17} /></button>
                        )}
                        <button className={styles.iconButton} title="أرشفة" type="button" onClick={() => setArchiveTarget(n)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar pagination={data.pagination} onPage={setPage} />
        </>
      )}

      {sendTarget && (
        <ConfirmModal
          title="إرسال الإشعار الآن"
          message="سيتم إرسال هذا الإشعار الآن إلى الجمهور المستهدف. هل تريد المتابعة؟"
          confirmLabel="إرسال الآن"
          busy={busy}
          onConfirm={confirmSend}
          onCancel={() => setSendTarget(null)}
        />
      )}
      {archiveTarget && (
        <ConfirmModal
          title="أرشفة الإشعار"
          message="سيتم حذف/أرشفة هذا الإشعار من بنك الإشعارات. هل تريد المتابعة؟"
          confirmLabel="أرشفة"
          danger
          busy={busy}
          onConfirm={confirmArchive}
          onCancel={() => setArchiveTarget(null)}
        />
      )}
    </div>
  );
}
