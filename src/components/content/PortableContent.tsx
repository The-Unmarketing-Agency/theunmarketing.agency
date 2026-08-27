import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { decodeHtmlEntities, normalizeCmsHref, safeVideoUrl } from "@/lib/content";
import type { PortableTextValue, SanityImage as SanityImageValue } from "@/lib/sanity/types";

import { SanityImage } from "./SanityImage";

type PortableContentProps = {
  value?: PortableTextValue;
  className?: string;
};

type LinkMark = {
  value?: { href?: string; internal?: boolean };
  children?: ReactNode;
};

type TableValue = {
  rows?: Array<{ _key?: string; cells?: string[] }>;
};

function normalizePortableText(value: PortableTextValue) {
  const result: PortableTextValue = [];
  for (let i = 0; i < value.length; i++) {
    const block = value[i];
    if (block._type === "image") {
      let caption: string | undefined =
        typeof block.caption === "string" ? block.caption : undefined;
      if (!caption && i + 1 < value.length) {
        const nextBlock = value[i + 1];
        if (
          nextBlock._type === "block" &&
          (nextBlock.style === "normal" || !nextBlock.style) &&
          !nextBlock.listItem &&
          Array.isArray(nextBlock.children) &&
          nextBlock.children.length === 1 &&
          typeof nextBlock.children[0]?.text === "string" &&
          nextBlock.children[0].text.trim().length > 0 &&
          nextBlock.children[0].text.trim().length < 200 &&
          !nextBlock.children[0].text.includes("\n\n")
        ) {
          caption = nextBlock.children[0].text.trim();
          i++; // Consume nextBlock as caption
        }
      }

      result.push({
        ...block,
        caption: caption ? decodeHtmlEntities(caption) : undefined,
      });
      continue;
    }

    result.push({
      ...block,
      children: Array.isArray(block.children)
        ? block.children.map((child) =>
            child && typeof child === "object" && "text" in child && typeof child.text === "string"
              ? { ...child, text: decodeHtmlEntities(child.text) }
              : child,
          )
        : block.children,
      rows: Array.isArray(block.rows)
        ? block.rows.map((row) =>
            row && typeof row === "object" && "cells" in row && Array.isArray(row.cells)
              ? {
                  ...row,
                  cells: row.cells.map((cell: unknown) =>
                    typeof cell === "string" ? decodeHtmlEntities(cell) : cell,
                  ),
                }
              : row,
          )
        : block.rows,
    });
  }
  return result;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ value, children }: LinkMark) => {
      const href = normalizeCmsHref(value?.href);
      if (!href) return <>{children}</>;

      const isInternal = value?.internal || href.startsWith("/") || href.startsWith("#");
      if (isInternal) return <Link href={href}>{children}</Link>;

      const isAllowed = /^(?:https?:|mailto:|tel:)/i.test(href);
      if (!isAllowed) return <>{children}</>;

      if (!/^https?:/i.test(href)) return <a href={href}>{children}</a>;

      return (
        <a href={href} rel="noreferrer noopener" target="_blank">
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const image = value as SanityImageValue;
      return (
        <figure className="portable-content__figure">
          <SanityImage image={image} sizes="(max-width: 767px) 100vw, 840px" />
          {image.caption ? <figcaption>{decodeHtmlEntities(image.caption)}</figcaption> : null}
        </figure>
      );
    },
    table: ({ value }) => {
      const { rows = [] } = value as TableValue;
      if (!rows.length) return null;
      const [headingRow, ...bodyRows] = rows;

      return (
        <div className="portable-content__table-wrap" role="region" aria-label="Scrollable data table" tabIndex={0}>
          <table>
            <thead>
              <tr>
                {(headingRow.cells ?? []).map((cell, index) => (
                  <th key={`${headingRow._key ?? "heading"}-${index}`} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, rowIndex) => (
                <tr key={row._key ?? `row-${rowIndex}`}>
                  {(row.cells ?? []).map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th key={`${row._key ?? rowIndex}-${cellIndex}`} scope="row">
                        {cell}
                      </th>
                    ) : (
                      <td key={`${row._key ?? rowIndex}-${cellIndex}`}>{cell}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    youtubeEmbed: ({ value }) => {
      const src = safeVideoUrl((value as { url?: string }).url);
      if (!src) return null;

      return (
        <div className="portable-content__video">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={src}
            title="Embedded video"
          />
        </div>
      );
    },
  },
  unknownType: () => null,
};

export function PortableContent({ value, className }: PortableContentProps) {
  if (!value?.length) return null;
  const normalizedValue = normalizePortableText(value);

  return (
    <div className={["portable-content", className].filter(Boolean).join(" ")}>
      <PortableText components={components} value={normalizedValue} />
    </div>
  );
}
