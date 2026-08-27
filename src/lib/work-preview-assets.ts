import { WEBFLOW_WORK_DATA } from "./work-webflow-data";

const WORK_PREVIEW_EXTENSIONS: Record<string, "jpg" | "webp"> = {
  adcb: "jpg",
  "dubai-font": "jpg",
  femmily: "jpg",
  indochino: "jpg",
  keyreply: "jpg",
  "kite-beach": "jpg",
  meraas: "jpg",
  merdeka: "jpg",
  mubadala: "jpg",
  renuvi: "webp",
  "sole-dxb": "jpg",
  "tiger-beer-asia": "jpg",
  "tiger-beer-malaysia": "jpg",
  "tiger-beer-mongolia": "jpg",
  wimera: "jpg",
};

/**
 * Webflow used separate listing taglines for each case study card that
 * were incorrectly populated in Sanity with SEO descriptions.
 */
export const WEBFLOW_WORK_TAGLINES: Record<string, string> = {
  renuvi: "One Solution, infinite power",
  "dubai-font": "Telling Dubai's story, through a custom font, in over 100 million devices.",
  meraas: "Meraas, Dubai's best kept secret... Uncovered & Unveiled.",
  adcb: "Transforming a legacy financial institution into finance with purpose.",
  femmily: "Inspiring health, transforming outcomes. For women and families in Singapore.",
  wimera: "Transforming manufacturing with IIoT 4.0 for the digital age",
  keyreply: "Earning trust for AI in healthcare, before the age of Conversational AI",
  "tiger-beer-asia": "Uncaging local talent whose approach to their craft serves a good cause.",
  "kite-beach": "Dubai's Favorite Beach... Reborn, Reimagined.",
  "sole-dxb": "Bringing Streetwear Culture to the streets of Dubai.",
  indochino: "Refreshing the brand image for a made-to-measure menswear company",
  "tiger-beer-malaysia": "Why are we so afraid to follow our dreams?",
  merdeka: "Connecting Singapore with the stories that helped shape the nation.",
  mubadala: "Transforming the regional healthcare landscape in the United Arab Emirates",
  "tiger-beer-mongolia": "Meet the Silent Heroes. Who uncage for a better tomorrow.",
};

export function getWorkTagline(slug?: string, defaultTagline?: string) {
  if (!slug) return defaultTagline || "";
  return WEBFLOW_WORK_DATA[slug]?.tagline || WEBFLOW_WORK_TAGLINES[slug] || defaultTagline || "";
}

export function getWorkOverview(slug?: string, defaultOverview?: string): string {
  if (!slug) return defaultOverview || "";
  return WEBFLOW_WORK_DATA[slug]?.previewP?.[0] || defaultOverview || "";
}

export function getWorkFullStory(slug?: string, defaultStory?: string[]): string[] {
  if (!slug) return defaultStory || [];
  return WEBFLOW_WORK_DATA[slug]?.fullP || defaultStory || [];
}

export function getWorkStats(slug?: string, defaultStats?: Array<{ value: string; label: string }>) {
  if (!slug) return defaultStats || [];
  const webflowStats = WEBFLOW_WORK_DATA[slug]?.stats;
  if (webflowStats && webflowStats.length > 0) {
    return webflowStats.map((s) => ({ value: s.num, label: s.lab }));
  }
  return defaultStats || [];
}

export function getWorkServices(slug?: string, defaultServices?: string) {
  if (!slug) return defaultServices || "";
  return WEBFLOW_WORK_DATA[slug]?.metaValue || defaultServices || "";
}

/**
 * Webflow used a separate 1920x540 listing preview that was not migrated into
 * the Sanity Work documents. Keep the migrated local previews isolated here so
 * new projects continue to fall back to their Sanity main image.
 */
export function getWorkPreviewAsset(slug?: string) {
  if (!slug) return undefined;
  const extension = WORK_PREVIEW_EXTENSIONS[slug];
  return extension ? `/media/work-previews/${slug}.${extension}` : undefined;
}
