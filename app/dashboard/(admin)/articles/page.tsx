'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../articles.module.css';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getIssue } from '@/app/lib/issues.service';
import type { ArticleDTO } from '@/app/lib/issues.model';
import RichTextEditor from '@/components/RichTextEditor/RichTextEditor';
import { getArticleById, updateArticle } from '@/app/lib/articles.service';

type Article = {
  id: string;
  title: string;
  className?: string;
  issueId: string;
  issueTitle?: string;
  views: number;
  content?: string | null;
};

export default function ArticlesAdminPage() {
  const router = useRouter();
  const params = useSearchParams();
  const issueIdParam = params.get('id');
  const [isLoading, setIsLoading] = React.useState(false);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [issueTitle, setIssueTitle] = React.useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [editorArticle, setEditorArticle] = React.useState<Article | null>(null);
  const [editorContent, setEditorContent] = React.useState('');

  const noIssueId = !issueIdParam;
  React.useEffect(() => {
    if (noIssueId) {
      router.replace('/dashboard/issues?from=articles');
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
        const mapped: Article[] = det.articles.map((a: ArticleDTO) => ({
          id: String(a.id),
          title: a.title,
          className: a.className ?? undefined,
          issueId: String(det.id),
          issueTitle: det.title,
          views: (a.views_count ?? 0) as number,
          content: a.content ?? null,
        }));
        if (!alive) return;
        setIssueTitle(det.title);
        setArticles(mapped);
      } catch {
        if (!alive) return;
        setArticles([]);
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
          <Link href="/dashboard/issues" className={styles.backBtn}>
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
                  <button
                    className={styles.actionBtn}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const resp = await getArticleById(a.id);
                        const art = resp.article;
                        const next: Article = {
                          id: String(art.id),
                          title: art.title,
                          className: a.className,
                          issueId: String(art.issue_id),
                          issueTitle: a.issueTitle,
                          views: (art.views_count ?? a.views) as number,
                          content: art.content ?? a.content ?? '',
                        };
                        setEditorArticle(next);
                        setEditorContent(String(next.content ?? ''));
                        setIsEditorOpen(true);
                      } catch {
                        setEditorArticle(a);
                        setEditorContent(String(a.content ?? ''));
                        setIsEditorOpen(true);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    إدارة المحتوى
                  </button>
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
            <div className={styles.cardActions}>
              <button
                className={styles.cardActionBtn}
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const resp = await getArticleById(a.id);
                    const art = resp.article;
                    const next: Article = {
                      id: String(art.id),
                      title: art.title,
                      className: a.className,
                      issueId: String(art.issue_id),
                      issueTitle: a.issueTitle,
                      views: (art.views_count ?? a.views) as number,
                      content: art.content ?? a.content ?? '',
                    };
                    setEditorArticle(next);
                    setEditorContent(String(next.content ?? ''));
                    setIsEditorOpen(true);
                  } catch {
                    setEditorArticle(a);
                    setEditorContent(String(a.content ?? ''));
                    setIsEditorOpen(true);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                إدارة المحتوى
              </button>
            </div>
          </div>
        ))}
      </div>

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
