import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { HomeView, plainPageDescription } from "@/features/site-views";
import { getHomePage, getWorks } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbNode, jsonLdGraph, organizationNode, webPageNode } from "@/lib/structured-data";

export async function generateMetadata() {
  const page = await getHomePage();
  if (!page) return buildMetadata({ path: "/" });
  return buildMetadata({
    path: "/",
    title: page.title,
    description: plainPageDescription(page),
    seo: page.seo,
    image: page.seo?.ogImage || page.featuredWork?.[0]?.mainImage,
  });
}

export default async function HomePage() {
  const [page, allWorks] = await Promise.all([getHomePage(), getWorks()]);
  if (!page) notFound();
  const description = plainPageDescription(page);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path: "/",
      title: page.seo?.metaTitle || page.title,
      description,
      image: page.seo?.ogImage || page.featuredWork?.[0]?.mainImage,
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({
      path: "/",
      items: [{ name: "Home", path: "/" }],
    }),
  ]);

  return (
    <>
      <JsonLd graph={graph} />
      <HomeView allWorks={allWorks} page={page} />
    </>
  );
}
