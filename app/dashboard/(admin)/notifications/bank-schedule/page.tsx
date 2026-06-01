'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Save, Trash2, X } from 'lucide-react';
import styles from '../bank-components/notificationBank.module.css';
import { Alert, Badge, ConfirmModal, FieldError, Loading, PageHeader, WEEKDAYS } from '../bank-components/shared';
import { deleteBankSchedule, getBankSchedule, saveBankSchedule } from '@/app/lib/notification-bank.service';
import type { ApiValidationError, BankSchedulePayload, JsonMap, ScheduleStatus } from '@/app/lib/notification-bank.model';

type SlotsByDay = Record<number, string[]>;

function emptySlots(): SlotsByDay {
  return WEEKDAYS.reduce((acc, day) => ({ ...acc, [day.value]: [] }), {} as SlotsByDay);
}

function parseJsonMap(value: string): JsonMap | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('البيانات الإضافية يجب أن تكون كائنا JSON');
  }
  return parsed as JsonMap;
}

export default function BankSchedulePage() {
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [status, setStatus] = useState<ScheduleStatus>('active');
  const [metadata, setMetadata] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [slots, setSlots] = useState<SlotsByDay>(emptySlots);
  const [draftTimes, setDraftTimes] = useState<SlotsByDay>(emptySlots);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]> | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    getBankSchedule()
      .then((schedule) => {
        if (!schedule) {
          setTimezone('Africa/Cairo');
          setStatus('active');
          setMetadata('');
          setSlots(emptySlots());
          return;
        }
        setTimezone(schedule.timezone || 'Africa/Cairo');
        setStatus(schedule.status || 'active');
        setMetadata(schedule.metadata ? JSON.stringify(schedule.metadata, null, 2) : '');
        const next = emptySlots();
        schedule.slots.forEach((slot) => {
          if (slot.is_active === false) return;
          next[slot.weekday] = [...(next[slot.weekday] ?? []), slot.send_time.slice(0, 5)];
        });
        Object.keys(next).forEach((key) => next[Number(key)].sort());
        setSlots(next);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب جدول نشر البنك'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const flatSlots = useMemo(
    () => WEEKDAYS.flatMap((day) => (slots[day.value] ?? []).map((send_time) => ({ weekday: day.value, send_time, is_active: true }))),
    [slots]
  );

  const addTime = (weekday: number) => {
    const time = (draftTimes[weekday]?.[0] || '').slice(0, 5);
    if (!/^\d{2}:\d{2}$/.test(time)) {
      setError('اختر وقتا صحيحا بصيغة HH:mm.');
      return;
    }
    if ((slots[weekday] ?? []).includes(time)) {
      setError('لا يمكن إضافة وقت مكرر لنفس اليوم.');
      return;
    }
    setError(null);
    setSlots((prev) => ({ ...prev, [weekday]: [...(prev[weekday] ?? []), time].sort() }));
    setDraftTimes((prev) => ({ ...prev, [weekday]: [''] }));
  };

  const removeTime = (weekday: number, time: string) => {
    setSlots((prev) => ({ ...prev, [weekday]: (prev[weekday] ?? []).filter((item) => item !== time) }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setErrors(undefined);
    try {
      if (!flatSlots.length) {
        setError('أضف وقت إرسال واحدا على الأقل قبل الحفظ.');
        return;
      }
      const payload: BankSchedulePayload = {
        timezone: timezone.trim() || 'Africa/Cairo',
        status,
        rotation_mode: 'loop',
        metadata: parseJsonMap(metadata),
        slots: flatSlots,
      };
      await saveBankSchedule(payload);
      setSuccess('تم حفظ جدول نشر البنك بنجاح.');
      load();
    } catch (err) {
      const apiErr = err as ApiValidationError;
      setError(apiErr.message || 'فشل حفظ جدول نشر البنك');
      setErrors(apiErr.errors);
    } finally {
      setSaving(false);
    }
  };

  const removeSchedule = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteBankSchedule();
      setSlots(emptySlots());
      setMetadata('');
      setConfirmDelete(false);
      setSuccess('تم حذف جدول نشر البنك.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل حذف جدول نشر البنك');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Notification Bank Schedule"
        title="جدول نشر بنك الإشعارات"
        subtitle="حدد الأيام والمواعيد التي يرسل فيها النظام الإشعار التالي تلقائيًا من البنك."
        actions={
          <>
            <Link className={styles.secondaryButton} href="/md-dash/notifications"><ArrowRight size={18} /> العودة للبنك</Link>
            <button className={styles.dangerButton} type="button" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /> حذف الجدول</button>
          </>
        }
      />
      <Alert message={error} />
      {success && <div className={styles.success}>{success}</div>}

      {loading ? <Loading /> : (
        <form className={styles.page} onSubmit={submit}>
          <div className={`${styles.panel} ${styles.formGrid}`}>
            <div className={styles.field}>
              <label className={styles.label}>المنطقة الزمنية</label>
              <input className={styles.input} value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Africa/Cairo" />
              <FieldError errors={errors} name="timezone" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>حالة الجدول</label>
              <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as ScheduleStatus)}>
                <option value="active">نشط</option>
                <option value="paused">متوقف</option>
              </select>
              <FieldError errors={errors} name="status" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>طريقة الدوران</label>
              <div className={styles.readOnlyBox}>دوران مستمر</div>
              <FieldError errors={errors} name="rotation_mode" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>إعدادات متقدمة</label>
              <button className={styles.ghostButton} type="button" onClick={() => setAdvancedOpen((value) => !value)}>
                {advancedOpen ? 'إخفاء البيانات الإضافية' : 'إظهار البيانات الإضافية'}
              </button>
            </div>
            {advancedOpen && (
              <div className={`${styles.field} ${styles.full}`}>
                <label className={styles.label}>metadata JSON</label>
                <textarea className={styles.textarea} dir="ltr" value={metadata} onChange={(e) => setMetadata(e.target.value)} placeholder='{"note":"optional"}' />
                <FieldError errors={errors} name="metadata" />
              </div>
            )}
          </div>

          <div className={styles.weekGrid}>
            {WEEKDAYS.map((day) => {
              const daySlots = slots[day.value] ?? [];
              return (
                <div className={`${styles.dayCard} ${daySlots.length ? styles.dayCardEnabled : ''}`} key={day.value}>
                  <div className={styles.dayHead}>
                    <h2 className={styles.dayTitle}>{day.label}</h2>
                    <Badge value={daySlots.length ? 'active' : 'paused'} />
                  </div>
                  <div className={styles.timeAdd}>
                    <input
                      className={styles.input}
                      type="time"
                      value={draftTimes[day.value]?.[0] ?? ''}
                      onChange={(e) => setDraftTimes((prev) => ({ ...prev, [day.value]: [e.target.value] }))}
                    />
                    <button className={styles.iconButton} type="button" onClick={() => addTime(day.value)} aria-label={`إضافة وقت ${day.label}`}>
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className={styles.timeList}>
                    {daySlots.length === 0 ? <span className={styles.hint}>لا توجد أوقات</span> : daySlots.map((time) => (
                      <span className={styles.timeChip} key={time}>
                        {time}
                        <button className={styles.iconButton} type="button" onClick={() => removeTime(day.value, time)} aria-label="حذف الوقت">
                          <X size={15} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <FieldError errors={errors} name="slots" />
          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={saving}>
              <Save size={18} />
              {saving ? 'جاري الحفظ...' : 'حفظ جدول النشر'}
            </button>
          </div>
        </form>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="حذف جدول نشر البنك"
          message="سيتم حذف جدول نشر بنك الإشعارات العام. لن يتم حذف أي إشعارات أو سجلات إرسال."
          confirmLabel="حذف الجدول"
          danger
          busy={saving}
          onConfirm={removeSchedule}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
