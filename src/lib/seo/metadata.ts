import type { Metadata } from "next";

import { imageUrl } from "@/lib/sanity/image";
import type { SanityImage, SeoFields } from "@/lib/sanity/types";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  canonicalPath,
} from "@/lib/site";

export type MetadataAuthor = string | { name: string; url?: string };

export type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  canonical?: string;
  seo?: SeoFields;
  image?: SanityImage | string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: readonly MetadataAuthor[];
  noIndex?: boolean;
  noFollow?: boolean;
};

function nonBlank(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function resolveCanonical(path: string, canonical?: string) {
  if (canonical && /^https?:\/\//i.test(canonical)) return canonical;
  return absoluteUrl(canonicalPath(canonical || path));
}

function resolveImage(image: SanityImage | string | undefined) {
  if (!image) return undefined;
  if (typeof image === "string") return absoluteUrl(image);
  return imageUrl(image, { width: 1200, height: 630, quality: 90, fit: "crop" });
}

/**
 * Builds crawler-visible metadata from Sanity SEO fields plus route-level
 * fallbacks. It never appends a title suffix, preserving migrated titles.
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  canonical,
  seo,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  authors = [],
  noIndex,
  noFollow = false,
}: BuildMetadataInput): Metadata {
  const resolvedTitle = nonBlank(seo?.metaTitle) ?? nonBlank(title) ?? SITE_NAME;
  const resolvedDescription =
    nonBlank(seo?.metaDescription) ?? nonBlank(description) ?? SITE_DESCRIPTION;
  const canonicalUrl = resolveCanonical(path, canonical);
  const socialImage = resolveImage(image ?? seo?.ogImage);
  const resolvedImageAlt =
    nonBlank(imageAlt) ??
    (typeof image === "object" ? nonBlank(image.alt) : undefined) ??
    nonBlank(seo?.ogImage?.alt) ??
    resolvedTitle;
  const shouldIndex = !(noIndex ?? seo?.noIndex ?? false);
  const shouldFollow = !noFollow;
  const authorNames = authors
    .map((author) => (typeof author === "string" ? author : author.name))
    .map((author) => author.trim())
    .filter(Boolean);
  const metadataAuthors = authors
    .map((author) =>
      typeof author === "string"
        ? { name: author.trim() }
        : { name: author.name.trim(), ...(author.url ? { url: author.url } : {}) },
    )
    .filter((author) => author.name);
  const openGraphImage = socialImage
    ? [{ url: socialImage, width: 1200, height: 630, alt: resolvedImageAlt }]
    : undefined;

  const sharedOpenGraph = {
    title: resolvedTitle,
    description: resolvedDescription,
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    images: openGraphImage,
  };

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          ...sharedOpenGraph,
          type: "article",
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
          ...(authorNames.length ? { authors: authorNames } : {}),
        }
      : { ...sharedOpenGraph, type: "website" };

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: canonicalUrl },
    ...(seo?.keywords?.length ? { keywords: seo.keywords } : {}),
    ...(metadataAuthors.length ? { authors: metadataAuthors } : {}),
    robots: {
      index: shouldIndex,
      follow: shouldFollow,
      googleBot: {
        index: shouldIndex,
        follow: shouldFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph,
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}
