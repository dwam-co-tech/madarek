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
    document.title = "مجلة مدارك | من نحن";
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
              <h2 className={styles.sectionTitle}>من نحن</h2>
              <p className={styles.lead}>
                <strong>مجلة مدارك</strong> مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية دراسةً وبحثًا ونقدًا، وفق منهج علمي يقوم على التوثيق والتحقيق، وردّ المسائل إلى أصولها: نصوصًا ومفاهيم وتاريخًا وواقعًا.
              </p>
              
              <p>
                تعمل المجلة على تقديم ملف معرفي متكامل حول الظاهرة الصوفية:
              </p>
              
              <ul className={styles.featureList}>
                <li>تفكيك المصطلحات وتحرير دلالاتها، حتى لا تُدار المعارك في الضباب.</li>
                <li>قراءة الشخصيات والمدارس في ضوء ميزان العلم والشرع والسياق التاريخي.</li>
                <li>تحليل الامتداد العالمي للصوفية وتحولاتها المعاصرة.</li>
                <li>تفنيد الشبهات والمغالطات التي تُلبَّس على العامة أو تُسوَّق بأسماء براقة.</li>
                <li>إتاحة الوثائق والنقول والمراجع بما يخدم الباحث والقارئ الجاد.</li>
              </ul>
              
              <p className={styles.highlight}>
                وفي كل ذلك، تسعى "مدارك" إلى كتابةٍ رصينة لا تعتمد الإثارة، ولا تُدار بالانطباع، بل بالبرهان: نصٌّ ثابت، وفهمٌ منضبط، وحُكمٌ معلّل.
              </p>

              <div className={styles.visionSection}>
                <h3 className={styles.subheading}>الرؤية</h3>
                <p>
                  أن تكون مدارك مرجعًا علميًّا عربيًّا موثوقًا في دراسة الصوفية: تاريخًا وفكرًا وممارسةً وتأثيرًا، يسهم في رفع الوعي، وتصحيح المفاهيم، وبناء خطاب علمي متوازن قادر على التفريق بين الحق والباطل دون تهويل ولا تمييع.
                </p>
              </div>

              <div className={styles.missionSection}>
                <h3 className={styles.subheading}>الرسالة</h3>
                <p>
                  تقديم محتوى علمي شهري متخصص يهدف إلى بيان حقيقة الصوفية من جميع جوانبها وذلك عبر تحرير علمي دقيق، وتحقيق للنقول، وتحليل للواقع، بما يخدم القارئ العام والباحث المتخصص على السواء.
                </p>
              </div>

              <div className={styles.goalsSection}>
                <h3 className={styles.subheading}>الأهداف</h3>
                <ol className={styles.goalsList}>
                  <li>تحرير المفاهيم والمصطلحات الصوفية وشرحها شرحًا علميًّا يزيل الالتباس ويمنع الخلط المتعمد أو غير المتعمد.</li>
                  <li>رصد المدارس والاتجاهات الصوفية تاريخيًّا ومعاصرًا، وبيان تطوراتها الفكرية والاجتماعية.</li>
                  <li>دراسة الشخصيات الصوفية المؤثرة دراسة نقدية موثقة، تُبيّن مواطن الصواب والخطأ بميزان منضبط.</li>
                  <li>تفكيك الشبهات المتعلقة بالصوفية والرد عليها ردًّا علميًّا، مع تتبّع مصادر الشبهة ومسار انتشارها.</li>
                  <li>تقديم إحصاءات وتحليلات تساعد على فهم الحضور المؤسسي والاجتماعي والإعلامي للصوفية، داخل العالم العربي وخارجه.</li>
                  <li>متابعة "الصوفية حول العالم": الانتشار، التنظيمات، الأدوات، التحالفات، وأثر ذلك في المجال الديني والفكري.</li>
                  <li>بناء خزانة وثائق تتضمن مواد أصلية ونقولًا ومصادر تساعد الباحث على الوصول للأصل بدل الدوران حول الكلام المنقول بلا سند.</li>
                  <li>تأريخ المحطات المؤثرة التي شكّلت الظاهرة الصوفية: اللحظات المفصلية، التحولات، والاصطدامات الفكرية عبر الزمن.</li>
                  <li>مراجعة الكتب والدراسات المتعلقة بالصوفية مراجعة علمية تُظهر قيمتها ومآخذها وتضعها في سياقها.</li>
                  <li>صناعة محتوى معرفي رصين يوازن بين قوة الحجة ووضوح العرض، بحيث يستفيد منه القارئ غير المتخصص دون فقدان الصرامة العلمية.</li>
                </ol>
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
