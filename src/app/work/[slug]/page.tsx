import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { WorkDetailView } from "@/features/site-views";
import { getWork, getWorkSlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import {
  breadcrumbNode,
  creativeWorkNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

type WorkRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getWorkSlugs();
}

export async function generateMetadata({ params }: WorkRouteProps) {
  const { slug } = await params;
  const work = await getWork(slug);
  return buildMetadata({
    path: `/work/${slug}`,
    title: work ? `Unmarketing | ${work.title}` : undefined,
    description: work?.tagline,
    image: work?.mainImage,
    imageAlt: work?.mainImage?.alt,
  });
}

export default async function WorkDetailPage({ params }: WorkRouteProps) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();
  const path = `/work/${slug}`;
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: work.title,
      description: work.tagline,
      image: work.mainImage,
      dateModified: work._updatedAt,
      mainEntityId: `${absoluteUrl(path)}#creative-work`,
    }),
    creativeWorkNode({ path, work }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "Work", path: "/work" },
        { name: work.title, path },
      ],
    }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <WorkDetailView work={work} />
    </>
  );
}
