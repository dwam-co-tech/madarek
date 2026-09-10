'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Database,
  Mail,
  Bell,
  FolderOpen
} from 'lucide-react';
import styles from './dashboard-layout.module.css';
import {
  ADMIN_INACTIVITY_TIMEOUT,
  ADMIN_LAST_ACTIVITY_KEY,
  clearAuth,
  getAuthUser,
  getLastAdminActivity,
  logout,
  recordAdminActivity,
} from '@/app/lib/auth.service';
import type { User } from '@/app/lib/auth.model';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const authUser: User | null = (() => {
    try {
      return getAuthUser();
    } catch {
      return null;
    }
  })();
  const isAuthor = authUser?.role === 'author';
  const allowedAuthorPaths = useMemo(
    () => new Set(['/md-dash/issues', '/md-dash/articles', '/md-dash/articles/manage', '/md-dash/account-settings']),
    []
  );

  // Check auth
  useEffect(() => {
    document.title = "لوحة تحكم مجلة مدارك";
    document.body.classList.add("dashboard-page");

    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
    if (!token) {
      router.push('/md-dash/login');
      return;
    }
    if (isAuthor && !allowedAuthorPaths.has(pathname)) {
      router.replace('/md-dash/issues');
    }

    return () => {
      document.body.classList.remove("dashboard-page");
    };
  }, [router, pathname, isAuthor, allowedAuthorPaths]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      clearAuth();
    }
    router.replace('/md-dash/login');
  }, [router]);

  // Keep the session while the dashboard is active and end it after two real
  // hours without activity, including across reloads and browser tabs.
  useEffect(() => {
    let lastPersistedAt = 0;

    const scheduleExpiry = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      const lastActivity = getLastAdminActivity();
      if (!lastActivity) {
        recordAdminActivity();
      } else if (Date.now() - lastActivity >= ADMIN_INACTIVITY_TIMEOUT) {
        void handleLogout();
        return;
      }
      const remaining = Math.max(
        0,
        ADMIN_INACTIVITY_TIMEOUT - (Date.now() - (getLastAdminActivity() ?? Date.now())),
      );
      inactivityTimerRef.current = setTimeout(() => {
        void handleLogout();
      }, remaining);
    };

    const registerActivity = () => {
      const now = Date.now();
      // Mousemove/scroll can fire dozens of times per second. Persist at most
      // once every 30 seconds while still rescheduling the in-memory timer.
      if (now - lastPersistedAt >= 30_000) {
        recordAdminActivity(now);
        lastPersistedAt = now;
      }
      scheduleExpiry();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ADMIN_LAST_ACTIVITY_KEY) return;
      if (event.newValue === null) {
        clearAuth();
        router.replace('/md-dash/login');
        return;
      }
      scheduleExpiry();
    };

    const handleUnauthorized = () => {
      clearAuth();
      router.replace('/md-dash/login?reason=session');
    };

    const events: Array<keyof DocumentEventMap> = [
      'pointerdown', 'mousemove', 'keydown', 'scroll', 'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, registerActivity, { passive: true });
    });
    window.addEventListener('storage', handleStorage);
    window.addEventListener('madarek:unauthorized', handleUnauthorized);
    scheduleExpiry();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, registerActivity);
      });
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('madarek:unauthorized', handleUnauthorized);
    };
  }, [handleLogout, router]);

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/md-dash' },
    { name: 'إدارة الأعداد', icon: FileText, path: '/md-dash/issues' },
    { name: 'إدارة المقالات', icon: FileText, path: '/md-dash/articles' },
    { name: 'إدارة الملفات', icon: FolderOpen, path: '/md-dash/files' },
    { name: 'إدارة المشرفين', icon: Users, path: '/md-dash/admins' },
    { name: 'إدارة المشتركين', icon: Mail, path: '/md-dash/newsletter' },
    { name: 'إدارة الإشعارات', icon: Bell, path: '/md-dash/notifications' },
    { name: 'النسخ الاحتياطي', icon: Database, path: '/md-dash/backup' },
    { name: 'إعدادات الحساب', icon: Settings, path: '/md-dash/account-settings' },
  ];
  const visibleMenuItems = isAuthor ? menuItems.filter((it) => allowedAuthorPaths.has(it.path)) : menuItems;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setIsSidebarOpen(false)}
          aria-label="إغلاق القائمة"
        >
          <X size={18} />
          {/* <span>إغلاق</span> */}
        </button>
        <Link href="/" className={styles.logoArea}>
          <Image
            src="/logo3.png"
            alt="مدارك"
            width={100}
            height={40}
            className={styles.logo}
          />
        </Link>

        <nav className={styles.nav}>
          {visibleMenuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navLink} ${(pathname === item.path || pathname.startsWith(`${item.path}/`)) ? styles.activeNavLink : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>لوحة تحكم مجلة مدارك</h2>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setIsSidebarOpen((s) => !s)}
            aria-label="فتح/إغلاق القائمة الجانبية"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={20} />
            <span>القائمة</span>
          </button>
          <div className={styles.headerActions}>
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <span className={styles.userName} suppressHydrationWarning>{authUser?.name ?? 'المسؤول'}</span>
                <span className={styles.userRole} suppressHydrationWarning>{authUser?.email ?? 'admin@madarek.com'}</span>
              </div>
              <div className={styles.avatar} suppressHydrationWarning>{(authUser?.name?.[0] ?? 'A').toUpperCase()}</div>
            </div>
          </div>
        </header>

        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
