'use client';

import { useParams } from 'next/navigation';
import DispatchLogsClient from '../../bank-components/DispatchLogsClient';

export default function NotificationDispatchesPage() {
  const params = useParams<{ id: string }>();
  return <DispatchLogsClient notificationId={params.id} title={`سجلات إرسال الإشعار #${params.id}`} />;
}
