"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function LibraryPage() {
  const issueTitle = "عصارة الكتب";
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
                <div className={styles.paperBadge}>عصارة الكتب</div>
                <h2 className={styles.paperTitle2}>مراجعة كتاب البدع الحولية للشيخ عبد الله بن عبد العزيز التويجري ( فصل شهر رجب ) </h2>
              </header>
              <div className={styles.paperContent2}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/8.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 900px) 94vw, 320px"
                      priority
                    />
                  </div>
                </div>
                <div className={styles.paperText}>
                  <h3 className={styles.paperSubtitle}>المبحث الأول: بعض الآثار الواردة فيه</h3>
                  <p>يعرض المؤلّف جملةً من الآثار التي شاعت في فضل شهر رجب، ويدور كثيرٌ منها حول تعظيمه بالصيام أو ادّعاء خصوصيةٍ تعبّديةٍ فيه. ثم يُخضع هذه المرويات للتمحيص من جهة الثبوت والدلالة، فيُبين أن كثيرًا مما يُتداول في &ldquo;فضل رجب&rdquo; لا يثبت على قواعد أهل الحديث، وأن الاحتجاج به لإحداث عباداتٍ مخصوصةٍ أو شعائرَ موسميةٍ لا يستقيم. ويستوقف المؤلف ما وقع من السلف في إنكار صورةٍ بعينها: وهي تعامل العامة مع صوم رجب كأنه فريضةٌ لازمة، حتى نقل آثارًا عن إنكار بعض الصحابة على من يُظهر ذلك أو يُشِيعُه، لئلا تتحول النافلة إلى شعارٍ يُشبه الواجب. وخلاصة هذا المبحث عنده: أن رجبًا من الأشهر الحرم التي تُحترم حرمتها، لكن دون أن يُشرع تخصيصه بعبادةٍ بعينها لم يدلّ عليها دليل صحيح صريح.</p>
                  <h3 className={styles.paperSubtitle}>المبحث الثاني: ويحتوي على مطلبين</h3>
                  <h3 className={styles.paperSubtitle}>المطلب الأول: تعظيم الكفار لشهر رجب</h3>
                  <p>يفصّل المؤلف في خلفية تعظيم رجب في الجاهلية، وكيف ارتبط عند بعض الأمم أو الأقوام بطقوسٍ وعوائد ومبالغاتٍ موسمية؛ فيُبرز أن &ldquo;التعظيم&rdquo; قد ينقلب إلى تديّنٍ مصنوع إذا لم يُضبط بالوحي، وأن بعض مظاهر التعظيم القديمة كانت ذات طابعٍ اجتماعي أو اعتقادي لا علاقة له بالتوقيف الشرعي. ويهدف من ذلك إلى تنبيه القارئ إلى خطورة استيراث الموروثات وتديينها، حتى لو كانت في ظاهرها &ldquo;تعظيمًا لشهرٍ حرام&rdquo;.</p>
                  <h3 className={styles.paperSubtitle}>المطلب الثاني: عتيرة رجب</h3>
                  <p>ينتقل المؤلف إلى &ldquo;العتيرة&rdquo; بوصفها ذبيحة كانت تُذبح في رجب في الجاهلية تقرّبًا. ثم يعرض أقوال العلماء في تفسيرها، ويمرّ على موضع الخلاف في حكمها بعد الإسلام، مركزًا على النصوص الواردة في نفيها، وعلى أوجه الجمع والترجيح، وهل نُسخت أو بقيت على الإباحة بلا استحبابٍ خاص. ويُبرز أن تحويلها إلى شعيرةٍ سنوية لازمة يفتح باب الإحداث، وأن العبرة ليست بوجود الذبح مطلقًا، بل بدعوى &ldquo;خصوصية رجب&rdquo; وإلزام الناس بها أو تفضيلها على وجهٍ تعبدي.</p>
                  <h3 className={styles.paperSubtitle}>المبحث الثالث: بدعة تخصيصه بالصيام أو القيام، وحكم العمرة فيه والزيارة الرجبية</h3>
                  <p>يفرّق المؤلف بين عبادةٍ تقع في رجب اتفاقًا (كمن يصوم الإثنين والخميس أو يصوم من كل شهرٍ أيامًا) وبين عبادةٍ تُربط برجب على أنها &ldquo;سُنّة رجبية&rdquo; ثابتة. فيقرر أن تخصيص رجب بالصيام أو قيام الليل على وجه الاعتقاد بفضيلةٍ مخصوصةٍ لم يثبت دليلها هو من أبواب البدع الإضافية؛ لأن أصل العبادة مشروع، لكن تقييدها بزمانٍ على أنه مقصود شرعًا يحتاج إلى برهان.</p>
                  <p>ثم يناقش العمرة في رجب: هل لها مزيةٌ مخصوصة؟ فيذكر أن العمرة مشروعة في الجملة، وأن وقوعها في رجب لا يجعلها &ldquo;شعيرة رجبية&rdquo; تُقصد لذاتها، ولا يُبنى عليها خطاب تعبدي خاص.</p>
                  <p>أما &ldquo;الزيارة الرجبية&rdquo; فيتناولها المؤلف بوصفها نمطًا من تحويل الأزمنة إلى مواسم لزياراتٍ مخصوصةٍ تُؤدى بآداب وأوراد واعتقادات معيّنة، فيحذر من توسيع أبواب المواسم بلا دليل، لأن ذلك يفضي إلى تديّنٍ طقوسي يزداد مع الزمن ويصعب ضبطه.</p>
                  <h3 className={styles.paperSubtitle}>المبحث الرابع: بدعة صلاة الرغائب</h3>
                  <p>يعرّف المؤلف صلاة الرغائب كما اشتهرت: تُفعل في أول جمعة من رجب، بين المغرب والعشاء، مع صيام نهارها، وهي صلاة ذات هيئةٍ مخصوصة وأذكارٍ مروية في أخبارٍ طويلة. ثم يقرر أن أصلها قائمٌ على حديثٍ موضوع، وأن هذه الصلاة لم تُعرف في القرون المفضّلة ولا عُمل بها عن الصحابة ولا التابعين، وأن ظهورها كان متأخرًا. ويضيف أن خطورتها لا تتوقف عند ضعف دليلها، بل تتعدى إلى آثارها الاجتماعية والدينية: تغرير العامة، وإلباس البدعة لباس السنة، وتزاحمها مع الفرائض والسنن الثابتة، وتحويل العبادة إلى &ldquo;احتفال&rdquo; له طقوس ثابتة تُتلقّى بالتسليم لا بالدليل.</p>
                  <h3 className={styles.paperSubtitle}>المبحث الخامس: بدعة الاحتفال بليلة الإسراء والمعراج</h3>
                  <p>يعالج المؤلف مسألة تحديد الليلة: ويقرر أن الأقوال في تعيينها متشعبة ومختلفة، ولم يثبت دليلٌ قاطع يحددها على وجهٍ يُشرع معه اتخاذها موسمًا. ثم ينتقل إلى حكم الاحتفال: فيقرر أن العبادات مبناها على التوقيف، وأن اتخاذ الليلة موسمًا اجتماعيا للذكر والقيام والاحتفالات هو من إحداث &ldquo;مواسم&rdquo; لم يشرعها الله، وأن الخير كل الخير في متابعة هدي النبي ﷺ وأصحابه؛ إذ لو كان في تخصيصها عبادةٌ راجحة لسبقوا إليها. ويشير كذلك إلى ما يقع عادةً في مثل هذه التجمعات من مخالفاتٍ تابعة: اختلاط، ومظاهر زينةٍ وشعاراتٍ وطقوسٍ تُنسب للدين بلا مستند. وخلاصة المبحث: تعظيم حادثة الإسراء والمعراج يكون بالاعتقاد الصحيح واتباع السنة، لا بصناعة احتفالٍ موسمي يضيف للدين ما ليس منه.</p>
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
      <Subfooter visible={footerVisible} pdfHref="/9.pdf" />
    </main>
  );
}
