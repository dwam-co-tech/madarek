import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { NewsletterSubscriber, SubscribeResponse, ApiErrorResponse } from './newsletter.model';

/**
 * Subscribe to newsletter (public endpoint)
 */
export async function subscribe(email: string): Promise<SubscribeResponse> {
    const res = await fetch(buildApiUrl('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
        const errorData = data as ApiErrorResponse;
        const msg = errorData.message || 'حدث خطأ أثناء الاشتراك';
        throw new Error(msg);
    }

    return data as SubscribeResponse;
}

/**
 * Get all subscribers (admin only)
 */
export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('غير مصرح');
    }

    const res = await fetch(buildApiUrl('/api/newsletter/subscribers'), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as ApiErrorResponse).message || 'حدث خطأ أثناء جلب البيانات';
        throw new Error(msg);
    }

    const data = await res.json();
    return (data.data || []) as NewsletterSubscriber[];
}

/**
 * Update subscriber email (admin only)
 */
export async function updateSubscriber(id: number, email: string): Promise<NewsletterSubscriber> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('غير مصرح');
    }

    const res = await fetch(buildApiUrl(`/api/newsletter/subscribers/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
        const errorData = data as ApiErrorResponse;
        const msg = errorData.message || 'حدث خطأ أثناء التحديث';
        throw new Error(msg);
    }

    return data.subscriber as NewsletterSubscriber;
}

/**
 * Delete subscriber (admin only)
 */
export async function deleteSubscriber(id: number): Promise<void> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('غير مصرح');
    }

    const res = await fetch(buildApiUrl(`/api/newsletter/subscribers/${id}`), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as ApiErrorResponse).message || 'حدث خطأ أثناء الحذف';
        throw new Error(msg);
    }
}

/**
 * Export subscribers to Excel (admin only)
 */
export async function exportToExcel(): Promise<Blob> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('غير مصرح');
    }

    const res = await fetch(buildApiUrl('/api/newsletter/export'), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as ApiErrorResponse).message || 'فشل في تصدير البيانات';
        throw new Error(msg);
    }

    return await res.blob();
}
