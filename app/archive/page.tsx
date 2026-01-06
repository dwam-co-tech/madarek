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

import { getPublishedIssues } from "@/app/lib/issues.service";
import type { IssueDTO } from "@/app/lib/issues.model";

export default function ArchivePage() {
  const issueTitle = "أرشيف المجلة";
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [itemsState, setItemsState] = useState<ArchiveItem[]>([]);

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

  useEffect(() => {
    (async () => {
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
      }
    })();
  }, []);

  const items = useMemo(() => {
    const filtered = itemsState.filter((it) => {
      const q = query.trim();
      if (!q) return true;
      const text = `${it.title} ${it.hijriLabel} ${it.gregLabel}`.toLowerCase();
      return text.includes(q.toLowerCase());
    });
    const sorted = [...filtered].sort((a, b) => (sortDesc ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id)));
    return sorted;
  }, [itemsState, query, sortDesc]);

  return (
    <main className={styles.stage}>
      <Subheader issueTitle={issueTitle} dateLabel="تصفح الأعداد السابقة" />

      <section className={styles.contentArea}>
        <div className={styles.archiveHeader}>
          <h2 className={styles.archiveTitle}>أعداد سنة 1447 هـ</h2>
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
                downloadHref={it.pdf}
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
