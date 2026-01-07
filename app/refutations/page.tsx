"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../editorial-opening/page.module.css";
import Subheader from "../components/Subheader";
import Subfooter from "../components/Subfooter";
import { getIssue, getIssueArticles } from "../lib/issues.service";
import type { ArticleDTO } from "../lib/issues.model";

export default function RefutationsPage() {
  const issueTitle = "شبهات تحت المجهر";
  const numberFmt = Intl.NumberFormat("ar-EG", { useGrouping: false });
  const hijriYear = numberFmt.format(1447);
  const gregYear = numberFmt.format(2025);
  const dateLabel = `رجب ${hijriYear} هـ - ديسمبر ${gregYear}م`;
  const [footerVisible, setFooterVisible] = useState(false);
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [articles, setArticles] = useState<ArticleDTO[]>([]);
  const [imageSrc, setImageSrc] = useState<string>("/cover.jpg");
  const [pdfHref, setPdfHref] = useState<string>("");
  const primaryTitle = articles[0]?.title ?? "مفهوم التوحيد بين التقرير الشرعي والانحراف الصوفي";
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
    const id = typeof window !== "undefined" ? localStorage.getItem("selectedIssueId") : null;
    if (!id) return;
    (async () => {
      try {
        const [list, detail] = await Promise.all([getIssueArticles(id), getIssue(id)]);
        const arr = Array.isArray(list) ? list : [];
        const wanted = arr.filter((a) => (a.className ?? "").trim() === "arc-refutations");
        setArticles(wanted);
        setPdfHref(detail.pdf_file ?? "");
        const first = wanted[0] ?? arr[0];
        const img = first?.featured_image || detail.cover_image || "/cover.jpg";
        setImageSrc(img || "/cover.jpg");
      } catch {
        setArticles([]);
        setPdfHref("");
        setImageSrc("/cover.jpg");
      }
    })();
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
                <div className={styles.paperBadge}>شبهات تحت المجهر</div>
                <h2 className={styles.paperTitle2}>{primaryTitle}</h2>
              </header>
              <div className={styles.paperContent2}>
                <div className={styles.paperImage}>
                  <div className={styles.photoFrame}>
                    <Image
                      src={imageSrc}
                      alt="صورة المقال"
                      fill
                      sizes="(max-width: 640px) 96vw, (max-width: 900px) 94vw, (max-width: 1200px) 32vw, 360px"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                </div>
                </div>
                <div className={styles.paperText}>
                  {articles.length === 0 ? (
                    <p>لا توجد مقالات لهذا القسم في العدد المختار.</p>
                  ) : (
                    (() => {
                      const a = articles[0];
                      return (
                        <article key={a.id}>
                          <h3 className={styles.paperSubtitle}>{a.title}</h3>
                          {a.content ? <div dangerouslySetInnerHTML={{ __html: a.content }} /> : null}
                        </article>
                      );
                    })()
                  )}
                  <p>ولو كان التوحيد المقصود في خطاب الوحي هو مجرد الإقرار بأن الله هو الخالق الرازق المدبر، لما كان لبعثة الرسل معنى؛ لأن هذا القدر من الإقرار كان حاصلاً عند الأمم التي بعث فيهم الأنبياء؛ وقد أخبر القرآن أن المشركين كانوا يقرون بأن الله هو الخالق الرازق المدبر، كما قال تعالى: ﴿وَلَئِنْ سَأَلْتَهُمْ مَنْ خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ لَيَقُولُنَّ اللَّهُ﴾ [لقمان: ٢٥]، وقوله تعالى: ﴿قُلْ مَنْ يَرْزُقُكُمْ مِنَ السَّمَاءِ وَالْأَرْضِ أَمَّنْ يَمْلِكُ السَّمْعَ وَالْأَبْصَارَ وَمَنْ يُخْرِجُ الْحَيَّ مِنَ الْمَيِّتِ وَيُخْرِجُ الْمَيِّتَ مِنَ الْحَيِّ وَمَنْ يُدْبِرُ الْأَمْرَ، فَسَيَقُولُونَ اللَّهُ فَقُلْ أَفَلَا تَتَّقُونَ﴾ [يونس: ٣١]، وقوله تعالى: ﴿قُلْ مَنْ بِيَدِهِ مَلَكُوتُ كُلِّ شَيْءٍ وَهُوَ يُجِيرُ وَلَا يُجَارُ عَلَيْهِ إِنْ كُنْتُمْ تَعْلَمُونَ، سَيَقُولُونَ لِلَّهِ قُلْ فَأَنَّى تُسْحَرُونَ﴾ [المؤمنون: ٨٨ - ٨٩]؛ ومع ذلك لم يعدهم موحدين؛ بل وصفهم بالشرك، وقاتلهم النبي ﷺ على هذا الأساس، وهذا يدل دلالة قاطعة على أن التوحيد الذي جاءت به الرسل ليس هو توحيد الربوبية وحده، وإنما توحيد العبادة، أي إفراد الله بجميع أنواع القصد والتقرب.</p>
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
      <Subfooter visible={footerVisible} pdfHref={pdfHref || "/"} />
    </main>
  );
}
