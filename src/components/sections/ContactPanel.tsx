import type { ReactNode } from "react";

import { ContactForm } from "@/components/forms/ContactForm";

import { Container } from "../ui/Container";

type ContactPanelProps = {
  heading?: string;
  text?: ReactNode;
  className?: string;
  variant?: "default" | "compact";
  eyebrow?: string | false;
  headingAs?: "h1" | "h2";
};

export function ContactPanel({
  heading = "Contact",
  text,
  className,
  variant = "default",
  eyebrow = "Get in touch",
  headingAs = "h2",
}: ContactPanelProps) {
  const Heading = headingAs;

  return (
    <section
      className={["contact-panel", `contact-panel--${variant}`, className].filter(Boolean).join(" ")}
    >
      <Container>
        <div className="contact-panel__copy">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <Heading>{heading}</Heading>
          {text ? <div className="contact-panel__text">{text}</div> : null}
        </div>

        <ContactForm />
      </Container>
    </section>
  );
}
