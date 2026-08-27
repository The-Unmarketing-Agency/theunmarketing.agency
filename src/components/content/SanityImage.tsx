import Image from "next/image";

import { imageUrl } from "@/lib/sanity/image";
import type { SanityImage as SanityImageValue } from "@/lib/sanity/types";

type SanityImageProps = {
  image?: SanityImageValue;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  fit?: "crop" | "clip" | "fill" | "fillmax" | "max" | "scale" | "min";
  overrideSrc?: string;
  unoptimized?: boolean;
};

export function SanityImage({
  image,
  alt,
  className,
  sizes = "(max-width: 767px) 100vw, 50vw",
  priority = false,
  fill = false,
  width,
  height,
  quality = 85,
  fit = "crop",
  overrideSrc,
  unoptimized,
}: SanityImageProps) {
  const sourceWidth = image?.asset?.metadata?.dimensions?.width;
  const sourceHeight = image?.asset?.metadata?.dimensions?.height;
  const requestedWidth = width ?? sourceWidth ?? 1600;
  const requestedHeight = height ?? sourceHeight ?? 1000;
  const resolvedWidth = sourceWidth ? Math.min(requestedWidth, sourceWidth) : requestedWidth;
  const resolvedHeight = sourceHeight ? Math.min(requestedHeight, sourceHeight) : requestedHeight;
  const assetRef = image?.asset?._ref || "";
  const isAnimated =
    Boolean(unoptimized) ||
    /-gif$/i.test(assetRef) ||
    /\.gif(?:$|\?)/i.test(image?.asset?.url || "") ||
    (overrideSrc ? /\.webp$/i.test(overrideSrc) || /\.gif$/i.test(overrideSrc) : false);

  const src =
    overrideSrc ||
    imageUrl(image, {
      width: fill ? Math.min(resolvedWidth, 2000) : resolvedWidth,
      height: fill ? undefined : resolvedHeight,
      quality,
      fit,
    });
  const resolvedAlt = alt ?? image?.alt ?? "";

  if (!src) {
    return (
      <span
        aria-hidden={resolvedAlt ? undefined : true}
        aria-label={resolvedAlt || undefined}
        className={["sanity-image-placeholder", className].filter(Boolean).join(" ")}
        role={resolvedAlt ? "img" : undefined}
      />
    );
  }

  if (fill) {
    return (
      <Image
        alt={resolvedAlt}
        className={className}
        fill
        placeholder={image?.asset?.metadata?.lqip ? "blur" : "empty"}
        blurDataURL={image?.asset?.metadata?.lqip}
        priority={priority}
        quality={quality}
        sizes={sizes}
        src={src}
        unoptimized={isAnimated}
      />
    );
  }

  return (
    <Image
      alt={resolvedAlt}
      className={className}
      height={resolvedHeight}
      placeholder={image?.asset?.metadata?.lqip ? "blur" : "empty"}
      blurDataURL={image?.asset?.metadata?.lqip}
      priority={priority}
      quality={quality}
      sizes={sizes}
      src={src}
      unoptimized={isAnimated}
      width={resolvedWidth}
    />
  );
}
