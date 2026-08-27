import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { getSitemapContent } from "@/lib/sanity/loaders";

type SitemapItem = MetadataRoute.Sitemap[number];

function entry(
  path: string,
  updatedAt?: string,
  options: Pick<SitemapItem, "changeFrequency" | "priority"> = {},
): SitemapItem {
  return {
    url: absoluteUrl(path),
    lastModified: updatedAt ? new Date(updatedAt) : undefined,
    ...options,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSitemapContent();

  return [
    ...content.pages.map((page) => {
      const path = page.isHomepage
        ? "/"
        : page.slug === "careers"
          ? "/unmarketing-careers"
          : `/${page.slug}`;
      return entry(path, page.updatedAt, {
        changeFrequency: page.isHomepage ? "weekly" : "monthly",
        priority: page.isHomepage ? 1 : 0.8,
      });
    }),
    ...content.landingPages.map((page) =>
      entry(`/${page.slug}`, page.updatedAt, { changeFrequency: "monthly", priority: 0.8 }),
    ),
    ...content.works.map((work) =>
      entry(`/work/${work.slug}`, work.updatedAt, { changeFrequency: "monthly", priority: 0.7 }),
    ),
    ...content.thoughts.map((thought) =>
      entry(`/thoughts/${thought.slug}`, thought.updatedAt, {
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    ...content.authors.map((author) =>
      entry(`/authors/${author.slug}`, author.updatedAt, {
        changeFrequency: "monthly",
        priority: 0.5,
      }),
    ),
    ...content.categories.map((category) =>
      entry(`/thoughts-categories/${category.slug}`, category.updatedAt, {
        changeFrequency: "weekly",
        priority: 0.5,
      }),
    ),
    ...content.ebooks.map((ebook) =>
      entry(`/ebook/${ebook.slug}`, ebook.updatedAt, {
        changeFrequency: "yearly",
        priority: 0.6,
      }),
    ),
  ].filter((item) => !item.url.includes("undefined"));
}
