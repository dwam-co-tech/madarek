'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './manage.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { getArticleById, updateArticle, createArticle } from '@/app/lib/articles.service';
import { getIssueSections } from '@/app/lib/issues.service';
import type { ArticleDetailResponse } from '@/app/lib/articles.model';
import type { ArticleDTO, IssueSection } from '@/app/lib/issues.model';

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
  issue_section_id: string;
};

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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function ManageArticlePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const articleId = params.get('id');
  const issueId = params.get('issue_id');
  const issueSectionIdParam = params.get('issue_section_id');

  const [isLoading, setIsLoading] = React.useState(false);
  const [article, setArticle] = React.useState<ArticleDTO | null>(null);
  const [sections, setSections] = React.useState<IssueSection[]>([]);
  const [form, setForm] = React.useState<EditableFields>({
    title: '',
    open_title: '',
    keywords: '',
    author_name: '',
    gregorian_date: '',
    hijri_date: '',
    references: '',
    status: 'published',
    className: '',
    content: '',
    issue_section_id: '',
  });
  const [toast, setToast] = React.useState<string | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = React.useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = React.useState<string | null>(null);
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  type RefItem = { title: string; url: string; originIndex?: number };
  const [referencesItems, setReferencesItems] = React.useState<RefItem[]>([]);
  const [removedIndices, setRemovedIndices] = React.useState<number[]>([]);
  const [refTitleInput, setRefTitleInput] = React.useState<string>('');
  const [refLinkInput, setRefLinkInput] = React.useState<string>('');

  const effectiveIssueId = article ? article.issue_id : (issueId ? Number(issueId) : null);

  // Load sections whenever the issue ID becomes available
  React.useEffect(() => {
    if (!effectiveIssueId) return;
    let alive = true;
    const loadSections = async () => {
      try {
        const list = await getIssueSections(effectiveIssueId);
        if (alive) {
          list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          setSections(list);
        }
      } catch (err) {
        console.error("Failed to load sections", err);
      }
    };
    loadSections();
    return () => {
      alive = false;
    };
  }, [effectiveIssueId]);

  // Load article if editing, or prefill from query parameters if creating
  React.useEffect(() => {
    if (!articleId) {
      // Create mode
      setForm({
        title: '',
        open_title: '',
        keywords: '',
        author_name: '',
        gregorian_date: '',
        hijri_date: '',
        references: '',
        status: 'published',
        className: '',
        content: '',
        issue_section_id: issueSectionIdParam ? String(issueSectionIdParam) : '',
      });
      setArticle(null);
      setReferencesItems([]);
      setRemovedIndices([]);
      return;
    }

    let alive = true;
    const load = async () => {
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
          status: a.status ?? 'published',
          className: a.className ?? '',
          content: a.content ?? '',
          issue_section_id: a.issue_section_id ? String(a.issue_section_id) : '',
        });
        const initialRefs = Array.isArray(a.references) ? a.references : [];
        setReferencesItems(initialRefs.map((ref, idx) => {
          if (typeof ref === 'object' && ref !== null) {
            return { title: ref.title || '', url: ref.url || '', originIndex: idx };
          }
          const refStr = typeof ref === 'string' ? ref : '';
          return { title: refStr, url: refStr, originIndex: idx };
        }));
        setRemovedIndices([]);
      } catch (err) {
        console.error(err);
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
  }, [articleId, issueSectionIdParam]);

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
    const finalIssueId = article ? article.issue_id : (issueId ? Number(issueId) : null);
    if (!finalIssueId) {
      setToast('يرجى تحديد العدد أولاً');
      window.setTimeout(() => setToast(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const allRefs = referencesItems.filter((it) => it.title.trim() || it.url.trim()).map((it) => ({ title: it.title.trim(), url: it.url.trim() }));
      const parsedSectionId = form.issue_section_id ? Number(form.issue_section_id) : null;

      if (articleId) {
        // Edit mode
        const payload = {
          title: form.title,
          open_title: form.open_title,
          keywords: form.keywords,
          author_name: form.author_name,
          gregorian_date: form.gregorian_date,
          hijri_date: form.hijri_date,
          references: allRefs,
          references_tmp: form.references,
          references_remove_indexes: removedIndices,
          status: form.status,
          className: form.className,
          content: form.content,
          featured_image: featuredImageFile ?? undefined,
          pdf_file: pdfFile ?? undefined,
          issue_section_id: parsedSectionId,
        };
        const res = await updateArticle(articleId, payload);
        const updated = res.article;
        setArticle(updated);
        const updatedRefs = Array.isArray(updated.references) ? updated.references : [];
        setReferencesItems(updatedRefs.map((ref, idx) => {
          if (typeof ref === 'object' && ref !== null) {
            return { title: (ref as { title?: string }).title || '', url: (ref as { url?: string }).url || '', originIndex: idx };
          }
          const refStr = typeof ref === 'string' ? ref : '';
          return { title: refStr, url: refStr, originIndex: idx };
        }));
        setRemovedIndices([]);
        setToast('تم تحديث المقالة بنجاح');
        window.setTimeout(() => setToast(null), 3000);
      } else {
        // Create mode
        const slug = generateSlug(form.title || 'مقال جديد');
        const payload = {
          title: form.title || 'مقال جديد',
          slug: slug,
          open_title: form.open_title || form.title || 'مقال جديد',
          keywords: form.keywords,
          author_name: form.author_name,
          gregorian_date: form.gregorian_date,
          hijri_date: form.hijri_date,
          references: allRefs,
          references_tmp: form.references,
          status: form.status || 'published',
          className: form.className,
          content: form.content,
          featured_image: featuredImageFile ?? undefined,
          pdf_file: pdfFile ?? undefined,
          issue_section_id: parsedSectionId,
        };
        const dummySectionId = parsedSectionId ? parsedSectionId : 1;
        await createArticle(dummySectionId, finalIssueId, payload);
        
        setToast('تم إنشاء المقالة بنجاح');
        window.setTimeout(() => {
          setToast(null);
          router.push(backHref);
        }, 2000);
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المقال');
      window.setTimeout(() => setToast(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const finalBackIssueId = article ? String(article.issue_id) : (issueId ?? '');
  const backHref =
    finalBackIssueId && finalBackIssueId.trim() !== '' ? `/md-dash/articles?id=${encodeURIComponent(finalBackIssueId)}` : '/md-dash/articles';

  const selectedSection = sections.find(s => String(s.id) === form.issue_section_id);

  return (
    <div className={styles.page}>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{articleId ? 'تعديل المقال' : 'إضافة مقال جديد'}</h1>
        <div className={styles.headerActions}>
          <Link href={backHref} className={styles.backBtn}>
            العودة للمقالات
          </Link>
        </div>
      </div>

      {articleId && !article ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>لم يتم العثور على المقال</div>
          <div className={styles.emptyHint}>تأكد من المعرّفات المرسلة عبر الرابط</div>
        </div>
      ) : (
        <React.Fragment>
          {article && (
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
          )}

          <div className={styles.formGrid}>
            <div className={styles.formCard}>
              <div className={styles.cardTitle}>البيانات الأساسية</div>
              <div className={styles.field}>
                <label className={styles.label}>العنوان الرئيسي</label>
                <input
                  className={styles.input}
                  value={form.title}
                  onChange={(e) => {
                    onChange('title', e.target.value);
                    if (!form.open_title || form.open_title === form.title) {
                      onChange('open_title', e.target.value);
                    }
                  }}
                  placeholder="العنوان الرئيسي للمقال"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>عنوان العرض (Open Title)</label>
                <input
                  className={styles.input}
                  value={form.open_title}
                  onChange={(e) => onChange('open_title', e.target.value)}
                  placeholder="عنوان العرض في الصفحة"
                />
              </div>
              
              <div className={styles.field}>
                <label className={styles.label}>القسم (التبويب)</label>
                <select
                  className={styles.input}
                  value={form.issue_section_id}
                  onChange={(e) => onChange('issue_section_id', e.target.value)}
                  disabled={!articleId} // Lock the section when creating
                >
                  <option value="">بدون قسم (مقالات غير مصنفة)</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title}
                    </option>
                  ))}
                </select>
                {!articleId && selectedSection && (
                  <span style={{ fontSize: '0.85rem', color: '#634722c5', marginTop: '4px', display: 'block' }}>
                    القسم المختار: {selectedSection.title} (مغلق)
                  </span>
                )}
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
                {(pdfFile || (article && article.pdf_file)) && (
                  <div className={styles.metaValue} style={{ marginTop: '0.5rem' }}>
                    {pdfFile ? (
                      <span>تم اختيار: {pdfFile.name}</span>
                    ) : article && article.pdf_file ? (
                      <a href={article.pdf_file} target="_blank" rel="noopener noreferrer">
                        عرض ملف PDF الحالي
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Slug</label>
                  <input className={styles.input} value={article?.slug ?? ''} readOnly placeholder="يتم توليده تلقائياً" />
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
                    <span className={styles.metaValue}>{article ? formatDateTime(article.published_at) : '-'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>تاريخ الإنشاء</span>
                    <span className={styles.metaValue}>{article ? formatDateTime(article.created_at) : '-'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>تاريخ التحديث</span>
                    <span className={styles.metaValue}>{article ? formatDateTime(article.updated_at) : '-'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.formCard}>
                <div className={styles.cardTitle}>المراجع</div>
                <div className={styles.fieldRow} style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    className={styles.input}
                    value={refTitleInput}
                    onChange={(e) => setRefTitleInput(e.target.value)}
                    placeholder="اسم المرجع"
                    style={{ flex: 1 }}
                  />
                  <input
                    className={styles.input}
                    value={refLinkInput}
                    onChange={(e) => setRefLinkInput(e.target.value)}
                    placeholder="رابط المرجع"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={() => {
                      const title = refTitleInput.trim();
                      const url = refLinkInput.trim();
                      if (!title && !url) return;
                      setReferencesItems((prev) => [...prev, { title: title || url, url }]);
                      setRefTitleInput('');
                      setRefLinkInput('');
                    }}
                  >
                    إضافة
                  </button>
                </div>
                {referencesItems.length > 0 ? (
                  <ul className={styles.metaList} style={{ listStyle: 'none', padding: 0 }}>
                    {referencesItems.map((item, idx) => {
                      const displayUrl = item.url && item.url.length > 30
                        ? item.url.substring(0, 30) + '...'
                        : item.url;
                      return (
                        <li key={`${item.url}-${idx}`} className={styles.metaItem} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.title || item.url}</div>
                            {item.url && (
                              <div style={{ fontSize: '0.8rem', color: '#888', direction: 'ltr', textAlign: 'left' }}>
                                {displayUrl}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
                            <button
                              type="button"
                              className={styles.saveBtn}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                              onClick={() => {
                                setRefTitleInput(item.title);
                                setRefLinkInput(item.url);
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
                              aria-label="تعديل المرجع"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              className={styles.cancelBtn}
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
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
                              aria-label="حذف المرجع"
                            >
                              حذف
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
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
          </div>

        </React.Fragment>
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
