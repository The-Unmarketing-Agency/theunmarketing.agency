import { notFound } from "next/navigation";

import { JsonLd } from "@/components/content/JsonLd";
import { LegalPageView, plainPageDescription } from "@/features/site-views";
import { getPage } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbNode, jsonLdGraph, organizationNode, webPageNode } from "@/lib/structured-data";

const path = "/privacy-policy";

export async function generateMetadata() {
  const page = await getPage("privacy-policy");
  return buildMetadata({
    path,
    title: page?.title,
    description: page ? plainPageDescription(page) : undefined,
    seo: page?.seo,
  });
}

export default async function PrivacyPolicyPage() {
  const page = await getPage("privacy-policy");
  if (!page) notFound();
  const graph = jsonLdGraph([
    organizationNode(),
    webPageNode({
      path,
      title: page.seo?.metaTitle || page.title,
      description: plainPageDescription(page),
      dateModified: page._updatedAt,
    }),
    breadcrumbNode({
      path,
      items: [
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path },
      ],
    }),
  ]);
  return (
    <>
      <JsonLd graph={graph} />
      <LegalPageView page={page} />
    </>
  );
}
