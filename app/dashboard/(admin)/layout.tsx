'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  BarChart3,
  Database,
  Mail
} from 'lucide-react';
import styles from './dashboard-layout.module.css';
import { getAuthUser, logout } from '@/app/lib/auth.service';
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
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
    if (!token) {
      router.push('/md-dash/login');
      return;
    }
    if (isAuthor && !allowedAuthorPaths.has(pathname)) {
      router.replace('/md-dash/issues');
    }
  }, [router, pathname, isAuthor, allowedAuthorPaths]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch { }
    router.push('/md-dash/login');
  };

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

    const resetTimer = () => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on any user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [router]);

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/md-dash' },
    { name: 'إدارة الأعداد', icon: FileText, path: '/md-dash/issues' },
    { name: 'إدارة المقالات', icon: FileText, path: '/md-dash/articles' },
    { name: 'إدارة المشرفين', icon: Users, path: '/md-dash/admins' },
    { name: 'إدارة المشتركين', icon: Mail, path: '/md-dash/newsletter' },
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
              className={`${styles.navLink} ${pathname === item.path ? styles.activeNavLink : ''}`}
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
