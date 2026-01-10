"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";
import { getIssue, getIssueArticles } from "../lib/issues.service";
import type { ArticleDTO } from "../lib/issues.model";

function stripLinks(html: string) {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("a").forEach((a) => a.replaceWith(a.textContent || ""));
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

export default function NewsPage() {
  const issueTitle = "الصوفية حول العالم";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2025);
  const dateLabel = `رجب ${hijriYear} هـ - ديسمبر ${gregYear}م`;
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [imageSrc, setImageSrc] = useState<string>("/cover.jpg");
  const [pdfHref, setPdfHref] = useState<string>("");
  const primaryTitle = articles[0]?.open_title ?? articles[0]?.title ?? "الصوفية حول العالم";
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: "مدارك", text: issueTitle, url };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };
  const handleTranslate = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const target = "en";
    const tUrl = `https://translate.google.com/translate?sl=auto&tl=${target}&u=${encodeURIComponent(url)}`;
    window.open(tUrl, "_blank", "noopener,noreferrer");
  };
  useEffect(() => {
    const el = footerSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        setFooterVisible(visible);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("selectedIssueId") : null;
    if (!id) return;
    (async () => {
      try {
        const [list, detail] = await Promise.all([getIssueArticles(id), getIssue(id)]);
        const arr = Array.isArray(list) ? list : [];
        const wanted = arr.filter((a) => (a.className ?? "").trim() === "arc-news");
        setArticles(wanted);
        setPdfHref(detail.pdf_file ?? "");
        const first = wanted[0] ?? arr[0];
        const img = first?.featured_image || detail.cover_image || "/cover.jpg";
        setImageSrc(img || "/cover.jpg");
      } catch {
        setArticles([]);
        setPdfHref("");
        setImageSrc("/cover.jpg");
      }
    })();
  }, []);
  useEffect(() => {
    document.body.classList.add("subpage-scroll");
    document.documentElement.classList.add("subpage-scroll");
    return () => {
      document.body.classList.remove("subpage-scroll");
      document.documentElement.classList.remove("subpage-scroll");
    };
  }, []);
  return (
    <main className={styles.stage}>
      <Subheader issueTitle={issueTitle} dateLabel={dateLabel} />

      <section className={styles.contentArea}>
        <div className={styles.paperSection} aria-label="عرض المقال داخل صفحة ورقية">
          <div className={styles.paper}>
            <div className={styles.paperInner}>
              <header className={styles.paperHeader}>
                <div className={styles.paperBadge}>اسم الكاتب : {(articles[0]?.author_name ?? '').trim() || 'الصوفية حول العالم'}</div>
                <h2 className={styles.paperTitle}>{articles[0]?.open_title ?? articles[0]?.title ?? primaryTitle}</h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src={imageSrc}
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  {articles.length === 0 ? (
                    <p>لا توجد مقالات لهذا القسم في العدد المختار.</p>
                  ) : (
                    (() => {
                      const a = articles[0];
                      return (
                        <article key={a.id}>
                          {a.content ? <div dangerouslySetInnerHTML={{ __html: a.content }} /> : null}
                          {(Array.isArray(a.references) && a.references.length) || a.references_tmp ? (
                            <div className={styles.paperSources}>
                              <h3 className={styles.paperSubtitle}>المراجع</h3>
                              {Array.isArray(a.references) && a.references.length ? (
                                <ol>
                                  {a.references.map((lnk, idx) => (
                                    <li key={`${lnk}-${idx}`}>
                                      {/^https?:\/\//i.test((lnk ?? "").trim()) ? (
                                        <a href={lnk} target="_blank" rel="noopener noreferrer">{lnk}</a>
                                      ) : (
                                        <span>{lnk}</span>
                                      )}
                                    </li>
                                  ))}
                                </ol>
                              ) : (
                                <div dangerouslySetInnerHTML={{ __html: stripLinks(a.references_tmp ?? "") }} />
                              )}
                            </div>
                          ) : null}
                        </article>
                      );
                    })()
                  )}
                </div>
              </div>
              <div className={styles.paperFooter}>
                <div className={styles.footLeft}>
                  <div className={styles.pageTile}>1</div>
                  <div className={styles.pageMeta}>العدد الأول • {dateLabel}</div>
                </div>
                <div className={styles.footCenter}>مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية</div>
                <div className={styles.footRight}>
                  <Image src="/logo3.png" alt="مدارك" width={62} height={62} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>
      <Subfooter visible={footerVisible} pdfHref={pdfHref || "/"} />
    </main>
  );
}
