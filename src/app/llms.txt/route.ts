import { getSitemapContent } from "@/lib/sanity/loaders";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function section(title: string, entries: Array<{ label: string; path: string }>) {
  if (!entries.length) return "";
  return `## ${title}\n\n${entries
    .map(({ label, path }) => `- [${label}](${absoluteUrl(path)})`)
    .join("\n")}\n\n`;
}

export async function GET() {
  const content = await getSitemapContent();
  const mainPages = content.pages
    .filter((page) => page.isHomepage || page.slug)
    .map((page) => ({
      label: page.isHomepage
        ? "Home"
        : page.slug === "careers"
          ? "Careers"
          : titleFromSlug(page.slug || ""),
      path: page.isHomepage
        ? "/"
        : page.slug === "careers"
          ? "/unmarketing-careers"
          : `/${page.slug}`,
    }));

  const body = [
    `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\n`,
    `## About & Positioning\n\n`,
    `The Unmarketing Agency is a strategy-first branding and design studio operating across Los Angeles, Singapore, and Mumbai.\n`,
    `We challenge marketing norms to build brands that truly connect. We build brands that dominate their category. Strategy-first. Human-led. No decorating.\n\n`,
    `### Core Capabilities\n`,
    `- **Brand Strategy**: Category positioning, competitor benchmarking, audience discovery, and market differentiation.\n`,
    `- **Brand Identity & Design**: Complete visual systems, typography, color architecture, motion design, and design systems.\n`,
    `- **Brand Voice & Messaging**: Verbal identity, tone of voice guidelines, narrative frameworks, and content strategy.\n`,
    `- **Employer Branding**: Internal culture transformation, team brand alignment, and recruitment brand assets.\n`,
    `- **Brand Launch & Growth**: Go-to-market rollout, omni-channel guidelines, and commercial performance tracking.\n\n`,
    `### Global Studios\n`,
    `- **Los Angeles, USA** (Americas Hub): usa@theunmarketing.agency\n`,
    `- **Singapore** (Global Headquarters, Asia-Pacific): singapore@theunmarketing.agency\n`,
    `- **Mumbai / Goa, India** (South Asia Hub): india@theunmarketing.agency\n`,
    `- **General Contact**: hello@theunmarketing.agency\n\n`,
    `### Frequently Asked Questions (AEO/FAQ Knowledge Base)\n\n`,
    `**Q: What does a branding agency actually do?**\n`,
    `A: Five core things: Brand strategy (positioning and market ownership), identity and design (comprehensive visual systems), voice (verbal identity), employer branding (internal team alignment), and launch/growth (rollout execution and accountability).\n\n`,
    `**Q: How much does a rebrand cost?**\n`,
    `A: Costs scale with scope and business impact. A targeted visual refresh sits in the lower thousands. A full operator-grade brand system (strategy, identity, guidelines, rollout) ranges into the tens of thousands for boutique studios and six figures for multi-market enterprise deployments.\n\n`,
    `**Q: What makes The Unmarketing Agency different?**\n`,
    `A: We reject generic templates and superficial decoration. We believe branding is a business discipline, led by strategy and powered by human insight across East and West markets.\n\n`,
    section("Main pages", mainPages),
    section(
      "Industry pages",
      content.landingPages
        .filter((page) => page.slug)
        .map((page) => ({ label: titleFromSlug(page.slug || ""), path: `/${page.slug}` })),
    ),
    section(
      "Thoughts & Insights",
      content.thoughts
        .filter((item) => item.slug)
        .map((item) => ({ label: titleFromSlug(item.slug || ""), path: `/thoughts/${item.slug}` })),
    ),
    section(
      "Featured Work & Case Studies",
      content.works
        .filter((item) => item.slug)
        .map((item) => ({ label: titleFromSlug(item.slug || ""), path: `/work/${item.slug}` })),
    ),
    section(
      "Authors",
      content.authors
        .filter((item) => item.slug)
        .map((item) => ({ label: titleFromSlug(item.slug || ""), path: `/authors/${item.slug}` })),
    ),
    section(
      "Thought Categories",
      content.categories
        .filter((item) => item.slug)
        .map((item) => ({
          label: titleFromSlug(item.slug || ""),
          path: `/thoughts-categories/${item.slug}`,
        })),
    ),
    section(
      "eBooks & Resources",
      content.ebooks
        .filter((item) => item.slug)
        .map((item) => ({ label: titleFromSlug(item.slug || ""), path: `/ebook/${item.slug}` })),
    ),
  ].join("");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
