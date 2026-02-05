import { buildApiUrl } from './api';
import { getAuthToken } from './auth.service';
import type { CreateBackupPayload, CreateBackupResponse, UploadBackupResponse, GetBackupsResponse, RestoreBackupResponse, GetBackupHistoryResponse, DeleteBackupResponse, BackupDiagnosticsResponse } from './backups.model';

export async function createBackup(payload: CreateBackupPayload): Promise<CreateBackupResponse> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/backups/create'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل إنشاء النسخة الاحتياطية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as CreateBackupResponse;
}

export async function uploadBackup(file: File): Promise<UploadBackupResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await fetch(buildApiUrl('/api/backups/upload'), {
    method: 'POST',
    headers,
    body: form,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل رفع النسخة الاحتياطية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as UploadBackupResponse;
}

export async function getBackups(): Promise<GetBackupsResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/backups'), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || !Array.isArray(data)) {
    let msg = 'فشل جلب النسخ الاحتياطية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as GetBackupsResponse;
}

export async function restoreBackup(file_name: string): Promise<RestoreBackupResponse> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/backups/restore'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ file_name }),
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل استرجاع النسخة الاحتياطية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as RestoreBackupResponse;
}

export async function downloadBackup(file_name: string): Promise<void> {
  const headers: Record<string, string> = { Accept: 'application/octet-stream' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = buildApiUrl(`/api/backups/download?file_name=${encodeURIComponent(file_name)}`);
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    let msg = 'فشل تحميل النسخة الاحتياطية';
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {}
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const a = document.createElement('a');
  const dlUrl = URL.createObjectURL(blob);
  a.href = dlUrl;
  a.download = file_name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(dlUrl);
}

export async function deleteBackup(file_name: string): Promise<DeleteBackupResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = buildApiUrl(`/api/backups?file_name=${encodeURIComponent(file_name)}`);
  const res = await fetch(url, { method: 'DELETE', headers });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل حذف النسخة الاحتياطية';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as DeleteBackupResponse;
}

export async function getBackupHistory(): Promise<GetBackupHistoryResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/backups/history'), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || !Array.isArray(data)) {
    let msg = 'فشل جلب سجل العمليات';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as GetBackupHistoryResponse;
}

export async function getBackupDiagnostics(): Promise<BackupDiagnosticsResponse> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(buildApiUrl('/api/backups/diagnostics'), {
    method: 'GET',
    headers,
  });
  const data = (await res.json()) as unknown;
  if (!res.ok || typeof data !== 'object' || data === null) {
    let msg = 'فشل جلب بيانات التشخيص';
    if (typeof data === 'object' && data !== null) {
      const maybe = data as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string') msg = maybe.message;
      else if (typeof maybe.error === 'string') msg = maybe.error;
    }
    throw new Error(msg);
  }
  return data as BackupDiagnosticsResponse;
}
