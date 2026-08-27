import { createImageUrlBuilder } from "@sanity/image-url";

import { sanityConfig } from "./env";
import type { SanityImage } from "./types";

const builder = createImageUrlBuilder(sanityConfig);

export function imageUrl(
  source: SanityImage | undefined,
  options: { width?: number; height?: number; quality?: number; fit?: "crop" | "clip" | "fill" | "fillmax" | "max" | "scale" | "min" } = {},
) {
  if (!source?.asset?._ref && !source?.asset?.url) return undefined;

  const assetRef = source?.asset?._ref || "";
  const isGif = /-gif$/i.test(assetRef) || /\.gif(?:$|\?)/i.test(source?.asset?.url || "");

  // Never transform animated GIFs via Sanity image processing pipeline,
  // as auto("format"), width(), and fit() strip animation frames into a static image.
  if (isGif) {
    return source.asset?.url || builder.image(source).url();
  }

  let image = builder.image(source).auto("format");
  if (options.width) image = image.width(options.width);
  if (options.height) image = image.height(options.height);
  if (options.quality) image = image.quality(options.quality);
  if (options.fit) image = image.fit(options.fit);
  return image.url();
}
