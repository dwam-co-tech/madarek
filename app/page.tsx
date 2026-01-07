"use client";
import type { CSSProperties } from "react";
import logoPng from "@/public/logo3.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getIssue, getPublishedIssues } from "./lib/issues.service";
import type { IssueDetailDTO } from "./lib/issues.model";

type MenuItem = {
  label: string;
  href: string;
  className?: string;
  angleDeg?: number;
  radius?: number;
  offsetX?: number;
  offsetY?: number;
};

const items: MenuItem[] = [
  { label: "افتتــاحية الــعدد", href: "/editorial-opening", className: "arc-opening" },
  { label: "قــاموس المصطلحـات", href: "/glossary", className: "arc-glossary" },
  { label: "شخـصيــات صوفـيــة", href: "/profiles", className: "arc-profiles" },
  { label: "إحصــائيات وتحليلات", href: "/stats", className: "arc-stats" },
  { label: "الصوفية حول العالم", href: "/news", className: "arc-news" },
  { label: "شبهــات تحت المجهر", href: "/refutations", className: "arc-refutations" },
  { label: "خـزّانــة الوثــائق", href: "/documents-lectures", className: "arc-archive" },
  { label: "مـحـطــات تـاريخية", href: "/history", className: "arc-history" },
  { label: "عـصــارة الـكـتــب", href: "/library", className: "arc-library" },
];

function ArcMenu() {
  const radius = 300; // px
  const startDeg = 250;
  const endDeg = 110;

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
  ];

  return (
    <div className="relative h-screen w-full" suppressHydrationWarning>
      {items.map((item, i) => {
        const { label, href, className, angleDeg, radius: itemRadius, offsetX = 0, offsetY = 0 } = item;
        const t = items.length === 1 ? 0 : i / (items.length - 1);
        const computedAngleDeg = angleDeg ?? startDeg + (endDeg - startDeg) * t;
        const angle = computedAngleDeg * (Math.PI / 180);
        const r = itemRadius ?? radius;
        const x = Math.cos(angle) * r + offsetX;
        const y = Math.sin(angle) * r + offsetY;
        const bg = i === items.length - 1 ? "#D7BB91" : palette[i % palette.length];
        const left = `var(--left, calc(50% + ${x}px + var(--offset-x, 0px)))`;
        const top = `var(--top, calc(50% + ${y}px + var(--offset-y, 0px)))`;
        const styleVars: CSSProperties = {
          left,
          top,
          transform: "translate(50%, -50%)",
          color: "#f5f5f5",
          backgroundImage: `linear-gradient(135deg, ${bg}, ${bg}e6)`,
        };

        return (
          <Link
            key={label}
            href={href}
            className={`absolute select-none rounded-full px-5 py-3 text-[15px] shadow-md transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-[1.03] focus-visible:outline-none arc-item ${className ?? ""}`}
            style={styleVars}
          >
            <span className="arc-label font-fanan tracking-wide">{label}</span>
          </Link>
        );
      })}
    </div>
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

function makeAbs(u: string) {
  try {
    return new URL(u, typeof window !== "undefined" ? window.location.origin : undefined).href;
  } catch {
    return u;
  }
}

export default function Home() {
  const params = useSearchParams();
  const [issue, setIssue] = useState<IssueDetailDTO | null>(null);
  const [bgUrl, setBgUrl] = useState<string>("/cover.jpg");
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
      shareText: title,
    };
  }, [issue]);
  useEffect(() => {
    const run = async () => {
      const issueIdParam = params.get("issueId");
      const storedId = typeof window !== "undefined" ? localStorage.getItem("selectedIssueId") : null;
      const idToUse = issueIdParam || storedId;
      if (idToUse) {
        const d = await getIssue(idToUse);
        setIssue(d);
        const alt = d.cover_image_alt || d.cover_image || "/cover.jpg";
        setBgUrl(makeAbs(alt));
        try {
          if (typeof window !== "undefined") localStorage.setItem("selectedIssueId", String(d.id));
        } catch {}
        return;
      }
      const published = await getPublishedIssues();
      const pick = (() => {
        const arr = Array.isArray(published) ? published : [];
        if (arr.length === 0) return null;
        const withDate = arr
          .map((it) => ({
            it,
            ts:
              Date.parse((it as Record<string, unknown>)["published_at"] as string) ||
              Date.parse((it as Record<string, unknown>)["updated_at"] as string) ||
              0,
          }))
          .sort((a, b) => b.ts - a.ts)[0]?.it;
        return withDate ?? arr.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
      })();
      if (pick) {
        const d = await getIssue(pick.id);
        setIssue(d);
        const alt = d.cover_image_alt || d.cover_image || "/cover.jpg";
        setBgUrl(makeAbs(alt));
        try {
          if (typeof window !== "undefined") localStorage.setItem("selectedIssueId", String(d.id));
        } catch {}
      } else {
        setIssue(null);
        setBgUrl("/cover.jpg");
        try {
          if (typeof window !== "undefined") localStorage.removeItem("selectedIssueId");
        } catch {}
      }
    };
    run();
  }, [params]);
  return (
    <>
      <main className="grid grid-cols-[30%_40%_30%] bg-[var(--beige-100)] home-stage" style={{ ["--home-bg-url"]: `url(\"${bgUrl}\")` } as CSSVars}>
        <section className="relative flex items-center justify-center issue-col section-height">
          <IssuePanel
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
          <ArcMenu />
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
          <div className="footer-domain" ><a href="#" target="_blank" rel="noreferrer noopener">www.madarek.com</a></div>
          <div className="footer-legal">
            <a href="https://www.facebook.com/profile.php?id=61584485048024&sk=about" target="_blank" rel="noreferrer noopener" className="fb-btn" aria-label="فيسبوك">
              <svg className="fb-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34v7.03C18.34 21.22 22 17.07 22 12.06Z" /></svg>
            </a>
            <span className="footer-legal-text">حقوق النشر والاقتباس متاحة للجميع</span>
            {/* <div className="design-credit">
            <span>تصميم وتطوير</span>
            <Image src="/dwam.png" alt="دوام" width={28} height={28} className="dwam-logo" />
          </div> */}
          </div>
        </div>
      </footer>
    </>
  );
}
