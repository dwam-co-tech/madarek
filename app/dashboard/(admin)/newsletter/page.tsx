'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Edit2, Eye, History, Mail, RefreshCw, Search, Send, Trash2, Users, X } from 'lucide-react';
import { getAuthUser } from '@/app/lib/auth.service';
import * as newsletterService from '@/app/lib/newsletter.service';
import type { NewsletterCampaign, NewsletterCampaignDetails, NewsletterRecipientType, NewsletterSubscriber } from '@/app/lib/newsletter.model';
import styles from './newsletter.module.css';

type Tab = 'compose' | 'subscribers' | 'history';
type SubscriberStatus = 'all' | 'active' | 'unsubscribed';

const campaignStatus: Record<string, string> = {
    queued: 'في انتظار الإرسال', processing: 'جاري الإرسال', completed: 'تم الإرسال',
    completed_with_failures: 'اكتمل مع وجود أخطاء', failed: 'فشل الإرسال',
};
const recipientTypeLabel: Record<string, string> = { single: 'مشترك محدد', all: 'جميع المشتركين' };
const deliveryStatus: Record<string, string> = {
    pending: 'في الانتظار', processing: 'قيد المعالجة', sent: 'تم الإرسال', failed: 'فشل', skipped: 'تم التجاوز',
};

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleString('ar-EG') : '—';
}

export default function NewsletterPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('compose');
    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [recipientSubscribers, setRecipientSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [subscriberSearch, setSubscriberSearch] = useState('');
    const [recipientSearch, setRecipientSearch] = useState('');
    const [subscriberStatus, setSubscriberStatus] = useState<SubscriberStatus>('all');
    const [loadingSubscribers, setLoadingSubscribers] = useState(true);
    const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipientType, setRecipientType] = useState<NewsletterRecipientType>('all');
    const [subscriberId, setSubscriberId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [editingSubscriber, setEditingSubscriber] = useState<NewsletterSubscriber | null>(null);
    const [editEmail, setEditEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [details, setDetails] = useState<NewsletterCampaignDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
    const [validation, setValidation] = useState<Record<string, string>>({});

    const loadSubscribers = useCallback(async () => {
        try {
            setLoadingSubscribers(true);
            const data = await newsletterService.getSubscribers({
                search: subscriberSearch,
                status: subscriberStatus === 'all' ? undefined : subscriberStatus,
            });
            setSubscribers(data);
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر جلب المشتركين' });
        } finally {
            setLoadingSubscribers(false);
        }
    }, [subscriberSearch, subscriberStatus]);

    const loadRecipientSubscribers = useCallback(async () => {
        try {
            const data = await newsletterService.getSubscribers({ search: recipientSearch, status: 'active' });
            setRecipientSubscribers(data);
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر جلب المشتركين النشطين' });
        }
    }, [recipientSearch]);

    const loadCampaigns = useCallback(async () => {
        try {
            setLoadingCampaigns(true);
            const data = await newsletterService.getCampaigns();
            setCampaigns(data.data);
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر جلب سجل الرسائل' });
        } finally {
            setLoadingCampaigns(false);
        }
    }, []);

    useEffect(() => {
        const user = getAuthUser();
        if (!user || user.role !== 'admin') {
            router.replace('/md-dash/login');
            return;
        }
        void loadSubscribers();
        void loadCampaigns();
    }, [router, loadSubscribers, loadCampaigns]);

    useEffect(() => {
        if (recipientType === 'single') void loadRecipientSubscribers();
    }, [recipientType, loadRecipientSubscribers]);

    const validateCampaign = () => {
        const errors: Record<string, string> = {};
        if (!subject.trim()) errors.subject = 'أدخل عنوان الرسالة.';
        if (!body.trim()) errors.body = 'أدخل نص الرسالة.';
        if (recipientType === 'single' && !subscriberId) errors.recipient = 'اختر مشتركاً نشطاً.';
        setValidation(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCampaignSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (validateCampaign()) setConfirmOpen(true);
    };

    const sendCampaign = async () => {
        try {
            setSending(true);
            await newsletterService.createCampaign({
                subject: subject.trim(), body: body.trim(), recipient_type: recipientType,
                ...(recipientType === 'single' && subscriberId ? { subscriber_id: subscriberId } : {}),
            });
            setSubject(''); setBody(''); setSubscriberId(null); setConfirmOpen(false); setValidation({});
            setMessage({ kind: 'success', text: 'تمت جدولة الرسالة للإرسال بنجاح.' });
            await loadCampaigns();
            setTab('history');
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر إرسال الرسالة' });
        } finally {
            setSending(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingSubscriber || !editEmail.trim()) return;
        try {
            setSaving(true);
            await newsletterService.updateSubscriber(editingSubscriber.id, editEmail.trim());
            setEditingSubscriber(null); setEditEmail('');
            setMessage({ kind: 'success', text: 'تم تحديث بريد المشترك.' });
            await loadSubscribers();
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر تحديث المشترك' });
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المشترك؟')) return;
        try {
            await newsletterService.deleteSubscriber(id);
            setMessage({ kind: 'success', text: 'تم حذف المشترك.' });
            await loadSubscribers();
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر حذف المشترك' });
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await newsletterService.exportToExcel();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(url);
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'فشل تصدير البيانات' });
        } finally { setExporting(false); }
    };

    const showDetails = async (id: number) => {
        try {
            setLoadingDetails(true); setDetails(null);
            const data = await newsletterService.getCampaign(id);
            setDetails(data);
        } catch (err) {
            setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'تعذر جلب تفاصيل الحملة' });
        } finally { setLoadingDetails(false); }
    };

    const selectedRecipient = recipientSubscribers.find((item) => item.id === subscriberId);

    return (
        <div className={styles.container} dir="rtl">
            <div className={styles.header}>
                <div><h1 className={styles.title}>إدارة النشرة البريدية</h1><p className={styles.subtitle}>إرسال الرسائل ومتابعة المشتركين وحالة الحملات.</p></div>
            </div>
            {message && <div className={`${styles.notice} ${message.kind === 'success' ? styles.success : styles.error}`} role="alert"><span>{message.text}</span><button onClick={() => setMessage(null)} aria-label="إغلاق"><X size={17} /></button></div>}

            <div className={styles.tabs} role="tablist" aria-label="أقسام النشرة البريدية">
                <button className={tab === 'compose' ? styles.activeTab : ''} onClick={() => setTab('compose')}><Send size={17} />إرسال رسالة</button>
                <button className={tab === 'subscribers' ? styles.activeTab : ''} onClick={() => setTab('subscribers')}><Users size={17} />المشتركون</button>
                <button className={tab === 'history' ? styles.activeTab : ''} onClick={() => setTab('history')}><History size={17} />سجل الرسائل</button>
            </div>

            {tab === 'compose' && <form className={styles.card} onSubmit={handleCampaignSubmit}>
                <h2>رسالة جديدة</h2>
                <label className={styles.field}><span>عنوان الرسالة</span><input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={255} placeholder="مثال: جديد مجلة مدارك" />{validation.subject && <small>{validation.subject}</small>}</label>
                <label className={styles.field}><span>نص الرسالة</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="اكتب نص الرسالة بصيغة نص عادي…" />{validation.body && <small>{validation.body}</small>}</label>
                <fieldset className={styles.recipientBox}><legend>المستلمون</legend>
                    <label className={styles.radio}><input type="radio" checked={recipientType === 'all'} onChange={() => setRecipientType('all')} />كل المشتركين النشطين</label>
                    <label className={styles.radio}><input type="radio" checked={recipientType === 'single'} onChange={() => setRecipientType('single')} />مشترك واحد</label>
                    {recipientType === 'single' && <div className={styles.selector}>
                        <div className={styles.searchRow}><input value={recipientSearch} onChange={(e) => setRecipientSearch(e.target.value)} placeholder="ابحث بالبريد الإلكتروني" /><button type="button" onClick={() => void loadRecipientSubscribers()}><Search size={16} />بحث</button></div>
                        <select value={subscriberId ?? ''} onChange={(e) => setSubscriberId(e.target.value ? Number(e.target.value) : null)}><option value="">اختر مشتركاً نشطاً</option>{recipientSubscribers.map((subscriber) => <option key={subscriber.id} value={subscriber.id}>{subscriber.email}</option>)}</select>
                    </div>}
                    {validation.recipient && <small>{validation.recipient}</small>}
                </fieldset>
                <div className={styles.formActions}><button className={styles.primaryButton} type="submit"><Send size={18} />مراجعة وإرسال</button></div>
            </form>}

            {tab === 'subscribers' && <section className={styles.card}>
                <div className={styles.sectionHeader}><h2>المشتركون</h2><button className={styles.secondaryButton} onClick={() => void handleExport()} disabled={exporting}><Download size={17} />{exporting ? 'جارٍ التصدير…' : 'تصدير Excel'}</button></div>
                <div className={styles.filters}><input value={subscriberSearch} onChange={(e) => setSubscriberSearch(e.target.value)} placeholder="ابحث بالبريد الإلكتروني" /><select value={subscriberStatus} onChange={(e) => setSubscriberStatus(e.target.value as SubscriberStatus)}><option value="all">كل الحالات</option><option value="active">نشط</option><option value="unsubscribed">ألغى الاشتراك</option></select><button className={styles.secondaryButton} onClick={() => void loadSubscribers()}><Search size={16} />بحث</button></div>
                {loadingSubscribers ? <div className={styles.loading}>جارٍ تحميل المشتركين…</div> : subscribers.length === 0 ? <div className={styles.empty}><Mail size={36} /><p>لا توجد نتائج مطابقة.</p></div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>البريد الإلكتروني</th><th>الحالة</th><th>تاريخ الاشتراك</th><th>الإجراءات</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.id}><td><a href={`mailto:${subscriber.email}`}>{subscriber.email}</a></td><td><span className={`${styles.badge} ${subscriber.unsubscribed_at ? styles.badgeMuted : styles.badgeSuccess}`}>{subscriber.unsubscribed_at ? 'ألغى الاشتراك' : 'نشط'}</span></td><td>{formatDate(subscriber.created_at)}</td><td><div className={styles.actions}><button onClick={() => { setEditingSubscriber(subscriber); setEditEmail(subscriber.email); }} title="تعديل"><Edit2 size={16} /></button><button className={styles.dangerButton} onClick={() => void handleDelete(subscriber.id)} title="حذف"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
            </section>}

            {tab === 'history' && <section className={styles.card}>
                <div className={styles.sectionHeader}><h2>سجل الرسائل</h2><button className={styles.secondaryButton} onClick={() => void loadCampaigns()} disabled={loadingCampaigns}><RefreshCw size={17} />تحديث</button></div>
                {loadingCampaigns ? <div className={styles.loading}>جارٍ تحميل سجل الرسائل…</div> : campaigns.length === 0 ? <div className={styles.empty}><History size={36} /><p>لم يتم إنشاء أي حملة بعد.</p></div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>العنوان</th><th>المستلمون</th><th>الحالة</th><th>النتائج</th><th>الإنشاء</th><th></th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td>{campaign.subject}</td><td>{campaign.recipient_type === 'all' ? 'كل النشطين' : campaign.recipient_email || 'مشترك واحد'}</td><td><span className={`${styles.badge} ${styles[`status${campaign.status}`] || ''}`}>{campaignStatus[campaign.status] || campaign.status}</span></td><td>{campaign.sent_count} مرسل / {campaign.failed_count} فشل</td><td>{formatDate(campaign.created_at)}</td><td><button className={styles.detailsButton} onClick={() => void showDetails(campaign.id)}><Eye size={16} />تفاصيل</button></td></tr>)}</tbody></table></div>}
            </section>}

            {confirmOpen && <div className={styles.modal} role="dialog" aria-modal="true"><div className={styles.modalContent}><h2>تأكيد جدولة الرسالة</h2><p>سيتم إرسال الرسالة إلى {recipientType === 'all' ? 'كل المشتركين النشطين' : selectedRecipient?.email || 'المشترك المحدد'}.</p><p className={styles.confirmSubject}>{subject}</p><div className={styles.modalActions}><button className={styles.primaryButton} onClick={() => void sendCampaign()} disabled={sending}>{sending ? 'جارٍ الجدولة…' : 'تأكيد الإرسال'}</button><button className={styles.secondaryButton} onClick={() => setConfirmOpen(false)} disabled={sending}>إلغاء</button></div></div></div>}
            {editingSubscriber && <div className={styles.modal} role="dialog" aria-modal="true"><div className={styles.modalContent}><h2>تعديل البريد الإلكتروني</h2><input className={styles.modalInput} type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /><div className={styles.modalActions}><button className={styles.primaryButton} onClick={() => void handleSaveEdit()} disabled={saving || !editEmail.trim()}>{saving ? 'جارٍ الحفظ…' : 'حفظ'}</button><button className={styles.secondaryButton} onClick={() => setEditingSubscriber(null)} disabled={saving}>إلغاء</button></div></div></div>}
            {(loadingDetails || details) && <div className={styles.modal} role="dialog" aria-modal="true"><div className={`${styles.modalContent} ${styles.detailModal}`}>{loadingDetails ? <div className={styles.loading}>جارٍ تحميل التفاصيل…</div> : details && <><div className={styles.sectionHeader}><h2>{details.campaign.subject}</h2><button className={styles.iconButton} onClick={() => setDetails(null)} aria-label="إغلاق"><X size={18} /></button></div><p className={styles.messageBody}>{details.campaign.body || '—'}</p><div className={styles.detailGrid}><div><span>المستلمون</span><strong>{recipientTypeLabel[details.campaign.recipient_type] || details.campaign.recipient_type}</strong></div><div><span>الحالة</span><strong>{campaignStatus[details.campaign.status] || details.campaign.status}</strong></div><div><span>تاريخ الإنشاء</span><strong>{formatDate(details.campaign.created_at)}</strong></div><div><span>تاريخ الاكتمال</span><strong>{formatDate(details.campaign.completed_at)}</strong></div></div><div className={styles.stats}><span>الإجمالي: {details.campaign.total_recipients}</span><span>مرسل: {details.campaign.sent_count}</span><span>فشل: {details.campaign.failed_count}</span></div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>البريد</th><th>الحالة</th><th>المحاولات</th><th>أرسل في</th><th>فشل في</th></tr></thead><tbody>{details.deliveries.data.map((delivery) => <tr key={delivery.id}><td>{delivery.email || delivery.subscriber?.email || '—'}</td><td>{deliveryStatus[delivery.status] || delivery.status}</td><td>{delivery.attempts}</td><td>{formatDate(delivery.sent_at)}</td><td>{formatDate(delivery.failed_at)}</td></tr>)}</tbody></table></div></>}</div></div>}
        </div>
    );
}
