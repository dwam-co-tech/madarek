import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NotificationForm from '../bank-components/NotificationForm';
import styles from '../bank-components/notificationBank.module.css';
import { PageHeader } from '../bank-components/shared';

export default function CreateNotificationPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Notification Bank"
        title="إنشاء إشعار"
        subtitle="الحفظ لا يرسل الإشعار. استخدم زر إرسال الآن بعد تفعيل الإشعار."
        actions={<Link className={styles.secondaryButton} href="/md-dash/notifications"><ArrowRight size={18} /> العودة</Link>}
      />
      <NotificationForm />
    </div>
  );
}
