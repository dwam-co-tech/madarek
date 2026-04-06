'use client';

import { useState } from 'react';
import { Bell, Clock, Link2, Trash2, ChevronRight, ChevronLeft, BellOff } from 'lucide-react';
import styles from './NotificationsList.module.css';
import type { Notification } from '@/app/lib/notifications.model';

const PAGE_SIZE = 10;

type Props = {
  notifications: Notification[];
  onDelete: (id: number) => Promise<void>;
  loading?: boolean;
};

export default function NotificationsList({ notifications, onDelete, loading = false }: Props) {
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const paginated = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      const newTotal = notifications.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > newTotalPages) setPage(newTotalPages);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.cardIcon}>
            <Bell size={20} />
          </div>
          <h2 className={styles.cardTitle}>سجل الإشعارات</h2>
        </div>
        <span className={styles.count}>{notifications.length} إشعار</span>
      </div>

      {loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><Bell size={28} /></div>
          <p className={styles.emptyText}>جاري تحميل الإشعارات...</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><BellOff size={28} /></div>
          <p className={styles.emptyText}>لا توجد إشعارات بعد</p>
        </div>
      ) : (
        <div className={styles.list}>
          {paginated.map((n) => (
            <div key={n.id} className={styles.item}>
              <div className={styles.itemIcon}><Bell size={18} /></div>
              <div className={styles.itemBody}>
                <p className={styles.itemTitle}>{n.title}</p>
                <p className={styles.itemDesc}>{n.description}</p>
                <div className={styles.itemMeta}>
                  <span className={styles.itemDate}>
                    <Clock size={12} />
                    {formatDate(n.sent_at)}
                  </span>
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noreferrer" className={styles.itemLink}>
                      <Link2 size={12} />
                      رابط الإشعار
                    </a>
                  )}
                  <span className={`${styles.statusBadge} ${n.status === 'sent' ? styles.statusSent : styles.statusFailed}`}>
                    {n.status === 'sent' ? 'تم الإرسال' : 'فشل'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(n.id)}
                disabled={deletingId === n.id}
                aria-label="حذف الإشعار"
              >
                {deletingId === n.id ? <span style={{ fontSize: '10px' }}>...</span> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.activePage : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            aria-label="الصفحة التالية"
          >
            <ChevronLeft size={16} />
          </button>

          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
