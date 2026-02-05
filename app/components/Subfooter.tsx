"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./subfooter.module.css";

export default function Subfooter({
  visible,
  shareText,
  pdfHref = "/magazine.pdf",
  translateTo = "en",
  showActions = true,
}: {
  visible: boolean;
  shareText?: string;
  pdfHref?: string;
  translateTo?: string;
  showActions?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<number | null>(null);
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 2800);
  };
  const makeAbsolutePdfUrl = () => {
    if (typeof window === "undefined") return pdfHref;
    try {
      return new URL(pdfHref, window.location.origin).href;
    } catch {
      return pdfHref;
    }
  };
  const handlePrint = () => {
    const url = makeAbsolutePdfUrl();
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1200);
    };
  };
  const submitEmail = () => {
    if (!email) {
      setEmailError("يرجى إدخال البريد الإلكتروني");
      showToast("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("بريد إلكتروني غير صالح");
      showToast("بريد إلكتروني غير صالح");
      return;
    }
    setEmailError(null);
    showToast("تم إرسال البريد");
  };
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("يرجى إدخال البريد الإلكتروني");
      showToast("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("بريد إلكتروني غير صالح");
      showToast("بريد إلكتروني غير صالح");
      return;
    }
    setEmailError(null);
  };
  const handleShare = () => {
    const url = makeAbsolutePdfUrl();
    const data = { title: "مدارك", text: shareText ?? "مدارك", url };
    if (navigator.share) {
      navigator.share(data).catch(() => { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => { });
    }
  };
  const handleTranslate = () => {
    if (typeof window === "undefined") return;
    const { hostname, href } = window.location;
    const isLocalHostname = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname.endsWith(".local");
    const isPrivateIpv4 = (() => {
      const m = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
      if (!m) return false;
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      if (a === 10) return true;
      if (a === 192 && b === 168) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      return false;
    })();

    if (isLocalHostname || isPrivateIpv4) {
      const title = (document.title ?? "").trim();
      const bodyText = (document.querySelector("main")?.textContent ?? "").trim();
      const text = `${title}\n\n${bodyText}`.trim().slice(0, 4000);
      const params = new URLSearchParams({ sl: "auto", tl: translateTo, text, op: "translate" });
      window.open(`https://translate.google.com/?${params.toString()}`, "_blank", "noopener,noreferrer");
      return;
    }

    const tUrl = `https://translate.google.com/translate?sl=auto&tl=${translateTo}&u=${encodeURIComponent(href)}`;
    window.open(tUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      {showActions ? (
        <div className={styles.actionsArea} aria-label="إجراءات الصفحة">
          <div className={styles.actionsInner}>
            <div className={styles.actionsRow}>
              <button type="button" className={`${styles.tabItem} ${styles.tabPrint}`} onClick={handlePrint} aria-label="طباعة">
                <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M6 7V3h12v4h3a1 1 0 0 1 1 1v8h-4v4H6v-4H2V8a1 1 0 0 1 1-1h3Zm2-2v2h8V5H8Zm8 12H8v2h8v-2Zm4-2V9H4v6h16Z" />
                </svg>
                <span className={styles.tabLabel}>طباعة</span>
              </button>
              <button type="button" className={`${styles.tabItem} ${styles.tabShare}`} onClick={handleShare} aria-label="مشاركة">
                <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z" />
                </svg>
                <span className={styles.tabLabel}>مشاركة</span>
              </button>
              <a href={pdfHref} download className={`${styles.tabItem} ${styles.tabPdf}`} aria-label="تحميل PDF">
                <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z" />
                </svg>
                <span className={styles.tabLabel}>تحميل PDF</span>
              </a>
              <button type="button" className={`${styles.tabItem} ${styles.tabTranslate}`} onClick={handleTranslate} aria-label="ترجمة">
                <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 4h2.4c.2 1.4.7 2.6 1.4 3.7l-1.3 1c-.6-.9-1-1.8-1.3-2.7-.3.9-.8 1.8-1.3 2.7l-1.3-1c.7-1.1 1.2-2.3 1.4-3.7ZM6.3 14.5c1.9-.6 3.5-2 4.6-3.9.7 1.1 1.7 2.1 2.8 2.8-1.2 1.6-3 2.8-5 3.3-1.1.3-2.1.3-2.4-.2-.4-.6.1-1.6 0-2ZM16 12.7c-.9-.6-1.7-1.4-2.5-2.3 1.2-1 2.1-2.2 2.6-3.7h1.9c-.5 1.9-1.2 3.6-2.4 5.2l.4.3Z" />
                </svg>
                <span className={styles.tabLabel}>ترجمة</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <footer className={`${styles.subfooter} ${visible ? styles.subfooterVisible : ""}`}>
        <div className={styles.subfooterInner}>
          <div className={styles.footerRowTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogoBox}>
                <Image src="/logo.png" alt="مدارك" width={56} height={56} />
              </div>
            </div>
            <nav className={styles.footerLinks}>
              <Link href="/about" className={styles.footerLink}>من نحن</Link>
              <span className={styles.footerSeparator}>.</span>
              <Link href="/privacy" className={styles.footerLink}>سياسة الخصوصية</Link>
              <span className={styles.footerSeparator}>.</span>
              <Link href="/terms" className={styles.footerLink}>الشروط والاحكام</Link>
            </nav>
            <div className={styles.footerActions}>
              <div className={styles.footerSubscribe}>
                <div className={styles.emailField}>
                  <input
                    type="email"
                    placeholder="ادخل الإيميل ليصلك الجديد"
                    className={styles.emailInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    aria-invalid={emailError ? "true" : "false"}
                    aria-describedby="emailError"
                  />
                  <button
                    type="button"
                    className={styles.emailSubmit}
                    onClick={submitEmail}
                    aria-label="إرسال البريد"
                  >
                    <svg viewBox="0 0 24 24" className={styles.arrowIcon} aria-hidden="true">
                      <path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`${styles.toast} ${toastVisible && toastMsg ? styles.toastVisible : ""}`}
            role="alert"
            aria-live="polite"
          >
            {toastMsg}
          </div>
          <div className={styles.footerRowBottom}>
            <div className={styles.footerSideLeft}>حقوق النشر والإقتباس متاحة للجميع</div>
            <div className={styles.footerCenter}><a href="#" target="_blank" rel="noreferrer noopener">www.madarek.com</a></div>
            <div className={styles.footerSideRight}>
              <span>تواصل معنا</span>
              {/* <Image src="/dwam.png" alt="دوام" width={28} height={28} className={styles.dwamLogo} /> */}
              <a href="https://www.facebook.com/profile.php?id=61584485048024" target="_blank" rel="noreferrer noopener" className={styles.fbInline} aria-label="فيسبوك">
                <svg viewBox="0 0 24 24" className={styles.fbIcon} aria-hidden="true"><path fill="currentColor" d="M22 12.06C22 6.49 17.52 2 11.95 2S2 6.49 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34v7.03C18.34 21.22 22 17.07 22 12.06Z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
