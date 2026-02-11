"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function TermsPage() {
  const title = "الشروط والأحكام";
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
    document.title = "مجلة مدارك | الشروط والأحكام";
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
                  alt="الشروط والأحكام"
                  fill
                  sizes="(max-width: 900px) 94vw, (max-width: 1200px) 28vw, 360px"
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>الشروط والأحكام – مجلة مدارك</h2>
              
              <p className={styles.intro}>
                مرحبًا بك في موقع مجلة مدارك. باستخدامك للموقع أو تصفحك له، فإنك توافق على شروط الاستخدام التالية. إذا لم توافق على هذه الشروط، يُرجى التوقف عن استخدام الموقع.
              </p>

              <div className={styles.section}>
                <h3 className={styles.subheading}>1) التعريفات</h3>
                <p><strong>الموقع / المجلة:</strong> يقصد به موقع مجلة مدارك وكل الصفحات والخدمات والمحتوى المنشور عليه.</p>
                <p><strong>المستخدم:</strong> كل من يزور الموقع أو يتفاعل معه بأي صورة.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>2) قبول الشروط</h3>
                <p>استخدامك للموقع يعني قبولك الكامل بهذه الشروط وبأي تحديثات تطرأ عليها. وقد يتم تحديث الشروط من وقت لآخر دون إشعار مسبق، ويعد استمرارك في الاستخدام بعد التحديث موافقة ضمنية على النسخة المحدثة.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>3) طبيعة المحتوى</h3>
                <p>محتوى الموقع يُقدَّم لأغراض معرفية وثقافية وإعلامية عامة. لا يُعد المحتوى فتوى ملزمة، ولا استشارة قانونية، ولا بديلًا عن الرجوع لأهل الاختصاص عند الحاجة. تتحرى المجلة الدقة قدر الإمكان، لكنها لا تضمن خلو المحتوى من الأخطاء بشكل مطلق.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>4) حقوق الملكية الفكرية</h3>
                <p>جميع المواد المنشورة على الموقع (نصوص، مقالات، ملفات، تصميمات، شعارات، صور، عناصر بصرية) محمية بحقوق الملكية الفكرية، وتعود ملكيتها للمجلة أو لأصحابها حسب ما هو مذكور.</p>
                
                <p><strong>يُسمح للمستخدم بما يلي:</strong></p>
                <ul className={styles.list}>
                  <li>قراءة المحتوى وتصفحه للاستخدام الشخصي غير التجاري.</li>
                  <li>مشاركة روابط المقالات مع الإشارة إلى المصدر.</li>
                </ul>

                <p><strong>ويُمنع منعًا باتًا:</strong></p>
                <ul className={styles.list}>
                  <li>نسخ المحتوى أو إعادة نشره كاملًا أو جزئيًا دون إذن مسبق.</li>
                  <li>استخدام المحتوى لأغراض تجارية أو ترويجية دون موافقة.</li>
                  <li>إزالة اسم المجلة أو نسب المحتوى لغير صاحبه.</li>
                  <li>إعادة إنتاج التصميمات أو الهوية البصرية أو الشعار بأي شكل.</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>5) استخدام الموقع بشكل سليم</h3>
                <p>يوافق المستخدم على عدم القيام بأي من الآتي:</p>
                <ul className={styles.list}>
                  <li>محاولة اختراق الموقع أو تعطيله أو التأثير على أمانه.</li>
                  <li>إرسال أو نشر أي محتوى مخالف للقانون أو يتضمن إساءة أو تحريضًا أو تشهيرًا أو كراهية.</li>
                  <li>استخدام الموقع لإرسال رسائل مزعجة أو إعلانات أو روابط ضارة.</li>
                  <li>انتحال صفة أي شخص أو جهة أو تقديم معلومات مضللة.</li>
                </ul>
                <p>للمجلة الحق في اتخاذ الإجراءات اللازمة عند وجود إساءة استخدام، بما في ذلك الحجب أو المنع أو اتخاذ إجراءات قانونية عند الحاجة.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>6) التعليقات والمشاركات (إن وُجدت)</h3>
                <p>إذا أتاح الموقع التعليقات أو إرسال مواد أو مشاركات، فإن المستخدم مسؤول عن كل ما يقدمه. وللمجلة الحق في مراجعة أو حذف أي محتوى تراه غير مناسب دون إبداء أسباب، بما يشمل: الإساءة، التكرار المزعج، المحتوى غير اللائق، أو المحتوى الذي يخل بهدف الموقع.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>7) الروابط الخارجية</h3>
                <p>قد يحتوي الموقع على روابط لمواقع خارجية. هذه الروابط تُقدَّم للتيسير فقط، ولا تتحمل مجلة مدارك مسؤولية محتوى تلك المواقع أو سياساتها أو دقتها أو أي ضرر قد ينشأ عن استخدامها.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>8) إخلاء المسؤولية</h3>
                <p>يُستخدم الموقع "كما هو" و"حسب التوفر". لا تضمن المجلة أن الموقع سيعمل دون انقطاع أو أخطاء دائمة، ولا تتحمل مسؤولية أي ضرر مباشر أو غير مباشر قد ينتج عن استخدام الموقع أو الاعتماد على محتواه.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>9) التعديلات وإيقاف الخدمة</h3>
                <p>للمجلة الحق في:</p>
                <ul className={styles.list}>
                  <li>تعديل المحتوى أو الخدمات أو شكل الموقع في أي وقت.</li>
                  <li>إيقاف الموقع مؤقتًا أو دائمًا لأسباب فنية أو تطويرية أو تنظيمية دون التزام بالتعويض.</li>
                </ul>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>10) القانون والاختصاص</h3>
                <p>تخضع هذه الشروط لما تقرره الأنظمة والقوانين المعمول بها، وأي نزاع ينشأ حولها يتم التعامل معه وفق الأطر القانونية المختصة.</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.subheading}>11) التواصل</h3>
                <p>للاستفسارات المتعلقة بشروط الاستخدام أو المحتوى أو الحقوق، يرجى التواصل عبر صفحة "اتصل بنا" داخل الموقع.</p>
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
