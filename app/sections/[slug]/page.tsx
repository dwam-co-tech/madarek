"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import Subheader from "../../components/Subheader";
import Subfooter from "../../components/Subfooter";
import { getIssue, getPublishedIssues, getIssueSections, getSectionArticles, getIssueArticles } from "../../lib/cached-issues.service";
import type { ArticleDTO, IssueDetailDTO } from "../../lib/issues.model";
import { getMapByPublicSlug } from "../../lib/section-route-map";
import PageLoader from "@/components/PageLoader";

function getExcerpt(html?: string | null, maxLen = 150): string {
    if (!html) return "";
    try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const text = doc.body.textContent || doc.body.innerText || "";
        const cleaned = text.replace(/\s+/g, " ").trim();
        if (cleaned.length <= maxLen) return cleaned;
        return cleaned.substring(0, maxLen) + "...";
    } catch {
        const cleaned = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleaned.length <= maxLen) return cleaned;
        return cleaned.substring(0, maxLen) + "...";
    }
}

function SectionArticlesPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const slug = params.slug as string;
    const routeMap = getMapByPublicSlug(slug);

    // Priority: 1. URL query param, 2. localStorage, 3. fetch latest
    const issueIdParam = searchParams.get("issueId");

    const [footerVisible, setFooterVisible] = useState(false);
    const footerSentinelRef = useRef<HTMLDivElement | null>(null);
    const [articles, setArticles] = useState<ArticleDTO[]>([]);
    const [issue, setIssue] = useState<IssueDetailDTO | null>(null);
    const [issueId, setIssueId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const sectionTitle = routeMap?.title ?? "القسم";

    // Update document title dynamically
    useEffect(() => {
        if (routeMap) {
            document.title = `مجلة مدارك | قسم ${routeMap.title}`;
        }
    }, [routeMap]);

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

    // Determine issueId
    useEffect(() => {
        const determineIssueId = async () => {
            if (issueIdParam) {
                setIssueId(issueIdParam);
                if (typeof window !== "undefined") {
                    localStorage.setItem("selectedIssueId", issueIdParam);
                }
                return;
            }

            if (typeof window !== "undefined") {
                const storedId = localStorage.getItem("selectedIssueId");
                if (storedId) {
                    setIssueId(storedId);
                    return;
                }
            }

            try {
                const published = await getPublishedIssues();
                const arr = Array.isArray(published) ? published : [];
                if (arr.length > 0) {
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
    }, [issueIdParam]);

    // Fetch issue details and articles for this section
    useEffect(() => {
        if (!issueId || !routeMap) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch issue details
                const issueData = await getIssue(issueId);
                setIssue(issueData);

                let fetchedArticles: ArticleDTO[] = [];
                let fallbackToLegacy = false;

                try {
                    // Fetch sections to match with backend IDs
                    const sectionsList = issueData.sections || await getIssueSections(issueId);
                    const matchedSection = sectionsList.find(
                        (s) => 
                            s.slug === routeMap.backendSlug || 
                            s.key === routeMap.backendKey || 
                            s.title === routeMap.title
                    );

                    if (matchedSection) {
                        fetchedArticles = await getSectionArticles(issueId, matchedSection.id);
                        
                        // Handle unclassified articles for the 'articles' section
                        if (routeMap.publicSlug === "articles") {
                            const allArticles = await getIssueArticles(issueId);
                            const unclassified = allArticles.filter(
                                (art) => 
                                    !art.issue_section_id && 
                                    !(art.className ?? "").trim() &&
                                    !fetchedArticles.some(fa => fa.id === art.id)
                            );
                            fetchedArticles = [...fetchedArticles, ...unclassified];
                        }
                    } else {
                        fallbackToLegacy = true;
                    }
                } catch (e) {
                    console.error("API Sections call failed, falling back to legacy filtering", e);
                    fallbackToLegacy = true;
                }

                // Legacy fallback: filter all issue articles by legacyClassName
                if (fallbackToLegacy) {
                    const allArticles = await getIssueArticles(issueId);
                    const arr = Array.isArray(allArticles) ? allArticles : [];
                    
                    if (routeMap.publicSlug === "articles") {
                        fetchedArticles = arr.filter(
                            (a) => 
                                (a.className ?? "").trim() === "arc-articles" || 
                                (!a.issue_section_id && !(a.className ?? "").trim())
                        );
                    } else {
                        fetchedArticles = arr.filter(
                            (a) => (a.className ?? "").trim() === routeMap.legacyClassName
                        );
                    }
                }

                setArticles(fetchedArticles);
                setLoading(false);
            } catch (err) {
                console.error("Error loading section articles page:", err);
                setArticles([]);
                setLoading(false);
            }
        };

        fetchData();
    }, [issueId, slug]);

    if (!routeMap) {
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
            {loading && <PageLoader message="جاري تحميل القسم..." />}
            <Subheader issueTitle={sectionTitle} dateLabel={dateLabel} />

            <section className={styles.contentArea}>
                <div className={styles.paperSection} aria-label="عرض مقالات القسم">
                    <div className={styles.paper}>
                        <div className={styles.paperInner}>
                            <header className={styles.paperHeader}>
                                <div className={styles.paperHeaderRight}>
                                    <h2 className={styles.paperTitle2}>
                                        قسم {sectionTitle}
                                    </h2>
                                    <span className={styles.paperSubtitle}>
                                        {articles.length > 0 
                                            ? `يحتوي هذا القسم على ${articles.length} مقالات` 
                                            : "لا توجد مقالات في هذا القسم حالياً"}
                                    </span>
                                </div>
                                <Link 
                                    href={issueId ? `/?issueId=${issueId}` : "/"} 
                                    className={styles.backToHomeBtn}
                                >
                                    <span>العودة للعدد الحالي</span>
                                    <svg 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        style={{ transform: "translateY(1px)" }}
                                    >
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                </Link>
                            </header>

                            {articles.length > 0 ? (
                                <div className={styles.cardGrid}>
                                    {articles.map((article) => {
                                        const excerpt = getExcerpt(article.content, 120);
                                        const coverImg = article.featured_image || issue?.cover_image || "/cover.jpg";
                                        const detailUrl = `/section/${slug}?issueId=${issueId || issue?.id || ""}&articleId=${article.id}`;
                                        
                                        return (
                                            <Link 
                                                href={detailUrl} 
                                                className={styles.card} 
                                                key={article.id}
                                            >
                                                <div className={styles.cardImageContainer}>
                                                    <Image 
                                                        src={coverImg}
                                                        alt={article.title}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                                                        className={styles.cardImage}
                                                    />
                                                </div>
                                                <div className={styles.cardContent}>
                                                    <h3 className={styles.cardTitle}>{article.title}</h3>
                                                    {article.open_title && article.open_title !== article.title && (
                                                        <span className={styles.cardOpenTitle}>
                                                            {article.open_title}
                                                        </span>
                                                    )}
                                                    {article.author_name && (
                                                        <span className={styles.cardAuthor}>
                                                            الكاتب: {article.author_name}
                                                        </span>
                                                    )}
                                                    {excerpt && <p className={styles.cardExcerpt}>{excerpt}</p>}
                                                    
                                                    <div className={styles.cardFooter}>
                                                        <div className={styles.cardMeta}>
                                                            {article.gregorian_date && (
                                                                <span className={styles.cardMetaItem}>
                                                                    📅 {article.gregorian_date}
                                                                </span>
                                                            )}
                                                            <span className={styles.cardMetaItem}>
                                                                👁️ {Intl.NumberFormat("ar-EG").format(article.views_count ?? 0)}
                                                            </span>
                                                        </div>
                                                        <span className={styles.cardCTA}>اقرأ المقال ←</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p className={styles.emptyText}>لا توجد مقالات داخل هذا القسم حالياً</p>
                                    <Link href="/" className={styles.backLink}>
                                        الذهاب للمجلة الرئيسية
                                    </Link>
                                </div>
                            )}
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
                <div ref={footerSentinelRef} className={styles.footerSentinel} />
            </section>

            <Subfooter visible={footerVisible} shareText={`قسم ${sectionTitle}`} pdfHref={issue?.pdf_file || "/"} />
        </main>
    );
}

export default function SectionArticlesPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>جاري التحميل...</div>}>
            <SectionArticlesPageContent />
        </Suspense>
    );
}
