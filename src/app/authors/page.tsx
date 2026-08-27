import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { AuthorsIndexView, plainPageDescription } from "@/features/site-views";
import { getAuthors, getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

const path = "/authors";

export async function generateMetadata() {
  const page = await getPage("authors");
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function AuthorsPage() {
  const [page, authors] = await Promise.all([getPage("authors"), getAuthors()]);
  if (!page) notFound();
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "CollectionPage",
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({ path, items: [{ name: "Home", path: "/" }, { name: "Authors", path }] }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <AuthorsIndexView authors={authors} />
    </>
  );
}
