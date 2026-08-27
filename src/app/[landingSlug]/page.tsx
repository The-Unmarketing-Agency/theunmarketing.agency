import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { LandingPageView } from "@/features/site-views";
import { cmsPlainText, portableTextToPlain } from "@/lib/content";
import { getLandingPage, getLandingPageSlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { RESERVED_ROOT_SLUGS, absoluteUrl } from "@/lib/site";
import {
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  organizationNode,
  serviceNodes,
  webPageNode,
} from "@/lib/structured-data";

type LandingRouteProps = { params: Promise<{ landingSlug: string }> };

export async function generateStaticParams() {
  const slugs = await getLandingPageSlugs();
  return slugs
    .filter(({ slug }) => !RESERVED_ROOT_SLUGS.has(slug))
    .map(({ slug }) => ({ landingSlug: slug }));
}

function landingDescription(introText: string | Array<Record<string, unknown>> | undefined) {
  return typeof introText === "string" ? cmsPlainText(introText) : portableTextToPlain(introText);
}

export async function generateMetadata({ params }: LandingRouteProps) {
  const { landingSlug } = await params;
  if (RESERVED_ROOT_SLUGS.has(landingSlug)) return buildMetadata({ path: `/${landingSlug}` });
  const page = await getLandingPage(landingSlug);
  return buildMetadata({
    path: `/${landingSlug}`,
    title: page?.title,
    description: page ? landingDescription(page.introText) : undefined,
    seo: page?.seo,
    image: page?.featuredWork?.[0]?.mainImage,
    imageAlt: page?.featuredWork?.[0]?.mainImage?.alt,
  });
}

export default async function IndustryLandingPage({ params }: LandingRouteProps) {
  const { landingSlug } = await params;
  if (RESERVED_ROOT_SLUGS.has(landingSlug)) notFound();
  const page = await getLandingPage(landingSlug);
  if (!page) notFound();
  const path = `/${landingSlug}`;
  const description = page.seo?.metaDescription || landingDescription(page.introText);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: page.seo?.metaTitle || page.title,
      description,
      image: page.featuredWork?.[0]?.mainImage,
      dateModified: page._updatedAt,
      mainEntityId: `${absoluteUrl(path)}#service`,
    }),
    serviceNodes({
      path,
      title: page.heroH1 || page.title,
      description,
      image: page.featuredWork?.[0]?.mainImage,
    }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: page.heroH1 || page.title, path },
      ],
    }),
    page.showFaq ? faqNode({ path, faqs: page.faqs }) : null,
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <LandingPageView page={page} />
    </>
  );
}
