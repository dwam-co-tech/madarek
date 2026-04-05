'use client';

import { useState, useEffect } from 'react';
import NotificationsHero from './components/NotificationsHero/NotificationsHero';
import SendNotification from './components/SendNotification/SendNotification';
import NotificationsList from './components/NotificationsList/NotificationsList';
import { getNotifications, deleteNotification } from '@/app/lib/notifications.service';
import type { Notification } from '@/app/lib/notifications.model';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = () => {
    setLoading(true);
    setError(null);
    getNotifications()
      .then(setNotifications)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب الإشعارات');
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSent = (n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const sentCount = notifications.filter((n) => n.status === 'sent').length;

  return (
    <>
      <NotificationsHero total={notifications.length} sent={sentCount} />
      <SendNotification onSent={handleSent} />

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1.5rem',
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
          color: '#dc2626', fontSize: '0.9rem', fontWeight: 600,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </span>
          <button
            onClick={loadNotifications}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.9rem', borderRadius: '8px',
              border: '1px solid #fca5a5', background: '#fff',
              color: '#dc2626', fontFamily: 'Cairo, sans-serif',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            إعادة المحاولة
          </button>
        </div>
      )}

      <NotificationsList
        notifications={notifications}
        onDelete={handleDelete}
        loading={loading}
      />
    </>
  );
}
