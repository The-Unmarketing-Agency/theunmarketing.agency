import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { Breadcrumbs, CategoryView } from "@/features/site-views";
import { getCategory, getCategorySlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

type CategoryRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getCategorySlugs();
}

export async function generateMetadata({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  return buildMetadata({
    path: `/thoughts-categories/${slug}`,
    title: category ? `Thoughts on ${category.title}` : undefined,
    description: category?.description,
    image: category?.thoughts?.[0]?.featuredImage,
  });
}

export default async function CategoryPage({ params }: CategoryRouteProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const path = `/thoughts-categories/${slug}`;
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      type: "CollectionPage",
      title: `${category.title} Thoughts`,
      description: category.description,
      image: category.thoughts?.[0]?.featuredImage,
    }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "Thoughts", path: "/thoughts" },
        { name: category.title, path },
      ],
    }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/thoughts", label: "Thoughts" },
          { href: path, label: category.title },
        ]}
      />
      <CategoryView category={category} thoughts={category.thoughts} />
    </>
  );
}
