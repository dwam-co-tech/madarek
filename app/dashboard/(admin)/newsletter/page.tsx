'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser } from '@/app/lib/auth.service';
import * as newsletterService from '@/app/lib/newsletter.service';
import type { NewsletterSubscriber } from '@/app/lib/newsletter.model';
import { Download, Edit2, Trash2, Mail } from 'lucide-react';
import styles from './newsletter.module.css';

export default function NewsletterPage() {
    const router = useRouter();
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingSubscriber, setEditingSubscriber] = useState<NewsletterSubscriber | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            router.push('/dashboard/login');
            return;
        }

        loadSubscribers();
    }, [router]);

    const loadSubscribers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await newsletterService.getSubscribers();
            setSubscribers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subscriber: NewsletterSubscriber) => {
        setEditingSubscriber(subscriber);
        setEditEmail(subscriber.email);
    };

    const handleCancelEdit = () => {
        setEditingSubscriber(null);
        setEditEmail('');
    };

    const handleSaveEdit = async () => {
        if (!editingSubscriber) return;

        try {
            setSaving(true);
            await newsletterService.updateSubscriber(editingSubscriber.id, editEmail);
            await loadSubscribers();
            setEditingSubscriber(null);
            setEditEmail('');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'حدث خطأ أثناء التحديث');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المشترك؟')) {
            return;
        }

        try {
            await newsletterService.deleteSubscriber(id);
            await loadSubscribers();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف');
        }
    };

    const handleExport = async () => {
        if (subscribers.length === 0) {
            alert('لا توجد بيانات للتصدير');
            return;
        }

        try {
            setExporting(true);
            const blob = await newsletterService.exportToExcel();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'فشل في تصدير البيانات');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>جاري التحميل...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>إدارة المشتركين في النشرة البريدية</h1>
                <button
                    onClick={handleExport}
                    disabled={exporting || subscribers.length === 0}
                    className={styles.exportButton}
                >
                    <Download size={18} />
                    {exporting ? 'جاري التصدير...' : 'تصدير Excel'}
                </button>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                    <button onClick={loadSubscribers} className={styles.retryButton}>
                        إعادة المحاولة
                    </button>
                </div>
            )}

            {subscribers.length === 0 ? (
                <div className={styles.empty}>
                    <Mail size={48} />
                    <p>لا توجد اشتراكات حتى الآن</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>البريد الإلكتروني</th>
                                <th>تاريخ التسجيل</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((subscriber) => (
                                <tr key={subscriber.id}>
                                    <td>
                                        <a
                                            href={`mailto:${subscriber.email}`}
                                            className={styles.emailLink}
                                        >
                                            {subscriber.email}
                                        </a>
                                    </td>
                                    <td>{subscriber.formatted_date || new Date(subscriber.created_at).toLocaleString('ar-EG')}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                onClick={() => handleEdit(subscriber)}
                                                className={styles.actionButton}
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subscriber.id)}
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingSubscriber && (
                <div className={styles.modal} onClick={handleCancelEdit}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>تعديل البريد الإلكتروني</h2>
                        <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className={styles.modalInput}
                            placeholder="البريد الإلكتروني"
                            disabled={saving}
                        />
                        <div className={styles.modalActions}>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving || !editEmail}
                                className={styles.saveButton}
                            >
                                {saving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className={styles.cancelButton}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
