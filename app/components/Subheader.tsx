"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getIssue } from "../lib/issues.service";
import styles from "./subheader.module.css";

export default function Subheader({ issueTitle, dateLabel, hideBadges = false }: { issueTitle: string; dateLabel: string; hideBadges?: boolean }) {
  const [issueBadge, setIssueBadge] = useState<string>("العدد الأول");
  const [dateBadge, setDateBadge] = useState<string>(dateLabel);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("selectedIssueId") : null;
    if (!id) return;
    (async () => {
      try {
        const detail = await getIssue(id);
        const name = (detail.title || issueTitle).trim();
        setIssueBadge(name);

        // Build date label from both hijri and gregorian dates
        const hijri = detail.hijri_date?.trim() ?? "";
        const greg = detail.gregorian_date?.trim() ?? "";

        if (hijri && greg) {
          setDateBadge(`${hijri} - ${greg}`);
        } else if (hijri) {
          setDateBadge(hijri);
        } else if (greg) {
          setDateBadge(greg);
        } else {
          setDateBadge(dateLabel);
        }
      } catch {
        setIssueBadge("العدد الأول");
        setDateBadge(dateLabel);
      }
    })();
  }, [dateLabel, issueTitle]);
  return (
    <header className={styles.subheader}>
      <div className={styles.subheaderInner}>
        <Link href="/" className={styles.headerLogo}>
          <Image src="/logo3.png" alt="مدارك" width={84} height={84} priority />
        </Link>
        <div className={styles.headerMeta}>
          <h1 className={styles.headerTitle}>{issueTitle}</h1>
          {!hideBadges && (
            <div className={styles.headerRow}>
              <span className={styles.badge}>{issueBadge}</span>
              <span className={styles.badge}>{dateBadge}</span>
            </div>
          )}
        </div>
        <div className={styles.headerSpacer}>
          <Link href="/" className={styles.homeBtn} aria-label="العودة للرئيسية">
            <svg className={styles.homeIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M12 3 3 11h3v10h5v-6h2v6h5V11h3L12 3Z" />
            </svg>
            <span className={styles.homeLabel}>الرئيسية</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
