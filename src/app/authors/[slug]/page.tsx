import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { AuthorDetailView, Breadcrumbs } from "@/features/site-views";
import { getAuthor, getAuthorSlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import {
  breadcrumbNode,
  jsonLdGraph,
  organizationNode,
  profileNodes,
} from "@/lib/structured-data";

type AuthorRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAuthorSlugs();
}

export async function generateMetadata({ params }: AuthorRouteProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  return buildMetadata({
    path: `/authors/${slug}`,
    title: author ? `Thoughts from ${author.name}` : undefined,
    description: author?.bio || author?.role,
    image: author?.image,
    imageAlt: author?.image?.alt,
    authors: author ? [{ name: author.name, url: `/authors/${slug}` }] : undefined,
  });
}

export default async function AuthorDetailPage({ params }: AuthorRouteProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) notFound();
  const path = `/authors/${slug}`;
  const graph = jsonLdGraph([
    organizationNode(),
    profileNodes({ path, author }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "Authors", path: "/authors" },
        { name: author.name, path },
      ],
    }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/authors", label: "Authors" },
          { href: path, label: author.name },
        ]}
      />
      <AuthorDetailView author={author} thoughts={author.thoughts} />
    </>
  );
}
