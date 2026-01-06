'use client';

import React, { useEffect, useState } from 'react';
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
  Database
} from 'lucide-react';
import styles from './dashboard-layout.module.css';
import { getAuthUser, logout } from '@/app/lib/auth.service';
import type { User } from '@/app/lib/auth.model';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const authUser: User | null = (() => {
    try {
      return getAuthUser();
    } catch {
      return null;
    }
  })();

  // Check auth
  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='));
    if (!token) {
      router.push('/dashboard/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    router.push('/dashboard/login');
  };

  const menuItems = [
    { name: 'الرئيسية', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'إدارة الأعداد', icon: FileText, path: '/dashboard/issues' },
    { name: 'إدارة المقالات', icon: FileText, path: '/dashboard/articles' },
    { name: 'إدارة المشرفين', icon: Users, path: '/dashboard/admins' },
    { name: 'النسخ الاحتياطي', icon: Database, path: '/dashboard/backup' },
    { name: 'إعدادات الحساب', icon: Settings, path: '/dashboard/account-settings' },
  ];

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
        <div className={styles.logoArea}>
          <Image 
            src="/logo3.png" 
            alt="مدارك" 
            width={100} 
            height={40} 
            className={styles.logo}
          />
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map((item) => (
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
          <h2 className={styles.headerTitle}>لوحة التحكم</h2>
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
