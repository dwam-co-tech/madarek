 'use client';
 
 import React, { useEffect, useState } from 'react';
 import Link from 'next/link';
 import { Eye, FileText } from 'lucide-react';
 import { Users, Database } from 'lucide-react';
 import styles from './dashboard-home.module.css';
 import { getHomeStats } from '@/app/lib/home.service';
 import type { HomeStatsResponse } from '@/app/lib/home.model';
 
 export default function DashboardHome() {
   const [stats, setStats] = useState<HomeStatsResponse | null>(null);
   useEffect(() => {
     getHomeStats()
       .then(setStats)
       .catch(() => setStats(null));
   }, []);
   return (
     <div>
       <section className={styles.welcomeSection}>
         <div className={styles.welcomeCard}>
           <div className={styles.welcomeTitle}>مرحباً بك في لوحة التحكم</div>
           <div className={styles.welcomeSubtitle}>إدارة المحتوى ومتابعة الإحصائيات بسهولة</div>
         </div>
       </section>
       <div className={styles.dashboardGrid}>
         <div className={styles.statCard}>
           <div className={styles.statHeader}>
             <span className={styles.statTitle}>إجمالي المشاهدات</span>
             <div className={`${styles.statIcon} ${styles.blue}`}>
               <Eye size={20} />
             </div>
           </div>
           <div className={styles.statValue}>{stats?.total_views ?? 0}</div>
         </div>
 
         <div className={styles.statCard}>
           <div className={styles.statHeader}>
             <span className={styles.statTitle}>عدد الأعداد</span>
             <div className={`${styles.statIcon} ${styles.green}`}>
               <FileText size={20} />
             </div>
           </div>
           <div className={styles.statValue}>{stats?.issues_count ?? 0}</div>
         </div>
       </div>
 
       <div className={styles.quickActions}>
         <Link href="/dashboard/issues" className={styles.actionBtn} aria-label="إدارة الأعداد">
           <FileText size={18} />
           <span>إدارة الأعداد</span>
         </Link>
         <Link href="/dashboard/articles" className={styles.actionBtn} aria-label="إدارة المقالات">
           <FileText size={18} />
           <span>إدارة المقالات</span>
         </Link>
         <Link href="/dashboard/admins" className={styles.actionBtn} aria-label="إدارة المشرفين">
           <Users size={18} />
           <span>إدارة المشرفين</span>
         </Link>
         <Link href="/dashboard/backup" className={styles.actionBtn} aria-label="النسخ الاحتياطي">
           <Database size={18} />
           <span>النسخ الاحتياطي</span>
         </Link>
       </div>
     </div>
   );
 }
