'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './manage.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { getArticleById, updateArticle } from '@/app/lib/articles.service';
import type { ArticleDetailResponse } from '@/app/lib/articles.model';
import type { ArticleDTO } from '@/app/lib/issues.model';

type EditableFields = {
  title: string;
  open_title: string;
  keywords: string;
  author_name: string;
  gregorian_date: string;
  hijri_date: string;
  references: string;
  status: string;
  className: string;
  content: string;
};

function ManageArticlePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const articleId = params.get('id');
  const issueId = params.get('issue_id');

  const [isLoading, setIsLoading] = React.useState(false);
  const [article, setArticle] = React.useState<ArticleDTO | null>(null);
  const [form, setForm] = React.useState<EditableFields>({
    title: '',
    open_title: '',
    keywords: '',
    author_name: '',
    gregorian_date: '',
    hijri_date: '',
    references: '',
    status: '',
    className: '',
    content: '',
  });
  const [toast, setToast] = React.useState<string | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = React.useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = React.useState<string | null>(null);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  type RefItem = { url: string; originIndex?: number };
  const [referencesItems, setReferencesItems] = React.useState<RefItem[]>([]);
  const [removedIndices, setRemovedIndices] = React.useState<number[]>([]);
  const [refLinkInput, setRefLinkInput] = React.useState<string>('');

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!articleId) return;
      setIsLoading(true);
      try {
        const resp: ArticleDetailResponse = await getArticleById(articleId);
        const a = resp.article;
        if (!alive) return;
        setArticle(a);
        setForm({
          title: a.title ?? '',
          open_title: a.open_title ?? a.title ?? '',
          keywords: a.keywords ?? '',
          author_name: a.author_name ?? '',
          gregorian_date: a.gregorian_date ?? '',
          hijri_date: a.hijri_date ?? '',
          references: a.references_tmp ?? '',
          status: a.status ?? '',
          className: a.className ?? '',
          content: a.content ?? '',
        });
        const initialRefs = Array.isArray(a.references) ? a.references : [];
        setReferencesItems(initialRefs.map((url, idx) => ({ url, originIndex: idx })));
        setRemovedIndices([]);
      } catch {
        if (!alive) return;
        setArticle(null);
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [articleId]);

  const onChange = <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onPickImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setFeaturedImageFile(file);
    if (featuredPreview) {
      try {
        URL.revokeObjectURL(featuredPreview);
      } catch { }
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setFeaturedPreview(url);
    } else {
      setFeaturedPreview(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (featuredPreview) {
        try {
          URL.revokeObjectURL(featuredPreview);
        } catch { }
      }
    };
  }, [featuredPreview]);

  const onPickPdf: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPdfFile(file);
  };

  const save = async () => {
    if (!articleId) return;
    setIsLoading(true);
    try {
      const allLinks = Array.from(new Set(referencesItems.map((it) => it.url.trim()).filter((u) => u)));
      const payload = {
        title: form.title,
        open_title: form.open_title,
        keywords: form.keywords,
        author_name: form.author_name,
        gregorian_date: form.gregorian_date,
        hijri_date: form.hijri_date,
        references: allLinks,
        references_tmp: form.references,
        references_remove_indexes: removedIndices,
        status: form.status,
        className: form.className,
        content: form.content,
        featured_image: featuredImageFile ?? undefined,
        pdf_file: pdfFile ?? undefined,
      };
      const res = await updateArticle(articleId, payload);
      const updated = res.article;
      setArticle(updated);
      const updatedRefs = Array.isArray(updated.references) ? updated.references : [];
      setReferencesItems(updatedRefs.map((url, idx) => ({ url, originIndex: idx })));
      setRemovedIndices([]);
      const msgLower = (res.message || '').toLowerCase();
      const created = msgLower.includes('created') || res.message?.includes('تم إنشاء');
      const updatedMsg = msgLower.includes('updated') || res.message?.includes('تم تحديث');
      const toastMsg = created
        ? 'تم إنشاء المقالة بنجاح'
        : updatedMsg
          ? 'تم تحديث المقالة بنجاح'
          : res.message || 'تم حفظ المقال بنجاح';
      setToast(toastMsg);
      window.setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المقال');
      window.setTimeout(() => setToast(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const backHref =
    issueId && issueId.trim() !== '' ? `/dashboard/articles?id=${encodeURIComponent(issueId)}` : '/dashboard/articles';

  return (
    <div className={styles.page}>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة المحتوى</h1>
        <div className={styles.headerActions}>
          <Link href={backHref} className={styles.backBtn}>
            العودة للمقالات
          </Link>
        </div>
      </div>

      {!article ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>لم يتم العثور على المقال</div>
          <div className={styles.emptyHint}>تأكد من المعرّفات المرسلة عبر الرابط</div>
        </div>
      ) : (
        <>
          <div className={styles.previewCard}>
            <div className={styles.previewInfo}>
              <div className={styles.previewTitle}>{article.title}</div>
              <div className={styles.previewMeta}>
                <span>المعرف: {article.id}</span>
                <span>رقم العدد: {article.issue_id}</span>
                <span>المستخدم: {article.user_id}</span>
                <span>المشاهدات: {article.views_count ?? 0}</span>
              </div>
            </div>
            <div className={styles.previewImageWrap}>
              <Image
                src={featuredPreview || article.featured_image || '/cover.jpg'}
                alt={article.title || 'صورة المقال'}
                width={320}
                height={200}
                className={styles.previewImage}
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formCard}>
              <div className={styles.cardTitle}>البيانات الأساسية</div>
              <div className={styles.field}>
                <label className={styles.label}>العنوان</label>
                <input
                  className={styles.input}
                  value={form.open_title}
                  onChange={(e) => onChange('open_title', e.target.value)}
                  placeholder="عنوان المقال"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>صورة المقال</label>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.input}
                  onChange={onPickImage}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>ملف PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  className={styles.input}
                  onChange={onPickPdf}
                />
                {(pdfFile || article.pdf_file) && (
                  <div className={styles.metaValue} style={{ marginTop: '0.5rem' }}>
                    {pdfFile ? (
                      <span>تم اختيار: {pdfFile.name}</span>
                    ) : article.pdf_file ? (
                      <a href={article.pdf_file} target="_blank" rel="noopener noreferrer">
                        عرض ملف PDF الحالي
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
              {/* <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>الحالة</label>
                  <select
                    className={styles.input}
                    value={form.status}
                    onChange={(e) => onChange('status', e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="draft">مسودة</option>
                    <option value="published">منشور</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>التصنيف (className)</label>
                  <input
                    className={styles.input}
                    value={form.className}
                    onChange={(e) => onChange('className', e.target.value)}
                    placeholder="مثل: arc-opening"
                  />
                </div>
              </div> */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Slug</label>
                  <input className={styles.input} value={article.slug} readOnly />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>الكلمات المفتاحية</label>
                  <input
                    className={styles.input}
                    value={form.keywords}
                    onChange={(e) => onChange('keywords', e.target.value)}
                    placeholder="اكتب الكلمات المفتاحية"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formCard}>
              <div className={styles.cardTitle}>الكاتب والتواريخ</div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>اسم الكاتب</label>
                  <input
                    className={styles.input}
                    value={form.author_name}
                    onChange={(e) => onChange('author_name', e.target.value)}
                    placeholder="اسم الكاتب"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>التاريخ الميلادي</label>
                  <input
                    className={styles.input}
                    value={form.gregorian_date}
                    onChange={(e) => onChange('gregorian_date', e.target.value)}
                    placeholder="مثال: 20 ديسمبر 2025"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>التاريخ الهجري</label>
                <input
                  className={styles.input}
                  value={form.hijri_date}
                  onChange={(e) => onChange('hijri_date', e.target.value)}
                  placeholder="مثال: 29 جمادى الآخرة 1447 هـ"
                />
              </div>
            </div>

            <div className={styles.formCardWide}>
              <div className={styles.cardTitle}>المحتوى</div>
              <div className={styles.editorWrap}>
                <RichTextEditor content={form.content} onChange={(html) => onChange('content', html)} />
              </div>
            </div>

            <div className={styles.bottomGrid}>
              <div className={styles.formCard}>
                <div className={styles.cardTitle}>معلومات إضافية</div>
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>تاريخ النشر</span>
                    <span className={styles.metaValue}>{formatDateTime(article.published_at)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>تاريخ الإنشاء</span>
                    <span className={styles.metaValue}>{formatDateTime(article.created_at)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>تاريخ التحديث</span>
                    <span className={styles.metaValue}>{formatDateTime(article.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.formCard}>
                {/* <div className={styles.cardTitle}>المراجع</div>
                <textarea
                  className={styles.textarea}
                  value={form.references}
                  onChange={(e) => onChange('references', e.target.value)}
                  placeholder="أدخل المراجع هنا"
                /> */}
                <div className={styles.fieldRow}>
                  <input
                    className={styles.input}
                    value={refLinkInput}
                    onChange={(e) => setRefLinkInput(e.target.value)}
                    placeholder="أدخل رابط مرجع"
                  />
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => {
                      const v = refLinkInput.trim();
                      if (!v) return;
                      setReferencesItems((prev) => [...prev, { url: v }]);
                      setRefLinkInput('');
                    }}
                  >
                    إضافة رابط
                  </button>
                </div>
                {referencesItems.length > 0 ? (
                  <ul className={styles.metaList}>
                    {referencesItems.map((item, idx) => (
                      <li key={`${item.url}-${idx}`} className={styles.metaItem}>
                        {/^https?:\/\//i.test((item.url ?? '').trim()) ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                        ) : (
                          <span className={styles.metaValue}>{item.url}</span>
                        )}
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => {
                            setReferencesItems((prev) => {
                              const target = prev[idx];
                              if (typeof target.originIndex === 'number') {
                                setRemovedIndices((r) => Array.from(new Set([...r, target.originIndex as number])));
                              }
                              const next = [...prev];
                              next.splice(idx, 1);
                              return next;
                            });
                          }}
                          aria-label="حذف الرابط"
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={save}>
              حفظ التغييرات
            </button>
            <button className={styles.cancelBtn} onClick={() => router.push(backHref)}>
              إلغاء
            </button>
          </div>
        </>
      )}

      {toast && (
        <div className={styles.toast} role="status" aria-live="polite">
          <div className={styles.toastAccent} />
          <div className={styles.toastMessage}>{toast}</div>
        </div>
      )}
    </div>
  );
}

export default function ManageArticlePage() {
  return (
    <React.Suspense
      fallback={
        <div className={styles.page}>
          <LoadingOverlay open={true} label="جاري التحميل..." ariaLabel="جاري التحميل" />
        </div>
      }
    >
      <ManageArticlePageInner />
    </React.Suspense>
  );
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value ?? '-';
    const date = d.toLocaleDateString('ar-EG');
    const time = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  } catch {
    return value ?? '-';
  }
}
