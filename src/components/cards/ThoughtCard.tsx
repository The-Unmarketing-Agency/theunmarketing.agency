import Link from "next/link";

import type { ThoughtSummary } from "@/lib/sanity/types";
import { getThoughtAnimatedAsset, getThoughtSummary } from "@/lib/thought-summaries";

import { SanityImage } from "../content/SanityImage";

type ThoughtCardProps = {
  thought: ThoughtSummary;
  className?: string;
  priority?: boolean;
};

export function ThoughtCard({ thought, className, priority = false }: ThoughtCardProps) {
  const slug = thought.slug?.current;
  const summary = getThoughtSummary(slug, thought.bluf);
  const animatedAsset = getThoughtAnimatedAsset(slug);
  const content = (
    <>
      <div className="thought-card__media">
        <SanityImage
          alt={thought.featuredImage?.alt || ""}
          className="thought-card__image"
          image={thought.featuredImage}
          overrideSrc={animatedAsset || undefined}
          priority={priority}
          sizes="(max-width: 991px) calc(100vw - 66px), 313px"
          unoptimized={Boolean(animatedAsset)}
        />
      </div>
      <div className="thought-card__body">
        <div className="thought-card__meta">
          {thought.categories?.map((category) => category.title).filter(Boolean).join(" · ") || "Thought"}
        </div>
        <h3>{thought.title}</h3>
        {summary ? <p>{summary}</p> : null}
      </div>
    </>
  );

  const classes = ["thought-card", className].filter(Boolean).join(" ");
  if (!slug) return <article className={classes}>{content}</article>;

  return (
    <article className={classes}>
      <Link aria-label={`Read ${thought.title}`} href={`/thoughts/${slug}`}>
        {content}
      </Link>
    </article>
  );
}
