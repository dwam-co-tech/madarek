'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Upload,
  Database,
  Download,
  RotateCcw,
  Trash2,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import styles from './backup.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import SearchFilter, { FieldDef, SearchQuery } from '@/components/SearchFilter';
import { createBackup as createBackupApi, uploadBackup as uploadBackupApi, getBackups, restoreBackup as restoreBackupApi, downloadBackup as downloadBackupApi, getBackupHistory, deleteBackup as deleteBackupApi } from '@/app/lib/backups.service';
import type { CreateBackupResponse, UploadBackupResponse, BackupDTO, BackupHistoryItemDTO, DeleteBackupResponse } from '@/app/lib/backups.model';
import { buildApiUrl } from '@/app/lib/api';

type BackupItem = {
  id: string;
  fileName: string;
  sizeKB: number;
  createdAt: string;
  status: 'done' | 'restoring' | 'failed';
  href?: string;
};

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [toast, setToast] = useState<string | undefined>();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState<SearchQuery>({});
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<BackupHistoryItemDTO[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BackupItem | undefined>();

  const fields = React.useMemo<FieldDef[]>(
    () => [
      { key: 'fileName', label: 'اسم الملف', type: 'text' },
      { key: 'sizeKB', label: 'الحجم (KB)', type: 'number' },
      { key: 'createdAt', label: 'تاريخ الإنشاء', type: 'date' },
      {
        key: 'status',
        label: 'الحالة',
        type: 'select',
        options: [
          { label: 'متوفرة', value: 'done' },
          { label: 'جارٍ الاسترجاع', value: 'restoring' },
          { label: 'فشل', value: 'failed' },
        ],
      },
    ],
    []
  );

  const displayBackups = React.useMemo(() => {
    const norm = (v: unknown) => String(v ?? '').toLowerCase().trim();
    const defSearchKeys = fields.filter((f) => f.type === 'text' || f.type === 'number').map((f) => f.key);
    const searchKeys = query.fields?.length ? query.fields : defSearchKeys;
    let arr = backups.slice();
    const t = norm(query.text);
    if (t) {
      arr = arr.filter((it) =>
        searchKeys.some((k) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return norm(val).includes(t);
        })
      );
    }
    // select
    const filters = query.filters ?? {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v == null || v === '' || v === 'any') return;
      const fdef = fields.find((f) => f.key === k);
      if (!fdef) return;
      if (fdef.type === 'select') {
        arr = arr.filter((it) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return String(val ?? '') === String(v);
        });
      } else if (fdef.type === 'number' && typeof v === 'object' && v) {
        const rng = v as { min?: string; max?: string };
        arr = arr.filter((it) => {
          const val = Number((it as unknown as Record<string, unknown>)[k]);
          if (rng.min && !Number.isNaN(Number(rng.min)) && val < Number(rng.min)) return false;
          if (rng.max && !Number.isNaN(Number(rng.max)) && val > Number(rng.max)) return false;
          return true;
        });
      }
    });
    // date
    if (query.date?.field) {
      const from = query.date.from ? new Date(query.date.from).valueOf() : null;
      const to = query.date.to ? new Date(query.date.to).valueOf() : null;
      const key = query.date.field;
      arr = arr.filter((it) => {
        const t = new Date(String((it as unknown as Record<string, unknown>)[key] ?? '')).valueOf();
        if (Number.isNaN(t)) return false;
        if (from && t < from) return false;
        if (to && t > to) return false;
        return true;
      });
    }
    if (query.sort?.key) {
      const dir = query.sort.dir === 'desc' ? -1 : 1;
      const key = query.sort.key;
      arr.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[key];
        const bv = (b as unknown as Record<string, unknown>)[key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av ?? '').localeCompare(String(bv ?? ''), 'ar') * dir;
      });
    }
    return arr;
  }, [backups, query, fields]);

  const countText = useMemo(() => `عدد النسخ: ${backups.length}`, [backups.length]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(undefined), 3800);
  };

  const translateMessage = (msg: string) => {
    if (msg.includes('Backup process has been queued') && msg.includes('background')) {
      return 'تم جدولة عملية النسخ الاحتياطي وستعمل في الخلفية.';
    }
    if (msg.includes('Backup uploaded successfully')) {
      return 'تم رفع النسخة الاحتياطية بنجاح.';
    }
    if (msg.includes('Backup deleted successfully')) {
      return 'تم حذف النسخة الاحتياطية بنجاح.';
    }
    if (msg.includes('Backup restored successfully')) {
      return 'تم استرجاع النسخة الاحتياطية بنجاح.';
    }
    if (msg.includes('Manual backup (full) queued')) {
      return 'تم جدولة النسخة اليدوية (كاملة).';
    }
    if (msg.includes('Restore process started')) {
      return 'بدأت عملية الاسترجاع.';
    }
    if (msg.includes('failed with a none successful exitcode')) {
      return 'فشلت عملية النسخ الاحتياطي أثناء التفريغ.';
    }
    if (msg.includes('SQL dump file not found in the backup archive')) {
      return 'ملف تفريغ SQL غير موجود في الأرشيف.';
    }
    return msg;
  };

  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const list = await getBackups();
        const toKB = (s: string) => {
          const m = s.trim().match(/^([\d.]+)\s*([KMG])$/i);
          if (!m) return Number.NaN;
          const val = Number.parseFloat(m[1]);
          const unit = m[2].toUpperCase();
          const kb = unit === 'K' ? val : unit === 'M' ? val * 1024 : unit === 'G' ? val * 1024 * 1024 : val;
          return Number(kb.toFixed(2));
        };
        const items: BackupItem[] = (list as BackupDTO[]).map((b) => ({
          id: `${b.file_name}_${b.created_at}`,
          fileName: b.file_name,
          sizeKB: toKB(b.file_size),
          createdAt: new Date(b.created_at.replace(' ', 'T')).toISOString(),
          status: 'done',
          href: b.download_link,
        }));
        setBackups(items);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'فشل جلب النسخ الاحتياطية';
        showToast(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openHistory = () => {
    setIsHistoryOpen(true);
    setIsLoading(true);
    (async () => {
      try {
        const items = await getBackupHistory();
        setHistory(items);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'فشل جلب سجل العمليات';
        showToast(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const createBackup = async () => {
    setIsLoading(true);
    try {
      const res: CreateBackupResponse = await createBackupApi({ mode: 'full' });
      const msg = res.message ? translateMessage(res.message) : 'تم إنشاء النسخة الاحتياطية بنجاح';
      showToast(msg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء النسخة الاحتياطية';
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpload = () => {
    setUploadFile(undefined);
    setIsUploadOpen(true);
  };

  const openDelete = (b: BackupItem) => {
    setToDelete(b);
    setIsDeleteOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setToDelete(undefined);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const ok = await deleteBackup(toDelete);
    if (ok) {
      setIsDeleteOpen(false);
      setToDelete(undefined);
    }
  };

  const confirmUpload = () => {
    if (!uploadFile) return;
    setIsLoading(true);
    (async () => {
      try {
        const res: UploadBackupResponse = await uploadBackupApi(uploadFile);
        const now = new Date();
        const id = String(now.getTime());
        const newItem: BackupItem = {
          id,
          fileName: res.file_name || uploadFile.name,
          sizeKB: Number((uploadFile.size / 1024).toFixed(2)),
          createdAt: now.toISOString(),
          status: 'done',
          href: buildApiUrl(`/api/backups/download?file_name=${encodeURIComponent(res.file_name || uploadFile.name)}`),
        };
        setBackups((prev) => [newItem, ...prev]);
        setIsUploadOpen(false);
        const msg = res.message ? translateMessage(res.message) : 'تم رفع النسخة الاحتياطية بنجاح.';
        showToast(msg);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء رفع النسخة الاحتياطية';
        showToast(msg);
      } finally {
        window.setTimeout(() => setIsLoading(false), 700);
      }
    })();
  };

  const downloadBackup = async (b: BackupItem) => {
    setIsLoading(true);
    try {
      await downloadBackupApi(b.fileName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل النسخة الاحتياطية';
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreBackup = async (b: BackupItem) => {
    setIsLoading(true);
    setBackups((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'restoring' } : x)));
    try {
      const res = await restoreBackupApi(b.fileName);
      setBackups((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'done' } : x)));
      const msg = res.message ? translateMessage(res.message) : 'تم الاسترجاع بنجاح';
      showToast(msg);
    } catch (err) {
      setBackups((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: 'failed' } : x)));
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء الاسترجاع';
      showToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBackup = async (b: BackupItem): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res: DeleteBackupResponse = await deleteBackupApi(b.fileName);
      setBackups((prev) => prev.filter((x) => x.id !== b.id));
      const msg = res.message ? translateMessage(res.message) : 'تم حذف النسخة الاحتياطية بنجاح';
      showToast(msg);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء حذف النسخة الاحتياطية';
      showToast(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <div className={styles.pageHeader}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>
            <Database size={18} />
            <span>النسخ الاحتياطي للبيانات</span>
          </div>
          <div className={styles.summarySub}>
            يتم إنشاء نسخة احتياطية تلقائيا كل 3 أيام الساعة 2:00 صباحا
          </div>
          <div className={styles.summaryBadges}>
            <div className={styles.badge}>{countText}</div>
            {/* <div className={`${styles.badge} ${styles.badgeMuted}`}>local النسخ</div> */}
            <div className={`${styles.badge} ${styles.badgeSuccess}`}>
              <CheckCircle2 size={16} />
              <span>نسخة تلقائية قبل الاسترجاع</span>
            </div>
          </div>
          <div className={styles.actionsBar}>
            <button className={`${styles.actionBtn} ${styles.createBtn}`} onClick={createBackup}>
              <Plus size={18} />
              <span>إنشاء نسخة احتياطية</span>
            </button>
            <button className={`${styles.actionBtn} ${styles.uploadBtn}`} onClick={openUpload}>
              <Upload size={18} />
              <span>رفع نسخة</span>
            </button>
            <button className={`${styles.actionBtn} ${styles.historyBtn}`} onClick={openHistory}>
              <Clock size={18} />
              <span>سجل التحميل</span>
            </button>
          </div>
        </div>
      </div>

      <SearchFilter
        fields={fields}
        onChange={setQuery}
        totalCount={backups.length}
        filteredCount={displayBackups.length}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>تاريخ الإنشاء</th>
              <th className={styles.th}>الحجم</th>
              <th className={styles.th}>الحالة</th>
              <th className={styles.th}>الإجراءات</th>
              <th className={styles.th}>الروابط</th>
            </tr>
          </thead>
          <tbody>
            {displayBackups.map((b) => (
              <tr key={b.id} className={styles.row}>
                <td className={styles.td}>
                  {new Date(b.createdAt).toLocaleString('ar-EG', {
                    hour12: false,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
                <td className={styles.td}>KB {b.sizeKB}</td>
                <td className={styles.td}>
                  <span
                    className={`${styles.statusBadge} ${
                      b.status === 'done' ? styles.statusDone : b.status === 'restoring' ? styles.statusRestoring : styles.statusFailed
                    }`}
                  >
                    {b.status === 'done' ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>متوفرة</span>
                      </>
                    ) : b.status === 'restoring' ? (
                      <>
                        <Clock size={14} />
                        <span>جارٍ الاسترجاع</span>
                      </>
                    ) : (
                      <>
                        <Info size={14} />
                        <span>فشل</span>
                      </>
                    )}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <button className={`${styles.iconBtn} ${styles.danger}`} title="حذف" onClick={() => openDelete(b)}>
                      <Trash2 size={18} />
                      <span className={styles.iconLabel}>حذف</span>
                    </button>
                    <button className={`${styles.iconBtn} ${styles.restore}`} title="استرجاع" onClick={() => restoreBackup(b)}>
                      <RotateCcw size={18} />
                      <span className={styles.iconLabel}>استرجاع</span>
                    </button>
                    <button className={`${styles.iconBtn} ${styles.download}`} title="تحميل" onClick={() => downloadBackup(b)}>
                      <Download size={18} />
                      <span className={styles.iconLabel}>تحميل</span>
                    </button>
                  </div>
                </td>
                <td className={styles.td}>
                  <Link href={b.href ?? `/${b.fileName}`} className={styles.link}>
                    {b.fileName}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {displayBackups.map((b) => (
          <div key={b.id} className={styles.card}>
            <div className={styles.cardTitle}>{new Date(b.createdAt).toLocaleString('ar-EG', { hour12: false })}</div>
            <div className={styles.cardMeta}>
              <span>KB {b.sizeKB}</span>
              <span
                className={`${styles.statusBadge} ${
                  b.status === 'done' ? styles.statusDone : b.status === 'restoring' ? styles.statusRestoring : styles.statusFailed
                }`}
              >
                {b.status === 'done' ? 'متوفرة' : b.status === 'restoring' ? 'جارٍ الاسترجاع' : 'فشل'}
              </span>
            </div>
            <div className={styles.cardLinks}>
              <Link href={b.href ?? `/${b.fileName}`} className={styles.link}>
                {b.fileName}
              </Link>
            </div>
            <div className={styles.cardActions}>
              <button className={`${styles.iconBtn} ${styles.danger}`} title="حذف" onClick={() => openDelete(b)}>
                <Trash2 size={18} />
              </button>
              <button className={`${styles.iconBtn} ${styles.restore}`} title="استرجاع" onClick={() => restoreBackup(b)}>
                <RotateCcw size={18} />
              </button>
              <button className={`${styles.iconBtn} ${styles.download}`} title="تحميل" onClick={() => downloadBackup(b)}>
                <Download size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isUploadOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>رفع نسخة احتياطية</div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>ملف النسخة (ZIP)</label>
              <input
                type="file"
                accept=".zip"
                className={styles.fileInput}
                onChange={(e) => setUploadFile(e.target.files?.[0])}
              />
              <div className={styles.hint}>
                يُفضّل رفع نسخة تم إنشاؤها من نفس النظام لضمان التوافق.
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={confirmUpload} disabled={!uploadFile}>
                تأكيد الرفع
              </button>
              <button className={styles.cancelBtn} onClick={() => setIsUploadOpen(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTitle}>تأكيد الحذف</div>
            <div className={styles.inputGroup}>
              <div className={styles.hint}>
                هل أنت متأكد من حذف النسخة التالية؟
              </div>
              <div className={styles.historyMessage}>{toDelete?.fileName ?? ''}</div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={confirmDelete}>
                تأكيد الحذف
              </button>
              <button className={styles.cancelBtn} onClick={cancelDelete}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.modal} ${styles.historyModal}`}>
            <div className={styles.modalTitle}>سجل التحميل</div>
            <div className={styles.modalBody}>
              <div className={styles.historyList}>
              {history.map((h) => (
                <div key={h.id} className={styles.historyItem}>
                  <div className={styles.historyHeader}>
                    <span
                      className={`${styles.statusBadge} ${
                        h.type === 'restore' ? styles.historyTypeRestore : styles.historyTypeCreate
                      }`}
                    >
                      {h.type === 'restore' ? 'استرجاع' : 'إنشاء'}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${
                        h.status === 'success'
                          ? styles.statusSuccess
                          : h.status === 'failed'
                          ? styles.statusFailed
                          : h.status === 'queued'
                          ? styles.statusQueued
                          : styles.statusStarted
                      }`}
                    >
                      {h.status === 'success'
                        ? 'نجاح'
                        : h.status === 'failed'
                        ? 'فشل'
                        : h.status === 'queued'
                        ? 'قيد الانتظار'
                        : 'بدأت العملية'}
                    </span>
                  </div>
                  <div className={styles.historyMessage}>{translateMessage(h.message)}</div>
                  <div className={styles.historyMeta}>
                    <span>{h.file_name ?? '—'}</span>
                    <span>{h.file_size ?? ''}</span>
                    <span>{new Date(h.created_at).toLocaleString('ar-EG', { hour12: false })}</span>
                    <span>{h.user_id ? `المستخدم #${h.user_id}` : '—'}</span>
                  </div>
                </div>
              ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsHistoryOpen(false)}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`${styles.toastCenter} ${styles.toastShow}`}>
          <CheckCircle2 className={styles.toastIcon} size={20} />
          <div className={styles.toastMessage}>{toast}</div>
        </div>
      )}
    </div>
  );
}
