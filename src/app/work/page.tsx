import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { WorkIndexView, plainPageDescription } from "@/features/site-views";
import { getPage, getWorks } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/work";

export async function generateMetadata() {
  const page = await getPage("work");
  return buildMetadata({
    path,
    title: page?.seo?.metaTitle || "Branding Portfolio & Case Studies | Unmarketing",
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function WorkPage() {
  const [page, allWorks] = await Promise.all([getPage("work"), getWorks()]);
  if (!page) notFound();
  const works = allWorks.length ? allWorks : (page.featuredWork ?? []);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "CollectionPage",
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      image: page.seo?.ogImage || works[0]?.mainImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Work", path }] }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <WorkIndexView page={page} works={works} />
    </>
  );
}
