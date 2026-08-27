import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { AboutView, plainPageDescription } from "@/features/site-views";
import { getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/about";

export async function generateMetadata() {
  const page = await getPage("about");
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function AboutPage() {
  const page = await getPage("about");
  if (!page) notFound();
  const description = plainPageDescription(page);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "AboutPage",
      title: page.seo?.metaTitle || page.title,
      description,
      image: page.seo?.ogImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "About", path }] }),
    page.showFaq ? faqNode({ path, faqs: page.faqs }) : null,
  ]);

  return (
    <>
      <JsonLd graph={graph} />
      <AboutView page={page} />
    </>
  );
}
