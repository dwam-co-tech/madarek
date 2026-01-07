"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";
import { getIssue, getIssueArticles } from "../lib/issues.service";
import type { ArticleDTO } from "../lib/issues.model";

export default function EditorialOpening() {
  const issueTitle = "افتتاحية العدد";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2025);
  const dateLabel = `رجب ${hijriYear} هـ - ديسمبر ${gregYear}م`;
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [imageSrc, setImageSrc] = useState<string>("/cover.jpg");
  const [pdfHref, setPdfHref] = useState<string>("");
  const primaryTitle = articles[0]?.title ?? "افتتاحية العدد";
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
        const wanted = arr.filter((a) => (a.className ?? "").trim() === "arc-opening");
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
                <div className={styles.paperBadge}>افتتاحية العدد</div>
                <h2 className={styles.paperTitle2}>{primaryTitle}</h2>
              </header>
              <div className={styles.paperContent2}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src={imageSrc}
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 640px) 96vw, (max-width: 900px) 94vw, (max-width: 1200px) 32vw, 360px"
                      style={{ objectFit: "cover" }}
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
                          <h3 className={styles.paperSubtitle}>{a.title}</h3>
                          {a.content ? <div dangerouslySetInnerHTML={{ __html: a.content }} /> : null}
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
                  {/* <span>مدارك</span> */}
                  <Image src="/logo3.png" alt="مدارك" width={62} height={62} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>

      {/* <div className={styles.actionsArea} aria-label="إجراءات الصفحة">
        <div className={styles.actionsInner}>
          <div className={styles.actionsRow}>
            <button type="button" className={`${styles.tabItem} ${styles.tabPrint}`} onClick={() => window.print()}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M6 7V3h12v4h3a1 1 0 0 1 1 1v8h-4v4H6v-4H2V8a1 1 0 0 1 1-1h3Zm2-2v2h8V5H8Zm8 12H8v2h8v-2Zm4-2V9H4v6h16Z"/>
              </svg>
              <span className={styles.tabLabel}>طباعة</span>
            </button>
            <button type="button" className={`${styles.tabItem} ${styles.tabShare}`} onClick={handleShare}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z"/>
              </svg>
              <span className={styles.tabLabel}>مشاركة</span>
            </button>
            <a href="/magazine.pdf" download className={`${styles.tabItem} ${styles.tabPdf}`}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z"/>
              </svg>
              <span className={styles.tabLabel}>تحميل PDF</span>
            </a>
            <button type="button" className={`${styles.tabItem} ${styles.tabTranslate}`} onClick={handleTranslate}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 4h2.4c.2 1.4.7 2.6 1.4 3.7l-1.3 1c-.6-.9-1-1.8-1.3-2.7-.3.9-.8 1.8-1.3 2.7l-1.3-1c.7-1.1 1.2-2.3 1.4-3.7ZM6.3 14.5c1.9-.6 3.5-2 4.6-3.9.7 1.1 1.7 2.1 2.8 2.8-1.2 1.6-3 2.8-5 3.3-1.1.3-2.1.3-2.4-.2-.4-.6.1-1.6 0-2ZM16 12.7c-.9-.6-1.7-1.4-2.5-2.3 1.2-1 2.1-2.2 2.6-3.7h1.9c-.5 1.9-1.2 3.6-2.4 5.2l.4.3Z"/>
              </svg>
              <span className={styles.tabLabel}>ترجمة</span>
            </button>
          </div>
          <div className={styles.subpageArchive}>
            <Link href="/archive" className="action-btn action-archive">أرشيف المجلة</Link>
          </div>
        </div>
      </div> */}

      <Subfooter visible={footerVisible} shareText={issueTitle} pdfHref={pdfHref || "/"} />
    </main>
  );
}
