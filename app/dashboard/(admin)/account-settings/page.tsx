'use client';

import React, { useEffect, useState } from 'react';
import styles from './account-settings.module.css';
import { updatePassword } from '@/app/lib/account.service';

export default function AccountSettingsPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; old?: string; general?: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
    };
  }, [toastTimer]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    const t = window.setTimeout(() => {
      setToastVisible(false);
      setToastMsg(null);
      setToastTimer(null);
    }, 2800);
    setToastTimer(t);
  };

  const validate = () => {
    const next: { email?: string; password?: string; confirm?: string; old?: string } = {};
    if (password && password.length < 6) next.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (password && confirm !== password) next.confirm = 'تأكيد كلمة المرور غير مطابق';
    if (password && !oldPassword) next.old = 'كلمة المرور القديمة مطلوبة';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = { password: oldPassword, new_password: password, new_password_confirmation: confirm };
      await updatePassword(payload);
      setPassword('');
      setConfirm('');
      setOldPassword('');
      showToast('تم تحديث كلمة المرور بنجاح');
    } catch (err: unknown) {
      let msg = 'حدث خطأ غير متوقع';
      if (err instanceof Error) msg = err.message;
      showToast(msg || 'حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>إعدادات الحساب</h1>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="old">كلمة المرور الحالية</label>
          <input
            id="old"
            type="password"
            className={`${styles.input} ${errors.old ? styles.inputError : ''}`}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.old && <div className={styles.error}>{errors.old}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">كلمة المرور الجديدة</label>
          <input
            id="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && <div className={styles.error}>{errors.password}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirm">تأكيد كلمة المرور</label>
          <input
            id="confirm"
            type="password"
            className={`${styles.input} ${errors.confirm ? styles.inputError : ''}`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.confirm && <div className={styles.error}>{errors.confirm}</div>}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
      {toastMsg && (
        <div className={`${styles.toast} ${toastVisible ? styles.toastVisible : ''}`}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
