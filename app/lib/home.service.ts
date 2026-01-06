import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { HomeStatsResponse } from './home.model';

export async function getHomeStats(): Promise<HomeStatsResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(buildApiUrl('/api/home/stats'), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    let msg = 'فشل جلب إحصائيات الصفحة الرئيسية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as HomeStatsResponse;
}
