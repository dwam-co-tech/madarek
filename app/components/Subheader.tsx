"use client";
import Link from "next/link";
import Image from "next/image";
import styles from "./subheader.module.css";

export default function Subheader({ issueTitle, dateLabel }: { issueTitle: string; dateLabel: string }) {
  return (
    <header className={styles.subheader}>
      <div className={styles.subheaderInner}>
        <div className={styles.headerLogo}>
          <Image src="/logo3.png" alt="مدارك" width={84} height={84} priority />
        </div>
        <div className={styles.headerMeta}>
          <h1 className={styles.headerTitle}>{issueTitle}</h1>
          <div className={styles.headerRow}>
            <span className={styles.badge}>العدد الأول</span>
            <span className={styles.badge}>{dateLabel}</span>
          </div>
        </div>
        <div className={styles.headerSpacer}>
          <Link href="/" className={styles.homeBtn} aria-label="العودة للرئيسية">
            <svg className={styles.homeIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 3 3 11h3v10h5v-6h2v6h5V11h3L12 3Z"/>
            </svg>
            <span className={styles.homeLabel}>الرئيسية</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
