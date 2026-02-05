"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../../components/Subheader";
import Subfooter from "../../components/Subfooter";
import { getIssue, getIssueArticles, getPublishedIssues } from "../../lib/issues.service";
import type { ArticleDTO, IssueDetailDTO } from "../../lib/issues.model";

// Section configuration - maps URL slug to className and title
const SECTIONS: Record<string, { className: string; title: string }> = {
    "editorial-opening": { className: "arc-opening", title: "افتتاحية العدد" },
    "glossary": { className: "arc-glossary", title: "قاموس المصطلحات" },
    "profiles": { className: "arc-profiles", title: "شخصيات صوفية" },
    "stats": { className: "arc-stats", title: "إحصائيات وتحليلات" },
    "news": { className: "arc-news", title: "الصوفية حول العالم" },
    "refutations": { className: "arc-refutations", title: "شبهات تحت المجهر" },
    "documents-lectures": { className: "arc-archive", title: "خزانة الوثائق" },
    "history": { className: "arc-history", title: "محطات تاريخية" },
    "library": { className: "arc-library", title: "عصارة الكتب" },
};

function stripLinks(html: string) {
    try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc.querySelectorAll("a").forEach((a) => a.replaceWith(a.textContent || ""));
        return doc.body.innerHTML;
    } catch {
        return html;
    }
}

function SectionPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const slug = params.slug as string;
    const section = SECTIONS[slug];

    // Priority: 1. URL query param, 2. localStorage, 3. fetch latest
    const issueIdParam = searchParams.get("issueId");

    const [footerVisible, setFooterVisible] = useState(false);
    const footerSentinelRef = useRef<HTMLDivElement | null>(null);
    const [articles, setArticles] = useState<ArticleDTO[]>([]);
    const [imageSrc, setImageSrc] = useState<string>("/cover.jpg");
    const [pdfHref, setPdfHref] = useState<string>("");
    const [issue, setIssue] = useState<IssueDetailDTO | null>(null);
    const [issueId, setIssueId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Section title and info
    const issueTitle = section?.title ?? "القسم";
    const primaryTitle = articles[0]?.open_title ?? articles[0]?.title ?? issueTitle;

    // Format date label from issue
    const dateLabel = (() => {
        if (!issue) return "";
        const hijri = issue.hijri_date?.trim() ?? "";
        const greg = issue.gregorian_date?.trim() ?? "";
        if (hijri && greg) return `${hijri} - ${greg}`;
        return hijri || greg || "";
    })();

    // Footer visibility observer
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

    // Scroll class for subpage
    useEffect(() => {
        document.body.classList.add("subpage-scroll");
        document.documentElement.classList.add("subpage-scroll");
        return () => {
            document.body.classList.remove("subpage-scroll");
            document.documentElement.classList.remove("subpage-scroll");
        };
    }, []);

    // Determine issueId from URL param, localStorage, or fetch latest
    useEffect(() => {
        const determineIssueId = async () => {
            // Priority 1: URL query param
            if (issueIdParam) {
                setIssueId(issueIdParam);
                // Save to localStorage for future use
                if (typeof window !== "undefined") {
                    localStorage.setItem("selectedIssueId", issueIdParam);
                }
                return;
            }

            // Priority 2: localStorage
            if (typeof window !== "undefined") {
                const storedId = localStorage.getItem("selectedIssueId");
                if (storedId) {
                    setIssueId(storedId);
                    return;
                }
            }

            // Priority 3: Fetch latest published issue
            try {
                const published = await getPublishedIssues();
                const arr = Array.isArray(published) ? published : [];
                if (arr.length > 0) {
                    // Sort by published_at or id to get the latest
                    const sorted = arr.sort((a, b) => {
                        const tsA = Date.parse(a.published_date ?? "") || a.id || 0;
                        const tsB = Date.parse(b.published_date ?? "") || b.id || 0;
                        return tsB - tsA;
                    });
                    const latestId = String(sorted[0].id);
                    setIssueId(latestId);
                    if (typeof window !== "undefined") {
                        localStorage.setItem("selectedIssueId", latestId);
                    }
                } else {
                    setLoading(false);
                }
            } catch {
                setLoading(false);
            }
        };

        determineIssueId();
    }, [issueIdParam, section]);

    // Fetch issue details and articles
    useEffect(() => {
        if (!issueId || !section) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [issueData, articlesList] = await Promise.all([
                    getIssue(issueId),
                    getIssueArticles(issueId),
                ]);

                setIssue(issueData);
                setPdfHref(issueData.pdf_file ?? "");

                const arr = Array.isArray(articlesList) ? articlesList : [];
                const filtered = arr.filter(
                    (a) => (a.className ?? "").trim() === section.className
                );
                setArticles(filtered);

                // Set image: article featured image > issue cover
                const first = filtered[0] ?? arr[0];
                const img = first?.featured_image || issueData.cover_image || "/cover.jpg";
                setImageSrc(img || "/cover.jpg");

                setLoading(false);
            } catch {
                setArticles([]);
                setPdfHref("");
                setImageSrc("/cover.jpg");
                setLoading(false);
            }
        };

        fetchData();
    }, [issueId, section]);

    // Handle 404 for invalid section
    if (!section) {
        return (
            <main className={styles.stage}>
                <div className={styles.notFound}>
                    <h1>القسم غير موجود</h1>
                    <p>الرجاء العودة للصفحة الرئيسية</p>
                    <Link href="/" className={styles.backLink}>
                        العودة للرئيسية
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.stage}>
            <Subheader issueTitle={issueTitle} dateLabel={dateLabel} />

            <section className={styles.contentArea}>
                <div className={styles.paperSection} aria-label="عرض المقال داخل صفحة ورقية">
                    <div className={styles.paper}>
                        <div className={styles.paperInner}>
                            <header className={styles.paperHeader}>
                                <div className={styles.paperBadge}>
                                    اسم الكاتب : {(articles[0]?.author_name ?? "").trim() || issueTitle}
                                </div>
                                <h2 className={styles.paperTitle2}>
                                    {articles[0]?.open_title ?? articles[0]?.title ?? primaryTitle}
                                </h2>
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
                                    {loading ? (
                                        <p className={styles.loadingText}>جاري التحميل...</p>
                                    ) : articles.length === 0 ? (
                                        <p>لا توجد مقالات لهذا القسم في العدد المختار.</p>
                                    ) : (
                                        (() => {
                                            const a = articles[0];
                                            return (
                                                <article key={a.id}>
                                                    {a.content ? (
                                                        <div dangerouslySetInnerHTML={{ __html: a.content }} />
                                                    ) : null}
                                                    {/* {a.pdf_file && (
                                                        <div className={styles.paperSources} style={{ textAlign: 'center', marginTop: '2rem' }}>
                                                            <a
                                                                href={a.pdf_file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.pageMeta}
                                                                style={{
                                                                    display: 'inline-block',
                                                                    padding: '0.75rem 1.5rem',
                                                                    background: 'var(--color-accent, #b8860b)',
                                                                    color: '#fff',
                                                                    borderRadius: '0.5rem',
                                                                    textDecoration: 'none',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                📄 تحميل ملف PDF
                                                            </a>
                                                        </div>
                                                    )} */}
                                                    {(Array.isArray(a.references) && a.references.length) ||
                                                        (a as Record<string, unknown>).references_tmp ? (
                                                        <div className={styles.paperSources}>
                                                            <h3 className={styles.paperSubtitle}>المراجع</h3>
                                                            {Array.isArray(a.references) && a.references.length ? (
                                                                <ol>
                                                                    {a.references.map((ref, idx) => {
                                                                        // Support both new format {title, url} and old format (string)
                                                                        const refObj = typeof ref === 'object' && ref !== null
                                                                            ? ref as { title?: string; url?: string }
                                                                            : { title: String(ref), url: String(ref) };
                                                                        const title = refObj.title || refObj.url || '';
                                                                        const url = refObj.url || '';

                                                                        // Add https:// if URL doesn't have protocol
                                                                        const hasProtocol = /^https?:\/\//i.test(url.trim());
                                                                        const isValidUrl = url.trim() && (hasProtocol || url.includes('.'));
                                                                        const fullUrl = isValidUrl && !hasProtocol ? `https://${url.trim()}` : url.trim();

                                                                        return (
                                                                            <li key={`ref-${idx}`}>
                                                                                {isValidUrl ? (
                                                                                    <a
                                                                                        href={fullUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                    >
                                                                                        {title}
                                                                                    </a>
                                                                                ) : (
                                                                                    <span>{title}</span>
                                                                                )}
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ol>
                                                            ) : (
                                                                <div
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: stripLinks(
                                                                            ((a as Record<string, unknown>).references_tmp as string) ?? ""
                                                                        ),
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </article>
                                            );
                                        })()
                                    )}
                                </div>
                            </div>
                            <div className={styles.paperFooter}>
                                <div className={styles.footLeft}>
                                    <div className={styles.pageTile}>{issue?.issue_number ?? 1}</div>
                                    <div className={styles.pageMeta}>
                                        {issue?.title ?? "العدد الأول"} • {dateLabel}
                                    </div>
                                </div>
                                <div className={styles.footCenter}>
                                    مجلة شهرية علمية متخصصة في بيان حقيقة الصوفية
                                </div>
                                <div className={styles.footRight}>
                                    <Image src="/logo3.png" alt="مدارك" width={62} height={62} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div ref={footerSentinelRef} className={styles.footerSentinel} />
            </section>

            <Subfooter visible={footerVisible} shareText={issueTitle} pdfHref={pdfHref || "/"} />
        </main>
    );
}

export default function SectionPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>جاري التحميل...</div>}>
            <SectionPageContent />
        </Suspense>
    );
}
