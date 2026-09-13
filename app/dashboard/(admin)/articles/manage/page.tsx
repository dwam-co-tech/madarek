'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight, BookOpen, Check, CheckCircle2, CircleAlert, Clock3, FileCheck2,
  FileText, ImagePlus, Info, Link2, LoaderCircle, Plus, Save, Trash2,
  UploadCloud, UserRound, X,
} from 'lucide-react';
import styles from './manage.module.css';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import {
  ArticleRequestError, checkArticleSlugAvailability, createArticle,
  getAdminArticleById, updateArticle,
} from '@/app/lib/articles.service';
import { getAdminIssueSections } from '@/app/lib/issues.service';
import type { ArticleDetailResponse } from '@/app/lib/articles.model';
import type { ArticleDTO, IssueSection } from '@/app/lib/issues.model';

type EditableFields = {
  title: string; open_title: string; slug: string; keywords: string;
  author_name: string; gregorian_date: string; hijri_date: string;
  references: string; status: string; className: string; content: string;
  issue_section_id: string;
};
type RefItem = { title: string; url: string; originIndex?: number };
type SlugState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';
type Notice = { type: 'success' | 'error'; message: string } | null;

const EMPTY_FORM: EditableFields = {
  title: '', open_title: '', slug: '', keywords: '', author_name: '',
  gregorian_date: '', hijri_date: '', references: '', status: 'published',
  className: '', content: '', issue_section_id: '',
};
function formatDateTime(value?: string | null): string {
  if (!value) return 'لم يُحدد بعد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('ar-EG')}، ${date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function validReferenceUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch { return false; }
}

function ManageArticlePageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const articleId = params.get('id');
  const issueId = params.get('issue_id');
  const issueSectionIdParam = params.get('issue_section_id');

  const [isInitialLoading, setIsInitialLoading] = React.useState(Boolean(articleId));
  const [isSaving, setIsSaving] = React.useState(false);
  const saveLockRef = React.useRef(false);
  const [article, setArticle] = React.useState<ArticleDTO | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [sections, setSections] = React.useState<IssueSection[]>([]);
  const [form, setForm] = React.useState<EditableFields>({ ...EMPTY_FORM });
  const [notice, setNotice] = React.useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const [featuredImageFile, setFeaturedImageFile] = React.useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState('');
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);
  const [pdfError, setPdfError] = React.useState('');
  const [referencesItems, setReferencesItems] = React.useState<RefItem[]>([]);
  const [removedIndices, setRemovedIndices] = React.useState<number[]>([]);
  const [refTitleInput, setRefTitleInput] = React.useState('');
  const [refLinkInput, setRefLinkInput] = React.useState('');
  const [referenceError, setReferenceError] = React.useState('');
  const [editingReferenceIndex, setEditingReferenceIndex] = React.useState<number | null>(null);
  const [slugState, setSlugState] = React.useState<SlugState>('idle');
  const [slugMessage, setSlugMessage] = React.useState('');
  const slugRequestRef = React.useRef<AbortController | null>(null);

  const effectiveIssueId = article?.issue_id ?? (issueId ? Number(issueId) : null);
  const finalBackIssueId = article ? String(article.issue_id) : (issueId ?? '');
  const backHref = finalBackIssueId
    ? `/md-dash/articles?id=${encodeURIComponent(finalBackIssueId)}` : '/md-dash/articles';

  React.useEffect(() => {
    if (!effectiveIssueId) return;
    let alive = true;
    getAdminIssueSections(effectiveIssueId).then((list) => {
      if (alive) setSections([...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    }).catch(() => {
      if (alive) setNotice({ type: 'error', message: 'تعذر تحميل أقسام العدد. يمكنك المحاولة مرة أخرى بعد تحديث الصفحة.' });
    });
    return () => { alive = false; };
  }, [effectiveIssueId]);

  React.useEffect(() => {
    if (!articleId) {
      setForm({ ...EMPTY_FORM, issue_section_id: issueSectionIdParam ?? '' });
      setArticle(null); setLoadFailed(false); setReferencesItems([]); setRemovedIndices([]);
      setIsInitialLoading(false); setIsDirty(false);
      return;
    }
    let alive = true;
    setIsInitialLoading(true); setLoadFailed(false);
    getAdminArticleById(articleId).then((response: ArticleDetailResponse) => {
      if (!alive) return;
      const current = response.article;
      setArticle(current);
      setForm({
        title: current.title ?? '', open_title: current.open_title ?? current.title ?? '',
        slug: current.slug ?? '', keywords: current.keywords ?? '',
        author_name: current.author_name ?? '', gregorian_date: current.gregorian_date ?? '',
        hijri_date: current.hijri_date ?? '', references: current.references_tmp ?? '',
        status: current.status ?? 'published', className: current.className ?? '',
        content: current.content ?? '',
        issue_section_id: current.issue_section_id ? String(current.issue_section_id) : '',
      });
      const refs = Array.isArray(current.references) ? current.references : [];
      setReferencesItems(refs.map((ref, index) => typeof ref === 'object' && ref !== null
        ? { title: ref.title || '', url: ref.url || '', originIndex: index }
        : { title: String(ref), url: String(ref), originIndex: index }));
      setRemovedIndices([]); setSlugState('available');
      setSlugMessage('الرابط الحالي خاص بهذا المقال.'); setIsDirty(false);
    }).catch(() => { if (alive) setLoadFailed(true); })
      .finally(() => { if (alive) setIsInitialLoading(false); });
    return () => { alive = false; };
  }, [articleId, issueSectionIdParam]);

  React.useEffect(() => {
    if (!isDirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [isDirty]);

  React.useEffect(() => {
    const slug = form.slug.trim();
    slugRequestRef.current?.abort();
    if (!slug) { setSlugState('idle'); setSlugMessage('سيظهر هنا فورًا ما إذا كان الرابط متاحًا.'); return; }
    if (article && slug === article.slug) {
      setSlugState('available'); setSlugMessage('الرابط الحالي خاص بهذا المقال.'); return;
    }
    setSlugState('checking'); setSlugMessage('جارٍ التحقق من الرابط…');
    const controller = new AbortController();
    slugRequestRef.current = controller;
    const timer = window.setTimeout(async () => {
      try {
        const available = await checkArticleSlugAvailability(slug, articleId ?? undefined, controller.signal);
        setSlugState(available ? 'available' : 'unavailable');
        setSlugMessage(available ? 'الرابط متاح ويمكن استخدامه.' : 'هذا الرابط مستخدم في مقال آخر، اختر رابطًا مختلفًا.');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSlugState('error');
        setSlugMessage(error instanceof Error ? error.message : 'تعذر التحقق من الرابط الآن.');
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [form.slug, article, articleId]);

  React.useEffect(() => () => { if (featuredPreview) URL.revokeObjectURL(featuredPreview); }, [featuredPreview]);

  const onChange = <K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous }; delete next[key]; return next;
    });
    setIsDirty(true);
  };

  const pickImage: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] ?? null;
    setImageError(''); if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('اختر ملف صورة صالحًا بصيغة JPG أو PNG أو GIF أو WebP.'); event.target.value = ''; return;
    }
    if (featuredPreview) URL.revokeObjectURL(featuredPreview);
    setFeaturedImageFile(file); setFeaturedPreview(URL.createObjectURL(file)); setIsDirty(true);
  };

  const pickPdf: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0] ?? null;
    setPdfError(''); if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('اختر ملفًا بصيغة PDF فقط.'); event.target.value = ''; return;
    }
    setPdfFile(file); setIsDirty(true);
  };

  const removeExistingReference = (item: RefItem) => {
    if (typeof item.originIndex === 'number') {
      setRemovedIndices((previous) => Array.from(new Set([...previous, item.originIndex as number])));
    }
  };

  const addOrUpdateReference = () => {
    const title = refTitleInput.trim(); const url = refLinkInput.trim();
    if (!title) { setReferenceError('اكتب اسم المرجع لإضافته.'); return; }
    if (url && !validReferenceUrl(url)) { setReferenceError('اكتب رابطًا صحيحًا يبدأ بـ http:// أو https://، أو اتركه فارغًا.'); return; }
    setReferencesItems((previous) => {
      if (editingReferenceIndex === null) return [...previous, { title, url }];
      const next = [...previous]; const old = next[editingReferenceIndex];
      next[editingReferenceIndex] = { title, url, originIndex: old?.originIndex }; return next;
    });
    setRefTitleInput(''); setRefLinkInput(''); setReferenceError('');
    setEditingReferenceIndex(null); setIsDirty(true);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'عنوان المقال مطلوب.';
    if (!form.slug.trim()) errors.slug = 'الرابط الفرعي مطلوب.';
    if (slugState === 'unavailable') errors.slug = 'الرابط الفرعي مكرر وغير مقبول.';
    if (!effectiveIssueId) errors.issue_id = 'لم يتم تحديد العدد الذي سيضاف إليه المقال.';
    if (refTitleInput.trim() || refLinkInput.trim()) errors.references = 'لديك بيانات مرجع لم تضغط على زر إضافتها بعد.';
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setNotice({ type: 'error', message: Object.values(errors)[0] });
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return false;
    }
    return true;
  };

  const save = async () => {
    if (saveLockRef.current || isSaving || !validate()) return;
    saveLockRef.current = true; setIsSaving(true); setNotice(null);
    try {
      const available = await checkArticleSlugAvailability(form.slug.trim(), articleId ?? undefined);
      if (!available) {
        setSlugState('unavailable'); setSlugMessage('هذا الرابط مستخدم في مقال آخر، اختر رابطًا مختلفًا.');
        setFieldErrors((previous) => ({ ...previous, slug: 'الرابط الفرعي مكرر وغير مقبول.' }));
        setNotice({ type: 'error', message: 'لا يمكن الحفظ لأن الرابط الفرعي مستخدم بالفعل.' }); return;
      }
      const references = referencesItems.map(({ title, url }) => ({ title: title.trim(), url: url.trim() }));
      const sectionId = form.issue_section_id ? Number(form.issue_section_id) : null;
      const payload = {
        title: form.title.trim(), slug: form.slug.trim(), open_title: form.title.trim(),
        keywords: form.keywords.trim(), author_name: form.author_name.trim(),
        gregorian_date: form.gregorian_date.trim(), hijri_date: form.hijri_date.trim(),
        references, references_tmp: form.references, references_remove_indexes: removedIndices,
        status: form.status || 'published', className: form.className, content: form.content,
        featured_image: featuredImageFile ?? undefined, pdf_file: pdfFile ?? undefined,
        issue_section_id: sectionId,
      };
      if (articleId) {
        const response = await updateArticle(articleId, payload);
        setArticle(response.article);
        setReferencesItems((response.article.references ?? []).map((ref, index) => ({ title: ref.title || '', url: ref.url || '', originIndex: index })));
        setRemovedIndices([]); setFeaturedImageFile(null); setPdfFile(null); setIsDirty(false);
        setNotice({ type: 'success', message: 'تم حفظ تعديلات المقال بنجاح.' });
      } else {
        await createArticle(sectionId ?? 1, Number(effectiveIssueId), payload);
        setIsDirty(false); setNotice({ type: 'success', message: 'تم إنشاء المقال ورفع ملفاته بنجاح.' });
        window.setTimeout(() => router.push(backHref), 900);
      }
    } catch (error) {
      if (error instanceof ArticleRequestError) {
        setFieldErrors(Object.fromEntries(Object.entries(error.errors).map(([key, messages]) => [key, messages[0]])));
      }
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'تعذر حفظ المقال. لم يُكرر الطلب تلقائيًا لتجنب إنشاء نسخة أخرى.' });
    } finally { saveLockRef.current = false; setIsSaving(false); }
  };

  const selectedSection = sections.find((section) => String(section.id) === form.issue_section_id);
  const basicsComplete = Boolean(form.title.trim() && form.slug.trim() && slugState === 'available');
  const contentComplete = Boolean(form.content.replace(/<[^>]*>/g, '').trim());

  if (isInitialLoading) return <div className={styles.centerState} role="status"><LoaderCircle className={styles.spin} size={30} /><strong>جارٍ تجهيز بيانات المقال…</strong><span>لن يستغرق الأمر سوى لحظات</span></div>;
  if (articleId && loadFailed) return <div className={styles.centerState}><CircleAlert size={34} /><strong>تعذر فتح المقال</strong><span>قد يكون الرابط غير صحيح أو حدث انقطاع أثناء التحميل.</span><Link href={backHref} className={styles.primaryButton}>العودة إلى المقالات</Link></div>;

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.hero}>
        <div><div className={styles.eyebrow}><BookOpen size={16} /> إدارة المحتوى</div><h1>{articleId ? 'تعديل المقال' : 'إضافة مقال جديد'}</h1><p>{articleId ? 'راجع التفاصيل وحدّث المحتوى والملفات بثقة.' : 'أدخل البيانات بالترتيب؛ سنراجع الرابط والملفات قبل الحفظ.'}</p></div>
        <Link href={backHref} className={styles.backButton}><ArrowRight size={18} /> العودة للمقالات</Link>
      </header>

      <div className={styles.progressStrip} aria-label="حالة اكتمال المقال">
        <div className={basicsComplete ? styles.progressDone : styles.progressItem}><span>{basicsComplete ? <Check size={16} /> : '١'}</span><div><strong>البيانات الأساسية</strong><small>{basicsComplete ? 'مكتملة' : 'العنوان والرابط'}</small></div></div>
        <div className={contentComplete ? styles.progressDone : styles.progressItem}><span>{contentComplete ? <Check size={16} /> : '٢'}</span><div><strong>المحتوى</strong><small>{contentComplete ? 'تمت الكتابة' : 'نص المقال'}</small></div></div>
        <div className={styles.progressItem}><span>٣</span><div><strong>الملفات والمراجع</strong><small>{referencesItems.length} مراجع · {(featuredImageFile || article?.featured_image) ? 'صورة جاهزة' : 'دون صورة'}</small></div></div>
      </div>

      {notice && <div className={notice.type === 'success' ? styles.successNotice : styles.errorNotice} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.type === 'success' ? <CheckCircle2 size={21} /> : <CircleAlert size={21} />}<span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="إغلاق الرسالة"><X size={18} /></button></div>}

      <div className={styles.workspace}>
        <main className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><FileText size={20} /></span><div><h2>التفاصيل الأساسية</h2><p>هذه البيانات تظهر للقارئ وفي روابط المقال.</p></div></div>
            <div className={styles.field}>
              <label htmlFor="article-title">العنوان الرئيسي <em>مطلوب</em></label>
              <input id="article-title" className={fieldErrors.title ? styles.inputError : styles.input} value={form.title} aria-invalid={Boolean(fieldErrors.title)} onChange={(event) => { const oldGenerated = generateSlug(form.title); const title = event.target.value; onChange('title', title); if (!form.slug || form.slug === oldGenerated) onChange('slug', generateSlug(title)); }} placeholder="اكتب عنوانًا واضحًا ومباشرًا للمقال" maxLength={255} />
              <div className={styles.fieldFooter}><span className={fieldErrors.title ? styles.fieldError : styles.helper}>{fieldErrors.title || 'سيُستخدم العنوان أيضًا كعنوان افتتاحي للمقال.'}</span><span>{form.title.length}/255</span></div>
            </div>
            <div className={styles.twoColumns}>
              <div className={styles.field}>
                <label htmlFor="article-slug">الرابط الفرعي (Slug) <em>مطلوب</em></label>
                <div className={styles.slugInputWrap}><Link2 size={18} /><input id="article-slug" className={fieldErrors.slug || slugState === 'unavailable' ? styles.inputError : styles.input} value={form.slug} dir="ltr" aria-invalid={Boolean(fieldErrors.slug || slugState === 'unavailable')} onChange={(event) => onChange('slug', generateSlug(event.target.value))} placeholder="article-slug" maxLength={255} /></div>
                <div className={`${styles.slugStatus} ${styles[`slug_${slugState}`]}`}>{slugState === 'checking' && <LoaderCircle className={styles.spin} size={15} />}{slugState === 'available' && <CheckCircle2 size={15} />}{(slugState === 'unavailable' || slugState === 'error') && <CircleAlert size={15} />}<span>{fieldErrors.slug || slugMessage}</span></div>
              </div>
              <div className={styles.field}><label htmlFor="article-keywords">الكلمات المفتاحية</label><input id="article-keywords" className={styles.input} value={form.keywords} onChange={(e) => onChange('keywords', e.target.value)} placeholder="مثال: تاريخ، ثقافة، بحوث" /><span className={styles.helper}>افصل بين الكلمات بفاصلة لتسهيل البحث.</span></div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><UserRound size={20} /></span><div><h2>الكاتب والتواريخ</h2><p>بيانات توثيق المقال كما ستظهر للقراء.</p></div></div>
            <div className={styles.threeColumns}>
              <div className={styles.field}><label htmlFor="author-name">اسم الكاتب</label><input id="author-name" className={styles.input} value={form.author_name} onChange={(e) => onChange('author_name', e.target.value)} placeholder="الاسم الكامل" maxLength={255} /></div>
              <div className={styles.field}><label htmlFor="gregorian-date">التاريخ الميلادي</label><input id="gregorian-date" className={styles.input} value={form.gregorian_date} onChange={(e) => onChange('gregorian_date', e.target.value)} placeholder="20 ديسمبر 2025" /></div>
              <div className={styles.field}><label htmlFor="hijri-date">التاريخ الهجري</label><input id="hijri-date" className={styles.input} value={form.hijri_date} onChange={(e) => onChange('hijri_date', e.target.value)} placeholder="29 جمادى الآخرة 1447 هـ" /></div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><BookOpen size={20} /></span><div><h2>محتوى المقال</h2><p>استخدم أدوات التنسيق لإخراج النص بصورة مريحة وواضحة.</p></div></div>
            <div className={styles.editorWrap}><RichTextEditor content={form.content} onChange={(html) => onChange('content', html)} /></div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><Link2 size={20} /></span><div><h2>المراجع</h2><p>اسم المرجع مطلوب، أما الرابط فاختياري. ويمكنك التعديل أو الحذف قبل الحفظ.</p></div><span className={styles.countBadge}>{referencesItems.length}</span></div>
            <div className={styles.referenceComposer}>
              <div className={styles.field}><label htmlFor="reference-title">اسم المرجع</label><input id="reference-title" className={styles.input} value={refTitleInput} onChange={(e) => { setRefTitleInput(e.target.value); setReferenceError(''); }} placeholder="مثال: الموسوعة العربية" /></div>
              <div className={styles.field}><label htmlFor="reference-url">رابط المرجع <span className={styles.optionalLabel}>اختياري</span></label><input id="reference-url" className={styles.input} value={refLinkInput} onChange={(e) => { setRefLinkInput(e.target.value); setReferenceError(''); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOrUpdateReference(); } }} placeholder="https://example.com/source أو اتركه فارغًا" dir="ltr" /></div>
              <button type="button" className={styles.addReferenceButton} onClick={addOrUpdateReference}>{editingReferenceIndex === null ? <Plus size={18} /> : <Save size={18} />}{editingReferenceIndex === null ? 'إضافة المرجع' : 'حفظ التعديل'}</button>
            </div>
            {(referenceError || fieldErrors.references) && <p className={styles.fieldError}>{referenceError || fieldErrors.references}</p>}
            {referencesItems.length ? <div className={styles.referencesList}>{referencesItems.map((item, index) => <div className={styles.referenceItem} key={`${item.title}-${item.url}-${index}`}><span className={styles.referenceNumber}>{index + 1}</span><div><strong>{item.title}</strong>{item.url ? <a href={item.url} target="_blank" rel="noreferrer" dir="ltr">{item.url}</a> : <span className={styles.referenceWithoutLink}>مرجع نصي بدون رابط</span>}</div><div className={styles.referenceActions}><button type="button" onClick={() => { setRefTitleInput(item.title); setRefLinkInput(item.url); setEditingReferenceIndex(index); setReferenceError(''); }}>تعديل</button><button type="button" className={styles.deleteReference} onClick={() => { removeExistingReference(item); setReferencesItems((previous) => previous.filter((_, i) => i !== index)); if (editingReferenceIndex === index) { setEditingReferenceIndex(null); setRefTitleInput(''); setRefLinkInput(''); } setIsDirty(true); }}><Trash2 size={16} /> حذف</button></div></div>)}</div> : <div className={styles.emptyReferences}><Link2 size={22} /><span>لا توجد مراجع مضافة بعد</span></div>}
          </section>
        </main>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><UploadCloud size={20} /></span><div><h2>ملفات المقال</h2><p>ستُرفع عند حفظ المقال.</p></div></div>
            <div className={styles.uploadBlock}>
              <div className={styles.uploadLabel}><ImagePlus size={18} /><div><strong>صورة المقال</strong><small>JPG أو PNG أو GIF أو WebP</small></div></div>
              <label className={styles.dropZone} htmlFor="featured-image">{(featuredPreview || article?.featured_image) ? <Image src={featuredPreview || article?.featured_image || ''} alt="معاينة صورة المقال" fill sizes="(max-width: 1000px) 100vw, 320px" className={styles.uploadPreview} /> : <><UploadCloud size={27} /><strong>اختر صورة المقال</strong><span>اضغط لاستعراض الملفات</span></>}<input id="featured-image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={pickImage} />{(featuredPreview || article?.featured_image) && <span className={styles.changeFile}>تغيير الصورة</span>}</label>
              {featuredImageFile && <div className={styles.fileReady}><CheckCircle2 size={17} /><div><strong>جاهزة للرفع</strong><span>{featuredImageFile.name} · {formatFileSize(featuredImageFile.size)}</span></div><button type="button" onClick={() => { setFeaturedImageFile(null); if (featuredPreview) URL.revokeObjectURL(featuredPreview); setFeaturedPreview(null); }} aria-label="إلغاء الصورة المختارة"><X size={16} /></button></div>}
              {!featuredImageFile && article?.featured_image && <div className={styles.currentFile}><FileCheck2 size={17} /> الصورة الحالية مرفوعة ومحفوظة</div>}{imageError && <p className={styles.fieldError}>{imageError}</p>}
            </div>
            <div className={styles.uploadBlock}>
              <div className={styles.uploadLabel}><FileText size={18} /><div><strong>ملف PDF</strong><small>ملف PDF فقط</small></div></div>
              <label className={styles.pdfPicker} htmlFor="pdf-file"><UploadCloud size={20} /><span>{pdfFile ? 'اختيار ملف آخر' : 'اختيار ملف PDF'}</span><input id="pdf-file" type="file" accept="application/pdf,.pdf" onChange={pickPdf} /></label>
              {pdfFile && <div className={styles.fileReady}><CheckCircle2 size={17} /><div><strong>جاهز للرفع عند الحفظ</strong><span>{pdfFile.name} · {formatFileSize(pdfFile.size)}</span></div><button type="button" onClick={() => setPdfFile(null)} aria-label="إلغاء ملف PDF المختار"><X size={16} /></button></div>}
              {!pdfFile && article?.pdf_file && <a className={styles.currentFile} href={article.pdf_file} target="_blank" rel="noreferrer"><FileCheck2 size={17} /> ملف PDF الحالي مرفوع — عرض الملف</a>}{!pdfFile && !article?.pdf_file && <div className={styles.noFile}><Info size={16} /> لم يتم اختيار ملف PDF</div>}{pdfError && <p className={styles.fieldError}>{pdfError}</p>}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}><span className={styles.cardIcon}><Info size={20} /></span><div><h2>النشر والتصنيف</h2><p>حدد موضع المقال وحالته.</p></div></div>
            <div className={styles.field}><label htmlFor="issue-section">قسم العدد</label><select id="issue-section" className={styles.input} value={form.issue_section_id} onChange={(e) => onChange('issue_section_id', e.target.value)}><option value="">بدون قسم محدد</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}</select><span className={styles.helper}>{selectedSection ? `سيظهر ضمن قسم «${selectedSection.title}».` : 'يمكن إبقاء المقال دون تصنيف داخل العدد.'}</span></div>
            <div className={styles.field}><label htmlFor="article-status">حالة المقال</label><select id="article-status" className={styles.input} value={form.status} onChange={(e) => onChange('status', e.target.value)}><option value="published">منشور</option><option value="draft">مسودة</option><option value="scheduled">مجدول</option><option value="archived">مؤرشف</option></select></div>
          </section>

          {article && <section className={styles.card}><div className={styles.cardHeader}><span className={styles.cardIcon}><Clock3 size={20} /></span><div><h2>معلومات المقال</h2><p>بيانات النظام للمتابعة.</p></div></div><dl className={styles.metadata}><div><dt>المعرّف</dt><dd>#{article.id}</dd></div><div><dt>رقم العدد</dt><dd>#{article.issue_id}</dd></div><div><dt>المشاهدات</dt><dd>{article.views_count ?? 0}</dd></div><div><dt>تاريخ النشر</dt><dd>{formatDateTime(article.published_at)}</dd></div><div><dt>تاريخ الإنشاء</dt><dd>{formatDateTime(article.created_at)}</dd></div><div><dt>آخر تحديث</dt><dd>{formatDateTime(article.updated_at)}</dd></div></dl></section>}
        </aside>
      </div>

      <div className={styles.stickyActions}>
        <div className={styles.saveStatus}>{isSaving ? <><LoaderCircle className={styles.spin} size={20} /><div><strong>{featuredImageFile || pdfFile ? 'جارٍ رفع الملفات وحفظ المقال…' : 'جارٍ حفظ المقال…'}</strong><span>لا تغلق الصفحة حتى اكتمال العملية</span></div></> : <><CheckCircle2 size={20} /><div><strong>{isDirty ? 'لديك تعديلات غير محفوظة' : 'كل التعديلات محفوظة'}</strong><span>لن يتم إرسال الطلب أكثر من مرة</span></div></>}</div>
        <div className={styles.actionButtons}><button type="button" className={styles.secondaryButton} disabled={isSaving} onClick={() => router.push(backHref)}>إلغاء</button><button type="button" className={styles.primaryButton} disabled={isSaving || slugState === 'checking' || slugState === 'unavailable'} onClick={save}>{isSaving ? <LoaderCircle className={styles.spin} size={19} /> : <Save size={19} />}{isSaving ? 'جارٍ الحفظ…' : articleId ? 'حفظ التغييرات' : 'إنشاء المقال'}</button></div>
      </div>
    </div>
  );
}

export default function ManageArticlePage() {
  return <React.Suspense fallback={<div className={styles.centerState}><LoaderCircle className={styles.spin} size={30} /><strong>جارٍ تجهيز الصفحة…</strong></div>}><ManageArticlePageInner /></React.Suspense>;
}
