"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ArticleShareButton.module.css";

type ArticleShareButtonProps = { href: string; title: string };

export default function ArticleShareButton({ href, title }: ArticleShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const absoluteUrl = () => {
    if (typeof window === "undefined") return href;
    return new URL(href, window.location.origin).href;
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const copyLink = async () => {
    const url = absoluteUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setOpen(false);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const openShare = (network: "facebook" | "x") => {
    const url = encodeURIComponent(absoluteUrl());
    const shareUrl = network === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
      : `https://x.com/intent/post?url=${url}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef}>
      <button type="button" className={`${styles.trigger} ${copied ? styles.copied : ""}`} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" aria-label={`مشاركة مقال ${title}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18 16a3 3 0 0 0-2.1.9l-7-4.1a3.3 3.3 0 0 0 0-1.6l7-4.1A3 3 0 1 0 15 5c0 .2 0 .4.1.6l-7 4.1a3 3 0 1 0 0 4.6l7 4.1A3 3 0 1 0 18 16Z" /></svg>
        <span>{copied ? "تم نسخ الرابط" : "مشاركة"}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu" aria-label="خيارات مشاركة المقال">
          <button type="button" className={styles.item} role="menuitem" onClick={copyLink}>
            <span className={`${styles.icon} ${styles.copyIcon}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14h11a2 2 0 0 0 2-2V5Zm-2 14H8V7h9v12Z" /></svg></span>
            نسخ الرابط
          </button>
          <button type="button" className={styles.item} role="menuitem" onClick={() => openShare("facebook")}>
            <span className={`${styles.icon} ${styles.facebookIcon}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34V22C18.34 21.22 22 17.07 22 12.06Z" /></svg></span>
            فيسبوك
          </button>
          <button type="button" className={styles.item} role="menuitem" onClick={() => openShare("x")}>
            <span className={`${styles.icon} ${styles.xIcon}`} aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.1-8.1L3.2 2h6.3l4.3 5.7L18.9 2Zm-1.1 17.9h1.7L8.6 4H6.8l11 15.9Z" /></svg></span>
            X
          </button>
        </div>
      )}
    </div>
  );
}
