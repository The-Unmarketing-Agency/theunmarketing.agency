import { sanityClient } from "./client";

const DEFAULT_REVALIDATE_SECONDS = 60 * 60;

type SanityFetchOptions = {
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
};

export async function sanityFetch<T>(
  query: string,
  { params = {}, tags = [], revalidate = DEFAULT_REVALIDATE_SECONDS }: SanityFetchOptions = {},
): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}
