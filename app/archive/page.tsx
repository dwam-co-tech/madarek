"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";
import IssueSection from "../components/IssueSection";

type ArchiveItem = {
  id: string;
  title: string;
  hijriLabel: string;
  gregLabel: string;
  cover: string;
  href: string;
  views: number;
};

const initialItems: ArchiveItem[] = [
  { id: "1", title: "العدد الأول", hijriLabel: "رجب ١٤٤٧هـ", gregLabel: "يناير ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 125 },
  // { id: "2", title: "العدد الثاني", hijriLabel: "شعبان ١٤٤٧هـ", gregLabel: "فبراير ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 2345 },
  // { id: "3", title: "العدد الثالث", hijriLabel: "رمضان ١٤٤٧هـ", gregLabel: "مارس ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 3456 },
  // { id: "4", title: "العدد الرابع", hijriLabel: "شوال ١٤٤٧هـ", gregLabel: "أبريل ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 4567 },
  // { id: "5", title: "العدد الخامس", hijriLabel: "ذو القعدة ١٤٤٧هـ", gregLabel: "مايو ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 1789 },
  // { id: "6", title: "العدد السادس", hijriLabel: "ذو الحجة ١٤٤٧هـ", gregLabel: "يونيو ٢٠٢٦م", cover: "/cover.jpg", href: "/editorial-opening", views: 2890 },
];

export default function ArchivePage() {
  const issueTitle = "أرشيف المجلة";
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

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
    document.body.classList.add("subpage-scroll");
    document.documentElement.classList.add("subpage-scroll");
    return () => {
      document.body.classList.remove("subpage-scroll");
      document.documentElement.classList.remove("subpage-scroll");
    };
  }, []);

  const items = useMemo(() => {
    const filtered = initialItems.filter((it) => {
      const q = query.trim();
      if (!q) return true;
      const text = `${it.title} ${it.hijriLabel} ${it.gregLabel}`.toLowerCase();
      return text.includes(q.toLowerCase());
    });
    const sorted = [...filtered].sort((a, b) => (sortDesc ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)));
    return sorted;
  }, [query, sortDesc]);

  return (
    <main className={styles.stage}>
      <Subheader issueTitle={issueTitle} dateLabel="تصفح الأعداد السابقة" />

      <section className={styles.contentArea}>
        <div className={styles.archiveHeader}>
          <h2 className={styles.archiveTitle}>تصفح الأعداد السابقة</h2>
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم العدد أو التاريخ"
                className={styles.searchInput}
                aria-label="ابحث في الأرشيف"
              />
              <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5Zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"/>
              </svg>
            </div>
            <button
              type="button"
              className={styles.sortBtn}
              onClick={() => setSortDesc((s) => !s)}
              aria-label="تبديل الترتيب"
            >
              <svg className={styles.sortIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M7 14h10v2H7v-2Zm0-6h10v2H7V8Z"/>
              </svg>
              <span className={styles.sortLabel}>{sortDesc ? "الأحدث أولاً" : "الأقدم أولاً"}</span>
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {items.map((it) => (
            <article key={it.id} className={styles.card}>
              <IssueSection
                coverSrc={it.cover}
                viewHref={it.href}
                downloadHref="/magazine2.pdf"
                views={it.views}
                numberTitle={it.title}
                hijriYear={it.hijriLabel}
                gregorianDate={it.gregLabel}
                shareText={it.title}
              />
            </article>
          ))}
        </div>

        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>

      <Subfooter visible={footerVisible} shareText="أرشيف المجلة" />
    </main>
  );
}
