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
  pdf: string;
  views: number;
};

import { getPublishedIssues } from "@/app/lib/cached-issues.service";
import type { IssueDTO } from "@/app/lib/issues.model";
import PageLoader from "@/components/PageLoader";

export default function ArchivePage() {
  const issueTitle = "أرشيف المجلة";
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(false);
  const [itemsState, setItemsState] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    document.title = "مجلة مدارك | أرشيف المجلة";
    document.body.classList.add("subpage-scroll");
    document.documentElement.classList.add("subpage-scroll");
    return () => {
      document.body.classList.remove("subpage-scroll");
      document.documentElement.classList.remove("subpage-scroll");
    };
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getPublishedIssues();
        const sanitize = (s: string | undefined | null) => String(s ?? "").replace(/[`]+/g, "").trim();
        const mapped: ArchiveItem[] = (Array.isArray(list) ? list : []).map((it: IssueDTO) => ({
          id: String(it.id),
          title: it.title,
          hijriLabel: it.hijri_date ?? "",
          gregLabel: it.gregorian_date ?? "",
          cover: sanitize(it.cover_image) || "/cover.jpg",
          href: sanitize(it.pdf_file),
          pdf: sanitize(it.pdf_file),
          views: (() => {
            const toNum = (v: unknown) => {
              if (typeof v === "number") return v;
              if (typeof v === "string") {
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
              }
              return 0;
            };
            const vc = (it as Record<string, unknown>)["views_count"];
            const v1 = toNum(vc);
            if (v1 > 0) return v1;
            return toNum(it.views);
          })(),
        }));
        setItemsState(mapped);
      } catch {
        setItemsState([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const itemsByYear = useMemo(() => {
    const filtered = itemsState.filter((it) => {
      const q = query.trim();
      if (!q) return true;
      const text = `${it.title} ${it.hijriLabel} ${it.gregLabel}`.toLowerCase();
      return text.includes(q.toLowerCase());
    });
    const sorted = [...filtered].sort((a, b) => (sortDesc ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)));
    
    // Group by Hijri year
    const grouped = new Map<string, ArchiveItem[]>();
    sorted.forEach((item) => {
      // Extract Hijri year from hijriLabel (e.g., "شعبان 1447 هـ" -> "1447")
      const yearMatch = item.hijriLabel.match(/(\d{4})/);
      const year = yearMatch ? yearMatch[1] : "غير محدد";
      
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(item);
    });
    
    // Convert to array and sort by year
    const result = Array.from(grouped.entries()).sort((a, b) => {
      if (a[0] === "غير محدد") return 1;
      if (b[0] === "غير محدد") return -1;
      return sortDesc ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]);
    });
    
    return result;
  }, [itemsState, query, sortDesc]);

  return (
    <main className={styles.stage}>
      {loading && <PageLoader message="جاري تحميل الأرشيف..." />}
      <Subheader issueTitle={issueTitle} dateLabel="" hideBadges={true} />

      <section className={styles.contentArea}>
        <div className={styles.archiveHeader}>
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

        {itemsByYear.map(([year, items]) => (
          <div key={year} className={styles.yearSection}>
            <h2 className={styles.yearTitle}>أعداد سنة {year} هـ</h2>
            <div className={styles.grid}>
              {items.map((it) => (
                <article key={it.id} className={styles.card}>
                  <IssueSection
                    coverSrc={it.cover}
                    viewHref={`/?issueId=${it.id}`}
                    downloadHref={it.pdf}
                    views={it.views}
                    numberTitle={it.title}
                    hijriYear={it.hijriLabel}
                    gregorianDate={it.gregLabel}
                    shareText={`مجلة مدارك | ${it.title}`}
                  />
                </article>
              ))}
            </div>
          </div>
        ))}

        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>

      <Subfooter visible={footerVisible} shareText="أرشيف المجلة" showActions={false} />
    </main>
  );
}
