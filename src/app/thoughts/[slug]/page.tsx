import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { ThoughtDetailView } from "@/features/site-views";
import { getThought, getThoughtSlugs } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import {
  articleNode,
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  organizationNode,
  webPageNode,
} from "@/lib/structured-data";

import { getThoughtSummary } from "@/lib/thought-summaries";

type ThoughtRouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getThoughtSlugs();
}

export async function generateMetadata({ params }: ThoughtRouteProps) {
  const { slug } = await params;
  const thought = await getThought(slug);
  const title = thought?.title || thought?.seo?.metaTitle;
  const description = getThoughtSummary(slug, thought?.bluf || thought?.seo?.metaDescription);
  return buildMetadata({
    path: `/thoughts/${slug}`,
    title,
    description,
    seo: {
      ...thought?.seo,
      metaTitle: title,
      metaDescription: description,
    },
    image: thought?.featuredImage,
    imageAlt: thought?.featuredImage?.alt,
    type: "article",
    publishedTime: thought?.publishedAt,
    modifiedTime: thought?._updatedAt,
    authors: thought?.author?.name
      ? [
          {
            name: thought.author.name,
            url: thought.author.slug?.current
              ? `/authors/${thought.author.slug.current}`
              : undefined,
          },
        ]
      : undefined,
  });
}

export default async function ThoughtDetailPage({ params }: ThoughtRouteProps) {
  const { slug } = await params;
  const thought = await getThought(slug);
  if (!thought) notFound();
  const path = `/thoughts/${slug}`;
  const title = thought.title || thought.seo?.metaTitle || "Thought";
  const description = getThoughtSummary(slug, thought.bluf || thought.seo?.metaDescription);
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title,
      description,
      image: thought.seo?.ogImage || thought.featuredImage,
      dateModified: thought._updatedAt,
      mainEntityId: `${absoluteUrl(path)}#article`,
    }),
    articleNode({ path, thought, title, description }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "Thoughts", path: "/thoughts" },
        { name: title || thought.title || "Thought", path },
      ],
    }),
    thought.showFaq ? faqNode({ path, faqs: thought.faqs }) : null,
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <ThoughtDetailView thought={thought} />
    </>
  );
}
