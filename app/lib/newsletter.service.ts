import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type {
    ApiErrorResponse,
    CreateNewsletterCampaignPayload,
    NewsletterCampaign,
    NewsletterCampaignDetails,
    NewsletterSubscriber,
    PaginatedResponse,
    SubscribeResponse,
} from './newsletter.model';

const NETWORK_ERROR_MESSAGE = 'تعذر الاتصال بالخادم. يرجى التحقق من الاتصال والمحاولة مرة أخرى.';

async function safeFetch(url: string, init: RequestInit): Promise<Response> {
    try {
        return await fetch(url, init);
    } catch {
        throw new Error(NETWORK_ERROR_MESSAGE);
    }
}

function errorMessage(data: unknown, fallback: string): string {
    const error = data as ApiErrorResponse;
    return error?.message || error?.error || fallback;
}

async function responseData<T>(res: Response, fallback: string): Promise<T> {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(errorMessage(data, fallback));
    }
    return data as T;
}

function authHeaders(json = false): HeadersInit {
    const token = getAuthToken();
    if (!token) throw new Error('غير مصرح بالدخول');

    return {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(json ? { 'Content-Type': 'application/json' } : {}),
    };
}

/** Subscribe to the public newsletter endpoint. */
export async function subscribe(email: string): Promise<SubscribeResponse> {
    const res = await safeFetch(buildApiUrl('/api/newsletter/subscribe'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
    });

    return responseData<SubscribeResponse>(res, 'حدث خطأ أثناء الاشتراك');
}

export async function getSubscribers(filters: {
    search?: string;
    status?: 'active' | 'unsubscribed';
} = {}): Promise<NewsletterSubscriber[]> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set('search', filters.search.trim());
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();
    const res = await safeFetch(buildApiUrl(`/api/newsletter/subscribers${query ? `?${query}` : ''}`), {
        method: 'GET',
        headers: authHeaders(),
    });

    const data = await responseData<{ data?: NewsletterSubscriber[] }>(res, 'حدث خطأ أثناء جلب المشتركين');
    return data.data || [];
}

export async function updateSubscriber(id: number, email: string): Promise<NewsletterSubscriber> {
    const res = await safeFetch(buildApiUrl(`/api/newsletter/subscribers/${id}`), {
        method: 'PUT',
        headers: authHeaders(true),
        body: JSON.stringify({ email }),
    });

    const data = await responseData<{ subscriber: NewsletterSubscriber }>(res, 'حدث خطأ أثناء التحديث');
    return data.subscriber;
}

export async function deleteSubscriber(id: number): Promise<void> {
    const res = await safeFetch(buildApiUrl(`/api/newsletter/subscribers/${id}`), {
        method: 'DELETE',
        headers: authHeaders(),
    });
    await responseData(res, 'حدث خطأ أثناء الحذف');
}

export async function exportToExcel(): Promise<Blob> {
    const res = await safeFetch(buildApiUrl('/api/newsletter/export'), {
        method: 'GET',
        headers: authHeaders(),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(errorMessage(data, 'فشل في تصدير البيانات'));
    }
    return res.blob();
}

export async function createCampaign(payload: CreateNewsletterCampaignPayload): Promise<NewsletterCampaign> {
    const res = await safeFetch(buildApiUrl('/api/admin/newsletter/campaigns'), {
        method: 'POST',
        headers: authHeaders(true),
        body: JSON.stringify(payload),
    });
    const data = await responseData<{ data: NewsletterCampaign }>(res, 'تعذر إنشاء حملة الرسالة');
    return data.data;
}

export async function getCampaigns(page = 1): Promise<PaginatedResponse<NewsletterCampaign>> {
    const res = await safeFetch(buildApiUrl(`/api/admin/newsletter/campaigns?page=${page}`), {
        method: 'GET',
        headers: authHeaders(),
    });
    const data = await responseData<{ data: PaginatedResponse<NewsletterCampaign> }>(res, 'حدث خطأ أثناء جلب سجل الرسائل');
    return data.data;
}

export async function getCampaign(id: number, page = 1): Promise<NewsletterCampaignDetails> {
    const res = await safeFetch(buildApiUrl(`/api/admin/newsletter/campaigns/${id}?page=${page}`), {
        method: 'GET',
        headers: authHeaders(),
    });
    const data = await responseData<{ data: NewsletterCampaignDetails }>(res, 'حدث خطأ أثناء جلب تفاصيل الحملة');
    return data.data;
}
