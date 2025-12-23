"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function HistoryPage() {
  const issueTitle = "محطات تاريخية";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2025);
  const dateLabel = `رجب ${hijriYear} هـ - ديسمبر ${gregYear}م`;
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: "مدارك", text: issueTitle, url };
    if (navigator.share) {
      navigator.share(data).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };
  const handleTranslate = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const target = "en";
    const tUrl = `https://translate.google.com/translate?sl=auto&tl=${target}&u=${encodeURIComponent(url)}`;
    window.open(tUrl, "_blank", "noopener,noreferrer");
  };
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
      <Subheader issueTitle={issueTitle} dateLabel={dateLabel} />

      <section className={styles.contentArea}>
        <div className={styles.paperSection} aria-label="عرض المقال داخل صفحة ورقية">
          <div className={styles.paper}>
            <div className={styles.paperInner}>
              <header className={styles.paperHeader}>
                <div className={styles.paperBadge}>محطات تاريخية</div>
                <h2 className={styles.paperTitle}>بين “الوساطة” و“التهمة”: الشارف الغرياني في حرب برقة وموقفه من عمر المختار</h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/7.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  <p>يُثار اسم الشارف باشا حمد الغرياني (1877–26 فبراير 1945) في ذاكرة الليبيين كلما ذُكرت سنوات &ldquo;التهدئة الكبرى&rdquo; الإيطالية في برقة، لا لأنه كان قائدًا عسكريًا في الميدان، بل لأنه ارتبط بدورٍ سياسيّ/اجتماعي داخل بيئة الحركة السنوسية، ثم صار موضع تجاذبٍ بين سرديتين: سرديةٍ تتهمه بمساندة الاحتلال الإيطالي أو التسهيل له، وسرديةٍ أخرى ترى أنه تعرّض لظلمٍ سينمائي ورواياتٍ غير منضبطة.</p>
                  <h3 className={styles.paperSubtitle}>الخلفية التاريخية: حربٌ طويلة وسياسات &ldquo;التهدئة&rdquo;</h3>
                  <p>شهدت ليبيا، وبخاصة برقة، صراعًا حادًا في الفترة التي تُعرف بـالحرب الإيطالية-السنوسية الثانية أو &ldquo;تهدئة ليبيا&rdquo; بين 1923 و1932، وكانت المقاومة السنوسية المسلحة في الجبل الأخضر تحت قيادة عمر المختار، فيما واجهت إيطاليا المقاومة بإجراءات قمعية واسعة وعمليات تهجير ومعسكرات اعتقال.</p>
                  <p>وفي هذا السياق، يَصعُب فهم أي شخصيةٍ سياسية/دينية بمعزل عن ضغط الاحتلال، والتوازنات القبلية، وخيارات القيادة السنوسية بين الاستمرار العسكري والبحث عن تفاوضٍ يخفف الكلفة.</p>
                  <h3 className={styles.paperSubtitle}>من هو الشارف الغرياني؟ وما موقعه داخل السنوسية؟</h3>
                  <p>وفق التراجم المتداولة، وُلد الشارف الغرياني بزاوية جنزور بمنطقة البطنان (شرق ليبيا)، ونشأ في أوساط الزوايا السنوسية، وتولّى—بحسب عرض سيرته—الجناح السياسي في الحركة السنوسية بعد مغادرة إدريس السنوسي إلى مصر، في مرحلةٍ شهدت انقلاب الفاشيين في إيطاليا ونقض المعاهدات السابقة وهدم الزوايا.</p>
                  <p>هذه النقطة &ldquo;المؤكدة&rdquo; نسبيًا (الدور السياسي) لا تعني بذاتها &ldquo;العمالة&rdquo;، لكنها تفسر لماذا ظهر اسمه في خطوط الاتصال، والوساطة، والرسائل، ومناطق التفاوض، وهي ساحاتٌ رمادية بطبيعتها في زمن الاستعمار.</p>
                  <h3 className={styles.paperSubtitle}>أين تبدأ &ldquo;تهمة المساندة&rdquo;؟ وأين تقف حدود الإثبات؟</h3>
                  <p>أقوى ما يمكن توثيقه من مصادر منشورة هو أن الشارف الغرياني كان محل اتهام بعلاقاتٍ مع المستعمر، وأنه كان على خلاف مع عمر المختار، بل وورد أنه كان &ldquo;آخر ليبي&rdquo; زار المختار في محبسه قبل تنفيذ الإعدام بيوم.</p>
                  <p>لكن هذا الوصف نفسه في مصدرٍ صحفيٍ تحليلي لا يُفصل لنا طبيعة العلاقة: هل هي تعاونٌ استخباري؟ أم وساطة؟ أم محاولة إقناع بالتهدئة؟ أم زيارة اجتماعية في لحظةٍ أخيرة؟ لذلك فالبحث المنضبط يميز بين: اتهامٍ تاريخيٍ شائع وبين تفاصيلٍ مثبتة بوثائق إيطالية/سنوسية منشورة.</p>
                  <p>ومن جهة أخرى، فإن الجدل تضاعف بسبب فيلم &ldquo;أسد الصحراء&rdquo; الذي قدّم الشارف في صورة &ldquo;متعاون مع الاحتلال&rdquo;، ثم ظهرت لاحقًا متابعة قضائية/بلدية في ليبيا تطلب &ldquo;رد اعتبار&rdquo; للشخصية بحجة أن الفيلم تضمّن &ldquo;تجنيًا&rdquo; ومشاهد مضللة، وذكرت تغطية صحفية صدور حكم يلزم باعتذار رسمي وحذف المشاهد الخاصة به وفق رواية أطراف القضية.</p>
                  <p>وهذا وحده كافٍ لإثبات أن الصورة الشائعة ليست محل إجماع، وأن التعامل معها يجب أن يكون بأدوات التاريخ لا بأثر الدراما.</p>
                  <h3 className={styles.paperSubtitle}>موقف عمر المختار: وثيقة &ldquo;الرسالة&rdquo; ومعنى الرفض</h3>
                  <p>أوضح نص يمكن الاستناد إليه في رسم موقف عمر المختار هو الرسالة المنقولة التي وُصفت بأنها ردٌّ من المختار على رسالةٍ بعثها الشارف الغرياني &ldquo;أكرهته إيطاليا&rdquo; ليكون وسيطًا في الصلح ووقف الحرب. وفي هذا الرد يقرر المختار أن جهة التفاوض هي السيد إدريس السنوسي، وأنه &ldquo;جندي من جنوده&rdquo;، ويؤكد استمرار القتال ما لم يصدر أمرٌ بوقفه، ويحذّر مخاطبه من الانجرار لما &ldquo;يدفعه إليه النصارى&rdquo; (أي ضغط الاحتلال) ويختم بما يدل على حسمه: القتال ضد الاحتلال هو الغاية لا صناعة مكانةٍ أو مكاسب.</p>
                  <p>وفي السياق الزمني الأوسع، يثبت أن المختار أُعدم شنقًا في سلوق جنوب بنغازي يوم 16 سبتمبر 1931 بعد محاكمة صورية، وهو ما يحدد نهاية المسار الذي رفض فيه الاستسلام حتى آخر لحظة.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>المصادر</h3>
                  <div className={styles.paperSources}>
                    <p>•  سيرة الشارف الغرياني وتاريخ ميلاده ووفاته ودوره السياسي في الحركة السنوسية: الويكيبيديا.</p>
                    <p>•  تحقيق سكاي نيوز 19 أكتوبر 2022  : بعد 40 عاما.. عودة الجدل حول الشارف الغرياني في ليبيا</p>
                    <p>•  د. علي الصلابي : الشيخ عمر المختار .. نشأته وجهاده .</p>
                    <p>•  سياق الحرب الإيطالية-السنوسية الثانية (1923–1932) وسياسات &ldquo;التهدئة&rdquo; الإيطالية: <a href="https://libyanheritagehouse.org/" target="_blank" rel="noopener noreferrer">Libyan Heritage House</a></p>
                    <p>•  بوابة الوسط صوت ليبيا الدولي 16 سبتمبر 2018 مقال بعنوان : في ذكرى «يوم الشهيد»: عمر المختار .. الملحمة والرمز</p>
                    <p>•  صحيفة الشرق الأوسط – 13 سبتمبر 2019 م  - مقال بعنوان عمر المختار بعيون أعداءة د. جبريل العبيدي</p>
                  </div>
                </div>
              </div>
              <div className={styles.paperFooter}>
                <div className={styles.footLeft}>
                  <div className={styles.pageTile}>1</div>
                  <div className={styles.pageMeta}>العدد الأول • {dateLabel}</div>
                </div>
                <div className={styles.footCenter}>مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية</div>
                <div className={styles.footRight}>
                  <Image src="/logo3.png" alt="مدارك" width={62} height={62} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>
      <Subfooter visible={footerVisible} pdfHref="/8.pdf" />
    </main>
  );
}
