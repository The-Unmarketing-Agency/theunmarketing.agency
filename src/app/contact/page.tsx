import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { ContactPageView, plainPageDescription } from "@/features/site-views";
import { getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/contact";

export async function generateMetadata() {
  const page = await getPage("contact");
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function ContactPage() {
  const page = await getPage("contact");
  if (!page) notFound();
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "ContactPage",
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      image: page.seo?.ogImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Contact", path }] }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <ContactPageView page={page} />
    </>
  );
}
