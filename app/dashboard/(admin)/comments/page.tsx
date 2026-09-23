'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Check, Eye, MessageSquare, X } from 'lucide-react';
import type { ArticleComment, CommentStatus, ModerationStatus } from '../../../lib/comments.model';
import { CommentRequestError, getAdminComment, getAdminComments, updateCommentStatus } from '../../../lib/comments.service';
import shared from '../issues.module.css';
import styles from './comments.module.css';

type StatusFilter = CommentStatus | 'all';

const statusLabels: Record<CommentStatus, string> = {
  pending: 'معلق',
  approved: 'مقبول',
  rejected: 'مرفوض',
};

function errorMessage(error: unknown) {
  return error instanceof CommentRequestError
    ? error.message
    : 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.';
}

function shortText(text: string) {
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [details, setDetails] = useState<ArticleComment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminComments(page, status);
      setComments(result.data);
      setLastPage(Math.max(1, result.last_page));
      setTotal(result.total);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { void load(); }, [load]);

  const changeFilter = (value: StatusFilter) => {
    setPage(1);
    setStatus(value);
    setFeedback(null);
  };

  const openDetails = async (id: number) => {
    setBusyId(id);
    setError('');
    try {
      const result = await getAdminComment(id);
      setDetails(result.comment);
    } catch (detailsError) {
      setError(errorMessage(detailsError));
    } finally {
      setBusyId(null);
    }
  };

  const moderate = async (comment: ArticleComment, nextStatus: ModerationStatus) => {
    setBusyId(comment.id);
    setError('');
    setFeedback(null);
    setDetails(null);
    try {
      const result = await updateCommentStatus(comment.id, nextStatus);
      setComments((current) => current.map((item) => item.id === comment.id ? result.comment : item));
      setFeedback({
        type: 'success',
        message: result.message ?? (nextStatus === 'approved' ? 'تم قبول التعليق بنجاح.' : 'تم رفض التعليق بنجاح.'),
      });
      if (status !== 'all' && status !== nextStatus) await load();
    } catch (moderationError) {
      setFeedback({ type: 'error', message: errorMessage(moderationError) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div dir="rtl">
      <div className={shared.pageHeader}>
        <div><h1 className={shared.pageTitle}>إدارة التعليقات</h1><p className={styles.subtitle}>مراجعة تعليقات القراء وقبولها أو رفضها.</p></div>
        <span className={styles.total}>الإجمالي: {total}</span>
      </div>

      <div className={styles.filters} role="group" aria-label="تصفية التعليقات حسب الحالة">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((value) => (
          <button key={value} type="button" className={status === value ? styles.activeFilter : styles.filter} onClick={() => changeFilter(value)}>
            {value === 'all' ? 'الكل' : statusLabels[value]}
          </button>
        ))}
      </div>

      {feedback && <p className={feedback.type === 'success' ? styles.success : styles.error} role={feedback.type === 'success' ? 'status' : 'alert'}>{feedback.message}</p>}
      {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}
      {loading && <p role="status">جارٍ تحميل التعليقات...</p>}

      {!loading && !error && (
        comments.length === 0 ? (
          <div className={styles.empty}><MessageSquare size={34} /><p>لا توجد تعليقات مطابقة.</p></div>
        ) : (
          <div className={`${shared.tableWrapper} ${styles.tableWrapper}`}>
            <table className={shared.table}>
              <thead className={shared.thead}><tr>
                <th className={shared.th}>اسم صاحب التعليق</th><th className={shared.th}>نص مختصر</th>
                <th className={shared.th}>المقال</th><th className={shared.th}>الحالة</th>
                <th className={shared.th}>تاريخ الإرسال</th><th className={shared.th}>الإجراءات</th>
              </tr></thead>
              <tbody>{comments.map((comment) => (
                <tr key={comment.id} className={shared.row}>
                  <td className={shared.td}>{comment.author_name}</td>
                  <td className={`${shared.td} ${styles.excerpt}`}>{shortText(comment.text)}</td>
                  <td className={shared.td}>{comment.article?.title ?? `المقال #${comment.article_id}`}</td>
                  <td className={shared.td}><span className={`${styles.badge} ${styles[comment.status]}`}>{statusLabels[comment.status]}</span></td>
                  <td className={shared.td}>{new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(comment.created_at))}</td>
                  <td className={shared.td}><div className={shared.actions}>
                    <button type="button" className={shared.iconBtn} disabled={busyId === comment.id} title="التفاصيل" aria-label={`عرض تعليق ${comment.author_name}`} onClick={() => void openDetails(comment.id)}><Eye size={17} /></button>
                    <button type="button" className={`${shared.iconBtn} ${styles.approve}`} disabled={busyId === comment.id || comment.status === 'approved'} title="قبول" aria-label={`قبول تعليق ${comment.author_name}`} onClick={() => void moderate(comment, 'approved')}><Check size={17} /></button>
                    <button type="button" className={`${shared.iconBtn} ${styles.reject}`} disabled={busyId === comment.id || comment.status === 'rejected'} title="رفض" aria-label={`رفض تعليق ${comment.author_name}`} onClick={() => void moderate(comment, 'rejected')}><X size={17} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}

      {!loading && !error && lastPage > 1 && <nav className={styles.pagination} aria-label="صفحات التعليقات">
        <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>السابق</button>
        <span>صفحة {page} من {lastPage}</span>
        <button type="button" disabled={page === lastPage} onClick={() => setPage((value) => value + 1)}>التالي</button>
      </nav>}

      {details && <div className={shared.modalOverlay}><div className={`${shared.modal} ${styles.modal}`} role="dialog" aria-modal="true" aria-labelledby="comment-details-title">
        <h2 className={shared.modalTitle} id="comment-details-title">تفاصيل التعليق</h2>
        <dl className={styles.details}>
          <div><dt>اسم صاحب التعليق</dt><dd>{details.author_name}</dd></div>
          <div><dt>المقال</dt><dd>{details.article?.title ?? `المقال #${details.article_id}`}</dd></div>
          <div><dt>الحالة</dt><dd><span className={`${styles.badge} ${styles[details.status]}`}>{statusLabels[details.status]}</span></dd></div>
          <div><dt>تاريخ الإرسال</dt><dd>{new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(details.created_at))}</dd></div>
          <div className={styles.fullText}><dt>نص التعليق</dt><dd>{details.text}</dd></div>
        </dl>
        <div className={shared.modalActions}>
          <button type="button" className={shared.cancelBtn} disabled={busyId === details.id} onClick={() => setDetails(null)}>إغلاق</button>
          <button type="button" className={shared.saveBtn} disabled={busyId === details.id || details.status === 'approved'} onClick={() => void moderate(details, 'approved')}>قبول</button>
          <button type="button" className={styles.rejectAction} disabled={busyId === details.id || details.status === 'rejected'} onClick={() => void moderate(details, 'rejected')}>رفض</button>
        </div>
      </div></div>}
    </div>
  );
}
