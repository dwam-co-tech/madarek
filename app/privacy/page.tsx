"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function PrivacyPage() {
  const title = "سياسة الخصوصية";
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
                  alt="سياسة الخصوصية"
                  fill
                  sizes="(max-width: 900px) 94vw, (max-width: 1200px) 28vw, 360px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
            <div className={styles.textContent}>
              <p>
                نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة أسس جمع البيانات ومعالجتها واستخدامها داخل موقع مجلة مدارك.
              </p>
              <p>
                يتم جمع المعلومات بشكل محدود لتحسين تجربة المستخدم، مثل بيانات الاستخدام العامة. لا نقوم ببيع بياناتك أو مشاركتها مع جهات خارجية إلا في الحالات النظامية.
              </p>
              <p>
                يمكنك التواصل معنا لطلب تعديل بياناتك أو حذفها، وسنعمل على معالجة الطلبات خلال مدة زمنية معقولة.
              </p>
              <p>
                باستخدامك للموقع فإنك توافق على بنود هذه السياسة وتحديثاتها الدورية.
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
