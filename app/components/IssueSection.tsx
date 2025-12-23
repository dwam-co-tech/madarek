"use client";
import Link from "next/link";
import { CSSProperties } from "react";
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
  const handleShare = () => {
    const url =
      typeof window !== "undefined"
        ? new URL(downloadHref, window.location.origin).toString()
        : downloadHref;
    const data = { title: "مدارك", text: shareText, url };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <section className="issue-section" style={containerStyle}>
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
          {numberTitle}
          {/* <span className="issue-title-accent">{issue.hijriDay}</span> */}
        </h2>
        <div className="issue-dates">
          <span className="date-badge">{hijriYear}</span>
          <span className="date-badge date-g">{gregorianDate}</span>
        </div>
      </div>
      <div className="issue-metrics" aria-label="عدد المشاهدات">
        <svg className="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Zm0-6.5c-1.4 0-2.5 1.1-2.5 2.5S10.6 13.5 12 13.5s2.5-1.1 2.5-2.5S13.4 8.5 12 8.5Z"/>
        </svg>
        <span className="metric-value">{Intl.NumberFormat("ar-EG").format(views)}</span>
      </div>
      <div className="issue-actions">
        <Link href={viewHref} className="action-btn action-view">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 5c-5.5 0-9.8 4.4-10.9 6 .9 1.3 4.7 6 10.9 6s10-4.7 10.9-6c-1.1-1.6-5.4-6-10.9-6Zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z"/>
          </svg>
          <span>عرض</span>
        </Link>
        <a href={downloadHref} download className="action-btn action-download">
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z"/>
          </svg>
          <span>تحميل</span>
        </a>
        <button type="button" className="action-btn action-share" onClick={handleShare}>
          <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z"/>
          </svg>
          <span>مشاركة</span>
        </button>
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
