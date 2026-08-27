import { cache } from "react";

import { sanityFetch } from "./fetch";
import {
  AUTHOR_BY_SLUG_QUERY,
  AUTHOR_LIST_QUERY,
  AUTHOR_SLUGS_QUERY,
  CATEGORY_BY_SLUG_QUERY,
  CATEGORY_LIST_QUERY,
  CATEGORY_SLUGS_QUERY,
  EBOOK_BY_SLUG_QUERY,
  EBOOK_SLUGS_QUERY,
  HOME_PAGE_QUERY,
  LANDING_PAGE_BY_SLUG_QUERY,
  LANDING_PAGE_SLUGS_QUERY,
  PAGE_BY_SLUG_QUERY,
  SERVICE_LIST_QUERY,
  SITEMAP_QUERY,
  THOUGHT_BY_SLUG_QUERY,
  THOUGHT_LIST_QUERY,
  THOUGHT_SLUGS_QUERY,
  WORK_BY_SLUG_QUERY,
  WORK_LIST_QUERY,
  WORK_SLUGS_QUERY,
} from "./queries";
import type {
  Author,
  Ebook,
  LandingPage,
  PageDocument,
  Service,
  SitemapContent,
  Thought,
  ThoughtCategory,
  ThoughtSummary,
  Work,
  WorkSummary,
} from "./types";

type SlugResult = { slug: string };

export const getHomePage = cache(() =>
  sanityFetch<PageDocument | null>(HOME_PAGE_QUERY, { tags: ["page", "homepage"] }),
);

export const getPage = cache((slug: string) =>
  sanityFetch<PageDocument | null>(PAGE_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["page", `page:${slug}`],
  }),
);

export const getLandingPage = cache((slug: string) =>
  sanityFetch<LandingPage | null>(LANDING_PAGE_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["landingPage", `landingPage:${slug}`],
  }),
);

export const getLandingPageSlugs = cache(() =>
  sanityFetch<SlugResult[]>(LANDING_PAGE_SLUGS_QUERY, { tags: ["landingPage"] }),
);

export const getWorks = cache(() =>
  sanityFetch<WorkSummary[]>(WORK_LIST_QUERY, { tags: ["work"] }),
);

export const getWork = cache((slug: string) =>
  sanityFetch<Work | null>(WORK_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["work", `work:${slug}`],
  }),
);

export const getWorkSlugs = cache(() =>
  sanityFetch<SlugResult[]>(WORK_SLUGS_QUERY, { tags: ["work"] }),
);

export const getThoughts = cache(() =>
  sanityFetch<ThoughtSummary[]>(THOUGHT_LIST_QUERY, { tags: ["thought"] }),
);

export const getThought = cache((slug: string) =>
  sanityFetch<Thought | null>(THOUGHT_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["thought", `thought:${slug}`],
  }),
);

export const getThoughtSlugs = cache(() =>
  sanityFetch<SlugResult[]>(THOUGHT_SLUGS_QUERY, { tags: ["thought"] }),
);

export const getAuthors = cache(() =>
  sanityFetch<Author[]>(AUTHOR_LIST_QUERY, { tags: ["author"] }),
);

export const getAuthor = cache((slug: string) =>
  sanityFetch<(Author & { thoughts?: ThoughtSummary[] }) | null>(AUTHOR_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["author", `author:${slug}`],
  }),
);

export const getAuthorSlugs = cache(() =>
  sanityFetch<SlugResult[]>(AUTHOR_SLUGS_QUERY, { tags: ["author"] }),
);

export const getCategories = cache(() =>
  sanityFetch<ThoughtCategory[]>(CATEGORY_LIST_QUERY, { tags: ["thoughtCategory"] }),
);

export const getCategory = cache((slug: string) =>
  sanityFetch<(ThoughtCategory & { thoughts?: ThoughtSummary[] }) | null>(CATEGORY_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["thoughtCategory", `thoughtCategory:${slug}`],
  }),
);

export const getCategorySlugs = cache(() =>
  sanityFetch<SlugResult[]>(CATEGORY_SLUGS_QUERY, { tags: ["thoughtCategory"] }),
);

export const getEbook = cache((slug: string) =>
  sanityFetch<Ebook | null>(EBOOK_BY_SLUG_QUERY, {
    params: { slug },
    tags: ["ebook", `ebook:${slug}`],
  }),
);

export const getEbookSlugs = cache(() =>
  sanityFetch<SlugResult[]>(EBOOK_SLUGS_QUERY, { tags: ["ebook"] }),
);

export const getSitemapContent = cache(() =>
  sanityFetch<SitemapContent>(SITEMAP_QUERY, { tags: ["sitemap"] }),
);

export const getServices = cache(() =>
  sanityFetch<Service[]>(SERVICE_LIST_QUERY, { tags: ["service"] }),
);
