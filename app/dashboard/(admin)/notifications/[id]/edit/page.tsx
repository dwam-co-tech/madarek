'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import NotificationForm from '../../bank-components/NotificationForm';
import styles from '../../bank-components/notificationBank.module.css';
import { Alert, Loading, PageHeader } from '../../bank-components/shared';
import { getBankNotification } from '@/app/lib/notification-bank.service';
import type { BankNotification } from '@/app/lib/notification-bank.model';

export default function EditNotificationPage() {
  const params = useParams<{ id: string }>();
  const [notification, setNotification] = useState<BankNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBankNotification(params.id)
      .then(setNotification)
      .catch((err) => setError(err instanceof Error ? err.message : 'فشل جلب الإشعار'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Notification Bank"
        title="تعديل إشعار"
        actions={<Link className={styles.secondaryButton} href={`/md-dash/notifications/${params.id}`}><ArrowRight size={18} /> العودة</Link>}
      />
      <Alert message={error} />
      {loading ? <Loading /> : notification && <NotificationForm notification={notification} />}
    </div>
  );
}
