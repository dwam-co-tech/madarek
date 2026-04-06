'use client';

import { useState } from 'react';
import { Send, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './SendNotification.module.css';
import { sendNotification } from '@/app/lib/notifications.service';
import type { Notification } from '@/app/lib/notifications.model';

type Props = {
  onSent: (notification: Notification) => void;
};

export default function SendNotification({ onSent }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSending(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const res = await sendNotification({
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || null,
      });

      onSent(res.notification);
      setStatus('success');
      setTitle('');
      setDescription('');
      setLink('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال');
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <Bell size={20} />
        </div>
        <h2 className={styles.cardTitle}>إرسال إشعار جديد</h2>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>
            عنوان الإشعار <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثال: صدر العدد الجديد من مجلة مدارك"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            وصف الإشعار <span className={styles.required}>*</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="اكتب تفاصيل الإشعار هنا..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>رابط (اختياري)</label>
          <input
            type="url"
            className={styles.input}
            placeholder="https://..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        {status === 'success' && (
          <div className={styles.successMsg}>
            <CheckCircle size={18} />
            تم إرسال الإشعار بنجاح
          </div>
        )}
        {status === 'error' && (
          <div className={styles.errorMsg}>
            <AlertCircle size={18} />
            {errorMsg || 'حدث خطأ أثناء الإرسال، حاول مرة أخرى'}
          </div>
        )}

        <div className={styles.footer}>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            مسح
          </button>
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={sending || !title.trim() || !description.trim()}
          >
            <Send size={16} />
            {sending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
          </button>
        </div>
      </form>
    </div>
  );
}
