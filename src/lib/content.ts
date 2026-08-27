import type { PortableTextValue, SanityColor } from "@/lib/sanity/types";

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }
    return HTML_ENTITIES[normalized] ?? match;
  });
}

/** Convert the small amount of legacy FAQ HTML into safe, shared plain text. */
export function cmsPlainText(value?: string) {
  if (!value) return "";
  return decodeHtmlEntities(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p\s*>/gi, "\n\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[\t ]+\n/g, "\n")
    .replace(/\n[\t ]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\t ]{2,}/g, " ")
    .trim();
}

const RENAMED_INTERNAL_PATHS: Record<string, string> = {
  "/thoughts/why-we-dont-let-ai-design-your-brand": "/thoughts/should-i-use-ai-for-branding",
};

/** Repairs known malformed migrated links without mutating the Sanity source. */
export function normalizeCmsHref(rawHref?: string) {
  const href = decodeHtmlEntities(rawHref?.trim() || "");
  if (!href) return "";

  let normalized = href;
  if (/^https?:\/\/\//i.test(normalized)) {
    normalized = `/${normalized.replace(/^https?:\/\/\/+?/i, "")}`;
  }

  try {
    const url = new URL(normalized);
    if (url.hostname === "theunmarketing.agency" || url.hostname === "www.theunmarketing.agency") {
      normalized = `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Relative paths and non-URL schemes are handled below.
  }

  normalized = normalized.replace(/^\/project\//, "/work/").replace(/^\/post\//, "/thoughts/");
  return RENAMED_INTERNAL_PATHS[normalized] || normalized;
}

export function portableTextToPlain(value?: Array<Record<string, unknown>>) {
  if (!value?.length) return "";
  return value
    .map((block) => {
      if (typeof block !== "object" || block === null) return "";
      if (typeof block.text === "string") return block.text;
      if (!Array.isArray(block.children)) return "";
      return block.children
        .map((child) =>
          child && typeof child === "object" && "text" in child && typeof child.text === "string"
            ? child.text
            : "",
        )
        .join("");
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPublishedDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function safeVideoUrl(rawUrl?: string) {
  if (!rawUrl) return undefined;
  try {
    const url = new URL(decodeHtmlEntities(rawUrl));
    const host = url.hostname.replace(/^www\./, "");
    if (host === "player.vimeo.com" && /^\/video\/\d+\/?$/.test(url.pathname)) return url.toString();

    let youtubeId: string | undefined;
    if (host === "youtu.be") youtubeId = url.pathname.split("/").filter(Boolean)[0];
    if (["youtube.com", "youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") youtubeId = url.searchParams.get("v") || undefined;
      if (url.pathname.startsWith("/embed/")) youtubeId = url.pathname.split("/")[2];
    }
    if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
      return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function resolveSanityColor(color?: SanityColor, fallback?: string): string | undefined {
  if (!color) return fallback;
  if (typeof color === "string") return color;
  if (color.hsl && typeof color.hsl.h === "number") {
    const { h, s = 0, l = 0, a = 1 } = color.hsl;
    const sPct = s <= 1 ? `${(s * 100).toFixed(2)}%` : `${s}%`;
    const lPct = l <= 1 ? `${(l * 100).toFixed(2)}%` : `${l}%`;
    return a < 1 ? `hsla(${h}, ${sPct}, ${lPct}, ${a})` : `hsl(${h}, ${sPct}, ${lPct})`;
  }
  if (color.hex) {
    return color.hex;
  }
  if (color.rgb && typeof color.rgb.r === "number") {
    const { r, g, b, a = 1 } = color.rgb;
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  }
  return fallback;
}

export function calculateReadingTime(value?: PortableTextValue | string, wordsPerMinute = 200): number {
  if (!value) return 1;
  const text = typeof value === "string" ? value : portableTextToPlain(value);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
