import Link from "next/link";
import Image from "next/image";

import { getWorkPreviewAsset, getWorkTagline } from "@/lib/work-preview-assets";
import type { WorkSummary } from "@/lib/sanity/types";

import { SanityImage } from "../content/SanityImage";

type WorkCardProps = {
  work: WorkSummary;
  className?: string;
  priority?: boolean;
  index?: number;
};

export function WorkCard({ work, className, priority, index }: WorkCardProps) {
  const slug = work.slug?.current;
  const previewAsset = getWorkPreviewAsset(slug);
  const shouldPrioritize = priority ?? (typeof index === "number" && index < 2);
  const content = (
    <>
      <div className="work-card__media">
        {previewAsset ? (
          <Image
            alt={work.mainImage?.alt || `${work.title} project image`}
            className="work-card__image"
            fill
            priority={shouldPrioritize}
            sizes="(max-width: 479px) calc(100vw - 66px), (max-width: 1199px) 90vw, 1040px"
            src={previewAsset}
          />
        ) : (
          <SanityImage
            alt={work.mainImage?.alt || `${work.title} project image`}
            className="work-card__image"
            fill
            image={work.mainImage}
            priority={shouldPrioritize}
            sizes="(max-width: 479px) calc(100vw - 66px), (max-width: 1199px) 90vw, 1040px"
          />
        )}
      </div>
      <div className="work-card__body">
        <div className="work-card__description">
          <div className="work-card__title-row">
            <h3>{work.title}</h3>
            <span aria-hidden="true" className="work-card__arrow">
              →
            </span>
          </div>
          {work.tagline ? <p className="work-card__tagline">{getWorkTagline(slug, work.tagline)}</p> : null}
        </div>
        {work.industry ? <p className="work-card__industry">{work.industry}</p> : <span />}
        {work.services?.length ? (
          <ul aria-label="Project services" className="tag-list">
            {work.services.map((service) => (
              <li key={service._id}>{service.title}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const classes = ["work-card", className].filter(Boolean).join(" ");
  if (!slug) return <article className={classes}>{content}</article>;

  return (
    <article className={classes}>
      <Link aria-label={`View ${work.title} case study`} href={`/work/${slug}`}>
        {content}
      </Link>
    </article>
  );
}
