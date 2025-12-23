"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function DocumentsLecturesPage() {
  const issueTitle = "خزّانة الوثائق ";
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
      <Subheader issueTitle={issueTitle} dateLabel={dateLabel} />
      <section className={styles.contentArea}>
        <div className={styles.paperSection} aria-label="عرض المقال داخل صفحة ورقية">
          <div className={styles.paper}>
            <div className={styles.paperInner}>
              <header className={styles.paperHeader}>
                <div className={styles.paperBadge}>خزّانة الوثائق </div>
                <h2 className={styles.paperTitle}>قراءة نقدية لكتاب التجليات لابن عربي </h2>
              </header>
              <div className={styles.paperContent}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/9.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                      style={{ objectFit: "cover" }}
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  <p>يُعدّ كتاب &ldquo;التجلّيات الإلهية&rdquo; لمحيي الدين ابن عربي جزءًا من المشروع الأكبر الذي يقدّم فيه &ldquo;التجربة الذوقية/الكشفية&rdquo; بوصفها طريقًا لفهم العالم والإنسان والمعنى الديني. وتزداد الحاجة إلى قراءة نقدّية لهذا الكتاب من زاوية أهل السنة والجماعة ومنهج السلف؛ لأن الإشكال هنا ليس في أصل &ldquo;التجلّي&rdquo; بمعناه القرآني العام (إظهار الله آياته لعباده، أو انكشاف بعض الحقائق للقلوب في حدود الشرع)، وإنما في الانتقال بالتجربة الذوقية إلى مقام التقرير العقدي، وصياغة عباراتٍ تحتمل—أو تُفضي—إلى تمييع الفاصل بين الخالق والمخلوق.</p>
                  <h3 className={styles.paperSubtitle}>أولًا: المنهج المعرفي في &ldquo;التجلّيات&rdquo; بين الوحي والذوق</h3>
                  <p>النص نفسه يُبنى على خطاب &ldquo;التجلّي&rdquo; كمشهد داخلي يمرّ فيه الإنسان بحالات تشبه—في التعبير—مشاهد الآخرة: &ldquo;تمرض في هذا التجلي وتموت وتحشر وتنشر…&rdquo;</p>
                  <p>وهنا موضع النقد السني الدقيق: الآخرة خبرٌ غيبيّ طريقه الوحي، ولا يجوز جعل &ldquo;التجربة الوجدانية&rdquo; معيارًا لإثبات تفاصيلها أو إعادة تعريفها. نعم، قد يذكّر الله العبد بالموت ويبعث فيه الخوف والرجاء، لكن تحويل ذلك إلى &ldquo;قيامة صغرى&rdquo; بمشهدية تفصيلية قد يُنتج بابًا مفتوحًا للدعاوى: كل صاحب حال يقدّم &ldquo;نسخته&rdquo; من الغيب، ثم يطلب من الناس التسليم لها باعتبارها معرفة &ldquo;أعلى&rdquo; من الدليل.</p>
                  <p>واللافت أن أحد مواقع نشر النص يُصرّح بأن بعض هذه المواد غير محققة وغير مدققة؛ وهذا يزيد وجوب الاحتياط العلمي في النقل والاستدلال، فضلًا عن البناء العقدي على نصّ قد لا يكون مضبوطًا ضبطًا نقديًا.</p>
                  <h3 className={styles.paperSubtitle}>ثانيًا: &ldquo;المعية&rdquo; بين تفسير السلف وتوسّع القراءة الوجودية</h3>
                  <p>من أكثر المقاطع حساسية ما يورده ابن عربي في &ldquo;تجلّي المعية&rdquo;، حيث يجعل الإنسان &ldquo;نسخة جامعة للموجودات&rdquo; ثم يوجّه خطابًا وجوديًا للمخلوق:</p>
                  <p>&ldquo;نامعك بكليتي… وانا معك بالذات ومع غيرك بالعرض&rdquo;</p>
                  <p>هذه العبارة—على ظاهرها—تُشعر بتضخيم &ldquo;الذات الإنسانية&rdquo; إلى حدّ يجعلها تتعامل مع الموجودات بنوع من المعية الذاتية، وهي صياغة تُقلق ميزان التوحيد إذا لم تُقيَّد بقيود الشرع واللغة.</p>
                  <p>منهج السلف في آية: &#123;وهو معكم أينما كنتم&#125; هو: معكم إنما تثبت المعية على ما يليق بالله: علمًا وإحاطةً ونصرًا وتأييدًا، بلا حلولٍ ولا اتحادٍ ولا ذوبان للفاصل بين الرب والعبد. وعليه: أي قراءة تجعل &ldquo;المعية&rdquo; معيةً وجودية تُلمح إلى امتزاجٍ أو حلولٍ—ولو باللوازم—تحتاج إلى ردٍّ صريح: الخالق غير المخلوق، ووجود الله ليس كوجود خلقه، ولا تُبنى العقيدة على عبارات موهمة تُؤوَّل بعد ذلك بتأويلات متكلّفة.</p>
                  <p>ولهذا نجد علماء السنة—وخاصة من اشتدّ نقدهم لمقولات &ldquo;الاتحادية&rdquo;—يفصّلون في فساد قول من يجعل &ldquo;وجود الكائنات هو عين وجود الله&rdquo; ويعدونه انقلابًا على أصل التوحيد.</p>
                  <h3 className={styles.paperSubtitle}>ثالثًا: مصادرة النصوص الشرعية لصالح &ldquo;الكشف&rdquo;</h3>
                  <p>يظهر في بعض التجليات حديث عن &ldquo;سريان الحق في الشرائع&rdquo; و&ldquo;ارتفاع الكذب منها&rdquo; ضمن سياق الكشف والتجلي.</p>
                  <p>والنقد هنا منهجي: الشريعة عند أهل السنة محفوظة بأصولها، وتمييز صحيحها من سقيمها يكون بأدوات العلم المعروفة (قرآن، سنة، إجماع، لغة، أصول)، لا بأن يزعم صاحب كشفٍ أنه &ldquo;يُري&rdquo; ما في الشرائع من حق وباطل على نحو استعلائي فوق الدليل. فالكشف—إن وقع—غاية ما يكون: بشارة خاصة لصاحبها لا &ldquo;حجة عامة&rdquo; على غيره.</p>
                  <p>ومن هنا يتقاطع كتاب &ldquo;التجلّيات&rdquo; مع الإشكال الأشهر في خطاب ابن عربي عمومًا: تحويل الذوق إلى &ldquo;سلطة معرفية&rdquo; تقرر في التوحيد والوجود، وهو ما جعل طائفة من كبار أهل العلم تنتقده نقدًا شديدًا، وتربط بعض عباراته بمقولات باطلة كـ&ldquo;قدم العالم&rdquo; أو &ldquo;الاتحاد&rdquo;، كما نقل عن أئمة في ترجمته.</p>
                  <p>فليس المقصود من هذه القراءة مصادرة كل حديث عن تزكية النفس أو الإحسان، ولا إنكار ما قد يقع لبعض الصالحين من إلهامٍ يوافق الشرع. المقصود هو تثبيت القاعدة السلفية الصارمة:</p>
                  <ol>
                    <li>العقيدة تُؤخذ من الوحي لا من الأحوال.</li>
                    <li>الغيب توقيفي لا يُعاد تشكيله بتجارب وجدانية.</li>
                    <li>ألفاظ موهمة في باب الأسماء والصفات والمعية لا تُترك بلا ضبط؛ فإن أفضت للاتحاد/الحلول رُدت، وإن احتملت حقًا قُيّدت بحدود الشرع.</li>
                  </ol>
                  <p>بهذا المعنى، يصبح &ldquo;التجلّيات&rdquo; نصًا يحتاج قارئه إلى فقهٍ مزدوج: فقهٍ لغوي يميّز المجاز من الحقيقة، وفقهٍ عقدي يمنع تسريب المصطلحات إلى أبواب التوحيد بلا قيد؛ وإلا انقلب &ldquo;الوجد&rdquo; إلى &ldquo;مذهب&rdquo;، و&ldquo;الذوق&rdquo; إلى &ldquo;دين بديل&rdquo;.</p>
                  <p>________________________________________</p>
                  <h3 className={styles.paperSubtitle}>المصادر:</h3>
                  <div className={styles.paperSources}>
                    <ol>
                      <li>محيي الدين ابن عربي، التجليات الإلهية (نص إلكتروني منشور ضمن &ldquo;المكتبة الأكبرية&rdquo; – موقع ابن عربي)، تجلّي المعية، يتضمن عبارة: &ldquo;نامعك بكليتي… وانا معك بالذات…&rdquo;</li>
                      <li>ابن تيمية، مجموع الفتاوى ، مبحث &ldquo;حقيقة ما تضمنه كتاب الفصوص&rdquo; ومباحث &ldquo;حقيقة قول الاتحادية&rdquo; في جعل وجود الكائنات عين وجود الله.</li>
                      <li>الذهبي، سير أعلام النبلاء (نص مكتبة إسلام ويب)، ترجمة محيي الدين ابن عربي، ونقولات النقد الشديد من بعض الأئمة في حقه.</li>
                      <li>إبراهيم بن عمر البقاعي، مصرع التصوف (ويضم: تنبيه الغبي إلى تكفير ابن عربي وتحذير العباد من أهل العناد ببدعة الاتحاد)، تحقيق عبد الرحمن الوكيل.</li>
                      <li>ابن عربي، التجليات الإلهية، تحقيق عثمان يحيى، طهران: مركز نشر دانشگاهي، 1988 (بيانات النشر كما تظهر في بطاقة أرشيف الإنترنت للطبعة المصورة).</li>
                    </ol>
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
      <Subfooter visible={footerVisible} shareText={issueTitle} pdfHref="/7.pdf" />
    </main>
  );
}
