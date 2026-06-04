'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import styles from '../articles.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getIssue, getIssueSections, getSectionArticles } from '@/app/lib/issues.service';
import type { ArticleDTO, IssueSection } from '@/app/lib/issues.model';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { getArticleById, updateArticle, deleteArticle } from '@/app/lib/articles.service';

type Article = {
  id: string;
  title: string;
  className?: string;
  issueId: string;
  issueTitle?: string;
  views: number;
  content?: string | null;
  issue_section_id?: number | null;
};

function ArticlesAdminPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const issueIdParam = params.get('id');
  const [isLoading, setIsLoading] = React.useState(false);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [sections, setSections] = React.useState<(Omit<IssueSection, 'articles'> & { articles: Article[] })[]>([]);
  const [hasSections, setHasSections] = React.useState(false);
  const [issueTitle, setIssueTitle] = React.useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editorArticle, setEditorArticle] = React.useState<Article | null>(null);
  const [editorContent, setEditorContent] = React.useState('');

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    setIsLoading(true);
    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          articles: sec.articles.filter((a) => a.id !== id),
        }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل حذف المقال');
    } finally {
      setIsLoading(false);
    }
  };

  const noIssueId = !issueIdParam;
  React.useEffect(() => {
    if (noIssueId) {
      router.replace('/md-dash/issues?from=articles');
    }
  }, [noIssueId, router]);

  React.useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!issueIdParam) return;
      setIsLoading(true);
      try {
        const issueIdNum = Number(issueIdParam);
        const det = await getIssue(issueIdNum);
        
        let sectionsList: IssueSection[] = [];
        try {
          sectionsList = det.sections && Array.isArray(det.sections) ? det.sections : await getIssueSections(issueIdNum);
        } catch (e) {
          console.error("Failed to load sections", e);
        }

        const mapped: Article[] = det.articles.map((a: ArticleDTO) => ({
          id: String(a.id),
          title: a.title,
          className: a.className ?? undefined,
          issueId: String(det.id),
          issueTitle: det.title,
          views: (a.views_count ?? 0) as number,
          content: a.content ?? null,
          issue_section_id: a.issue_section_id ?? null,
        }));

        if (!alive) return;
        setIssueTitle(det.title);
        setArticles(mapped);

        if (sectionsList && sectionsList.length > 0) {
          sectionsList.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          
          const articlesSec = sectionsList.find(s => s.title === 'مقالات' || s.key === 'articles' || s.slug === 'articles');
          
          const grouped: (Omit<IssueSection, 'articles'> & { articles: Article[] })[] = await Promise.all(
            sectionsList.map(async (sec) => {
              let secArticles: Article[] = [];
              try {
                const fetched = await getSectionArticles(issueIdNum, sec.id);
                secArticles = fetched.map((a: ArticleDTO) => ({
                  id: String(a.id),
                  title: a.title,
                  className: a.className ?? undefined,
                  issueId: String(issueIdNum),
                  issueTitle: det.title,
                  views: (a.views_count ?? 0) as number,
                  content: a.content ?? null,
                  issue_section_id: a.issue_section_id ?? null,
                }));
              } catch (err) {
                console.error(`Failed to fetch articles for section ${sec.id}, falling back`, err);
                secArticles = mapped.filter(art => art.issue_section_id === sec.id);
              }

              if (sec.id === articlesSec?.id) {
                const unclassified = mapped.filter(art => !art.issue_section_id);
                const unclassifiedFiltered = unclassified.filter(u => !secArticles.some(a => a.id === u.id));
                secArticles = [...secArticles, ...unclassifiedFiltered];
              }

              const { articles: _, ...secWithoutArticles } = sec;
              return {
                ...secWithoutArticles,
                articles: secArticles
              };
            })
          );
          
          if (!articlesSec) {
            const unclassified = mapped.filter(art => !art.issue_section_id);
            if (unclassified.length > 0) {
              grouped.push({
                id: -1,
                issue_id: Number(issueIdNum),
                title: "مقالات غير مصنفة",
                slug: "unclassified",
                key: "unclassified",
                sort_order: 999,
                is_active: true,
                articles: unclassified
              });
            }
          }
          
          grouped.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          setSections(grouped);
          setHasSections(true);
        } else {
          setHasSections(false);
        }
      } catch (err) {
        console.error(err);
        if (!alive) return;
        setArticles([]);
        setSections([]);
        setHasSections(false);
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [issueIdParam]);

  if (noIssueId) return null;
  return (
    <div>
      <LoadingOverlay open={isLoading} label="جاري التحميل..." ariaLabel="جاري التحميل" />
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>إدارة المقالات</h1>
        <div className={styles.headerActions}>
          <Link href="/md-dash/issues" className={styles.backBtn}>
            العودة للأعداد
          </Link>
        </div>
      </div>

      <div className={styles.issueMeta}>
        <div className={styles.issueName}>
          {issueTitle ? `العدد: ${issueTitle}` : 'جميع المقالات المنشورة'}
        </div>
        <div className={styles.hint}>إجمالي: {articles.length}</div>
      </div>

      {hasSections ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sections.map((sec) => (
            <div className={styles.sectionCard} key={sec.id}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionMeta}>
                  <h2 className={styles.sectionTitle}>{sec.title}</h2>
                  <span className={styles.sectionCount}>عدد المقالات: {sec.articles.length}</span>
                </div>
                {sec.id !== -1 && (
                  <Link
                    href={`/md-dash/articles/manage?issue_id=${encodeURIComponent(issueIdParam || '')}&issue_section_id=${encodeURIComponent(String(sec.id))}`}
                    className={styles.addArticleBtn}
                  >
                    <Plus size={16} />
                    <span>إضافة مقال</span>
                  </Link>
                )}
              </div>

              {sec.articles.length > 0 ? (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th className={`${styles.th} ${styles.titleCol}`.trim()}>العنوان</th>
                          <th className={styles.th}>المشاهدات</th>
                          <th className={`${styles.th} ${styles.actionsCol}`.trim()}>تعديل المقال</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sec.articles.map((a) => (
                          <tr key={a.id} className={styles.row}>
                            <td className={`${styles.td} ${styles.titleCol}`.trim()}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <span>{a.title}</span>
                              </div>
                            </td>
                            <td className={styles.td}>{a.views}</td>
                            <td className={`${styles.td} ${styles.actionsCol}`.trim()}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <Link
                                  href={`/md-dash/articles/manage?id=${encodeURIComponent(a.id)}&issue_id=${encodeURIComponent(a.issueId)}`}
                                  className={styles.actionBtn}
                                >
                                  تعديل المقال
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(a.id)}
                                  className={styles.deleteBtn}
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.cards}>
                    {sec.articles.map((a) => (
                      <div key={a.id} className={styles.card}>
                        <div className={styles.cardTitle}>{a.title}</div>
                        <div className={styles.cardMeta}>
                          <span>المشاهدات: {a.views}</span>
                        </div>
                        <div className={styles.cardActions} style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            href={`/md-dash/articles/manage?id=${encodeURIComponent(a.id)}&issue_id=${encodeURIComponent(a.issueId)}`}
                            className={styles.cardActionBtn}
                          >
                            تعديل المقال
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(a.id)}
                            className={styles.deleteBtn}
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.emptySectionState}>
                  لا توجد مقالات داخل هذا القسم
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={`${styles.th} ${styles.titleCol}`.trim()}>العنوان</th>
                  <th className={styles.th}>المشاهدات</th>
                  <th className={`${styles.th} ${styles.actionsCol}`.trim()}>إدارة المحتوى</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className={styles.row}>
                    <td className={`${styles.td} ${styles.titleCol}`.trim()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span>{a.title}</span>
                      </div>
                    </td>
                    <td className={styles.td}>{a.views}</td>
                    <td className={`${styles.td} ${styles.actionsCol}`.trim()}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link
                          href={`/md-dash/articles/manage?id=${encodeURIComponent(a.id)}&issue_id=${encodeURIComponent(a.issueId)}`}
                          className={styles.actionBtn}
                        >
                          إدارة المحتوى
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className={styles.deleteBtn}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cards}>
            {articles.map((a) => (
              <div key={a.id} className={styles.card}>
                <div className={styles.cardTitle}>{a.title}</div>
                <div className={styles.cardMeta}>
                  <span>المشاهدات: {a.views}</span>
                </div>
                <div className={styles.cardActions} style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/md-dash/articles/manage?id=${encodeURIComponent(a.id)}&issue_id=${encodeURIComponent(a.issueId)}`}
                    className={styles.cardActionBtn}
                  >
                    إدارة المحتوى
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className={styles.deleteBtn}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isEditorOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalTitle}>إدارة المحتوى: {editorArticle?.title ?? ''}</div>
            <div className={styles.editorContainer}>
              <RichTextEditor content={editorContent} onChange={(html) => setEditorContent(html)} />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.saveBtn}
                onClick={async () => {
                  if (!editorArticle) return;
                  setIsLoading(true);
                  try {
                    const resp = await updateArticle(editorArticle.id, { content: editorContent });
                    const updated = resp.article;
                    setArticles((prev) =>
                      prev.map((x) =>
                        x.id === String(updated.id)
                          ? {
                              ...x,
                              title: updated.title ?? x.title,
                              views: (updated.views_count ?? x.views) as number,
                              content: updated.content ?? editorContent,
                              issueId: String(updated.issue_id ?? x.issueId),
                            }
                          : x
                      )
                    );
                  } catch {
                  } finally {
                    setIsLoading(false);
                    setIsEditorOpen(false);
                    setEditorArticle(null);
                  }
                }}
              >
                حفظ
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditorArticle(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArticlesAdminPage() {
  return (
    <React.Suspense
      fallback={
        <div>
          <LoadingOverlay open={true} label="جاري التحميل..." ariaLabel="جاري التحميل" />
        </div>
      }
    >
      <ArticlesAdminPageInner />
    </React.Suspense>
  );
}
