import Link from "next/link";

import type { Author } from "@/lib/sanity/types";

import { SanityImage } from "../content/SanityImage";

type AuthorCardProps = {
  author: Author;
  className?: string;
};

export function AuthorCard({ author, className }: AuthorCardProps) {
  const slug = author.slug?.current;
  const classes = ["author-card", className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <div className="author-card__identity">
        <div className="author-card__media">
          <SanityImage
            alt={author.image?.alt || author.name}
            className="author-card__image"
            fill
            image={author.image}
            sizes="80px"
          />
        </div>
        <div className="author-card__body">
          <div>
            <h2>
              {slug ? <Link href={`/authors/${slug}`}>{author.name}</Link> : author.name}
            </h2>
            {author.role ? <p>{author.role}</p> : null}
          </div>
        </div>
      </div>
      <p className="eyebrow author-card__label">About the author</p>
      {author.bio ? <p className="author-card__bio">{author.bio}</p> : null}
      {author.linkedin ? (
        <a className="author-card__linkedin" href={author.linkedin} rel="noreferrer noopener" target="_blank">
          LinkedIn
        </a>
      ) : null}
    </article>
  );
}
