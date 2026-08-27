import { createClient } from "@sanity/client";

import { sanityConfig } from "./env";

export const sanityClient = createClient({
  ...sanityConfig,
  useCdn: false,
  perspective: "published",
  stega: false,
});
