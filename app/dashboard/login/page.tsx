'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { login as authLogin, checkAuth } from '@/app/lib/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      try {
        const user = await checkAuth();
        if (user) {
          if (user.role === 'author') {
            router.replace('/md-dash/issues');
          } else {
            router.replace('/md-dash');
          }
        } else {
          setIsCheckingAuth(false);
        }
      } catch {
        setIsCheckingAuth(false);
      }
    };
    checkUser();
  }, [router]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    }

    if (!password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);
    try {
      const auth = await authLogin(email, password);
      if (auth.user.role === 'author') {
        router.push('/md-dash/issues');
      } else {
        router.push('/md-dash');
      }
    } catch (err: unknown) {
      let message = 'حدث خطأ غير متوقع';
      if (err instanceof Error) {
        message = err.message;
      }
      setErrors({ general: message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isCheckingAuth ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>
          جاري التحقق من الجلسة...
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo3.png"
              alt="شعار مدارك"
              width={150}
              height={150}
              className={styles.logo}
              priority
            />
          </div>

          <h1 className={styles.title}>تسجيل الدخول</h1>
          <p className={styles.subtitle}>مرحباً بك في لوحة تحكم مدارك</p>

          {errors.general && (
            <div className={styles.generalError}>
              {errors.general}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>كلمة المرور</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && <div className={styles.errorMsg}>{errors.password}</div>}
            </div>

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? <div className={styles.loader}></div> : 'تسجيل الدخول'}
            </button>

            {/* <div className={styles.forgotPassword}>
            <a href="#" className={styles.forgotPasswordLink}>نسيت كلمة المرور؟</a>
          </div> */}
          </form>
        </div>
      )}
    </div>
  );
}
