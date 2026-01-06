"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";

export default function EditorialOpening() {
  const issueTitle = "افتتاحية العدد";
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
                <div className={styles.paperBadge}>افتتاحية العدد</div>
                <h2 className={styles.paperTitle2}>الطرق الصوفية تحتفل بمولد السيدة فاطمة رضي الله عنها مع استغلال الشيعة للحدث </h2>
              </header>
              <div className={styles.paperContent2}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src="/1.jfif"
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 640px) 96vw, (max-width: 900px) 94vw, (max-width: 1200px) 32vw, 360px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>
                </div>
                <div className={styles.paperText}>
                  <p>
                  لا يختلف أهل السنة والجماعة في أصلٍ كبيرٍ من أصول الديانة: محبة آل بيت النبي ﷺ وتعظيم قدرهم الشرعي، وفي مقدمتهم السيدة فاطمة الزهراء رضي الله عنها. لكن الإشكال لا يبدأ من “المحبة” بوصفها معنىً قلبيًا مشروعًا، وإنما يبدأ حين تتحول هذه المحبة إلى مواسم ثابتة تُعامل معاملة الشعائر، ثم تُفتح أبوابها - بحسن قصد أو بسوء تدبير - لتصبح مجالًا رحبًا لـ الترويج العقدي المذهبي، حيث تتسلل سرديات لا تمت إلى منهج أهل السنة بصلة، مستندةً إلى حرارة العاطفة عند العامة أكثر من استنادها إلى برهان العلم.
                  </p>
                  <h3 className={styles.paperSubtitle}>
                  ما الذي تكشفه الأخبار عن طبيعة الموسم؟
                  </h3>
                  <p>تُظهر الأخبار المتداولة أن الاحتفال اتخذ صورة “الموسم” الذي يجتمع فيه المريدون والأتباع على تلاواتٍ وأناشيد ومدائح وحلقات ذكر، مع كلماتٍ تُقرر في ظاهرها فضل آل البيت ومكانتهم.</p>
                  <p>ففي خبر “الطريقة الشبراوية” جاء نصًا أن الاحتفال وقع يوم الجمعة 12 ديسمبر 2025، مع حضورٍ كبير من المنتسبين ومحبي آل البيت، وتقدّم الحضور الشيخ محمد عبد الخالق الشبراوي الذي شارك حلقات الذكر وألقى كلمة عن “قيم التضحية والصبر والطهارة”.</p>
                  <p>وفي خبرٍ آخر، شاركت الطريقة الرفاعية ممثلةً في الشيخ طارق ياسين، والطريقة الجازولية الشاذلية ممثلةً في الدكتور سالم جابر الجازولي، في احتفالٍ أُقيم الإثنين 22 سبتمبر 2025 بمسجد ومقام “السيدة فاطمة النبوية”، مع إبراز “تعالي الأصوات بالمدائح والأذكار” وتأكيد أن الاحتفال تجديد لمعاني الولاء والمحبة.</p>
                  <p>كما وُثق انعقاد احتفالٍ بمولد السيدة فاطمة الزهراء في مقر مشيخة الطريقة العزمية بالقاهرة يوم الخميس 11 ديسمبر 2025.</p>
                  <p>هذه اللوحة مجتمعة تُثبت أننا أمام مناخ احتفالي واسع: جمهور كبير، خطاب وجداني، تكرار سنوي، وأسماء طرق وشيوخ بارزين.</p>
                  <p>وهنا تحديدًا تتولد “المساحة الرمادية”: مساحةٌ يُمكن أن تُوظَّف فيها العاطفة الدينية توظيفًا لا يخدم العلم ولا يخدم وحدة المسلمين على المنهج الصحيح.</p>
                  <h3 className={styles.paperSubtitle}>
                  لماذا يخاف أهل السنة من “التوظيف الشيعي” تحديدًا؟
                  </h3>
                  <p>السبب ليس “وهمًا” ولا “خصومةً مجانية”، بل هو قراءة واقعية لمسارٍ معروف: الرموز الجامعة - وفي مقدمتها آل البيت - تُستخدم أحيانًا كجسرٍ لتصدير سرديات عقدية خاصة بالمذهب الإمامي، ثم تُقدَّم تدريجيًا لعامة المتدينين على أنها “محبة آل البيت”، بينما هي في حقيقتها انتقالٌ ناعم من المحبة المشروعة إلى مقولاتٍ مرفوضة عند أهل السنة (كإعادة ترتيب التاريخ الإسلامي، والطعن في بعض الصحابة، وإعادة تعريف المرجعية الدينية).</p>
                  <p>والشاهد المهم:</p>
                  <p>أن مؤسسات ووسائل إعلام مرتبطة بالسياق الإيراني - وهو سياق شيعي اثنا عشري واضح - تُعرّف ميلاد السيدة فاطمة الزهراء بأنه مناسبة ذات وظيفة عامة في إيران، حتى جُعل في الخطاب الرسمي والإعلامي يومًا للمرأة والأم مرتبطًا مباشرةً بهذه الذكرى.</p>
                  <p>فالمسألة ليست مجرد “احتفال ديني”، بل هي هوية رمزية تُستثمر سياسيًا وثقافيًا. وإذا كان هذا التوظيف قائمًا في بيئته الأصلية، فكيف لا يُخشى انتقاله - بصيغ أكثر نعومة - إلى البيئات التي تُقام فيها مواسم جماهيرية مفتوحة؟</p>
                  <p>ويزداد القلق حين نقرأ وقائع سابقة حول حضور دبلوماسي ثقافي إيراني لاحتفال الطريقة العزمية بمولد السيدة فاطمة الزهراء، مع تأكيده أن حضوره “شخصي”.</p>
                  <p>سواء اتفقنا مع تفسير هذه الواقعة أو اختلفنا، فهي تكفي لتقرير حقيقة واحدة: أن المناسبة محل اهتمامٍ من خارج الدائرة الصوفية المحلية، وأن باب “التواصل الرمزي” يُطرق بالفعل.</p>
                  <h3 className={styles.paperSubtitle}>
                  أين تكون الثغرة؟ 
                  </h3>
                  <p>الثغرة الأكبر ليست في كلماتٍ جميلة تُقال عن فضل الزهراء رضي الله عنها فهذا حق وإنما في أمرين:</p>
                  <ol>
                    <li>تحويل المحبة إلى موسمٍ تعبديٍّ راتب بلا تأصيلٍ واضح من هدي السلف؛ فتتحول المناسبة مع الزمن إلى “شعيرة” في وجدان العامة، يُظن أنها من الدين بذاتها.</li>
                    <li>الخلط بين المقامات والأسماء: فالأخبار نفسها تذكر احتفالًا بمولد “فاطمة النبوية” (وهي تسمية مرتبطة بمقام محلي) إلى جانب الاحتفاء بفاطمة الزهراء رضي الله عنها.</li>
                  </ol>
                  <p>وهذا الخلط -حين لا يُضبط علميًا - يسهّل على أي خطاب مذهبي أن يذيب الفوارق، ثم يمرّر رسائل مختارة تحت عنوان واحد جذّاب: “حب فاطمة”.</p>
                  <p>ومن هنا يفهم منهج أهل السنة: الخوف ليس من ذكر فاطمة، بل من صناعة مناخٍ تتراجع فيه الحجة أمام العاطفة، وتُقدَّم فيه “الرمزية” على “المنهج”، فيصبح الجمهور سهلَ الالتقاط لأي سردية تُحسن استثمار الحب والدمعة والقصيدة.</p>
                  <h3 className={styles.paperSubtitle}>
                 ما المخرج العلمي الذي يحفظ المحبة ويغلق أبواب الاستغلال؟
                  </h3>
                  <p>المخرج ليس صدامًا مع الناس ولا تجريحًا لمشاعرهم، بل هو إعادة ضبط البوصلة:</p>
                  <ul>
                    <li>أن تُعلَّم فضائل السيدة فاطمة رضي الله عنها بأحاديث صحيحة وسيرة موثوقة، وتُقدَّم كنموذج عبادة وزهد وحياء وصبر، لا كعنوان موسم.</li>
                    <li>أن يُحذَّر - بلغة علمية - من كل ما يندس في هذه المواسم من خطابٍ يُعيد تعريف التاريخ أو يفتح أبواب السبّ والطعن، أو يقرر مفاهيم العصمة والإمامة بمعناها الإمامي.</li>
                    <li>أن تُردّ المحبة إلى “سنّة الاتباع”: من أحب آل البيت حقًا اتبع هدي النبي ﷺ في العبادة، ولم يجعل الدين مواسم مضافة بلا دليل.</li>
                  </ul>
                  <p>وبذلك تبقى المحبة في موضعها الشرعي، ويُسدّ الطريق على أي توظيف مذهبي يحاول أن يحوّل حب آل البيت إلى منصة لتمرير أطروحاتٍ عقدية دخيلة، خصوصًا في البيئات الجماهيرية التي يغلب عليها الوجدان على حساب التمحيص العلمي.</p>



                  <div className={styles.paperSources}>
                    <p>________________________________________</p>
                    <p>المصادر</p>
                    <ol>
                      <li>
                        <a href="https://www.dostor.org/5340648#goog_rewarded" target="_blank" rel="noopener noreferrer">
                          الدستور — &quot;الطريقة الشبراوية&quot; تحتفل بمولد السيدة فاطمة الزهراء
                        </a>
                      </li>
                      <li>
                        <a href="https://www.gomgad.com/52265" target="_blank" rel="noopener noreferrer">
                          الجمهورية الجديدة — الطريقة الرفاعية والجازولية تحييان مولد السيدة فاطمة النبوية
                        </a>
                      </li>
                      <li>
                        <a href="https://nabd.com/s/165126314-ece484/%D8%A7%D9%84%D8%B7%D8%B1%D9%8A%D9%82%D8%A9-%D8%A7%D9%84%D8%B4%D8%A8%D8%B1%D8%A7%D9%88%D9%8A%D8%A9-%D8%AA%D8%AD%D8%AA%D9%81%D9%84-%D8%A8%D9%85%D9%88%D9%84%D8%AF-%D8%A7%D9%84%D8%B3%D9%8A%D8%AF%D8%A9-%D9%81%D8%A7%D8%B7%D9%85%D8%A9-%D8%A7%D9%84%D8%B2%D9%87%D8%B1%D8%A7%D8%A1" target="_blank" rel="noopener noreferrer">
                          نبض — &quot;الطريقة الشبراوية&quot; تحتفل بمولد السيدة فاطمة الزهراء
                        </a>
                      </li>
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
                  {/* <span>مدارك</span> */}
                  <Image src="/logo3.png" alt="مدارك" width={62} height={62} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div ref={footerSentinelRef} className={styles.footerSentinel} />
      </section>

      {/* <div className={styles.actionsArea} aria-label="إجراءات الصفحة">
        <div className={styles.actionsInner}>
          <div className={styles.actionsRow}>
            <button type="button" className={`${styles.tabItem} ${styles.tabPrint}`} onClick={() => window.print()}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M6 7V3h12v4h3a1 1 0 0 1 1 1v8h-4v4H6v-4H2V8a1 1 0 0 1 1-1h3Zm2-2v2h8V5H8Zm8 12H8v2h8v-2Zm4-2V9H4v6h16Z"/>
              </svg>
              <span className={styles.tabLabel}>طباعة</span>
            </button>
            <button type="button" className={`${styles.tabItem} ${styles.tabShare}`} onClick={handleShare}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M18 8a3 3 0 1 0-5.9-.8L8.6 9.2a3 3 0 1 0 0 5.6l3.5 2a3 3 0 1 0 1.5-2.6l-3.5-2a3 3 0 0 0 0-2.4l3.5-2A3 3 0 0 0 18 8Z"/>
              </svg>
              <span className={styles.tabLabel}>مشاركة</span>
            </button>
            <a href="/magazine.pdf" download className={`${styles.tabItem} ${styles.tabPdf}`}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M5 20h14v-2H5v2Zm6-17h2v8l3-3 1.4 1.4-5.4 5.4-5.4-5.4L7 8l3 3V3Z"/>
              </svg>
              <span className={styles.tabLabel}>تحميل PDF</span>
            </a>
            <button type="button" className={`${styles.tabItem} ${styles.tabTranslate}`} onClick={handleTranslate}>
              <svg className={styles.tabIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 4h2.4c.2 1.4.7 2.6 1.4 3.7l-1.3 1c-.6-.9-1-1.8-1.3-2.7-.3.9-.8 1.8-1.3 2.7l-1.3-1c.7-1.1 1.2-2.3 1.4-3.7ZM6.3 14.5c1.9-.6 3.5-2 4.6-3.9.7 1.1 1.7 2.1 2.8 2.8-1.2 1.6-3 2.8-5 3.3-1.1.3-2.1.3-2.4-.2-.4-.6.1-1.6 0-2ZM16 12.7c-.9-.6-1.7-1.4-2.5-2.3 1.2-1 2.1-2.2 2.6-3.7h1.9c-.5 1.9-1.2 3.6-2.4 5.2l.4.3Z"/>
              </svg>
              <span className={styles.tabLabel}>ترجمة</span>
            </button>
          </div>
          <div className={styles.subpageArchive}>
            <Link href="/archive" className="action-btn action-archive">أرشيف المجلة</Link>
          </div>
        </div>
      </div> */}

      <Subfooter visible={footerVisible} shareText={issueTitle} pdfHref="/1.pdf" />
    </main>
  );
}
