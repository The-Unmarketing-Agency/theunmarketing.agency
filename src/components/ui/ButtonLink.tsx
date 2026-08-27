import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "text";
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href" | "children">;

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  target,
  rel,
  ...props
}: ButtonLinkProps) {
  const classes = ["button-link", `button-link--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  const isExternal = /^(?:https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

  if (isExternal) {
    const safeRel = target === "_blank" ? rel ?? "noreferrer noopener" : rel;

    return (
      <a className={classes} href={href} rel={safeRel} target={target} {...props}>
        <span>{children}</span>
        <span aria-hidden="true" className="button-link__arrow">
          ↗
        </span>
      </a>
    );
  }

  return (
    <Link className={classes} href={href} rel={rel} target={target} {...props}>
      <span>{children}</span>
      <span aria-hidden="true" className="button-link__arrow">
        →
      </span>
    </Link>
  );
}
