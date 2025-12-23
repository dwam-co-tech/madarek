"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function StatsPage() {
  const issueTitle = "إحصائيات وتحليلات";
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
                <div className={styles.paperBadge}>إحصائيات وتحليلات</div>
                <h2 className={styles.paperTitle}>كم عدد الطرق الصوفية “رسميًا” في مصر؟ ولماذا تتباين الأرقام؟ قراءة إحصائية-مؤسسية</h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/4.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  <p>يثير سؤال “عدد الطرق الصوفية في مصر” إشكالًا منهجيًا قبل أن يكون سؤالًا رقميًا؛ لأن “العدد الرسمي” ليس مجرد رقمٍ ثابت في كتابٍ إحصائي، بل هو حصيلة تعريف قانوني وإجراءات اعتماد وسجل إداري متغير، إضافة إلى فرقٍ جوهري بين: وجود الطريقة اجتماعيًا وبين اعتراف الدولة بها وتنظيمها داخل المجلس الأعلى للطرق الصوفية. ومن هنا جاءت الأرقام المتداولة متقاربة لكنها غير متطابقة: 77، أو 80، أو 81… وكل رقم منها يلتقط “طبقة” مختلفة من المشهد.</p>
                  <h3 className={styles.paperSubtitle}>1) ما معنى “رسميًا”؟</h3>
                  <p>قانون تنظيم الطرق الصوفية (118 لسنة 1976) جعل المجلس الأعلى للطرق الصوفية الجهة التنظيمية العليا، ومنحه اختصاصات حاسمة تتعلق بتحديد “القائمة المعترف بها”، مثل: الموافقة على إنشاء طرق صوفية جديدة، والإشراف على نشاط الطرق وأعضائها، بل وإصدار قرارات بحظر نشاط أي جماعة أو شخص يباشر نشاطًا صوفيًا دون أن يكون “مدرجًا ضمن سجلات الطرق الصوفية&rdquo;</p>
                  <p>إذًا: “رسميًا” هنا يعني—بالمعنى الإداري القانوني—المدرج في السجلات والخاضع لآليات المجلس من حيث الاعتماد والرقابة والتنظيم.</p>
                  <h3 className={styles.paperSubtitle}>2) ما الأرقام التي تظهر في المصادر شبه الرسمية/الإعلامية؟</h3>
                  <p>لدينا ثلاث نقاط رقمية مهمة، تمثل ثلاث لحظات أو زوايا إحصائية:</p>
                  <p>•  77 طريقة (مع تفصيل التسجيل): مصدر موسوعي صحفي ذكر أن عدد الطرق الصوفية في مصر يبلغ 77 طريقة، وأن 67 منها مسجل بالمجلس الأعلى للطرق الصوفية.</p>
                  <p>هذا التفصيل مهم جدًا: فهو يفرّق بين “طرق موجودة/متداولة” وبين “طرق مسجلة فعليًا”، ويُثبت أن حتى داخل رقم واحد قد توجد طبقتان: إجمالي مقابل المسجل.</p>
                  <p>•  81 طريقة “رسميًا”: تقرير صحفي لاحق ذكر صراحة أن عدد الطرق الصوفية في مصر بلغ رسميًا 81 طريقة، مع التنبيه إلى وجود طرق أخرى “لم يتم الاعتراف بها أو تسجيلها رسميًا”.</p>
                  <p>هنا كلمة “رسميًا” استُخدمت كمرادف للاعتراف والتسجيل، لكن التقرير في الوقت نفسه يعترف بأن “الخريطة الفعلية” أكبر من السجل.</p>
                  <p>هذا النوع من التصريحات عادةً يُعطي رقمًا تقريبيًا (حوالي) لأنه يراعي تغير السجل واعتماد طرق جديدة أو تغير أوضاع بعضها.</p>
                  <h3 className={styles.paperSubtitle}>3) لماذا تتباين الأرقام رغم أنها تتحدث عن “الرسمي”؟</h3>
                  <p>التباين ليس لغزًا؛ بل له أسباب منهجية يمكن ضبطها في أربعة محاور:</p>
                  <p>(أ) اختلاف تعريف “الطريقة” كوحدة عدّ</p>
                  <p>بعض الإحصاءات تعدّ “الطريقة” كوحدة أصلية فقط، بينما يعدّ آخرون فروعًا أو “شُعَبًا” داخل الطريقة الأم كوحدات مستقلة إذا كانت معتمدة أو لها شيخ مستقل وسجل خاص. وبما أن كثيرًا من الطرق تتفرع تاريخيًا إلى مسارات فرعية، فإن منهج العدّ وحده قد يرفع الرقم أو يخفضه دون أي تغيير حقيقي على الأرض.</p>
                  <p>(ب) تغيّر السجل مع قرارات الاعتماد والإضافة</p>
                  <p>القانون يمنح المجلس سلطة الموافقة على إنشاء طرق جديدة.</p>
                  <p>ومع الزمن تظهر طرق جديدة تُعتمد بقرارات رسمية. مثال واضح: تقرير صحفي عن “الطريقة الصديقية الشاذلية” ذكر أنها تم اعتمادها رسميًا بقرار من المجلس الأعلى للطرق الصوفية رقم 11/2018 بتاريخ 26 فبراير 2018.</p>
                  <p>وجود “إضافات” من هذا النوع يفسّر لماذا قد يرتفع الرقم من 77 في لحظةٍ توثيقية إلى 81 في لحظة لاحقة.</p>
                  <p>(ج) وجود طرق “موجودة اجتماعيًا” لكنها خارج التسجيل</p>
                  <p>حتى التقارير التي تعطي رقمًا “رسميًا” تُقرّ بوجود طرق لم تُسجل أو لم يُعترف بها بعد. .</p>
                  <p>وهذا يخلق ضبابية: هل يعدّ الباحث تلك الطرق ضمن “الخريطة” أم يستبعدها لأنها ليست رسمية؟ هنا يتباين الرقم بحسب هدف الدراسة: وصف المجتمع أم وصف التنظيم القانوني.</p>
                  <p>(د) ضعف نشر “قائمة رسمية مُحدَّثة للعامة”</p>
                  <p>في كثير من القطاعات التنظيمية، نشرُ قوائمٍ محدّثة هو ما يوقف الجدل. لكن حين لا يكون هناك “سجل منشور بصفة دورية” يوضح: الطرق المعتمدة، والمجمّدة، والمضافة حديثًا—تتحول الكتابة إلى تجميعٍ من مصادر متعددة: تصريحات، تقارير صحفية، دراسات بحثية، وكل منها يلتقط لحظة زمنية مختلفة.</p>
                  <h3 className={styles.paperSubtitle}>4) كيف يقرأ الباحث الرقم قراءة صحيحة؟</h3>
                  <p>لأغراض بحثية أكاديمية، الأدق أن نكتب الرقم بصيغة “نطاق” مع تفسيره:</p>
                  <p>•  العدد الرسمي المتداول يدور حول 80 طريقة (تقريبًا)</p>
                  <p>•  مع وجود توثيق سابق يذكر 77، ويضيف تفصيلًا أن المسجل وقتها 67</p>
                  <p>ثم نشرح أن الفروق تعود إلى: منهج العدّ + القرارات الجديدة + الفاصل بين الاجتماعي والرسمي.</p>
                  <p>بهذا ننتقل من “جدل الأرقام” إلى “علم الإحصاء المؤسسي”: ليس المهم رقمٌ واحد، بل فهم ما الذي يُعدّ، ومن يعدّه، وبأي تعريف، وفي أي تاريخ.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>المراجع والمصادر</h3>
                  <div className={styles.paperSources}>
                    <p>1.  قانون نظام الطرق الصوفية – القانون رقم 118 لسنة 1976 (نص المواد الخاصة باختصاصات المجلس، بما فيها اعتماد الطرق الجديدة وحظر نشاط غير المدرج بالسجلات)</p>
                    <p>2.  الجزيرة نت – موسوعة: “المجلس الأعلى للطرق الصوفية بمصر” (يتضمن: 77 طريقة، 67 منها مسجل بالمجلس).</p>
                    <p>3.  مجلة روزاليوسف: “81 طريقة معتَرف بها رسميًا.. بعضها بلا أتباع” (يتضمن: 81 طريقة رسميًا + الإشارة لطرق غير مسجلة).</p>
                    <p>4.  بوابة الأهرام: “الأعلى للطرق الصوفية: مصر بها 15 مليون مريد رسميًا..” (يتضمن تصريح عضو المجلس: “حوالي 80 طريقة”).</p>
                    <p>5.  مجلة روزاليوسف: “الصديقية الشاذلية طوق نجاة للتصوف” (قرار اعتماد الطريقة الصديقية الشاذلية رقم 11/2018 بتاريخ 26 فبراير 2018).</p>
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
      <Subfooter visible={footerVisible} pdfHref="/4.pdf" />
    </main>
  );
}
