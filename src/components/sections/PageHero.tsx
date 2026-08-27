import type { ReactNode } from "react";

import { Container } from "../ui/Container";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  lead?: ReactNode;
  intro?: ReactNode;
  secondary?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: "default" | "display" | "article" | "home";
};

export function PageHero({
  title,
  eyebrow,
  lead,
  intro,
  secondary,
  actions,
  children,
  className,
  size = "default",
}: PageHeroProps) {
  const primaryLead = lead ?? intro;

  return (
    <section className={["page-hero", `page-hero--${size}`, className].filter(Boolean).join(" ")}>
      <Container>
        {eyebrow ? <p className="eyebrow page-hero__eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {primaryLead || secondary || actions || children ? (
          <div className="page-hero__lower">
            {primaryLead ? <div className="page-hero__intro">{primaryLead}</div> : null}
            {secondary ? <div className="page-hero__secondary">{secondary}</div> : null}
            {actions ? <div className="page-hero__actions">{actions}</div> : null}
            {children ? <div className="page-hero__content">{children}</div> : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
