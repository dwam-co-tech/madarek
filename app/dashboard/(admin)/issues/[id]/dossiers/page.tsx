'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowDown, ArrowUp, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { getAdminIssue } from '@/app/lib/issues.service';
import type { ArticleDTO } from '@/app/lib/issues.model';
import type { Dossier, CreateDossierPayload } from '@/app/lib/dossiers.model';
import { createDossier, deleteDossier, DossierRequestError, getAdminIssueArticles, getDossier, getDossiers, updateDossier } from '@/app/lib/dossiers.service';
import styles from '../../../issues.module.css';
import local from './dossiers.module.css';

type FormState = Omit<CreateDossierPayload, 'cover_image'>;
const emptyForm: FormState = { title: '', slug: '', intro: '', status: 'draft', article_ids: [] };
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function errorMessage(error: unknown): string {
  return error instanceof DossierRequestError ? error.message : 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.';
}

export default function IssueDossiersPage() {
  const params = useParams<{ id: string }>();
  const issueId = Number(params.id);
  const [issueTitle, setIssueTitle] = useState('');
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [cover, setCover] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Dossier | null>(null);

  const load = useCallback(async () => {
    if (!Number.isSafeInteger(issueId) || issueId <= 0) {
      setLoadError('رقم العدد غير صالح.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const [issue, list, issueArticles] = await Promise.all([
        getAdminIssue(issueId), getDossiers(issueId), getAdminIssueArticles(issueId),
      ]);
      setIssueTitle(issue.title);
      setDossiers(list);
      setArticles(issueArticles.filter((article) => Number(article.issue_id) === issueId));
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!cover) return;
    const url = URL.createObjectURL(cover);
    setLocalPreview(url);
    return () => { URL.revokeObjectURL(url); setLocalPreview(null); };
  }, [cover]);

  const closeForm = () => {
    if (busy) return;
    setEditing(null);
    setCover(null);
    setCoverUrl(null);
    setRemoveCover(false);
    setActionError('');
    setFieldErrors({});
  };

  const startCreate = () => {
    setForm({ ...emptyForm, article_ids: [] });
    setCover(null);
    setCoverUrl(null);
    setRemoveCover(false);
    setActionError('');
    setFieldErrors({});
    setEditing('new');
  };

  const startEdit = async (id: number) => {
    setBusy(true);
    setActionError('');
    try {
      const { dossier } = await getDossier(id);
      if (dossier.issue_id !== issueId) {
        setActionError('هذا الملف لا ينتمي إلى العدد الحالي.');
        return;
      }
      setForm({ title: dossier.title, slug: dossier.slug, intro: dossier.intro ?? '', status: dossier.status, article_ids: dossier.article_ids });
      setCover(null);
      setCoverUrl(dossier.cover_image);
      setRemoveCover(false);
      setFieldErrors({});
      setEditing(id);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const toggleArticle = (id: number) => {
    setForm((previous) => ({
      ...previous,
      article_ids: previous.article_ids.includes(id)
        ? previous.article_ids.filter((item) => item !== id)
        : [...previous.article_ids, id],
    }));
  };

  const moveArticle = (index: number, direction: -1 | 1) => {
    setForm((previous) => {
      const next = [...previous.article_ids];
      const target = index + direction;
      if (target < 0 || target >= next.length) return previous;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...previous, article_ids: next };
    });
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = form.title.trim();
    const slug = form.slug.trim();
    const errors: Record<string, string[]> = {};
    if (!title || title.length > 255) errors.title = ['يرجى إدخال عنوان لا يتجاوز 255 حرفاً.'];
    if (!slugPattern.test(slug) || slug.length > 255) errors.slug = ['استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط في الرابط.'];
    if (cover && (!['image/jpeg', 'image/png', 'image/webp'].includes(cover.type))) errors.cover_image = ['اختر صورة JPEG أو PNG أو WebP.'];
    if (form.article_ids.some((id) => !articles.some((article) => article.id === id))) errors.article_ids = ['اختر مقالات من هذا العدد فقط.'];
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    setActionError('');
    try {
      const payload = { ...form, title, slug, cover_image: cover ?? (removeCover ? null : undefined) };
      if (editing === 'new') await createDossier(issueId, { ...payload, cover_image: cover ?? undefined });
      else if (typeof editing === 'number') await updateDossier(editing, payload);
      setEditing(null);
      setCover(null);
      await load();
    } catch (error) {
      setActionError(errorMessage(error));
      if (error instanceof DossierRequestError) setFieldErrors(error.errors);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setActionError('');
    try {
      await deleteDossier(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const availableArticles = articles.filter((article) => !form.article_ids.includes(article.id));

  return (
    <div dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <Link href="/md-dash/issues" className={local.back}>العودة إلى الأعداد</Link>
          <h1 className={styles.pageTitle}>الملفات الخاصة {issueTitle && `— ${issueTitle}`}</h1>
        </div>
        {!loading && !loadError && <button type="button" className={styles.addButton} onClick={startCreate}><Plus size={18} /> إضافة ملف خاص</button>}
      </div>

      {loading && <p role="status">جارٍ تحميل الملفات الخاصة...</p>}
      {loadError && <div className={local.error} role="alert">{loadError} <button type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}
      {actionError && editing === null && <p className={local.error} role="alert">{actionError}</p>}
      {!loading && !loadError && (
        dossiers.length === 0 ? <div className={local.empty}><FolderOpen size={32} /><p>لا توجد ملفات خاصة لهذا العدد.</p></div> :
        <div className={`${styles.tableWrapper} ${local.tableWrapper}`}>
          <table className={styles.table}>
            <thead className={styles.thead}><tr><th className={styles.th}>الغلاف</th><th className={styles.th}>عنوان الملف</th><th className={styles.th}>الرابط</th><th className={styles.th}>الحالة</th><th className={styles.th}>المقالات</th><th className={styles.th}>الإجراءات</th></tr></thead>
            <tbody>{dossiers.map((dossier) => <tr key={dossier.id} className={styles.row}>
              <td className={styles.td}>{dossier.cover_image ? <Image unoptimized width={48} height={48} className={local.thumbnail} src={dossier.cover_image} alt={`غلاف ${dossier.title}`} /> : '—'}</td>
              <td className={styles.td}>{dossier.title}</td><td className={styles.td} dir="ltr">{dossier.slug}</td>
              <td className={styles.td}><span className={dossier.status === 'published' ? local.published : local.draft}>{dossier.status === 'published' ? 'منشور' : 'مسودة'}</span></td>
              <td className={styles.td}>{dossier.article_ids.length}</td>
              <td className={styles.td}><div className={styles.actions}>
                <button type="button" className={styles.iconBtn} aria-label={`تعديل ${dossier.title}`} title="تعديل" disabled={busy} onClick={() => void startEdit(dossier.id)}><Pencil size={18} /></button>
                <button type="button" className={styles.iconBtn} aria-label={`حذف ${dossier.title}`} title="حذف" disabled={busy} onClick={() => { setActionError(''); setDeleteTarget(dossier); }}><Trash2 size={18} /></button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}

      {editing !== null && <div className={styles.modalOverlay}>
        <div className={`${styles.modal} ${local.modal}`} role="dialog" aria-modal="true" aria-labelledby="dossier-form-title">
          <h2 id="dossier-form-title" className={styles.modalTitle}>{editing === 'new' ? 'إضافة ملف خاص' : 'تعديل الملف الخاص'}</h2>
          <form onSubmit={(event) => void save(event)} className={local.form}>
            <label className={styles.inputGroup}><span className={styles.label}>عنوان الملف</span><input className={styles.input} value={form.title} maxLength={255} required onChange={(e) => setForm({ ...form, title: e.target.value })} />{fieldErrors.title && <span className={local.fieldError}>{fieldErrors.title[0]}</span>}</label>
            <label className={styles.inputGroup}><span className={styles.label}>الرابط</span><input className={styles.input} dir="ltr" value={form.slug} maxLength={255} required onChange={(e) => setForm({ ...form, slug: e.target.value })} />{fieldErrors.slug && <span className={local.fieldError}>{fieldErrors.slug[0]}</span>}</label>
            <label className={styles.inputGroup}><span className={styles.label}>مقدمة الملف</span><textarea className={styles.input} rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} />{fieldErrors.intro && <span className={local.fieldError}>{fieldErrors.intro[0]}</span>}</label>
            <label className={styles.inputGroup}><span className={styles.label}>الحالة</span><select className={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FormState['status'] })}><option value="draft">مسودة</option><option value="published">منشور</option></select>{fieldErrors.status && <span className={local.fieldError}>{fieldErrors.status[0]}</span>}</label>
            <div className={styles.inputGroup}><label className={styles.label} htmlFor="dossier-cover">صورة الغلاف</label>
              {(localPreview || (coverUrl && !removeCover && !cover)) && <Image unoptimized width={110} height={80} className={local.preview} src={localPreview ?? coverUrl!} alt="معاينة الغلاف" />}
              <input id="dossier-cover" className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { setCover(e.target.files?.[0] ?? null); setRemoveCover(false); }} />
              {(cover || (coverUrl && !removeCover)) && <button type="button" className={styles.cancelBtn} onClick={() => { setCover(null); setRemoveCover(Boolean(coverUrl)); const input = document.getElementById('dossier-cover') as HTMLInputElement | null; if (input) input.value = ''; }}>إزالة الغلاف</button>}
              {fieldErrors.cover_image && <span className={local.fieldError}>{fieldErrors.cover_image[0]}</span>}
            </div>
            <div className={styles.inputGroup}><span className={styles.label}>المقالات في هذا العدد</span>
              {form.status === 'published' && <small className={local.note}>يظهر الملف للزوار فقط عندما يكون العدد منشوراً ويحتوي الملف على مقال منشور واحد على الأقل.</small>}
              <div className={local.articlePicker}>{availableArticles.length ? availableArticles.map((article) => <label key={article.id} className={local.articleOption}><input type="checkbox" checked={false} onChange={() => toggleArticle(article.id)} /> {article.title} <small>#{article.id}</small></label>) : <span>لا توجد مقالات أخرى متاحة.</span>}</div>
              <span className={styles.label}>ترتيب المقالات المختارة</span>
              <ol className={local.selected}>{form.article_ids.map((id, index) => {
                const article = articles.find((item) => item.id === id);
                return <li key={id}><span>{article?.title ?? `#${id}`}</span><div className={styles.actions}>
                  <button type="button" className={styles.iconBtn} aria-label={`تقديم ${article?.title ?? id}`} disabled={index === 0} onClick={() => moveArticle(index, -1)}><ArrowUp size={16} /></button>
                  <button type="button" className={styles.iconBtn} aria-label={`تأخير ${article?.title ?? id}`} disabled={index === form.article_ids.length - 1} onClick={() => moveArticle(index, 1)}><ArrowDown size={16} /></button>
                  <button type="button" className={styles.iconBtn} aria-label={`إزالة ${article?.title ?? id}`} onClick={() => toggleArticle(id)}><Trash2 size={16} /></button>
                </div></li>;
              })}</ol>
              {fieldErrors.article_ids && <span className={local.fieldError}>{fieldErrors.article_ids[0]}</span>}
              {Object.keys(fieldErrors).filter((field) => field.startsWith('article_ids.')).map((field) => <span key={field} className={local.fieldError}>{fieldErrors[field][0]}</span>)}
            </div>
            {actionError && <p className={local.error} role="alert">{actionError}</p>}
            <div className={styles.modalActions}><button type="button" className={styles.cancelBtn} disabled={busy} onClick={closeForm}>إلغاء</button><button type="submit" className={styles.saveBtn} disabled={busy}>{busy ? 'جارٍ الحفظ...' : 'حفظ الملف'}</button></div>
          </form>
        </div>
      </div>}

      {deleteTarget && <div className={styles.modalOverlay}><div className={styles.modal} role="alertdialog" aria-modal="true" aria-labelledby="dossier-delete-title">
        <h2 className={styles.modalTitle} id="dossier-delete-title">حذف الملف الخاص</h2>
        <p className={styles.confirmText}>هل أنت متأكد من حذف هذا الملف الخاص: {deleteTarget.title}؟</p>
        {actionError && <p className={local.error} role="alert">{actionError}</p>}
        <div className={styles.modalActions}><button type="button" className={styles.cancelBtn} disabled={busy} onClick={() => { setDeleteTarget(null); setActionError(''); }}>إلغاء</button><button type="button" className={styles.saveBtn} disabled={busy} onClick={() => void confirmDelete()}>{busy ? 'جارٍ الحذف...' : 'تأكيد الحذف'}</button></div>
      </div></div>}
    </div>
  );
}
