"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function ProfilesPage() {
  const issueTitle = "شخصيات صوفية";
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
                <div className={styles.paperBadge}>شخصيات صوفية</div>
                <h2 className={styles.paperTitle}>ابن عربي: التعريف والنشأة والتحوّلات الفكرية والعقدية  </h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/3.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  <p>يُعَدُّ محيي الدين محمد بن علي بن محمد الطائي الحاتمي، المشهور بابن عربي (ت 638هـ)، من أكثر الشخصيات إثارة للجدل في تاريخ التصوّف؛ لا من حيث السيرة وحدها، بل من حيث المضمون العقدي والفلسفي الذي حملته مصنّفاته، وما ترتّب عليه من آثارٍ بعيدة في تشكيل “التصوّف النظري/الفلسفي” داخل كثير من الطرق والمدارس.</p>
                  <p>ولد ابن عربي بالأندلس، ونُسبت ولادته إلى مرسية، وكان ذلك في رمضان سنة 560هـ، ثم دخل فاس سنة 594هـ، ودخل مكة سنة 598هـ، واستمر في الأسفار والتنقّل حتى انتهت به الرحلة إلى الشام حيث توفي بدمشق سنة 638هـ. وهذه الخطوط العامة في سيرته مما تُثبته كتب التراجم والتواريخ.</p>
                  <p>ولئن كانت الأسفار والالتقاء بالمشايخ والبيئات المتباينة سِمة مشتركة عند عدد من المتصوّفة، فإن ابن عربي تميّز بتحوّلٍ واضح: من زهدٍ وسلوكٍ عمليٍّ إلى بناء “منظومة تفسيرية” للوجود والدين والنبوة والولاية، تتوسّل بالمصطلحات الشرعية لكنها تُحمِّلها معاني مغايرة لمدلولها المعروف عند السلف وأهل الحديث. وهذا هو موطن النزاع الحقيقي؛ إذ ليس الخلاف مع ابن عربي مجرد خلاف في “الذوق” أو “العبادة”، بل في قضايا توحيدٍ وأسماء وصفات، وفي معنى الإله والخَلْق، وفي حقيقة النبوة والولاية.</p>
                  <h3 className={styles.paperSubtitle}>ملامح التحوّل الفكري عند ابن عربي</h3>
                  <p>أنتج ابن عربي تراثًا ضخمًا اشتهر منه ما نُسب إليه من “الفتوحات” و“الفصوص”، وتلقّته طوائف من المتصوّفة على أنه “ذروة التحقيق”، بينما نظر إليه آخرون على أنه تأسيسٌ لعقائد “الاتحاد/الحلول/وحدة الوجود” بصيغٍ متعدّدة، وإن اختلفت عبارات القوم في التسمية والتقرير.</p>
                  <p>ومن هنا تتضح طبيعة التحوّل: لم يعد الكلام عنده محصورًا في ترقيق القلب أو تهذيب السلوك، بل صار يقرّر قضايا كلية من نوع: العلاقة بين الخالق والمخلوق، وأنماط “التجلّي”، ومعنى “الحق” و“الخلق”، وحدود التأويل للكتاب والسنة. وهذا الانتقال من “التصوف العملي” إلى “التصوف الفلسفي” هو الذي جعل أثره يتجاوز دائرة السلوك إلى دائرة الاعتقاد.</p>
                  <h3 className={styles.paperSubtitle}>خلاصة الردّ السلفي على أصول مذهبه</h3>
                  <p>منهج أهل السنّة والسلف في هذا الباب يقوم على أصلين:</p>
                  <p>1. توقيفية الاعتقاد: فلا يُؤخذ في باب التوحيد والغيب إلا بنصٍّ صحيحٍ من كتابٍ أو سنّة بفهم السلف.</p>
                  <p>2. ردّ المتشابه إلى المحكم: والألفاظ المحتملة تُحمل على المعنى الشرعي الموافق للمحكمات، ولا تُجعل مطيّة لهدم القطعيات.</p>
                  <p>وعند تنزيل هذين الأصلين على ما نُقل عن ابن عربي في بعض تقريراته - وخاصة ما يتصل بمباحث “وحدة الوجود” وما يلزمها - حكم علماء من أهل السنّة بأن في كلامه ما هو مناقض للتوحيد، وأنه لا يُقبل فيه اعتذار “التأويل” إذا كان اللفظ صريحًا في إبطال الفرقان بين الخالق والمخلوق. ومن أشهر من تكلم على هذا المعنى شيخ الإسلام ابن تيمية، إذ تعرّض لنصوص تُنسب لابن عربي في “الفصوص” ونحوها، وبيّن أن طائفة من هذه المقولات عند التحقيق ترجع إلى مقالات الاتحادية التي تُبطل حقيقة العبادة والربوبية.</p>
                  <p>كما أن بعض المصنفين اعتنى بجمع أقوال العلماء في ابن عربي وبيان خطورة تقريراته، ومن ذلك ما في بعض كتب الردود التي تسوق نماذج من تقريراته ثم تناقشها من جهة مخالفتها لأصول الشريعة والتوحيد.</p>
                  <p>ومع ذلك - وهنا ينبغي أن يكون الكلام منضبطًا - فإن الخلاف في ابن عربي تاريخيًا لم يكن على وتيرة واحدة: فمن العلماء من اشتدّ إنكاره إلى حدّ الجزم بالتضليل أو التكفير بناءً على نصوص بعينها، ومنهم من توقّف أو حاول حمل بعض العبارات على محامل محتملة، ومنهم من فرّق بين “ثبوت النسبة” و“فهم العبارة” و“الحكم على القائل”. وقد نُقل في بعض المصنفات تقسيم الناس فيه إلى أقسام متعددة بحسب شدة الحكم أو التوقف، مع ذكر أسماء ممن نسبوا إليه سوء الاعتقاد أو اشتدّوا في الإنكار.</p>
                  <h3 className={styles.paperSubtitle}>لماذا يُعدّ خطره أعظم من مجرد “غلوّ طُرُقي”؟</h3>
                  <p>لأن أثره ليس محصورًا في طقسٍ أو عادةٍ أو “حضرة”، بل في تأسيس رؤية للعالم تُعيد تعريف الألوهية والعبادة والشرائع. فإذا شاع هذا اللون من التفكير بين عوام المنتسبين للتصوف، وقع الخلط: تُصبح الحدود بين التوحيد والشرك “ذوقًا”، وبين الاتباع والابتداع “حقيقةً”، وبين النبوة والولاية “مراتبَ قابلة للمزاحمة”. وهذه بالضبط بوابة الانحراف: إذ تتحول النصوص الشرعية إلى رموز قابلة لإعادة الصياغة بحسب التجربة الباطنية.</p>
                  <p>ومن هنا فإن الردّ السلفي ليس “خصومة شخصية” مع ابن عربي، بل هو حماية لجناب التوحيد وحراسة لمعنى “لا إله إلا الله” كما فهمها الصحابة ومن تبعهم بإحسان: خالقٌ بائنٌ من خلقه، وعبادةٌ لا تُصرف إلا له، وشرعٌ لا يُبدّل بذوق ولا كشف ولا إلهام.</p>
                  <p>________________________________________</p>
                 
                  <div className={styles.paperSources}>
                     <p>المصادر:</p>
                    <p>1. ابن شاكر الكتبي، فوات الوفيات والذيل عليها، ج3، ص435 (ترجمة محيي الدين ابن عربي: مولده، أسفاره، وفاته)</p>
                    <p>2. ابن كثير، البداية والنهاية، ج13، ص182 (ذكر ابن عربي ضمن وفيات تلك السنة وما يتصل بترجمته).</p>
                    <p>3. ابن تيمية، مجموع الفتاوى، ج13، ص196 (كلامه على الاتحادية ونصوص منسوبة لابن عربي في “الفصوص” وما يلزمها).</p>
                    <p>4. برهان الدين البقاعي، مصرع التصوف = تنبيه الغبي إلى تكفير ابن عربي…، ج1، ص19 (عرض مناقشة “عقيدة ابن عربي” وما يتعلق بأصول الوحدة المطلقة عنده).</p>
                    <p>5. ابن الألوسي، جلاء العينين في محاكمة الأحمدين، ص86 (تقسيم الناس في ابن عربي وذكر أسماء من اشتد إنكارهم عليه)</p>
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
      <Subfooter visible={footerVisible} pdfHref="/3.pdf" />
    </main>
  );
}
