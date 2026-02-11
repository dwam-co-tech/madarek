"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./PDFViewer.module.css";

type PDFViewerProps = {
  pdfUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export default function PDFViewer({ pdfUrl, isOpen, onClose, title = "عرض PDF" }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setLoading(true);
      setError(false);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="إغلاق"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>جاري تحميل الملف...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              <p>حدث خطأ في تحميل الملف</p>
              <button onClick={onClose} className={styles.errorBtn}>
                إغلاق
              </button>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className={styles.iframe}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
