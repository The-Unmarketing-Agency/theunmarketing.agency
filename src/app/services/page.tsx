import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { ServicesView, plainPageDescription } from "@/features/site-views";
import { servicesFromPageSections } from "@/lib/page";
import { getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  organizationNode,
  serviceNodes,
  webPageNode,
} from "@/lib/structured-data";

const path = "/services";

export async function generateMetadata() {
  const page = await getPage("services");
  return buildMetadata({
    path,
    title: page?.seo?.metaTitle || "Branding Agency Services | Strategy, Identity, Voice & Launch",
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function ServicesPage() {
  const page = await getPage("services");
  if (!page) notFound();
  const description = plainPageDescription(page);
  const services = servicesFromPageSections(page);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: page.seo?.metaTitle || page.title,
      description,
      image: page.seo?.ogImage,
      dateModified: page._updatedAt,
    }),
    serviceNodes({ path, services }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Services", path }] }),
    page.showFaq ? faqNode({ path, faqs: page.faqs }) : null,
  ]);

  return (
    <>
      <JsonLd graph={graph} />
      <ServicesView page={page} />
    </>
  );
}
