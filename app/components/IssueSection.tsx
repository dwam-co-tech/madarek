"use client";
import Link from "next/link";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import shareStyles from "./ShareMenu.module.css";
/**
 * Reusable issue section component extracted from Home page.
 */
export type IssueSectionProps = {
  coverSrc: string;
  viewHref: string;
  downloadHref: string;
  views: number;
  numberTitle: string;
  hijriYear: string;
  gregorianDate: string;
  shareText?: string;
  containerStyle?: CSSProperties;
};

export default function IssueSection({
  coverSrc,
  viewHref,
  downloadHref,
  views,
  numberTitle,
  hijriYear,
  gregorianDate,
  shareText = "اطلع على عدد المجلة",
  containerStyle,
}: IssueSectionProps) {
  const hasPdf = Boolean(downloadHref);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);
  const shareBtnRef = useRef<HTMLButtonElement | null>(null);
  const [sharePos, setSharePos] = useState<{ top: number; left: number } | null>(null);
  const makeAbsolutePdfUrl = () => {
    if (typeof window === "undefined") return downloadHref;
    try {
      return new URL(downloadHref, window.location.origin).href;
    } catch {
      return downloadHref;
    }
  };
  const getFileName = (url: string) => {
    try {
      const u = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
      const last = u.pathname.split("/").filter(Boolean).pop();
      return last || "magazine.pdf";
    } catch {
      const parts = url.split("/");
      const last = parts.filter(Boolean).pop();
      return last || "magazine.pdf";
    }
  };
  const handleShare = () => {
    if (!hasPdf) return;
    const url = makeAbsolutePdfUrl();
    const data = { title: "مدارك", text: shareText, url };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else {
      setShareOpen(true);
    }
  };
  const handleDownloadClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasPdf) return;
    const abs = makeAbsolutePdfUrl();
    const proxy = new URL("/api/proxy-pdf", window.location.origin);
    proxy.searchParams.set("url", abs);
    const a = document.createElement("a");
    a.href = proxy.toString();
    a.download = getFileName(abs);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!shareRef.current) return;
      const t = ev.target as Node;
      if (!shareRef.current.contains(t)) setShareOpen(false);
    };
    if (shareOpen) {
      document.addEventListener("click", onDocClick);
    }
    return () => document.removeEventListener("click", onDocClick);
  }, [shareOpen]);
  useEffect(() => {
    const position = () => {
      const btn = shareBtnRef.current;
      const menu = shareRef.current;
      if (!btn || !menu) return;
      const br = btn.getBoundingClientRect();
      const mw = menu.offsetWidth || 240;
      const mh = menu.offsetHeight || 180;
      const left = Math.min(Math.max(8, br.right - mw), window.innerWidth - mw - 8);
      const top = Math.max(8, br.top - mh - 12);
      setSharePos({ top, left });
    };
    if (shareOpen) {
      position();
      const onScroll = () => position();
      const onResize = () => position();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      const t = window.setTimeout(position, 0);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
        window.clearTimeout(t);
      };
    }
  }, [shareOpen]);

  return (
    <section className={`issue-section ${shareOpen ? "share-open" : ""}`} style={containerStyle}>
      {hasPdf ? (
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
      ) : (
        <div className="book-container" aria-label="عرض غلاف العدد">
          <div className="book">
            <img alt="مجلة مدارك" src={coverSrc} />
          </div>
        </div>
      )}
      <div className="issue-header">
        <h2 className="issue-title">
          {numberTitle}
          {/* <span className="issue-title-accent">{issue.hijriDay}</span> */}
        </h2>
        <div className="issue-dates">
          <span className="date-badge">{hijriYear}</span>
          <span className="date-badge date-g">{gregorianDate}</span>
        </div>
      </div>
      {shareOpen &&
        createPortal(
          <div
            ref={shareRef}
            className={`${shareStyles.menu} ${shareStyles.menuOpen}`}
            role="menu"
            aria-label="خيارات المشاركة"
            style={{ position: "fixed", top: (sharePos?.top ?? 0), left: (sharePos?.left ?? 0) }}
          >
            <div className={shareStyles.menuHeader}>مشاركة</div>
            <div className={shareStyles.menuList}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(makeAbsolutePdfUrl())}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.wa}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M12 2a10 10 0 0 0-9.1 14.5L2 22l5.7-1.9A10 10 0 1 0 12 2Zm5.7 14.2c-.2.6-1.1 1-1.6 1.1-.4.1-.9.1-1.4-.1-1.2-.4-2.6-1-3.9-2.2-1.4-1.2-2.3-2.6-2.8-3.9-.2-.6-.2-1.1-.1-1.5.1-.5.5-1.1 1.1-1.3.3-.1.5-.1.8 0 .2.1.4.3.5.5l.7 1.7c.1.3.1.6 0 .8-.1.2-.2.4-.4.6l-.3.3c.4.7 1.1 1.4 1.9 2 .7.5 1.5.9 2.2 1.2l.2-.3c.2-.2.3-.3.5-.4.3-.2.6-.2.9-.1l1.8.8c.2.1.4.2.5.4.1.2.1.5 0 .8Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>واتساب</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(makeAbsolutePdfUrl())}&text=${encodeURIComponent(shareText ?? "مدارك")}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.tg}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M21.9 4.2c-.3-.3-.8-.3-1.2-.2L3.2 10.7c-.4.1-.9.4-.9.8s.3.7.7.8l4.8 1.5 1.7 5.3c.1.4.4.7.8.7h.1c.3 0 .6-.2.7-.4ل2.5-3.1 4.8 3.6c.2.2.4.2.6.2.2 0 .4-.1.6-.2.2-.2.4-.5.4-.8l2.1-15c.1-.4 0-.8-.3-1.1ZM9.9 16.1l-.8-2.6 7.9-6.1-9.3 5.6-2.5-.8 13.5-5.1-8.8 9z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>تيليجرام</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(makeAbsolutePdfUrl())}&text=${encodeURIComponent(shareText ?? "مدارك")}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.tw}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h16l-7.6 7.6L20 20H4l7.6-7.6L4 4Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>تويتر</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(makeAbsolutePdfUrl())}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.fb}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34v7.03C18.34 21.22 22 17.07 22 12.06Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>فيسبوك</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(shareText ?? "مدارك")}&body=${encodeURIComponent((shareText ?? "مدارك") + "\n" + makeAbsolutePdfUrl())}`}
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.mail}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4 8 5 8-5V6l-8 5-8-5v2Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>بريد إلكتروني</span>
              </a>
              <button
                type="button"
                className={shareStyles.menuItem}
                onClick={() => {
                  navigator.clipboard?.writeText(makeAbsolutePdfUrl()).catch(() => {});
                  setShareOpen(false);
                }}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.copy}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>نسخ الرابط</span>
              </button>
            </div>
          </div>,
          document.body
        )}
      <div className="issue-metrics" aria-label="عدد المشاهدات">
        <svg className="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Zm0-6.5c-1.4 0-2.5 1.1-2.5 2.5S10.6 13.5 12 13.5s2.5-1.1 2.5-2.5S13.4 8.5 12 8.5Z"/>
        </svg>
        <span className="metric-value">{Intl.NumberFormat("ar-EG").format(views)}</span>
      </div>
      <div className="issue-actions" style={{ position: "relative" }}>
        <Link href={viewHref} className="action-btn action-view">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Zm0-6.5c-1.4 0-2.5 1.1-2.5 2.5S10.6 13.5 12 13.5s2.5-1.1 2.5-2.5S13.4 8.5 12 8.5Z"/>
          </svg>
          <span>عرض</span>
        </Link>
        <a
          href={hasPdf ? makeAbsolutePdfUrl() : "#"}
          onClick={handleDownloadClick}
          download={hasPdf ? getFileName(makeAbsolutePdfUrl()) : undefined}
          className="action-btn action-download"
          aria-disabled={hasPdf ? "false" : "true"}
        >
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z"/>
          </svg>
          <span>تحميل</span>
        </a>
        <button
          type="button"
          className="action-btn action-share"
          onClick={handleShare}
          disabled={!hasPdf}
          aria-disabled={!hasPdf}
          ref={shareBtnRef}
        >
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z"/>
          </svg>
          <span>مشاركة</span>
        </button>
        {false && (
          <div ref={shareRef} className={`${shareStyles.menu} ${shareStyles.menuOpen}`} role="menu" aria-label="خيارات المشاركة">
            <div className={shareStyles.menuHeader}>مشاركة</div>
            <div className={shareStyles.menuList}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(makeAbsolutePdfUrl())}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.wa}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M12 2a10 10 0 0 0-9.1 14.5L2 22l5.7-1.9A10 10 0 1 0 12 2Zm5.7 14.2c-.2.6-1.1 1-1.6 1.1-.4.1-.9.1-1.4-.1-1.2-.4-2.6-1-3.9-2.2-1.4-1.2-2.3-2.6-2.8-3.9-.2-.6-.2-1.1-.1-1.5.1-.5.5-1.1 1.1-1.3.3-.1.5-.1.8 0 .2.1.4.3.5.5l.7 1.7c.1.3.1.6 0 .8-.1.2-.2.4-.4.6l-.3.3c.4.7 1.1 1.4 1.9 2 .7.5 1.5.9 2.2 1.2l.2-.3c.2-.2.3-.3.5-.4.3-.2.6-.2.9-.1l1.8.8c.2.1.4.2.5.4.1.2.1.5 0 .8Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>واتساب</span>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(makeAbsolutePdfUrl())}&text=${encodeURIComponent(shareText ?? "مدارك")}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.tg}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M21.9 4.2c-.3-.3-.8-.3-1.2-.2L3.2 10.7c-.4.1-.9.4-.9.8s.3.7.7.8l4.8 1.5 1.7 5.3c.1.4.4.7.8.7h.1c.3 0 .6-.2.7-.4l2.5-3.1 4.8 3.6c.2.2.4.2.6.2.2 0 .4-.1.6-.2.2-.2.4-.5.4-.8l2.1-15c.1-.4 0-.8-.3-1.1ZM9.9 16.1l-.8-2.6 7.9-6.1-9.3 5.6-2.5-.8 13.5-5.1-8.8 9z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>تيليجرام</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(makeAbsolutePdfUrl())}&text=${encodeURIComponent(shareText ?? "مدارك")}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.tw}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h16l-7.6 7.6L20 20H4l7.6-7.6L4 4Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>تويتر</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(makeAbsolutePdfUrl())}`}
                target="_blank"
                rel="noreferrer noopener"
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.fb}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34v7.03C18.34 21.22 22 17.07 22 12.06Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>فيسبوك</span>
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(shareText ?? "مدارك")}&body=${encodeURIComponent((shareText ?? "مدارك") + "\n" + makeAbsolutePdfUrl())}`}
                className={shareStyles.menuItem}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.mail}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 4 8 5 8-5V6l-8 5-8-5v2Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>بريد إلكتروني</span>
              </a>
              <button
                type="button"
                className={shareStyles.menuItem}
                onClick={() => {
                  navigator.clipboard?.writeText(makeAbsolutePdfUrl()).catch(() => {});
                  setShareOpen(false);
                }}
              >
                <span className={`${shareStyles.menuIconWrap} ${shareStyles.copy}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
                  </svg>
                </span>
                <span className={shareStyles.menuLabel}>نسخ الرابط</span>
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="issue-archive">
        <Link href="/archive" className="action-btn action-archive">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M20 6H4L3 8v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-1-2Zm-2 14H6V10h12v10ZM3 4h18v2H3V4Z"/>
          </svg>
          <span>أرشيف المجلة</span>
        </Link>
      </div>
    </section>
  );
}
