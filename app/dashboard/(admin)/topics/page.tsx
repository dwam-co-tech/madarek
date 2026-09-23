'use client';

import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, ListTree, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { CreateTopicPayload, Topic, TopicArticle, TopicCategory } from '../../../lib/topics.model';
import { TOPIC_CATEGORIES, TOPIC_CATEGORY_LABELS } from '../../../lib/topics.model';
import {
  createTopic,
  deleteTopic,
  getAllAdminArticles,
  getTopic,
  getTopics,
  TopicRequestError,
  updateTopic,
} from '../../../lib/topics.service';
import shared from '../issues.module.css';
import styles from './topics.module.css';

type CategoryFilter = TopicCategory | 'all';

const emptyForm: CreateTopicPayload = {
  name: '',
  slug: '',
  category: 'country',
  article_ids: [],
};
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function messageFor(error: unknown): string {
  return error instanceof TopicRequestError
    ? error.message
    : 'تعذر إتمام الطلب حالياً. حاول مرة أخرى.';
}

function articleContext(article: TopicArticle): string {
  const issueTitle = article.issue?.title?.trim();
  const issueNumber = article.issue?.issue_number;
  if (issueTitle && issueNumber != null) return `${issueTitle} — العدد ${issueNumber}`;
  if (issueTitle) return issueTitle;
  if (issueNumber != null) return `العدد ${issueNumber}`;
  return `رقم المقال ${article.id}`;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<TopicArticle[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [articleSearch, setArticleSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [form, setForm] = useState<CreateTopicPayload>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [topicList, articleList] = await Promise.all([getTopics(), getAllAdminArticles()]);
      setTopics(topicList);
      setArticles(articleList);
    } catch (error) {
      setLoadError(messageFor(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filteredTopics = useMemo(
    () => category === 'all' ? topics : topics.filter((topic) => topic.category === category),
    [category, topics],
  );
  const showCreatedAt = topics.some((topic) => Boolean(topic.created_at));
  const selectedArticles = form.article_ids.map((id) => articles.find((article) => article.id === id));
  const availableArticles = useMemo(() => {
    const query = articleSearch.trim().toLocaleLowerCase('ar');
    return articles.filter((article) => {
      if (form.article_ids.includes(article.id)) return false;
      if (!query) return true;
      const haystack = `${article.title} ${articleContext(article)} ${article.id}`.toLocaleLowerCase('ar');
      return haystack.includes(query);
    });
  }, [articleSearch, articles, form.article_ids]);

  const startCreate = () => {
    setForm({ ...emptyForm, article_ids: [] });
    setArticleSearch('');
    setActionError('');
    setFieldErrors({});
    setEditing('new');
  };

  const startEdit = async (id: number) => {
    setBusy(true);
    setActionError('');
    setFieldErrors({});
    try {
      const { topic } = await getTopic(id);
      setForm({ name: topic.name, slug: topic.slug, category: topic.category, article_ids: [...topic.article_ids] });
      setArticleSearch('');
      setEditing(id);
    } catch (error) {
      setActionError(messageFor(error));
    } finally {
      setBusy(false);
    }
  };

  const closeForm = () => {
    if (busy) return;
    setEditing(null);
    setActionError('');
    setFieldErrors({});
  };

  const addArticle = (id: number) => {
    setForm((previous) => previous.article_ids.includes(id)
      ? previous
      : { ...previous, article_ids: [...previous.article_ids, id] });
  };

  const removeArticle = (id: number) => {
    setForm((previous) => ({ ...previous, article_ids: previous.article_ids.filter((item) => item !== id) }));
  };

  const moveArticle = (index: number, direction: -1 | 1) => {
    setForm((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.article_ids.length) return previous;
      const ordered = [...previous.article_ids];
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      return { ...previous, article_ids: ordered };
    });
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { ...form, name: form.name.trim(), slug: form.slug.trim() };
    const errors: Record<string, string[]> = {};
    if (!payload.name || payload.name.length > 255) {
      errors.name = ['يرجى إدخال اسم لا يتجاوز 255 حرفاً.'];
    }
    if (!slugPattern.test(payload.slug) || payload.slug.length > 255) {
      errors.slug = ['استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط في الرابط.'];
    }
    if (!TOPIC_CATEGORIES.includes(payload.category)) {
      errors.category = ['التصنيف غير صالح.'];
    }
    if (new Set(payload.article_ids).size !== payload.article_ids.length
      || payload.article_ids.some((id) => !articles.some((article) => article.id === id))) {
      errors.article_ids = ['تحقق من المقالات المحددة وألا تتكرر.'];
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    setActionError('');
    try {
      if (editing === 'new') await createTopic(payload);
      else if (typeof editing === 'number') await updateTopic(editing, payload);
      setEditing(null);
      await load();
    } catch (error) {
      setActionError(messageFor(error));
      if (error instanceof TopicRequestError) setFieldErrors(error.errors);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setActionError('');
    try {
      await deleteTopic(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (error) {
      setActionError(messageFor(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl">
      <div className={shared.pageHeader}>
        <div>
          <h1 className={shared.pageTitle}>إدارة شجرة المواضيع</h1>
          <p className={styles.subtitle}>تصنيف المقالات عبر جميع الأعداد.</p>
        </div>
        {!loading && !loadError && (
          <button type="button" className={shared.addButton} onClick={startCreate}>
            <Plus size={18} /> إضافة موضوع
          </button>
        )}
      </div>

      {!loading && !loadError && (
        <div className={styles.filters} role="group" aria-label="تصفية حسب التصنيف">
          <button type="button" className={category === 'all' ? styles.activeFilter : styles.filter} onClick={() => setCategory('all')}>الكل</button>
          {TOPIC_CATEGORIES.map((value) => (
            <button key={value} type="button" className={category === value ? styles.activeFilter : styles.filter} onClick={() => setCategory(value)}>
              {TOPIC_CATEGORY_LABELS[value]}
            </button>
          ))}
        </div>
      )}

      {loading && <p role="status">جارٍ تحميل المواضيع والمقالات...</p>}
      {loadError && <div className={styles.error} role="alert">{loadError} <button type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}
      {actionError && editing === null && !deleteTarget && <p className={styles.error} role="alert">{actionError}</p>}

      {!loading && !loadError && (
        topics.length === 0 ? (
          <div className={styles.empty}><ListTree size={34} /><p>لا توجد موضوعات مضافة حتى الآن.</p></div>
        ) : filteredTopics.length === 0 ? (
          <div className={styles.empty}><p>لا توجد موضوعات في هذا التصنيف.</p></div>
        ) : (
          <div className={`${shared.tableWrapper} ${styles.tableWrapper}`}>
            <table className={shared.table}>
              <thead className={shared.thead}><tr>
                <th className={shared.th}>الاسم</th><th className={shared.th}>الرابط Slug</th>
                <th className={shared.th}>التصنيف</th><th className={shared.th}>عدد المقالات</th>
                {showCreatedAt && <th className={shared.th}>تاريخ الإنشاء</th>}
                <th className={shared.th}>تعديل</th><th className={shared.th}>حذف</th>
              </tr></thead>
              <tbody>{filteredTopics.map((topic) => (
                <tr key={topic.id} className={shared.row}>
                  <td className={shared.td}>{topic.name}</td>
                  <td className={shared.td} dir="ltr">{topic.slug}</td>
                  <td className={shared.td}><span className={styles.categoryBadge}>{TOPIC_CATEGORY_LABELS[topic.category]}</span></td>
                  <td className={shared.td}>{topic.article_ids.length}</td>
                  {showCreatedAt && <td className={shared.td}>{topic.created_at ? new Intl.DateTimeFormat('ar-EG').format(new Date(topic.created_at)) : '—'}</td>}
                  <td className={shared.td}><button type="button" className={shared.iconBtn} disabled={busy} title="تعديل" aria-label={`تعديل ${topic.name}`} onClick={() => void startEdit(topic.id)}><Pencil size={18} /></button></td>
                  <td className={shared.td}><button type="button" className={`${shared.iconBtn} ${styles.deleteButton}`} disabled={busy} title="حذف" aria-label={`حذف ${topic.name}`} onClick={() => { setActionError(''); setDeleteTarget(topic); }}><Trash2 size={18} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )
      )}

      {editing !== null && (
        <div className={shared.modalOverlay}>
          <div className={`${shared.modal} ${styles.modal}`} role="dialog" aria-modal="true" aria-labelledby="topic-form-title">
            <h2 id="topic-form-title" className={shared.modalTitle}>{editing === 'new' ? 'إضافة موضوع' : 'تعديل الموضوع'}</h2>
            <form className={styles.form} onSubmit={(event) => void save(event)}>
              <label className={shared.inputGroup}><span className={shared.label}>الاسم</span><input className={shared.input} value={form.name} maxLength={255} required onChange={(event) => setForm({ ...form, name: event.target.value })} />{fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name[0]}</span>}</label>
              <label className={shared.inputGroup}><span className={shared.label}>الرابط</span><input className={shared.input} dir="ltr" value={form.slug} maxLength={255} required placeholder="ibn-arabi" onChange={(event) => setForm({ ...form, slug: event.target.value })} />{fieldErrors.slug && <span className={styles.fieldError}>{fieldErrors.slug[0]}</span>}</label>
              <label className={shared.inputGroup}><span className={shared.label}>التصنيف</span><select className={shared.input} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as TopicCategory })}>{TOPIC_CATEGORIES.map((value) => <option key={value} value={value}>{TOPIC_CATEGORY_LABELS[value]}</option>)}</select>{fieldErrors.category && <span className={styles.fieldError}>{fieldErrors.category[0]}</span>}</label>

              <div className={shared.inputGroup}>
                <span className={shared.label}>المقالات من جميع الأعداد</span>
                <div className={styles.searchBox}><Search size={17} /><input aria-label="البحث في المقالات" value={articleSearch} placeholder="ابحث بعنوان المقال أو العدد..." onChange={(event) => setArticleSearch(event.target.value)} /></div>
                <div className={styles.articlePicker}>
                  {availableArticles.length ? availableArticles.map((article) => (
                    <button key={article.id} type="button" className={styles.articleOption} onClick={() => addArticle(article.id)}>
                      <span>{article.title}</span><small>{articleContext(article)}</small>
                    </button>
                  )) : <p className={styles.pickerEmpty}>لا توجد مقالات مطابقة متاحة.</p>}
                </div>
              </div>

              <div className={shared.inputGroup}>
                <span className={shared.label}>ترتيب المقالات المختارة</span>
                {selectedArticles.length ? <ol className={styles.selected}>{selectedArticles.map((article, index) => {
                  const id = form.article_ids[index];
                  return <li key={id}><div><span>{article?.title ?? `المقال #${id}`}</span><small>{article ? articleContext(article) : `رقم المقال ${id}`}</small></div><div className={shared.actions}>
                    <button type="button" className={shared.iconBtn} disabled={index === 0} aria-label={`تقديم ${article?.title ?? id}`} onClick={() => moveArticle(index, -1)}><ArrowUp size={16} /></button>
                    <button type="button" className={shared.iconBtn} disabled={index === form.article_ids.length - 1} aria-label={`تأخير ${article?.title ?? id}`} onClick={() => moveArticle(index, 1)}><ArrowDown size={16} /></button>
                    <button type="button" className={`${shared.iconBtn} ${styles.deleteButton}`} aria-label={`إزالة ${article?.title ?? id}`} onClick={() => removeArticle(id)}><Trash2 size={16} /></button>
                  </div></li>;
                })}</ol> : <p className={styles.pickerEmpty}>لم تختر أي مقالات بعد.</p>}
                {fieldErrors.article_ids && <span className={styles.fieldError}>{fieldErrors.article_ids[0]}</span>}
                {Object.keys(fieldErrors).filter((field) => field.startsWith('article_ids.')).map((field) => <span key={field} className={styles.fieldError}>{fieldErrors[field][0]}</span>)}
              </div>

              {actionError && <p className={styles.error} role="alert">{actionError}</p>}
              <div className={shared.modalActions}><button type="button" className={shared.cancelBtn} disabled={busy} onClick={closeForm}>إلغاء</button><button type="submit" className={shared.saveBtn} disabled={busy}>{busy ? 'جارٍ الحفظ...' : 'حفظ الموضوع'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={shared.modalOverlay}><div className={shared.modal} role="alertdialog" aria-modal="true" aria-labelledby="topic-delete-title">
          <h2 id="topic-delete-title" className={shared.modalTitle}>حذف الموضوع</h2>
          <p className={shared.confirmText}>هل أنت متأكد من حذف هذا الموضوع من شجرة المواضيع؟</p>
          <p className={styles.deleteName}>{deleteTarget.name}</p>
          {actionError && <p className={styles.error} role="alert">{actionError}</p>}
          <div className={shared.modalActions}><button type="button" className={shared.cancelBtn} disabled={busy} onClick={() => { setDeleteTarget(null); setActionError(''); }}>إلغاء</button><button type="button" className={shared.saveBtn} disabled={busy} onClick={() => void confirmDelete()}>{busy ? 'جارٍ الحذف...' : 'تأكيد الحذف'}</button></div>
        </div></div>
      )}
    </div>
  );
}
