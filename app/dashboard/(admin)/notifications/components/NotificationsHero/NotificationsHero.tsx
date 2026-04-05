import { Bell } from 'lucide-react';
import styles from './NotificationsHero.module.css';

type Props = {
  total: number;
  sent: number;
};

export default function NotificationsHero({ total, sent }: Props) {
  return (
    <div className={styles.hero}>
      <div className={styles.heroText}>
        <h1 className={styles.heroTitle}>إدارة الإشعارات</h1>
        <p className={styles.heroSubtitle}>أرسل إشعارات فورية لمتابعي المجلة وتابع سجل الإشعارات السابقة</p>
      </div>

      <div className={styles.heroStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{total}</span>
          <span className={styles.statLabel}>إجمالي الإشعارات</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{sent}</span>
          <span className={styles.statLabel}>تم الإرسال</span>
        </div>
      </div>

      <div className={styles.heroIcon}>
        <Bell size={36} />
      </div>
    </div>
  );
}
