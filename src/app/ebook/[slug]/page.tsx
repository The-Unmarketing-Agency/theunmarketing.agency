import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { Breadcrumbs, EbookPageView } from "@/features/site-views";
import { cmsPlainText } from "@/lib/content";
import { getEbook, getEbookSlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import {
  bookNodes,
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

type EbookRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getEbookSlugs();
}

export async function generateMetadata({ params }: EbookRouteProps) {
  const { slug } = await params;
  const ebook = await getEbook(slug);
  return buildMetadata({
    path: `/ebook/${slug}`,
    title: ebook?.title,
    description: ebook?.subheading || cmsPlainText(ebook?.description),
    seo: ebook?.seo,
    image: ebook?.seo?.ogImage || ebook?.coverImage,
    imageAlt: ebook?.coverImage?.alt,
  });
}

export default async function EbookDetailPage({ params }: EbookRouteProps) {
  const { slug } = await params;
  const ebook = await getEbook(slug);
  if (!ebook) notFound();
  const path = `/ebook/${slug}`;
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: ebook.seo?.metaTitle || ebook.title,
      description: ebook.seo?.metaDescription || ebook.subheading,
      image: ebook.seo?.ogImage || ebook.coverImage,
      dateModified: ebook._updatedAt,
      mainEntityId: `${absoluteUrl(path)}#book`,
    }),
    bookNodes({ path, ebook }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "EBook", path: "/thoughts" },
        { name: ebook.title, path },
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
          { href: path, label: ebook.title },
        ]}
      />
      <EbookPageView ebook={ebook} />
    </>
  );
}
