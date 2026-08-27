import { cmsPlainText } from "@/lib/content";
import type { Faq } from "@/lib/sanity/types";
import { UniversalFAQSchema, type UniversalFaqItem } from "@/components/content/UniversalFAQSchema";

export { UniversalFAQSchema, type UniversalFaqItem };

type FaqSectionProps = {
  faqs?: Faq[];
  title?: string;
  eyebrow?: string;
  className?: string;
  renderSchema?: boolean;
  pageUrl?: string;
};

function faqId(faq: Faq, index: number) {
  return `faq-${(faq._id || "item").replace(/[^a-zA-Z0-9_-]/g, "-")}-${index}`;
}

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  eyebrow = "FAQ",
  className,
  renderSchema = false,
  pageUrl,
}: FaqSectionProps) {
  const validFaqs =
    faqs
      ?.map((faq) => ({
        faq,
        question: cmsPlainText(faq.question),
        answer: cmsPlainText(faq.answer),
      }))
      .filter(({ question, answer }) => question && answer) ?? [];
  if (!validFaqs.length) return null;

  return (
    <section className={["faq-section", className].filter(Boolean).join(" ")}>
      <div className="container accordion">
        <div className="faq-section__heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="faq-list">
          {validFaqs.map(({ faq, question, answer }, index) => {
            const id = faqId(faq, index);
            const normalizedAnswer = answer
              .replace(/\.([A-Z])/g, ". $1")
              .replace(/(whether it works\.)\s*\n*\s*(We do all five)/g, "$1 $2");
            return (
              <details className="faq-item" key={faq._id || `${faq.question}-${index}`}>
                <summary aria-controls={`${id}-answer`} id={`${id}-question`}>
                  <span className="faq-question">{question}</span>
                  <span aria-hidden="true" className="faq-icon-circle">
                    <svg fill="none" height="25" viewBox="0 0 25 25" width="25" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12.5" cy="12.5" fill="var(--orange, #ff6600)" r="12.5" />
                      <path d="M12.5 7V18M7 12.5H18" stroke="white" strokeLinecap="square" strokeWidth="2" />
                    </svg>
                  </span>
                </summary>
                <div aria-labelledby={`${id}-question`} className="faq-item__answer" id={`${id}-answer`} role="region">
                  {normalizedAnswer.split(/\n{2,}/).map((paragraph, paragraphIndex) => (
                    <p key={`${id}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
      {renderSchema ? <UniversalFAQSchema faqItems={validFaqs} pageUrl={pageUrl} /> : null}
    </section>
  );
}
