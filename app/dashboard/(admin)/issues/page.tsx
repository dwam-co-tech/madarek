'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Pencil, Trash2, Plus, Info } from 'lucide-react';
import styles from '../issues.module.css';
import { createIssue, getIssues, deleteIssue as deleteIssueApi, updateIssue as updateIssueApi, publishIssue as publishIssueApi, unpublishIssue as unpublishIssueApi, getIssue } from '@/app/lib/issues.service';
import type { CreateIssueResponse } from '@/app/lib/issues.model';
import LoadingOverlay from '@/components/LoadingOverlay';
import SearchFilter, { FieldDef, SearchQuery } from '@/components/SearchFilter';

type Issue = {
  id: string;
  name: string;
  hijriDate: string;
  gregorianDate: string;
  coverUrl?: string;
  pdfUrl?: string;
  published: boolean;
  views: number;
  createdAt: string;
  publishAt?: string;
};

function IssuesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialIssues: Issue[] = useMemo(() => [], []);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Issue>>({});
  const [coverPreview, setCoverPreview] = useState<string | undefined>(undefined);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const shouldToast = params.get('from') === 'articles';
  const [deleteToast, setDeleteToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<SearchQuery>({});
  const [hasAggregates, setHasAggregates] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const normalizePublishAt = (v?: string) => {
    if (!v) return '';
    const s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s} 00:00:00`;
    const parts = s.replace('T', ' ').split(' ');
    if (parts.length >= 2) {
      const date = parts[0];
      const hm = parts[1].slice(0, 5);
      const [hh, mm] = hm.split(':');
      const H = /^\d{2}$/.test(hh) ? hh : '00';
      const M = /^\d{2}$/.test(mm) ? mm : '00';
      return `${date} ${H}:${M}:00`;
    }
    return `${s.slice(0, 10)} 00:00:00`;
  };

  const fields = React.useMemo<FieldDef[]>(
    () => [
      { key: 'publishAt', label: 'تاريخ النشر', type: 'date' },
      { key: 'createdAt', label: 'تاريخ الإنشاء', type: 'date' },
      { key: 'name', label: 'اسم العدد', type: 'text' },
      { key: 'hijriDate', label: 'التاريخ الهجري', type: 'text' },
      { key: 'gregorianDate', label: 'التاريخ الميلادي', type: 'text' },
      { key: 'published', label: 'منشور', type: 'boolean' },
      { key: 'views', label: 'عدد المشاهدات', type: 'number' },
      { key: 'id', label: 'المعرف', type: 'text' },
    ],
    []
  );

  const displayIssues = React.useMemo(() => {
    const norm = (v: unknown) => String(v ?? '').toLowerCase().trim();
    const defSearchKeys = fields.filter((f) => f.type === 'text' || f.type === 'number').map((f) => f.key);
    const searchKeys = query.fields?.length ? query.fields : defSearchKeys;
    let arr = issues.slice();
    const t = norm(query.text);
    if (t) {
      arr = arr.filter((it) =>
        searchKeys.some((k) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return norm(val).includes(t);
        })
      );
    }
    const filters = query.filters ?? {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v == null || v === '' || v === 'any') return;
      const fdef = fields.find((f) => f.key === k);
      if (!fdef) return;
      if (fdef.type === 'boolean') {
        const want = v === 'true';
        arr = arr.filter((it) => {
          const val = (it as unknown as Record<string, unknown>)[k];
          return Boolean(val) === want;
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
  }, [issues, query, fields]);
  const total = displayIssues.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
    else if (page < 1) setPage(1);
  }, [lastPage, page]);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pagedIssues = displayIssues.slice(start, end);

  React.useEffect(() => {
    if (shouldToast) {
      const t = setTimeout(() => {
        router.replace('/dashboard/issues');
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [shouldToast, router]);
  React.useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const list = await getIssues();
        const mapped: Issue[] = list.map((it) => ({
          id: String(it.id),
          name: it.title,
          hijriDate: it.hijri_date ?? '',
          gregorianDate: it.gregorian_date ?? '',
          coverUrl: it.cover_image,
          pdfUrl: it.pdf_file,
          published: it.status === 'published',
          views: it.views ?? 0,
          createdAt: it.created_at ?? '',
        }));
        setIssues(mapped);
      } catch (err) {
        setDeleteToast(err instanceof Error ? err.message : 'فشل جلب الأعداد');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  React.useEffect(() => {
    if (hasAggregates) return;
    if (!issues.length) return;
    let alive = true;
    (async () => {
      try {
        const results = await Promise.allSettled(
          issues.map(async (it) => {
            const det = await getIssue(it.id);
            const sum = det.articles.reduce((acc, a) => acc + ((a.views_count ?? 0) as number), 0);
            return { id: String(det.id), sum, publishAt: det.published_at ?? '' };
          })
        );
        if (!alive) return;
        setIssues((prev) =>
          prev.map((x) => {
            const found = results.find(
              (r) => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ id: string; sum: number }>).value.id === x.id
            ) as PromiseFulfilledResult<{ id: string; sum: number; publishAt: string }> | undefined;
            return found ? { ...x, views: found.value.sum, publishAt: found.value.publishAt } : x;
          })
        );
        setHasAggregates(true);
      } catch { }
    })();
    return () => {
      alive = false;
    };
  }, [issues, hasAggregates]);
  React.useEffect(() => {
    if (!deleteToast) return;
    if (isSaving || isDeleting) return;
    const t = setTimeout(() => setDeleteToast(null), 2000);
    return () => clearTimeout(t);
  }, [deleteToast, isSaving, isDeleting]);

  const openAddModal = () => {
    setForm({});
    setCoverPreview(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (issue: Issue) => {
    setForm(issue);
    setCoverPreview(issue.coverUrl);
    setIsModalOpen(true);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    setCoverFile(file);
  };

  const saveIssue = async () => {
    const isEdit = Boolean(form.id);
    const title = form.name ?? '';
    const hijri_date = form.hijriDate ?? '';
    const gregorian_date = form.gregorianDate ?? '';
    const published_at = normalizePublishAt(form.publishAt);
    setIsModalOpen(false);
    setIsSaving(true);
    if (isEdit) {
      setDeleteToast('جاري تحديث العدد...');
      try {
        const resp = await updateIssueApi(form.id as string, {
          title: title || undefined,
          hijri_date: hijri_date || undefined,
          gregorian_date: gregorian_date || undefined,
          published_at: published_at || undefined,
          cover_image: coverFile ?? undefined,
          cover_image_alt: coverFile ?? undefined,
          pdf_file: pdfFile ?? undefined,
        });
        const it = resp.issue;
        setIssues((prev) =>
          prev.map((x) =>
            x.id === String(it.id)
              ? {
                id: String(it.id),
                name: it.title,
                hijriDate: it.hijri_date ?? '',
                gregorianDate: it.gregorian_date ?? '',
                coverUrl: it.cover_image,
                pdfUrl: it.pdf_file,
                published: it.status === 'published',
                views: it.views ?? 0,
                createdAt: it.created_at ?? '',
              }
              : x
          )
        );
        setForm({});
        setCoverPreview(undefined);
        setCoverFile(null);
        setPdfFile(null);
        setDeleteToast('تم تحديث العدد بنجاح');
      } catch (err) {
        setDeleteToast(err instanceof Error ? err.message : 'فشل تحديث العدد');
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const tmpId = `tmp-${Date.now()}`;
    const optimisticIssue: Issue = {
      id: tmpId,
      name: title,
      hijriDate: hijri_date,
      gregorianDate: gregorian_date,
      coverUrl: coverPreview,
      pdfUrl: form.pdfUrl,
      published: false,
      views: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setIssues((prev) => [optimisticIssue, ...prev]);
    setDeleteToast('جاري إنشاء العدد...');
    try {
      const resp: CreateIssueResponse = await createIssue({
        title,
        hijri_date,
        gregorian_date,
        status: 'draft',
        published_at: published_at || undefined,
        cover_image: coverFile ?? undefined,
        cover_image_alt: coverFile ?? undefined,
        pdf_file: pdfFile ?? undefined,
      });
      const it = resp.issue;
      setIssues((prev) =>
        prev.map((x) =>
          x.id === tmpId
            ? {
              id: String(it.id),
              name: it.title,
              hijriDate: it.hijri_date ?? '',
              gregorianDate: it.gregorian_date ?? '',
              coverUrl: it.cover_image,
              pdfUrl: it.pdf_file,
              published: it.status === 'published',
              views: it.views ?? 0,
              createdAt: it.created_at ?? '',
            }
            : x
        )
      );
      setForm({});
      setCoverPreview(undefined);
      setCoverFile(null);
      setPdfFile(null);
      setDeleteToast('تم إنشاء العدد بنجاح');
    } catch (err) {
      setIssues((prev) => prev.filter((x) => x.id !== tmpId));
      setDeleteToast(err instanceof Error ? err.message : 'فشل إنشاء العدد');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((x) => x.id !== id));
    setDeleteToast('تم حذف العدد بنجاح');
  };
  const openDeleteConfirm = (issue: Issue) => {
    setDeleteTarget(issue);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteTarget(null);
    setDeleteToast('جاري حذف العدد...');
    setIsDeleting(true);
    try {
      const resp = await deleteIssueApi(deleteTarget.id);
      deleteIssue(deleteTarget.id);
      setDeleteToast(resp.message || 'تم حذف العدد بنجاح');
    } catch (err) {
      setDeleteToast(err instanceof Error ? err.message : 'فشل حذف العدد');
    } finally {
      setIsDeleting(false);
    }
  };
  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const reloadIssues = async () => {
    try {
      setIsLoading(true);
      const list = await getIssues();
      const mapped: Issue[] = list.map((it) => ({
        id: String(it.id),
        name: it.title,
        hijriDate: it.hijri_date ?? '',
        gregorianDate: it.gregorian_date ?? '',
        coverUrl: it.cover_image,
        pdfUrl: it.pdf_file,
        published: it.status === 'published',
        views: it.views ?? 0,
        createdAt: it.created_at ?? '',
      }));
      setIssues(mapped);
      setHasAggregates(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublished = async (id: string, next: boolean) => {
    const prev = issues.find((x) => x.id === id)?.published ?? false;
    setIssues((prevList) => prevList.map((x) => (x.id === id ? { ...x, published: next } : x)));
    setDeleteToast('جاري تحديث الحالة...');
    try {
      let it:
        | {
          id: number;
          title: string;
          hijri_date?: string;
          gregorian_date?: string;
          cover_image?: string;
          pdf_file?: string;
          status?: string;
          views?: number;
          views_count?: number;
        }
        | null = null;
      if (next) {
        const resp = await publishIssueApi(id);
        it = resp.issue;
      } else {
        const resp = await unpublishIssueApi(id);
        it = resp.issue;
      }
      if (it) {
        try {
          const det = await getIssue(it.id);
          setIssues((prevList) =>
            prevList.map((x) =>
              x.id === String(it!.id)
                ? {
                  id: String(it!.id),
                  name: it!.title,
                  hijriDate: it!.hijri_date ?? '',
                  gregorianDate: it!.gregorian_date ?? '',
                  coverUrl: it!.cover_image,
                  pdfUrl: it!.pdf_file,
                  published: (it!.status ?? (next ? 'published' : 'draft')) === 'published',
                  views: (it!.views ?? it!.views_count ?? 0) as number,
                  createdAt: det.created_at ?? '',
                  publishAt: det.published_at ?? '',
                }
                : x
            )
          );
        } catch {
          setIssues((prevList) =>
            prevList.map((x) =>
              x.id === String(it!.id)
                ? {
                  id: String(it!.id),
                  name: it!.title,
                  hijriDate: it!.hijri_date ?? '',
                  gregorianDate: it!.gregorian_date ?? '',
                  coverUrl: it!.cover_image,
                  pdfUrl: it!.pdf_file,
                  published: (it!.status ?? (next ? 'published' : 'draft')) === 'published',
                  views: (it!.views ?? it!.views_count ?? 0) as number,
                  createdAt: x.createdAt,
                  publishAt: x.publishAt,
                }
                : x
            )
          );
        }
      }
      setDeleteToast(next ? 'تم نشر العدد بنجاح' : 'تم تحويل العدد إلى مسودة');
      await reloadIssues();
    } catch (err) {
      setIssues((prevList) => prevList.map((x) => (x.id === id ? { ...x, published: prev } : x)));
      setDeleteToast(err instanceof Error ? err.message : 'فشل تحديث الحالة');
    }
  };

  return (
    <div>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <LoadingOverlay open={isSaving} label="جاري حفظ العدد..." ariaLabel="جاري الحفظ" />
      <LoadingOverlay open={isDeleting} label="جاري حذف العدد..." ariaLabel="جاري الحذف" />
      {shouldToast && (
        <div className={`${styles.toastCenter} ${styles.toastShow}`}>
          <Info className={styles.toastIcon} size={24} />
          <div className={styles.toastMessage}>فضلاً اختر العدد أولاً لعرض المقالات المرتبطة به</div>
        </div>
      )}
      {deleteToast && (
        <div className={`${styles.toastCenter} ${isDeleting ? '' : styles.toastShow}`.trim()}>
          <Info className={styles.toastIcon} size={24} />
          <div className={styles.toastMessage}>{deleteToast}</div>
        </div>
      )}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة الأعداد</h1>
        <button className={styles.addButton} onClick={openAddModal}>
          <Plus size={18} />
          <span>إضافة عدد</span>
        </button>
      </div>

      <SearchFilter
        fields={fields}
        onChange={setQuery}
        totalCount={issues.length}
        filteredCount={displayIssues.length}
      />

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>الغلاف</th>
              <th className={styles.th}>اسم العدد</th>
              <th className={styles.th}>التاريخ الهجري</th>
              <th className={styles.th}>عدد المشاهدات</th>
              <th className={styles.th}>الحالة</th>
              <th className={styles.th}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pagedIssues.map((issue) => (
              <tr key={issue.id} className={styles.row}>
                <td className={styles.td}>
                  <div className={styles.coverPreview}>
                    {issue.coverUrl ? (
                      <Image src={issue.coverUrl} alt={issue.name} width={48} height={48} style={{ borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 48, height: 48, background: '#f1f5f9', borderRadius: 8 }} />
                    )}
                  </div>
                </td>
                <td className={styles.td}>{issue.name}</td>
                <td className={styles.td}>{issue.hijriDate}</td>
                <td className={styles.td}>{issue.views}</td>
                <td className={styles.td}>
                  <div className={styles.statusCell}>
                    <div className={styles.switch}>
                      <input
                        className={styles.switchInput}
                        id={`switch-${issue.id}`}
                        type="checkbox"
                        checked={issue.published}
                        onChange={(e) => togglePublished(issue.id, e.target.checked)}
                      />
                      <label htmlFor={`switch-${issue.id}`} className={styles.switchTrack}>
                        <span className={styles.switchThumb} />
                      </label>
                    </div>
                    <span>{issue.published ? 'منشور' : 'مسودة'}</span>
                  </div>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <Link href={`/dashboard/articles?id=${issue.id}`} className={styles.iconBtn}>
                      <FileText size={18} />
                      <span className={styles.iconLabel}>إدارة المقالات</span>
                    </Link>
                    <button className={styles.iconBtn} onClick={() => openEditModal(issue)}>
                      <Pencil size={18} />
                      <span className={styles.iconLabel}>تعديل العدد</span>
                    </button>
                    <button className={styles.iconBtn} onClick={() => openDeleteConfirm(issue)}>
                      <Trash2 size={18} />
                      <span className={styles.iconLabel}>حذف العدد</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.cards}>
        {pagedIssues.map((issue) => (
          <div key={issue.id} className={styles.card}>
            <div className={styles.cardTitle}>
              {issue.coverUrl ? (
                <Image src={issue.coverUrl} alt={issue.name} width={40} height={40} style={{ borderRadius: 8 }} />
              ) : (
                <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 8 }} />
              )}
              <span>{issue.name}</span>
            </div>
            <div className={styles.cardMeta}>
              <span>هجري: {issue.hijriDate || '-'}</span>
              <span>مشاهدات: {issue.views}</span>
            </div>
            <div className={styles.cardStatus}>
              <div className={styles.switch}>
                <input
                  className={styles.switchInput}
                  id={`switch-card-${issue.id}`}
                  type="checkbox"
                  checked={issue.published}
                  onChange={(e) => togglePublished(issue.id, e.target.checked)}
                />
                <label htmlFor={`switch-card-${issue.id}`} className={styles.switchTrack}>
                  <span className={styles.switchThumb} />
                </label>
              </div>
              <span>{issue.published ? 'منشور' : 'مسودة'}</span>
            </div>
            <div className={styles.cardActions}>
              <Link href={`/dashboard/articles?id=${issue.id}`} className={styles.iconBtn} title="إدارة المقالات">
                <FileText size={18} />
              </Link>
              <button className={styles.iconBtn} onClick={() => openEditModal(issue)} title="تعديل العدد">
                <Pencil size={18} />
              </button>
              <button className={styles.iconBtn} onClick={() => openDeleteConfirm(issue)} title="حذف العدد">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.6rem 1rem', marginTop: '0.75rem' }}>
        <div style={{ color: 'var(--brown-900)', fontWeight: 700 }}>
          عرض {perPage} صف في الصفحة — الإجمالي: {total} — الصفحة {page} من {lastPage}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className={styles.iconBtn}
            aria-label="التالي"
            title="التالي"
          >
            ▶
          </button>

          {Array.from({ length: lastPage }).map((_, i) => {
            const p = i + 1;
            const active = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-label={`الانتقال إلى الصفحة ${p}`}
                className={styles.iconBtn}
                style={{
                  background: active ? 'var(--beige-100)' : '#fff',
                  borderColor: active ? 'var(--brown-700)' : '#e2e8f0',
                  fontWeight: active ? 800 : 700,
                  width: 40,
                  height: 36,
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={styles.iconBtn}
            aria-label="السابق"
            title="السابق"
          >
            ◀
          </button>


        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>إضافة/تعديل عدد</div>

            <div className={styles.modalGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>صورة الغلاف</label>
                <input type="file" accept="image/*" className={styles.fileInput} onChange={handleCoverChange} />
                {coverPreview && (
                  <div className={styles.coverPreview}>
                    <Image src={coverPreview} alt="cover" width={64} height={64} style={{ borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>اسم العدد</label>
                <input
                  className={styles.input}
                  value={form.name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="العدد الأول"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>التاريخ الهجري</label>
                <input
                  className={styles.input}
                  value={form.hijriDate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, hijriDate: e.target.value }))}
                  placeholder="رجب 1447"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>التاريخ الميلادي</label>
                <input
                  className={styles.input}
                  value={form.gregorianDate ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, gregorianDate: e.target.value }))}
                  placeholder="مارس 2025"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>تاريخ النشر التلقائي</label>
                <input
                  type="date"
                  className={styles.input}
                  value={form.publishAt ? String(form.publishAt).slice(0, 10) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, publishAt: e.target.value }))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>ملف PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setForm((f) => ({ ...f, pdfUrl: file.name }));
                    setPdfFile(file);
                  }}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>إلغاء</button>
              <button className={styles.saveBtn} onClick={saveIssue} disabled={isSaving}>حفظ</button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>تأكيد الحذف</div>
            <div className={styles.confirmText}>
              هل تريد حذف هذا العدد: {deleteTarget.name}؟ لا يمكن التراجع عن هذه العملية.
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={cancelDelete}>إلغاء</button>
              <button className={styles.saveBtn} onClick={confirmDelete}>تأكيد الحذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div />}>
      <IssuesContent />
    </Suspense>
  );
}
