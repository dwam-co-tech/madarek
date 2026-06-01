import Link from 'next/link';
import { ArrowRight, CalendarClock } from 'lucide-react';
import styles from '../../bank-components/notificationBank.module.css';
import { PageHeader } from '../../bank-components/shared';

export default function LegacyNotificationSchedulePage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Legacy Schedule"
        title="تم نقل جدولة الإشعارات"
        subtitle="تم نقل الجدولة إلى جدول نشر بنك الإشعارات العام، ولم تعد الإشعارات الفردية تملك جدولا من لوحة التحكم."
        actions={<Link className={styles.secondaryButton} href="/md-dash/notifications"><ArrowRight size={18} /> العودة للبنك</Link>}
      />
      <div className={styles.panel}>
        <p className={styles.legacyText}>تم نقل الجدولة إلى جدول نشر بنك الإشعارات العام.</p>
        <Link className={styles.button} href="/md-dash/notifications/bank-schedule">
          <CalendarClock size={18} />
          فتح جدول نشر البنك
        </Link>
      </div>
    </div>
  );
}
