import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { CareersPageView, plainPageDescription } from "@/features/site-views";
import { getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/unmarketing-careers";

export async function generateMetadata() {
  const page = (await getPage("careers")) || (await getPage("unmarketing-careers"));
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function CareersPage() {
  const page = (await getPage("careers")) || (await getPage("unmarketing-careers"));
  if (!page) notFound();
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      image: page.seo?.ogImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Careers", path }] }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <CareersPageView page={page} />
    </>
  );
}
