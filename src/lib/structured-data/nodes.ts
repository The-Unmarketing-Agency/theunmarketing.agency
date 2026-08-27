import { imageUrl } from "@/lib/sanity/image";
import { cmsPlainText } from "@/lib/content";
import { getThoughtSummary } from "@/lib/thought-summaries";
import type {
  Author,
  Ebook,
  Faq,
  SanityImage,
  Service,
  Thought,
  Work,
} from "@/lib/sanity/types";
import {
  ORGANIZATION_ID,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  canonicalPath,
} from "@/lib/site";

import type { JsonLdNode } from "./types";

type SchemaImage = SanityImage | string | undefined;

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function compact<T>(values: readonly (T | undefined | null | false)[]) {
  return values.filter(Boolean) as T[];
}

function resolvedUrl(path = "/") {
  return absoluteUrl(canonicalPath(path));
}

function pageId(path = "/") {
  return `${resolvedUrl(path)}#webpage`;
}

function schemaImage(image: SchemaImage, width = 1600) {
  if (!image) return undefined;
  if (typeof image === "string") return absoluteUrl(image);
  return imageUrl(image, { width, quality: 90, fit: "max" });
}

function idSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "item";
}

export const DEFAULT_ORGANIZATION_SOCIALS = [
  "https://www.linkedin.com/company/theunmarketingagency/",
  "https://www.x.com/theunmarketing",
  "https://www.instagram.com/theunmarketing/",
  "https://vimeo.com/theunmarketingagency",
] as const;

export const DEFAULT_ORGANIZATION_OFFICES = [
  {
    name: "The Unmarketing Agency — Los Angeles",
    locality: "Los Angeles",
    region: "CA",
    country: "US",
    email: "usa@theunmarketing.agency",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    name: "The Unmarketing Agency Pte. Ltd. — Singapore",
    locality: "Singapore",
    region: "Singapore",
    country: "SG",
    email: "singapore@theunmarketing.agency",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    name: "The Unmarketing Agency — Mumbai",
    locality: "Mumbai",
    region: "MH",
    country: "IN",
    email: "india@theunmarketing.agency",
    latitude: 19.076,
    longitude: 72.8777,
  },
] as const;

export type OrganizationNodeInput = {
  name?: string;
  legalName?: string;
  description?: string;
  logo?: SchemaImage;
  email?: string;
  telephone?: string;
  sameAs?: readonly string[];
};

export function organizationNode({
  name = SITE_NAME,
  legalName = "The Unmarketing Agency Pte. Ltd.",
  description = SITE_DESCRIPTION,
  logo,
  email = "hello@theunmarketing.agency",
  telephone = "+1-213-555-0100",
  sameAs = DEFAULT_ORGANIZATION_SOCIALS,
}: OrganizationNodeInput = {}): JsonLdNode {
  const logoUrl = logo ? schemaImage(logo, 800) : absoluteUrl("/apple-touch-icon.png");
  const socialProfiles = (sameAs && sameAs.length ? sameAs : DEFAULT_ORGANIZATION_SOCIALS)
    .map(clean)
    .filter(Boolean) as string[];

  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name,
    legalName,
    url: SITE_URL,
    description: clean(description),
    logo: {
      "@type": "ImageObject",
      "@id": `${ORGANIZATION_ID}-logo`,
      url: logoUrl,
      contentUrl: logoUrl,
      caption: name,
      width: 512,
      height: 512,
    },
    image: logoUrl,
    email: clean(email),
    telephone: clean(telephone),
    sameAs: socialProfiles,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: clean(email) || "hello@theunmarketing.agency",
        telephone: clean(telephone) || "+1-213-555-0100",
        areaServed: ["Worldwide", "US", "SG", "IN"],
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "regional office",
        email: "usa@theunmarketing.agency",
        areaServed: "US",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "regional office",
        email: "singapore@theunmarketing.agency",
        areaServed: "SG",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "regional office",
        email: "india@theunmarketing.agency",
        areaServed: "IN",
        availableLanguage: ["English"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Singapore",
      addressCountry: "SG",
    },
    location: DEFAULT_ORGANIZATION_OFFICES.map((office) => ({
      "@type": "Place",
      name: office.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: office.locality,
        addressRegion: office.region,
        addressCountry: office.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: office.latitude,
        longitude: office.longitude,
      },
    })),
  };
}

export type BreadcrumbItem = {
  name?: string;
  path?: string;
  url?: string;
};

export type BreadcrumbNodeInput = {
  path: string;
  items: readonly BreadcrumbItem[];
};

export function breadcrumbNode({ path, items }: BreadcrumbNodeInput): JsonLdNode | null {
  const validItems = items
    .map((item) => {
      const name = clean(item.name);
      const url = item.url
        ? absoluteUrl(item.url)
        : item.path
          ? resolvedUrl(item.path)
          : undefined;
      return name && url ? { name, url } : undefined;
    })
    .filter(Boolean) as Array<{ name: string; url: string }>;

  if (!validItems.length) return null;

  return {
    "@type": "BreadcrumbList",
    "@id": `${resolvedUrl(path)}#breadcrumb`,
    itemListElement: validItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export type FaqNodeInput = {
  path: string;
  faqs?: readonly Faq[];
};

export function faqNode({ path, faqs = [] }: FaqNodeInput): JsonLdNode | null {
  const mainEntity = faqs
    .map((faq) => {
      const question = clean(cmsPlainText(faq.question));
      const answer = clean(cmsPlainText(faq.answer));
      if (!question || !answer) return undefined;
      return {
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      } satisfies JsonLdNode;
    })
    .filter(Boolean) as JsonLdNode[];

  if (!mainEntity.length) return null;

  return {
    "@type": "FAQPage",
    "@id": `${resolvedUrl(path)}#faq`,
    url: resolvedUrl(path),
    mainEntity,
  };
}

export type WebPageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";

export type WebPageNodeInput = {
  path: string;
  title: string;
  description?: string;
  type?: WebPageType;
  image?: SchemaImage;
  dateModified?: string;
  mainEntityId?: string;
};

export function webPageNode({
  path,
  title,
  description,
  type = "WebPage",
  image,
  dateModified,
  mainEntityId,
}: WebPageNodeInput): JsonLdNode {
  const url = resolvedUrl(path);
  const imageValue = schemaImage(image);
  const inferredMainEntityId =
    mainEntityId ?? (type === "AboutPage" || type === "ContactPage" ? ORGANIZATION_ID : undefined);

  return {
    "@type": type,
    "@id": pageId(path),
    url,
    name: clean(title) ?? SITE_NAME,
    description: clean(description),
    ...(imageValue ? { primaryImageOfPage: { "@type": "ImageObject", url: imageValue } } : {}),
    dateModified: clean(dateModified),
    ...(inferredMainEntityId ? { mainEntity: { "@id": inferredMainEntityId } } : {}),
    ...(type === "AboutPage" ? { about: { "@id": ORGANIZATION_ID } } : {}),
  };
}

export type ServiceNodesInput = {
  path: string;
  title?: string;
  description?: string;
  image?: SchemaImage;
  services?: readonly Service[];
};

/** Returns one Service node per CMS service, or one page-level Service fallback. */
export function serviceNodes({
  path,
  title,
  description,
  image,
  services = [],
}: ServiceNodesInput): JsonLdNode[] {
  const pageUrl = resolvedUrl(path);
  const pageImage = schemaImage(image);
  const validServices = services.filter((service) => clean(service.title));

  if (!validServices.length) {
    const name = clean(title);
    if (!name) return [];
    return [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name,
        description: clean(description),
        url: pageUrl,
        provider: { "@id": ORGANIZATION_ID },
        ...(pageImage ? { image: pageImage } : {}),
      },
    ];
  }

  return validServices.map((service) => {
    const slug = service.slug?.current || service._id || service.title;
    return {
      "@type": "Service",
      "@id": `${pageUrl}#service-${idSegment(slug)}`,
      name: service.title.trim(),
      description: clean(service.description),
      url: pageUrl,
      provider: { "@id": ORGANIZATION_ID },
      ...(pageImage ? { image: pageImage } : {}),
    };
  });
}

export type ArticleNodeInput = {
  path: string;
  thought: Thought;
  title?: string;
  description?: string;
  image?: SchemaImage;
};

export function articleNode({
  path,
  thought,
  title,
  description,
  image,
}: ArticleNodeInput): JsonLdNode {
  const url = resolvedUrl(path);
  const author = thought.author;
  const authorPath = author?.slug?.current ? `/authors/${author.slug.current}` : undefined;
  const authorEntity = author?.name
    ? {
        "@type": "Person",
        "@id": authorPath ? `${resolvedUrl(authorPath)}#person` : `${url}#author`,
        name: author.name,
        ...(authorPath ? { url: resolvedUrl(authorPath) } : {}),
      }
    : { "@id": ORGANIZATION_ID };
  const categories = compact(thought.categories?.map((category) => clean(category.title)) ?? []);
  const pillar = clean(thought.pillar?.title);
  const imageValue = schemaImage(image ?? thought.featuredImage);

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@id": pageId(path) },
    headline: clean(title) ?? thought.title,
    description:
      clean(description) ??
      clean(getThoughtSummary(thought.slug?.current, thought.bluf)) ??
      clean(thought.seo?.metaDescription),
    image: imageValue,
    datePublished: clean(thought.publishedAt),
    dateModified: clean(thought._updatedAt),
    author: authorEntity,
    publisher: { "@id": ORGANIZATION_ID },
    ...(categories.length ? { articleSection: categories } : {}),
    ...(pillar ? { about: { "@type": "Thing", name: pillar } } : {}),
    inLanguage: "en",
  };
}

export type CreativeWorkNodeInput = {
  path: string;
  work: Work;
  title?: string;
  description?: string;
};

export function creativeWorkNode({
  path,
  work,
  title,
  description,
}: CreativeWorkNodeInput): JsonLdNode {
  const url = resolvedUrl(path);
  const images = compact([
    schemaImage(work.mainImage),
    ...(work.gallery?.map((item) => schemaImage(item)) ?? []),
  ]);
  const serviceTopics =
    work.services
      ?.map((service) => clean(service.title))
      .filter(Boolean)
      .map((name) => ({ "@type": "Thing", name })) ?? [];

  return {
    "@type": "CreativeWork",
    "@id": `${url}#creative-work`,
    url,
    mainEntityOfPage: { "@id": pageId(path) },
    name: clean(title) ?? work.title,
    description: clean(description) ?? clean(work.tagline),
    ...(images.length ? { image: images } : {}),
    dateModified: clean(work._updatedAt),
    creator: { "@id": ORGANIZATION_ID },
    genre: clean(work.industry),
    ...(serviceTopics.length ? { about: serviceTopics } : {}),
    ...(clean(work.audience)
      ? { audience: { "@type": "Audience", audienceType: clean(work.audience) } }
      : {}),
  };
}

function personNode(author: Author, path: string): JsonLdNode {
  const url = resolvedUrl(path);
  const image = schemaImage(author.image, 1000);
  const sameAs = compact([clean(author.linkedin)]);

  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.name,
    url,
    jobTitle: clean(author.role),
    description: clean(author.bio),
    image,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export type ProfileNodesInput = {
  path: string;
  author: Author;
  title?: string;
  description?: string;
};

/** Returns the linked ProfilePage and Person nodes for an author route. */
export function profileNodes({
  path,
  author,
  title,
  description,
}: ProfileNodesInput): JsonLdNode[] {
  const url = resolvedUrl(path);
  const person = personNode(author, path);
  const page: JsonLdNode = {
    "@type": "ProfilePage",
    "@id": pageId(path),
    url,
    name: clean(title) ?? author.name,
    description: clean(description) ?? clean(author.bio),
    dateModified: clean(author._updatedAt),
    mainEntity: { "@id": person["@id"] as string },
  };
  return [page, person];
}

export type BookNodesInput = {
  path: string;
  ebook: Ebook;
  title?: string;
  description?: string;
};

export function bookNodes({
  path,
  ebook,
  title,
  description,
}: BookNodesInput): JsonLdNode[] {
  const url = resolvedUrl(path);
  const image = schemaImage(ebook.coverImage, 1400);

  return [
    {
      "@type": "Book",
      "@id": `${url}#book`,
      url,
      name: clean(title) ?? ebook.title,
      description:
        clean(cmsPlainText(description)) ??
        clean(cmsPlainText(ebook.description)) ??
        clean(ebook.subheading),
      image,
      publisher: { "@id": ORGANIZATION_ID },
      inLanguage: "en",
    },
  ];
}
