'use client';

import React, { useEffect, useState } from 'react';
import styles from './account-settings.module.css';
import { updateEmail, updatePassword } from '@/app/lib/account.service';
import { getAuthUser } from '@/app/lib/auth.service';

export default function AccountSettingsPage() {
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ email?: string; password?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirm?: string; old?: string }>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  useEffect(() => {
    const u = getAuthUser();
    if (u?.email) setEmail(u.email);
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

  const validateEmail = () => {
    const next: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) next.email = 'البريد الإلكتروني مطلوب';
    else if (!emailRegex.test(email)) next.email = 'صيغة البريد الإلكتروني غير صحيحة';
    if (!emailPassword) next.password = 'كلمة المرور الحالية مطلوبة';
    setEmailErrors(next);
    return Object.keys(next).length === 0;
  };

  const validatePassword = () => {
    const next: { newPassword?: string; confirm?: string; old?: string } = {};
    if (newPassword && newPassword.length < 6) next.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (newPassword && confirm !== newPassword) next.confirm = 'تأكيد كلمة المرور غير مطابق';
    if (newPassword && !oldPassword) next.old = 'كلمة المرور الحالية مطلوبة';
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailErrors({});
    if (!validateEmail()) return;
    setIsSavingEmail(true);
    try {
      await updateEmail({ password: emailPassword, new_email: email });
      setEmailPassword('');
      showToast('تم تحديث البريد الإلكتروني بنجاح');
    } catch (err: unknown) {
      let msg = 'حدث خطأ غير متوقع';
      if (err instanceof Error) msg = err.message;
      showToast(msg || 'حدث خطأ أثناء تحديث البريد الإلكتروني');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    if (!validatePassword()) return;
    setIsSavingPassword(true);
    try {
      const payload = { password: oldPassword, new_password: newPassword, new_password_confirmation: confirm };
      await updatePassword(payload);
      setNewPassword('');
      setConfirm('');
      setOldPassword('');
      showToast('تم تحديث كلمة المرور بنجاح');
    } catch (err: unknown) {
      let msg = 'حدث خطأ غير متوقع';
      if (err instanceof Error) msg = err.message;
      showToast(msg || 'حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>إعدادات الحساب</h1>
      </div>
      <form className={styles.form} onSubmit={handleEmailSubmit} noValidate>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${emailErrors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
          />
          {emailErrors.email && <div className={styles.error}>{emailErrors.email}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email_password">كلمة المرور الحالية</label>
          <input
            id="email_password"
            type="password"
            className={`${styles.input} ${emailErrors.password ? styles.inputError : ''}`}
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {emailErrors.password && <div className={styles.error}>{emailErrors.password}</div>}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={isSavingEmail}>
            {isSavingEmail ? 'جاري الحفظ...' : 'حفظ البريد الإلكتروني'}
          </button>
        </div>
      </form>

      <form className={styles.form} onSubmit={handlePasswordSubmit} noValidate>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="old">كلمة المرور الحالية</label>
          <input
            id="old"
            type="password"
            className={`${styles.input} ${passwordErrors.old ? styles.inputError : ''}`}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {passwordErrors.old && <div className={styles.error}>{passwordErrors.old}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">كلمة المرور الجديدة</label>
          <input
            id="password"
            type="password"
            className={`${styles.input} ${passwordErrors.newPassword ? styles.inputError : ''}`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {passwordErrors.newPassword && <div className={styles.error}>{passwordErrors.newPassword}</div>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="confirm">تأكيد كلمة المرور</label>
          <input
            id="confirm"
            type="password"
            className={`${styles.input} ${passwordErrors.confirm ? styles.inputError : ''}`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {passwordErrors.confirm && <div className={styles.error}>{passwordErrors.confirm}</div>}
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn} disabled={isSavingPassword}>
            {isSavingPassword ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
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
