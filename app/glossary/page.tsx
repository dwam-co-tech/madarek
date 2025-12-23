"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function GlossaryPage() {
  const issueTitle = "قاموس المصطلحات";
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
                <div className={styles.paperBadge}>قاموس المصطلحات</div>
                <h2 className={styles.paperTitle2}>مفهوم الحَضْرَة (عند المتصوِّفة)</h2>
              </header>
              <div className={styles.paperContent2}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/2.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                  </div>
                </div>
                <div className={styles.paperText}>
                  <p>تُستعمل كلمة <strong>الحَضْرَة</strong> في العربية استعمالًا واسعًا، يدلّ في أصله على <strong>الحضور</strong> والوجود والمشاهدة، ثم نُقلت في سياقات متعددة إلى معانٍ اصطلاحية تُلبِس اللفظَ ثوبًا جديدًا بحسب البيئة التي تتداوله. وعند المتصوفة صارت “الحضرة” عنوانًا على <strong>مجلس ذِكرٍ جماعيّ</strong> تُتلى فيه الأذكار والصلوات والإنشاد، وقد يُلحق بها ما يسمّونه “الوجد” و“التحريك” و“التمايل”، بل وقد تدخل فيها آلات السماع عند بعض الطوائف، ويُنظر إليها لديهم على أنها لحظة “<strong>حضور القلب</strong>” أو “<strong>حضور المعنى</strong>” أو “<strong>حضور الشيخ</strong>” أو “<strong>حضور الروحانية</strong>” — على اختلاف مدارسهم وتعبيراتهم.</p>
                  <p>غير أنّ التحقيق العلمي يقتضي التفريق بين <strong>الحضور الشرعيّ</strong> الذي هو حضور القلب مع الله في الصلاة والذكر المشروعين، وبين <strong>الصورة المحدثة</strong> التي صارت تُعرف عند المتأخرين باسم “الحضرة” بما تشتمل عليه من هيئاتٍ مخصوصة واجتماعاتٍ منضبطة بإيقاع واحد وصوت واحد، أو تلازمها طقوس الانفعال الحركي والتمايل والاصطياح. فالمسألة ليست في “ذكر الله” من حيث هو ذكر، وإنما في <strong>الهيئة</strong> و<strong>الطريقة</strong> و<strong>الالتزام</strong> وادّعاء الخصوصية الدينية لها.</p>
                  <p>ومن أهم ما ينبغي تقريره هنا: أنّ أعمال القُرَب في الشريعة مبناها على <strong>الاتباع</strong>، وأن إضافة “كيفيّة” أو “تعيين هيئة” لم تُعرف عن السلف ثم جعلها شعارًا لازمًا للعبادة — هو من أبواب <strong>البدع الإضافية</strong> عند المحققين. وقد نبّه الإمام الشاطبي إلى هذا المعنى عند حديثه عن صورٍ من الذكر الجماعي المقيّد بهيئة واحدة، وذكر مثال <strong>الاجتماع على الذكر “بصوتٍ واحد” وعلى “لسانٍ واحد”</strong> بوصفه طريقًا محدثًا ليس من عمل السلف، وإن كان أصل الذكر مشروعًا. فالقضية: هل جُعلت العبادة على صفةٍ مخصوصة تُتخذ دينًا؟ أم ذُكِر الله على الوجه المشروع بلا التزام هيئةٍ مبتدعة؟</p>
                  <p>ثم إن تسمية “الحضرة” في التاريخ الصوفي ارتبطت — في كثير من البيئات — بتكوين “مجالس” لها نظام ثابت: افتتاح معيّن، أوراد معيّنة، تدرّج في الإيقاع، ثم “ختم” معيّن، وأحيانًا تُربط هذه المجالس بمناسبات وموالد وزيارات، فتتحول من الذكر المشروع إلى <strong>مظهر اجتماعي ديني</strong> تُضفى عليه قداسة وخصوصية، وتُقاس به ديانة العامّة: من حضر “الحضرة” فهو “أكمل حالًا”، ومن لم يحضرها فهو “محجوب”! وهنا يتحول الأمر من عبادة فردية مشروعة إلى <strong>بنية طقسية</strong> تحمل في جوفها بذور الغلوّ: غلوّ في الأشخاص، وغلوّ في الآثار، وغلوّ في هيئاتٍ لم يأذن بها الله.</p>
                  <p>ومن جهةٍ أخرى، فإن باب “الحضرة” كان — تاريخيًا وواقعيًا — أحد المنافذ التي يدخل منها الخلط العقدي على العامّة؛ لأن هذه المجالس إذا ضعفت فيها سلطة العلم والتمييز، صارت قابلة لاستيراد مفاهيم دخيلة تحت لافتة “المحبة” و“الولاية” و“أسرار آل البيت”، ثم تُمرَّر عبر إنشادٍ عاطفيّ لا يملك كثير من الحاضرين أدوات نقده. وليس المقصود اتهام كل من حضر مجلس ذكر، بل المقصود التحذير من <strong>قابلية هذه البيئات</strong> للاختراق حين تُدار بالعاطفة لا بالعلم، وبالانفعال لا بالاتباع، وبالتقليد الأعمى لا بالبرهان. ومن هنا كان واجب أهل العلم أن يردّوا الناس إلى ميزانٍ واضح: <strong>الذكر المشروع ثابت</strong>، وأما تديين الهيئات المحدثة وإلزام الناس بها وإضفاء القداسة عليها فمردود.</p>
                  <p>ولأجل ذلك، فإن الموقف السنيّ الحديثيّ الرصين لا يُخاصم أصل الذكر، ولا يحارب محبة الصالحين، لكنه يُنكر أن تُجعل “الحضرة” نظامًا تعبديًا لازمًا يُقدَّم على السنة أو يُوازِيها، ويُنكر ما لحق بها من صور السماع المحدث أو التحريك أو الصياح أو دعوى سقوط التكاليف أو تعظيم الأشخاص بما لا يليق إلا بالله. وقد أشار شيخ الإسلام ابن تيمية إلى أن <strong>السماع المحدث</strong> لم يكن معروفًا في القرون الفاضلة، وأنه لما اشتهر بين طوائف من المتأخرين وقع بسببِه من الفتن والخلل ما هو معروف، ورجع عنه بعض من جرّبه لما تبينت عواقبه. وخلاصة المنهج: <strong>نزن الأعمال بالوحي، لا بالمواجيد</strong>؛ وبالسنة، لا بالعوائد؛ وبالعلم، لا بالتهيج العاطفي.</p>
                  <p>وبهذا يتبين أن “الحضرة” في صورتها الشائعة اليوم ليست مجرد لفظ بريء، بل عنوانٌ على <strong>ممارسة مخصوصة</strong> تحتاج تفصيلًا: فما وافق السنة قُبل، وما خالفها رُدّ، وما التبس على الناس فميزانه سؤال أهل العلم والرجوع إلى طريقة السلف في الذكر والعبادة: صفاءً وبساطةً وخشوعًا… بلا ضجيجٍ يُتخذ دينًا، ولا طقوسٍ تُحجب بها السنن.</p>
                  <div className={styles.paperSources}>
                    <p>________________________________________</p>
                    <p>المصادر</p>
                    <ol>
                      <li>الإمام الشاطبي، الاعتصام، ج2، ص69 (التنبيه على هيئة الاجتماع على الذكر بصوت/لسان واحد).</li>
                      <li>الإمام الشاطبي، الاعتصام، ج2، ص99 (ذكر أحوال طوائف من المتصوفة وما أحدثوه من طرائق).</li>
                      <li>ابن تيمية، مجموع الفتاوى، ج11، ص592 (في السماع المحدث وكونه لم يكن في القرون المفضلة وذكر الرجوع عنه).</li>
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
      <Subfooter visible={footerVisible} pdfHref="/2.pdf" />
    </main>
  );
}
