import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { ThoughtsIndexView, plainPageDescription } from "@/features/site-views";
import { getCategories, getPage, getThoughts } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/thoughts";

export async function generateMetadata() {
  const page = await getPage("thoughts");
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function ThoughtsPage() {
  const [page, thoughts, categories] = await Promise.all([
    getPage("thoughts"),
    getThoughts(),
    getCategories(),
  ]);
  if (!page) notFound();
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "CollectionPage",
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      image: page.seo?.ogImage || thoughts[0]?.featuredImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Thoughts", path }] }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <ThoughtsIndexView categories={categories} page={page} thoughts={thoughts} />
    </>
  );
}
