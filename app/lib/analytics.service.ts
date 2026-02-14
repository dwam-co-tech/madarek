import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { CountryStatisticsResponse, DailyVisitsResponse } from './analytics.model';

/**
 * Get country statistics from the analytics API.
 */
export async function getCountryStatistics(): Promise<CountryStatisticsResponse> {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(buildApiUrl('/api/analytics/countries'), {
        method: 'GET',
        headers,
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('يجب تسجيل الدخول للوصول إلى هذه البيانات');
        }
        if (res.status === 403) {
            throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
        }
        throw new Error('حدث خطأ أثناء جلب البيانات');
    }

    return res.json();
}

/**
 * Get daily visit statistics with optional date range filter.
 */
export async function getDailyVisits(from?: string, to?: string): Promise<DailyVisitsResponse> {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const queryString = params.toString();
    const url = queryString
        ? `/api/analytics/daily-visits?${queryString}`
        : '/api/analytics/daily-visits';

    const res = await fetch(buildApiUrl(url), {
        method: 'GET',
        headers,
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('يجب تسجيل الدخول للوصول إلى هذه البيانات');
        }
        if (res.status === 403) {
            throw new Error('ليس لديك صلاحية للوصول إلى هذه البيانات');
        }
        if (res.status === 400) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'تنسيق التاريخ غير صحيح');
        }
        throw new Error('حدث خطأ أثناء جلب البيانات');
    }

    return res.json();
}
