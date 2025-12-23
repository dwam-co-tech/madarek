"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function AboutPage() {
  const title = "من نحن";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2025);
  const dateLabel = `رجب ${hijriYear} هـ - ديسمبر ${gregYear}م`;
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
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
  return (
    <main className={styles.stage}>
      <Subheader issueTitle={title} dateLabel={dateLabel} />
      <section className={styles.contentArea}>
        <div className={styles.paper}>
          {/* <div className={styles.hero}>
            <h1 className={styles.pageTitle}>{title}</h1>
          </div> */}
          <div className={styles.body}>
            <div className={styles.imageWrap}>
              <div className={styles.photoFrame}>
                <Image
                  src="/logo3.png"
                  alt="مدارك"
                  fill
                  sizes="(max-width: 900px) 94vw, (max-width: 1200px) 28vw, 360px"
                  style={{ objectFit: "contain", background: "#fff" }}
                  priority
                />
              </div>
            </div>
            <div className={styles.textContent}>
              <p>
                مدارك مجلة معرفية تُعنى بتقديم محتوى رصين يلامس القارئ العربي، ويجمع بين عمق الطرح وجمال العرض.
              </p>
              <p>
                نعمل على معالجة القضايا الفكرية والثقافية والاجتماعية بروح علمية، ونسعى إلى بناء وعي أصيل يوازن بين الثوابت الشرعية ومتطلبات العصر.
              </p>
              <p>
                رؤيتنا أن تكون المدارك مرجعًا موثوقًا ومُلهمًا، يصنع الفارق في ساحة المعرفة، ويقدم نموذجًا احترافيًا في التحرير والتصميم.
              </p>
              <p>
                فريقنا يجمع نخبة من الباحثين والمحررين والمصممين، وغايتنا خدمة القارئ والارتقاء بذائقته ومعرفته.
              </p>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>
      <Subfooter visible={footerVisible} shareText={title} />
    </main>
  );
}
