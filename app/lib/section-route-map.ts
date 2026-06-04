export type SectionMapItem = {
  publicSlug: string;
  backendSlug: string;
  backendKey: string;
  legacyClassName: string;
  title: string;
};

export const SECTION_MAP: SectionMapItem[] = [
  {
    publicSlug: "editorial-opening",
    backendSlug: "opening",
    backendKey: "arc-opening",
    legacyClassName: "arc-opening",
    title: "افتتاحية العدد"
  },
  {
    publicSlug: "glossary",
    backendSlug: "glossary",
    backendKey: "arc-glossary",
    legacyClassName: "arc-glossary",
    title: "قاموس المصطلحات"
  },
  {
    publicSlug: "profiles",
    backendSlug: "profiles",
    backendKey: "arc-profiles",
    legacyClassName: "arc-profiles",
    title: "شخصيات صوفية"
  },
  {
    publicSlug: "stats",
    backendSlug: "stats",
    backendKey: "arc-stats",
    legacyClassName: "arc-stats",
    title: "إحصائيات وتحليلات"
  },
  {
    publicSlug: "news",
    backendSlug: "news",
    backendKey: "arc-news",
    legacyClassName: "arc-news",
    title: "الصوفية حول العالم"
  },
  {
    publicSlug: "refutations",
    backendSlug: "refutations",
    backendKey: "arc-refutations",
    legacyClassName: "arc-refutations",
    title: "شبهات تحت المجهر"
  },
  {
    publicSlug: "documents-lectures",
    backendSlug: "archive",
    backendKey: "arc-archive",
    legacyClassName: "arc-archive",
    title: "خزانة الوثائق"
  },
  {
    publicSlug: "history",
    backendSlug: "history",
    backendKey: "arc-history",
    legacyClassName: "arc-history",
    title: "محطات تاريخية"
  },
  {
    publicSlug: "library",
    backendSlug: "library",
    backendKey: "arc-library",
    legacyClassName: "arc-library",
    title: "عصارة الكتب"
  },
  {
    publicSlug: "articles",
    backendSlug: "articles",
    backendKey: "arc-articles",
    legacyClassName: "arc-articles",
    title: "مقالات"
  }
];

export function getMapByPublicSlug(slug: string): SectionMapItem | undefined {
  return SECTION_MAP.find(m => m.publicSlug === slug);
}

export function getMapByBackendKey(key: string): SectionMapItem | undefined {
  return SECTION_MAP.find(m => m.backendKey === key);
}

export function getMapByLegacyClassName(className: string): SectionMapItem | undefined {
  return SECTION_MAP.find(m => m.legacyClassName === className);
}
