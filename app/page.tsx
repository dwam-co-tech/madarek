"use client";
import type { CSSProperties } from "react";
import logoPng from "@/public/mainlogo.png";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getIssue, getPublishedIssues } from "./lib/cached-issues.service";
import { getIssue as getIssueApi } from "./lib/issues.service";
import type { IssueDetailDTO } from "./lib/issues.model";
import IssueSection from "./components/IssueSection";
import PageLoader from "@/components/PageLoader";

// Force dynamic rendering to prevent static optimization with localhost URLs
export const dynamic = 'force-dynamic';

type MenuItem = {
  label: string;
  href: string;
  className?: string;
};

// Section items - now using dynamic route with issueId
const sectionItems: MenuItem[] = [
  { label: "افتتــاحية الــعدد", href: "/sections/editorial-opening", className: "arc-opening" },
  { label: "قــاموس المصطلحـات", href: "/sections/glossary", className: "arc-glossary" },
  { label: "شخـصيــات صوفـيــة", href: "/sections/profiles", className: "arc-profiles" },
  { label: "إحصــائيات وتحليلات", href: "/sections/stats", className: "arc-stats" },
  { label: "الصوفية حول العالم", href: "/sections/news", className: "arc-news" },
  { label: "شبهــات تحت المجهر", href: "/sections/refutations", className: "arc-refutations" },
  { label: "خـزّانــة الوثــائق", href: "/sections/documents-lectures", className: "arc-archive" },
  { label: "مـحـطــات تـاريخية", href: "/sections/history", className: "arc-history" },
  { label: "عـصــارة الـكـتــب", href: "/sections/library", className: "arc-library" },
  { label: "مــقــالات", href: "/sections/articles", className: "arc-articles" },
];

function ArcMenu({ issueId, startAnimation }: { issueId?: string | number | null; startAnimation?: boolean }) {
  const [mounted, setMounted] = useState(false);

  const palette = [
    "#4b2e2e",
    "#5a3a2f",
    "#6b4f3a",
    "#806141",
    "#9a7b50",
    "#b38b59",
    "#c6a270",
    "#d7b98d",
    "#e6ccab",
    "#eddac2",
  ];

  useEffect(() => {
    // Start animation only when startAnimation is true (after loading is done)
    if (startAnimation) {
      const timer = setTimeout(() => {
        setMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [startAnimation]);

  // Build href with issueId if available
  const buildHref = (baseHref: string) => {
    if (issueId) {
      return `${baseHref}?issueId=${issueId}`;
    }
    return baseHref;
  };

  return (
    <nav className="arc-menu" aria-label="أقسام المجلة" suppressHydrationWarning>
      {sectionItems.map((item, i) => {
        const { label, href: baseHref, className } = item;
        const href = buildHref(baseHref);
        const bg =
          i >= sectionItems.length - 2
            ? "#D7BB91"
            : palette[i % palette.length];
        const styleVars: CSSProperties = {
          color: "#f5f5f5",
          backgroundImage: `linear-gradient(135deg, ${bg}, ${bg}e6)`,
          opacity: mounted ? 1 : 0,
          animation: mounted ? `arc-enter 0.6s ease-out ${i * 0.1}s forwards` : "none",
        };

        return (
          <Link
            key={label}
            href={href}
            className={`arc-item select-none focus-visible:outline-none ${className ?? ""}`}
            style={styleVars}
          >
            <span className="arc-label font-fanan tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function IssuePanel(props?: {
  coverSrc?: string;
  viewHref?: string;
  downloadHref?: string;
  views?: number;
  numberTitle?: string;
  hijriYear?: string;
  gregorianDate?: string;
  shareText?: string;
}) {
  const coverSrc = props?.coverSrc ?? "/cover.jpg";
  const viewHref = props?.viewHref ?? "/magazine2.pdf";
  const downloadHref = props?.downloadHref ?? "/magazine2.pdf";
  const views = props?.views ?? 0;
  const issue = {
    numberTitle: props?.numberTitle ?? "عدد المجلة",
    hijriYear: props?.hijriYear ?? "",
    gregorianDate: props?.gregorianDate ?? "",
  };
  const handleShare = () => {
    const url =
      typeof window !== "undefined"
        ? new URL(downloadHref, window.location.origin).toString()
        : "";
    const data = { title: "مدارك", text: props?.shareText ?? "اطلع على عدد المجلة", url };
    if (navigator.share) {
      navigator.share(data).catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => { });
    }
  };
  return (
    <section className="issue-section">

      <a
        className="book-container"
        href={downloadHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="عرض غلاف العدد"
      >
        <div className="book">
          <img alt="مجلة مدارك" src={coverSrc} />
        </div>
      </a>
      <div className="issue-header">
        <h2 className="issue-title">
          {issue.numberTitle}

          {/* <span className="issue-title-accent">{issue.hijriDay}</span> */}
        </h2>
        <div className="issue-dates">
          <span className="date-badge">{issue.hijriYear}</span>
          <span className="date-badge date-g">{issue.gregorianDate}</span>
        </div>
      </div>
      <div className="issue-metrics" aria-label="عدد المشاهدات">
        <svg className="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Zm0-6.5c-1.4 0-2.5 1.1-2.5 2.5S10.6 13.5 12 13.5s2.5-1.1 2.5-2.5S13.4 8.5 12 8.5Z" />
        </svg>
        <span className="metric-value">
          {Intl.NumberFormat("ar-EG").format(views)}
        </span>
      </div>
      <div className="issue-actions">
        <Link href={viewHref} className="action-btn action-view">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z" />
          </svg>
          <span>عرض</span>
        </Link>
        <a href={downloadHref} download className="action-btn action-download">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z" />
          </svg>
          <span>تحميل</span>
        </a>
        <button type="button" className="action-btn action-share" onClick={handleShare}>
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z" />
          </svg>
          <span>مشاركة</span>
        </button>
      </div>
      <div className="issue-archive">
        <Link href="/archive" className="action-btn action-archive">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M20 6H4L3 8v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-1-2Zm-2 14H6V10h12v10ZM3 4h18v2H3V4Z" />
          </svg>
          <span>أرشيف المجلة</span>
        </Link>
      </div>
    </section>
  );
}
void IssuePanel;

function makeAbs(u: string) {
  try {
    return new URL(u, typeof window !== "undefined" ? window.location.origin : undefined).href;
  } catch {
    return u;
  }
}

function getLatestPublishedIssue(issues: IssueDetailDTO[] | Awaited<ReturnType<typeof getPublishedIssues>>) {
  const arr = Array.isArray(issues) ? issues : [];
  if (arr.length === 0) return null;

  return [...arr]
    .map((it) => {
      const publishedAt =
        (it as Record<string, unknown>)["published_at"] ??
        (it.published_date && it.published_time ? `${it.published_date}T${it.published_time}` : null) ??
        it.published_date ??
        it.updated_at ??
        it.created_at;
      const timestamp = typeof publishedAt === "string" ? Date.parse(publishedAt) : 0;
      const fallbackOrder = it.issue_number ?? it.id ?? 0;

      return {
        issue: it,
        timestamp: Number.isFinite(timestamp) ? timestamp : 0,
        fallbackOrder,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp || b.fallbackOrder - a.fallbackOrder)[0]?.issue ?? null;
}

function HomeInner() {
  const params = useSearchParams();
  const [issue, setIssue] = useState<IssueDetailDTO | null>(null);
  const [bgUrl, setBgUrl] = useState<string>("/cover.jpg");
  const [loading, setLoading] = useState(true);
  type CSSVars = CSSProperties & Record<string, string | number>;
  const issueProps = useMemo(() => {
    const title = issue?.title ?? "عدد المجلة";
    const hijri = issue?.hijri_date ?? "";
    const greg = issue?.gregorian_date ?? "";
    const views = (() => {
      const v = (issue as unknown as Record<string, unknown>)?.["views_count"];
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    })();
    const cover = issue?.cover_image ?? "/cover.jpg";
    const pdf = issue?.pdf_file ?? "";
    return {
      coverSrc: cover,
      viewHref: pdf || "#",
      downloadHref: pdf || "",
      views,
      numberTitle: title,
      hijriYear: hijri,
      gregorianDate: greg,
      shareText: `مجلة مدارك | ${title}`,
    };
  }, [issue]);
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        // Check if there's a specific issue requested via query param (from archive page)
        const issueIdParam = params.get("issueId");

        if (issueIdParam) {
          // Only use query param when explicitly provided (e.g., from archive)
          const d = await getIssue(issueIdParam);
          setIssue(d);
          // Save to localStorage for section pages
          localStorage.setItem("selectedIssueId", issueIdParam);
          const alt = d.cover_image_alt || d.cover_image || "/cover.jpg";
          setBgUrl(makeAbs(alt));
          return;
        }

        // Normal visits should always show the latest published issue.
        // localStorage is only a navigation hint for section pages, not the homepage source of truth.
        const published = await getPublishedIssues();
        const pick = getLatestPublishedIssue(published);

        if (pick) {
          const d = await getIssue(pick.id);
          setIssue(d);
          // Save to localStorage for section pages
          localStorage.setItem("selectedIssueId", String(pick.id));
          const alt = d.cover_image_alt || d.cover_image || "/cover.jpg";
          setBgUrl(makeAbs(alt));
        } else {
          setIssue(null);
          setBgUrl("/cover.jpg");
        }
      } catch (error) {
        console.error("Error loading issue:", error);
        setIssue(null);
        setBgUrl("/cover.jpg");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  // Poll for view updates every 5 seconds
  useEffect(() => {
    if (!issue?.id) return;
    const interval = setInterval(() => {
      getIssueApi(issue.id)
        .then((updated) => {
          if (updated.id === issue.id) {
            setIssue(updated);
          }
        })
        .catch(() => { /* ignore background errors */ });
    }, 5000);
    return () => clearInterval(interval);
  }, [issue?.id]);

  return (
    <>
      {loading && <PageLoader message="جاري تحميل العدد..." />}
      <div className="home-shell">
        <main className="grid grid-cols-[30%_40%_30%] bg-[var(--beige-100)] home-stage" style={{ ["--home-bg-url"]: `url(\"${bgUrl}\")` } as CSSVars}>
          <section className="relative flex items-center justify-center issue-col section-height">
            <IssueSection
              coverSrc={issueProps.coverSrc}
              viewHref={issueProps.viewHref}
              downloadHref={issueProps.downloadHref}
              views={issueProps.views}
              numberTitle={issueProps.numberTitle}
              hijriYear={issueProps.hijriYear}
              gregorianDate={issueProps.gregorianDate}
              shareText={issueProps.shareText}
            />
          </section>
          <section className="relative flex flex-col items-center justify-center logo-col section-height">
            <Image
              src={logoPng}
              alt="شعار مدارك"
              width={620}
              height={620}
              priority
              className="drop-shadow-[0_10px_10px_var(--brown-900)] logo-main"
            />
            <p className="font-fanan text-center text-xl mt-4">
              مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية
            </p>
          </section>
          <section className="flex items-center justify-center px-10 arc-section arc-col section-height">
            <ArcMenu issueId={issue?.id} startAnimation={!loading} />
          </section>
        </main>
        <footer className="site-footer">
        <div className="footer-grid">
          <nav className="footer-links">
            <Link href="/about" className="footer-link">من نحن</Link>
            <span className="footer-separator" style={{ color: "var(--beige-100)" }}>.</span>
            <Link href="/privacy" className="footer-link">سياسة الخصوصية</Link>
            <span className="footer-separator" style={{ color: "var(--beige-100)" }}>.</span>
            <Link href="/terms" className="footer-link">الشروط والأحكام</Link>
          </nav>
          <div className="footer-store-links" aria-label="تحميل تطبيق مدارك">
            <a
              className="store-btn"
              href="https://play.google.com/store/apps/details?id=com.mdarek.application"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="تحميل تطبيق مدارك من Google Play"
            >
              <svg className="store-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M5.2 3.6c-.35.19-.57.56-.57 1.02v14.76c0 .46.22.83.57 1.02l8.03-8.4-8.03-8.4Zm9.04 7.36 2.12-2.22L7.35 3.6l6.89 7.36Zm2.12 4.3-2.12-2.22-6.89 7.36 9.01-5.14Zm1.1-5.9L15.28 12l2.18 2.64 1.4-.8c.84-.48.84-1.2 0-1.68l-1.4-.8Z" />
              </svg>
              <span>Google Play</span>
            </a>
            <a
              className="store-btn"
              href="https://apps.apple.com/eg/app/%D9%85%D8%AC%D9%84%D8%A9-%D9%85%D8%AF%D8%A7%D8%B1%D9%83/id6766868982"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="تحميل تطبيق مدارك من App Store"
            >
              <svg className="store-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M16.9 2.4c.05 1.03-.35 2.03-1.06 2.78-.72.77-1.9 1.34-2.93 1.25-.1-.99.42-2.06 1.07-2.75.74-.79 2.02-1.39 2.92-1.28Zm3.02 15.12c-.51 1.16-.75 1.68-1.41 2.72-.92 1.41-2.21 3.17-3.82 3.19-1.43.02-1.8-.92-3.74-.91-1.94.01-2.35.93-3.78.91-1.61-.02-2.84-1.6-3.76-3.01-2.57-3.95-2.84-8.59-1.25-11.06 1.13-1.75 2.92-2.78 4.6-2.78 1.71 0 2.79.94 4.21.94 1.38 0 2.22-.94 4.21-.94 1.5 0 3.09.82 4.21 2.23-3.7 2.03-3.1 7.31.53 8.71Z" />
              </svg>
              <span>App Store</span>
            </a>
          </div>
          <div className="footer-domain" ><a href="#" target="_blank" rel="noreferrer noopener">www.madarek.com</a></div>
          <div className="footer-legal">
            <a href="https://www.facebook.com/profile.php?id=61584485048024&sk=about" target="_blank" rel="noreferrer noopener" className="fb-btn" aria-label="فيسبوك">
              <svg className="fb-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34v7.03C18.34 21.22 22 17.07 22 12.06Z" /></svg>
            </a>
            <a
              href="https://dwam-tech.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="design-credit footer-legal-text"
              aria-label="تصميم وتطوير شركة دوام تك"
            >
              <span>تصميم وتطوير شركة</span>
              <Image src="/02-transparent.webp" alt="شعار دوام تك" width={28} height={28} className="dwam-logo" />
            </a>
          </div>
        </div>
        </footer>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div />}>
      <HomeInner />
    </Suspense>
  );
}
