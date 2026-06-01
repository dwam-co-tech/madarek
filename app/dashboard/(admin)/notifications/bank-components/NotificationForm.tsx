'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './notificationBank.module.css';
import { Alert, FieldError } from './shared';
import { createBankNotification, updateBankNotification } from '@/app/lib/notification-bank.service';
import type { ApiValidationError, BankNotification, JsonMap, NotificationPayload, NotificationStatus, NotificationTargetType } from '@/app/lib/notification-bank.model';

const initial: NotificationPayload = {
  title: '',
  body: '',
  link: '',
  type: '',
  status: 'draft',
  send_push: true,
  send_in_app: false,
  target_type: 'all',
  target_filters: null,
  metadata: null,
  bank_order: null,
  bank_enabled: true,
};

function parseJsonMap(value: string, label: string): JsonMap | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} يجب أن يكون كائنا JSON`);
  }
  return parsed as JsonMap;
}

export default function NotificationForm({ notification }: { notification?: BankNotification }) {
  const router = useRouter();
  const [form, setForm] = useState<NotificationPayload>(initial);
  const [targetFilters, setTargetFilters] = useState('');
  const [metadata, setMetadata] = useState('');
  const [saving, setSaving] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]> | undefined>();

  useEffect(() => {
    if (!notification) return;
    setForm({
      title: notification.title ?? '',
      body: notification.body ?? '',
      link: notification.link ?? '',
      type: notification.type ?? '',
      status: notification.status,
      send_push: Boolean(notification.send_push),
      send_in_app: Boolean(notification.send_in_app),
      target_type: notification.target_type,
      target_filters: notification.target_filters,
      metadata: notification.metadata,
      bank_order: notification.bank_order,
      bank_enabled: Boolean(notification.bank_enabled),
    });
    setTargetFilters(notification.target_filters ? JSON.stringify(notification.target_filters, null, 2) : '');
    setMetadata(notification.metadata ? JSON.stringify(notification.metadata, null, 2) : '');
  }, [notification]);

  const set = <K extends keyof NotificationPayload>(key: K, value: NotificationPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setErrors(undefined);
    try {
      if (!form.title.trim() || !form.body.trim()) {
        setError('العنوان والمحتوى مطلوبان.');
        return;
      }
      const payload: NotificationPayload = {
        ...form,
        title: form.title.trim(),
        body: form.body.trim(),
        link: form.link?.trim() || null,
        type: form.type?.trim() || null,
        bank_order: form.bank_order === null || form.bank_order === undefined ? null : Number(form.bank_order),
        bank_enabled: form.bank_enabled ?? true,
        target_filters: parseJsonMap(targetFilters, 'فلاتر الجمهور'),
        metadata: parseJsonMap(metadata, 'البيانات الإضافية'),
      };
      const saved = notification ? await updateBankNotification(notification.id, payload) : await createBankNotification(payload);
      router.push(`/md-dash/notifications/${saved.id}`);
    } catch (err) {
      const apiErr = err as ApiValidationError;
      setError(apiErr.message || 'فشل حفظ الإشعار');
      setErrors(apiErr.errors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={`${styles.panel} ${styles.formGrid}`} onSubmit={submit}>
      <Alert message={error} />
      <div className={styles.field}>
        <label className={styles.label}>العنوان</label>
        <input className={styles.input} value={form.title} onChange={(e) => set('title', e.target.value)} required />
        <FieldError errors={errors} name="title" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>الرابط</label>
        <input className={styles.input} value={form.link ?? ''} onChange={(e) => set('link', e.target.value)} placeholder="/library أو madarek://..." />
        <span className={styles.hint}>اختياري، ويمكن أن يكون مسارا داخليا أو deep link.</span>
        <FieldError errors={errors} name="link" />
      </div>
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.label}>المحتوى</label>
        <textarea className={styles.textarea} value={form.body} onChange={(e) => set('body', e.target.value)} required />
        <FieldError errors={errors} name="body" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>الحالة</label>
        <select className={styles.select} value={form.status} onChange={(e) => set('status', e.target.value as NotificationStatus)}>
          <option value="draft">مسودة</option>
          <option value="active">نشط</option>
          <option value="paused">متوقف</option>
          <option value="archived">مؤرشف</option>
        </select>
        <FieldError errors={errors} name="status" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>ترتيب النشر</label>
        <input
          className={styles.input}
          type="number"
          min={0}
          value={form.bank_order ?? ''}
          onChange={(e) => set('bank_order', e.target.value === '' ? null : Number(e.target.value))}
          placeholder="يحدده الخادم تلقائيا عند تركه فارغا"
        />
        <FieldError errors={errors} name="bank_order" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>مفعّل في بنك الإشعارات</label>
        <label className={styles.check}>
          <input type="checkbox" checked={form.bank_enabled ?? true} onChange={(e) => set('bank_enabled', e.target.checked)} />
          متاح للدوران التلقائي
        </label>
        <FieldError errors={errors} name="bank_enabled" />
      </div>

      <div className={`${styles.full} ${styles.advancedBlock}`}>
        <button className={styles.ghostButton} type="button" onClick={() => setAdvancedOpen((value) => !value)}>
          <ChevronDown size={18} className={advancedOpen ? styles.chevronOpen : undefined} />
          إعدادات متقدمة
        </button>
        {advancedOpen && (
          <div className={styles.advancedGrid}>
            <div className={styles.field}>
              <label className={styles.label}>type</label>
              <input className={styles.input} value={form.type ?? ''} onChange={(e) => set('type', e.target.value)} placeholder="general" />
              <FieldError errors={errors} name="type" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>الجمهور</label>
              <select className={styles.select} value={form.target_type} onChange={(e) => set('target_type', e.target.value as NotificationTargetType)}>
                <option value="all">الكل</option>
                <option value="guests">الزوار</option>
                <option value="registered">المسجلون</option>
              </select>
              <FieldError errors={errors} name="target_type" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>قنوات الإرسال</label>
              <div className={styles.checks}>
                <label className={styles.check}>
                  <input type="checkbox" checked={form.send_push} onChange={(e) => set('send_push', e.target.checked)} />
                  Push
                </label>
                <label className={styles.check}>
                  <input type="checkbox" checked={form.send_in_app} onChange={(e) => set('send_in_app', e.target.checked)} />
                  داخل التطبيق
                </label>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>target_filters JSON</label>
              <textarea className={styles.textarea} dir="ltr" value={targetFilters} onChange={(e) => setTargetFilters(e.target.value)} placeholder='{"country":"EG"}' />
              <FieldError errors={errors} name="target_filters" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>metadata JSON</label>
              <textarea className={styles.textarea} dir="ltr" value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder='{"campaign":"weekly"}' />
              <FieldError errors={errors} name="metadata" />
            </div>
          </div>
        )}
      </div>
      <div className={`${styles.actions} ${styles.full}`}>
        <button className={styles.button} type="submit" disabled={saving}>
          <Save size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ الإشعار'}
        </button>
      </div>
    </form>
  );
}
