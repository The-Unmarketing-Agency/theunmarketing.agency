import { SearchView } from "@/features/site-views";
import { getThoughts, getWorks } from "@/lib/sanity/loaders";
import { buildMetadata } from "@/lib/seo";

type SearchPageProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export const metadata = buildMetadata({
  path: "/search",
  title: "Search | Unmarketing",
  description: "Search published thoughts and work from The Unmarketing Agency.",
  noIndex: true,
});

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [{ query }, thoughts, works] = await Promise.all([
    searchParams,
    getThoughts(),
    getWorks(),
  ]);
  const searchQuery = Array.isArray(query) ? query[0] || "" : query || "";
  return <SearchView query={searchQuery.slice(0, 120)} thoughts={thoughts} works={works} />;
}
