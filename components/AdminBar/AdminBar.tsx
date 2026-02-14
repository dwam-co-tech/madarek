'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Mail,
    Users,
    Settings,
    LogOut,
    User,
    ChevronDown,
} from 'lucide-react';
import { getAuthUser, logout } from '@/app/lib/auth.service';
import type { User as AuthUser } from '@/app/lib/auth.model';
import styles from './AdminBar.module.css';

export default function AdminBar() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await getAuthUser();
                if (currentUser && currentUser.role === 'admin') {
                    setUser(currentUser);
                    // Add class to body when admin bar is visible
                    document.body.classList.add('admin-bar-visible');
                }
            } catch (error) {
                // User not authenticated or not admin
                setUser(null);
                document.body.classList.remove('admin-bar-visible');
            }
        };

        checkAuth();

        return () => {
            document.body.classList.remove('admin-bar-visible');
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            document.body.classList.remove('admin-bar-visible');
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Don't render if user is not admin or on dashboard pages
    if (!user || pathname?.startsWith('/md-dash') || pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <div className={styles.adminBar}>
            <div className={styles.container}>
                {/* Right side - Logo and main links */}
                <div className={styles.rightSection}>
                    <Link href="/" className={styles.siteName}>
                        مدارك
                    </Link>

                    <nav className={styles.mainNav}>
                        <Link href="/md-dash" className={styles.navLink}>
                            <LayoutDashboard size={16} />
                            <span>لوحة التحكم</span>
                        </Link>

                        <Link href="/md-dash/issues" className={styles.navLink}>
                            <FileText size={16} />
                            <span>الأعداد</span>
                        </Link>

                        <Link href="/md-dash/articles" className={styles.navLink}>
                            <FileText size={16} />
                            <span>المقالات</span>
                        </Link>

                        <Link href="/md-dash/newsletter" className={styles.navLink}>
                            <Mail size={16} />
                            <span>المشتركين</span>
                        </Link>

                        <Link href="/md-dash/admins" className={styles.navLink}>
                            <Users size={16} />
                            <span>المشرفين</span>
                        </Link>
                    </nav>
                </div>

                {/* Left side - User menu */}
                <div className={styles.leftSection}>
                    <div className={styles.userMenu}>
                        <button
                            className={styles.userButton}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            onBlur={() => setTimeout(() => setShowUserMenu(false), 200)}
                        >
                            <User size={16} />
                            <span className={styles.userName}>{user.name}</span>
                            <ChevronDown size={14} className={showUserMenu ? styles.chevronUp : ''} />
                        </button>

                        {showUserMenu && (
                            <div className={styles.dropdown}>
                                <Link href="/md-dash/account" className={styles.dropdownItem}>
                                    <Settings size={16} />
                                    <span>إعدادات الحساب</span>
                                </Link>

                                <button onClick={handleLogout} className={styles.dropdownItem}>
                                    <LogOut size={16} />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
