"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function NewsPage() {
  const issueTitle = "الصوفية حول العالم";
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
                <div className={styles.paperBadge}>الصوفية حول العالم</div>
                <h2 className={styles.paperTitle}>متابعة آخر الأنشطة والمناسبات الصوفية </h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/5.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  <h3 className={styles.paperSubtitle}>القاهرة: &ldquo;العالمي للطرق الصوفية&rdquo; والطريقة العزمية يعلنان احتفالية مولد السيدة فاطمة الزهراء</h3>
                  <p><strong>المصدر:</strong> صحيفة الدستور المصرية 10 ديسمبر 2025</p>
                  <p>أعلن &ldquo;الاتحاد العالمي للطرق الصوفية&rdquo; مع &ldquo;الطريقة العزمية&rdquo; تنظيم احتفالية بمناسبة مولد السيدة فاطمة الزهراء، في مقر الطريقة العزمية بالقاهرة، مع توقع حضور قيادات صوفية ومريدين ومحبي آل البيت، وتقديم فقرات إنشاد وابتهالات وتلاوة قرآن. الخبر يقدّم المناسبة بوصفها نشاطًا روحانيًا واجتماعيًا واسع الحضور، ويبرز اسم علاء أبو العزائم بوصفه رئيس الاتحاد وشيخ الطريقة العزمية.</p>
                  <p><strong>تعليق (مدارك):</strong> مثل هذه المناسبات تصبح أحيانًا ساحة توظيف &ldquo;رمزي/مذهبي&rdquo; من أطراف متعددة؛ المهنية تقتضي رصد أي خطاب تعبوي أو استقطابي داخل الحدث بدل الاكتفاء بالطقس الاحتفالي.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>القاهرة: &ldquo;الطريقة الشبراوية&rdquo; تحتفل بمولد السيدة فاطمة الزهراء</h3>
                  <p><strong>المصدر:</strong> صحيفة الدستور المصرية   12 ديسمبر 2025.</p>
                  <p>احتفلت &ldquo;الطريقة الشبراوية&rdquo; بمولد السيدة فاطمة الزهراء، مشيرةً إلى حضور مئات من المنتسبين ومحبي آل البيت من محافظات مختلفة، وامتزاج التلاوة بالأناشيد والمدائح. وتذكر أن الشيخ محمد عبد الخالق الشبراوي شارك حلقات الذكر وألقى كلمة حول قيم تُنسب لشخصية السيدة فاطمة (كالزهد والصبر).</p>
                  <p><strong>تعليق (مدارك):</strong> الاحتفالات الشعبية الدينية غالبًا ما تُستثمر لصناعة &ldquo;ولاءات&rdquo; أكثر من صناعة &ldquo;علم&rdquo;، لذا المهم تحرير النقاش: هل يُقدَّم المحتوى كوعظ عام أم كتصورات عقدية/تاريخية ملزمة؟ وأي روايات تُمرّر دون توثيق؟</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>القاهرة: &ldquo;الطريقة الرفاعية&rdquo; تقيم &ldquo;حضرة&rdquo; بمسجد الإمام علي زين العابدين</h3>
                  <p><strong>المصدر:</strong> صحيفة الدستور المصرية (عبر نبض) 19 ديسمبر 2025.</p>
                  <p>أفاد التقرير بأن &ldquo;الطريقة الرفاعية&rdquo; أحيت ذكرى مولد الإمام علي زين العابدين عبر احتفال تضمن &ldquo;حضرة&rdquo; ومجالس ذكر ومديح، في مسجد الإمام علي زين العابدين بمنطقة السيدة زينب بالقاهرة، مع حضور مشايخ ومريدين ومحبي آل البيت. وذكر افتتاح الفعالية بتلاوة قرآن ثم مجلس ذكر وتقديم قصائد ومدائح تتناول سيرة الإمام ومكانته.</p>
                  <p><strong>تعليق (مدارك):</strong> الحدث هنا ديني-اجتماعي في صورته، لكن سؤال التحرير: أين الحد الفاصل بين &ldquo;التذكير بالسيرة&rdquo; وبين صناعة طقوس ثابتة تُعامل كجزء لازم من الدين؟ رصد الخطاب داخل الحضرات أهم من صور الزحام.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>القاهرة: آلاف في الليلة الختامية لمولد علي زين العابدين بالسيدة زينب</h3>
                  <p><strong>المصدر:</strong> مصراوي 20 ديسمبر 2025.</p>
                  <p>نشر &ldquo;مصراوي&rdquo; تقريرًا مصورًا عن الليلة الختامية لمولد الإمام علي زين العابدين حول مسجده في حي السيدة زينب بالقاهرة، مع مشاركة آلاف من المريدين ومحبي آل البيت، وذكر أن الفعاليات بدأت بعد المغرب بتلاوة قرآن ثم مجالس ذكر وابتهالات ومديح تناولت السيرة والفضائل. التقرير يقدّم المشهد كطقس جماهيري سنوي يتكرر حول مقامات بعينها في القاهرة.</p>
                  <p><strong>تعليق (مدارك):</strong> المشهد يثبت أن &ldquo;الدين الشعبي&rdquo; قوة اجتماعية؛ ومتى كانت القوة موجودة، تظهر محاولات ركوب الموجة سياسيًا أو مذهبيًا. النقد العلمي لا يحارب الناس؛ بل يراجع &ldquo;المحتوى&rdquo; و&ldquo;الاستدلال&rdquo; و&ldquo;الحدود الشرعية&rdquo; للطقس.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>المغرب: تيزنيت تستضيف &ldquo;المنتدى الدولي السابع للفكر الصوفي&rdquo;</h3>
                  <p><strong>المصدر:</strong> Morocco World News 6 ديسمبر 2025. .</p>
                  <p>غطّى الموقع انعقاد منتدى دولي للفكر الصوفي في مدينة تيزنيت خلال 4–6 ديسمبر، بمشاركة شخصيات &ldquo;روحية وأكاديمية&rdquo; من دول إفريقية وعربية وغربية، وتحت محور أخلاقي/تزكوي. المادة تعرض المنتدى بصفته فعالية فكرية ذات بعد دولي، وتربطه بسياقات ثقافية ودينية مغربية.</p>
                  <p><strong>تعليق (مدارك):</strong> المؤتمرات تضفي &ldquo;شرعنة معرفية&rdquo; على اتجاهات بعينها؛ لذا القراءة النقدية تحتاج متابعة: ما هي المرجعيات العلمية؟ هل تُطرح نصوص محققة ومناهج استدلال أم مجرد خطاب وجداني؟ &ldquo;التزكية&rdquo; قيمة شرعية، لكن تحويلها إلى مدرسة مغلقة بلا ضوابط معرفية هو المشكلة.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>المغرب: مهرجان &ldquo;السماع&rdquo; بمراكش (لقاءات وموسيقى صوفية) 4–7 ديسمبر</h3>
                  <p><strong>المصدر:</strong> VisitMarrakech     4 إلى 7 ديسمبر 2025.</p>
                  <p>أدرج موقع &ldquo;VisitMarrakech&rdquo; فعالية بعنوان مهرجان السماع بمراكش بوصفه لقاءات وموسيقى صوفية خلال 4 -7 ديسمبر. هذا النوع من الفعاليات يمزج البعد الفني/السياحي بالطقس الديني، ويقدَّم عادةً كتراث محلي وجذب ثقافي</p>
                  <p><strong>تعليق (مدارك):</strong> حين يتحول &ldquo;الطقس&rdquo; إلى &ldquo;منتَج سياحي&rdquo;، تتغير معايير النقد: لا يعود السؤال دينيًا فقط، بل ثقافيًا أيضًا (من يملك حق تمثيل الدين؟ وكيف تُنقل الممارسات للجمهور؟). والأهم: منع أي استقطاب مذهبي داخل الفعاليات العامة، لأن السوق يحب &ldquo;المشاهدة&rdquo; أكثر مما يحب &ldquo;التحقيق&rdquo;.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>باكستان: مهرجان &ldquo;Alhamra Sufi Festival&rdquo; في لاهور (28–30 نوفمبر</h3>
                  <p><strong>المصدر:</strong> The Express Tribune - 29 نوفمبر 2025.</p>
                  <p>تقرير من لاهور عن افتتاح &ldquo;Alhamra Sufi Festival 2025&rdquo; كبرنامج يمتد ثلاثة أيام يركز على التعبير الروحي والفنون (ومنها معرض أعمال فنية)، ويعرض &ldquo;الصوفية&rdquo; بوصفها ذاكرة ثقافية وإلهامًا جماليًا. الخبر يضع المهرجان في سياق فني-ثقافي أكثر من كونه شعيرة دينية.</p>
                  <p><strong>تعليق (مدارك):</strong> هنا تتضح نقطة مهمة: &ldquo;الصوفية&rdquo; قد تُقدَّم كدين، أو كفن، أو كهوية. وكل تحويل يغيّر قواعد اللعبة. النقد العلمي يحتاج تمييزًا: هل نتعامل مع تراث فني أم مع دعوى دينية ومعايير اعتقاد؟ الخلط هو الباب الخلفي لأي استقطاب.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>تركيا: بدء مراسم إحياء ذكرى وفاة جلال الدين الرومي في قونية (Shab-i Arus)</h3>
                  <p><strong>المصدر:</strong> Anadolu Agency - 8 ديسمبر 2025.</p>
                  <p>نشرت الأناضول خبر بدء مراسم إحياء ذكرى وفاة &ldquo;مولانا جلال الدين الرومي&rdquo; في قونية ضمن برنامج يمتد لأيام ويتضمن طقوس &ldquo;السماع/السِما&rdquo; المعترف بها لدى اليونسكو، ويستقطب زوارًا من دول متعددة. المادة تقدّم الحدث كفعالية دولية ذات طابع روحي وتراثي في آنٍ واحد.</p>
                  <p><strong>تعليق (مدارك):</strong> قابلية الرومي للتسويق &ldquo;عالميًا&rdquo; تجعل خطابه يُستعمل أحيانًا بلا سياقه العقدي والتاريخي، أو يُحوّل إلى شعارات سلام عامة. المطلوب نقد هادئ: احترام التاريخ، وعدم صناعة قداسة &ldquo;مفاهيمية&rdquo; خارج ميزان النصوص، وألا تتحول الفعاليات إلى منصات صراع هوياتي بين المسلمين أنفسهم .</p>
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
      <Subfooter visible={footerVisible} pdfHref="/5.pdf" />
    </main>
  );
}
