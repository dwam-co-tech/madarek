"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function PrivacyPage() {
  const title = "سياسة الخصوصية";
  const lastUpdate = "آخر تحديث: 10 فبراير 2026";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2026);
  const dateLabel = `شعبان ${hijriYear} هـ - فبراير ${gregYear}م`;
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
    document.title = "مجلة مدارك | سياسة الخصوصية";
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
              <h2 className={styles.sectionTitle}>سياسة الخصوصية – مجلة مدارك</h2>
              {/* <p className={styles.lastUpdate}>{lastUpdate}</p> */}
              
              <p className={styles.intro}>
                تحترم مجلة مدارك خصوصية زوارها وتلتزم بحماية البيانات التي قد يتم جمعها عند استخدام الموقع. توضح هذه السياسة أنواع المعلومات التي قد نجمعها وكيفية استخدامها وحمايتها.
              </p>

              <div className={styles.section}>
                <h3 className={styles.subheading}>1) المعلومات التي قد نجمعها</h3>
                <p>قد نجمع معلومات بطريقتين:</p>
                <p><strong>أولًا: معلومات يقدّمها المستخدم طوعًا</strong> مثل الاسم أو البريد الإلكتروني أو أي بيانات يرسلها عبر نماذج التواصل أو التعليقات أو الاشتراك.</p>
                <p><strong>ثانيًا: معلومات تُجمع تلقائيًا</strong> مثل عنوان IP، ونوع المتصفح، ونظام التشغيل، والصفحات التي تمت زيارتها، ووقت الزيارة، ومصدر الدخول، وبيانات تقنية مشابهة تساعد في تحسين أداء الموقع.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>2) كيف نستخدم المعلومات</h3>
                <p>قد نستخدم المعلومات للأغراض التالية:</p>
                <ul className={styles.list}>
                  <li>تشغيل الموقع وتحسين تجربة المستخدم وتطوير المحتوى.</li>
                  <li>الرد على الاستفسارات والرسائل والملاحظات.</li>
                  <li>إرسال إشعارات أو تحديثات إذا اختار المستخدم الاشتراك في ذلك.</li>
                  <li>تحليل الأداء وقياس التفاعل داخل الموقع.</li>
                  <li>تعزيز الأمان ومنع إساءة الاستخدام أو الاحتيال أو الهجمات التقنية.</li>
                  <li>الالتزام بالمتطلبات القانونية عند الضرورة.</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>3) ملفات تعريف الارتباط (Cookies)</h3>
                <p>قد يستخدم الموقع ملفات تعريف الارتباط وتقنيات مشابهة لتحسين الأداء وتخصيص التجربة وتحليل الزيارات. يمكن للمستخدم التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح، وقد يؤدي تعطيلها إلى التأثير على بعض وظائف الموقع.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>4) مشاركة المعلومات</h3>
                <p>لا تقوم مجلة مدارك ببيع أو تأجير البيانات الشخصية. وقد يتم مشاركة معلومات محدودة فقط في الحالات التالية:</p>
                <ul className={styles.list}>
                  <li>مع مزودي خدمات موثوقين لتشغيل الموقع أو تحسينه (مثل الاستضافة أو التحليلات) وبالقدر الضروري فقط.</li>
                  <li>إذا طُلب ذلك بموجب القانون أو أمر قضائي أو من جهة رسمية مختصة.</li>
                  <li>لحماية حقوق الموقع أو المستخدمين أو منع الأضرار أو إساءة الاستخدام.</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>5) حماية البيانات</h3>
                <p>تتخذ مجلة مدارك إجراءات تنظيمية وتقنية معقولة لحماية المعلومات من الوصول غير المصرح به أو التعديل أو الإتلاف أو التسريب. ومع ذلك، لا يمكن ضمان الأمان المطلق لأي نقل بيانات عبر الإنترنت.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>6) مدة الاحتفاظ بالمعلومات</h3>
                <p>يتم الاحتفاظ بالمعلومات للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، أو وفق ما تتطلبه القوانين، ثم يتم حذفها أو إخفاء هويتها عند عدم الحاجة إليها.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>7) روابط خارجية</h3>
                <p>قد يحتوي الموقع على روابط لمواقع خارجية. لا تتحمل مجلة مدارك مسؤولية محتوى أو سياسات الخصوصية الخاصة بتلك المواقع، ويُنصح بمراجعتها عند زيارتها.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>8) خصوصية الأطفال</h3>
                <p>الموقع موجّه للجمهور العام ولا يستهدف جمع بيانات من الأطفال دون السن القانوني. في حال تبين جمع بيانات طفل دون قصد، سيتم اتخاذ الإجراءات اللازمة لحذفها عند العلم بذلك.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>9) التعديلات على السياسة</h3>
                <p>قد يتم تحديث سياسة الخصوصية من وقت لآخر. يتم نشر النسخة الأحدث على هذه الصفحة، ويُعد استمرار استخدام الموقع بعد التحديث موافقة على التعديلات.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>10) التواصل</h3>
                <p>لأي استفسار متعلق بالخصوصية أو البيانات، يمكن التواصل عبر صفحة التواصل في الموقع.</p>
              </div>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>
      <Subfooter visible={footerVisible} shareText={title} />
    </main>
  );
}
