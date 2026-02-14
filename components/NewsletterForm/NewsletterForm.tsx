'use client';

import { useState, FormEvent } from 'react';
import { subscribe } from '@/app/lib/newsletter.service';
import styles from './NewsletterForm.module.css';

interface NewsletterFormProps {
    className?: string;
}

export function NewsletterForm({ className }: NewsletterFormProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToastMessage({ type, text });
        setToastVisible(true);

        setTimeout(() => {
            setToastVisible(false);
            setTimeout(() => setToastMessage(null), 300);
        }, 3000);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            showToast('error', 'البريد الإلكتروني مطلوب');
            return;
        }

        setLoading(true);

        try {
            const response = await subscribe(email);
            showToast('success', response.message);
            setEmail('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء الاشتراك';
            showToast('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`${styles.newsletterForm} ${className || ''}`}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.emailField}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ادخل الإيميل ليصلك الجديد"
                            className={styles.emailInput}
                            disabled={loading}
                            required
                        />
                        <button
                            type="submit"
                            className={styles.emailSubmit}
                            disabled={loading}
                            aria-label="إرسال البريد"
                        >
                            <svg viewBox="0 0 24 24" className={styles.arrowIcon} aria-hidden="true">
                                <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {toastMessage && (
                <div
                    className={`${styles.toast} ${toastVisible ? styles.toastVisible : ''} ${styles[toastMessage.type]}`}
                    role="alert"
                    aria-live="polite"
                >
                    {toastMessage.text}
                </div>
            )}
        </>
    );
}
