import type { Faq } from "@/lib/sanity/types";
import { cmsPlainText } from "@/lib/content";

export type UniversalFaqItem =
  | {
      question?: string;
      answer?: string;
    }
  | Faq;

export type UniversalFAQSchemaProps = {
  faqItems?: readonly UniversalFaqItem[] | null;
  pageUrl?: string;
};

/**
 * UniversalFAQSchema
 * Emits https://schema.org FAQPage structured data for search engine & LLM optimization (AEO/SEO).
 * Returns null if no FAQs exist — completely silent on pages without FAQs.
 */
export function UniversalFAQSchema({ faqItems, pageUrl = "" }: UniversalFAQSchemaProps) {
  if (!faqItems || faqItems.length === 0) return null;

  const validItems = faqItems
    .map((faq) => {
      const question = cmsPlainText(faq.question);
      const answer = cmsPlainText(faq.answer);
      if (!question || !answer) return null;
      return {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    })
    .filter(Boolean);

  if (validItems.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems,
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      key={`faq-schema-${pageUrl || "universal"}`}
      type="application/ld+json"
    />
  );
}

export default UniversalFAQSchema;
