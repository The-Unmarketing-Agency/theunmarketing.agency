import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { AuthorCard } from "@/components/cards/AuthorCard";
import { ThoughtCard } from "@/components/cards/ThoughtCard";
import { WorkCard } from "@/components/cards/WorkCard";
import { PortableContent } from "@/components/content/PortableContent";
import { SanityImage } from "@/components/content/SanityImage";
import { getWorkPreviewAsset, getWorkTagline } from "@/lib/work-preview-assets";
import { getThoughtAnimatedAsset } from "@/lib/thought-summaries";
import { ContactPanel } from "@/components/sections/ContactPanel";
import { ArticleProgressBar } from "@/components/thoughts/ArticleProgressBar";
import { ArticleShareButtons } from "@/components/thoughts/ArticleShareButtons";
import { ThoughtsExplorer } from "@/components/thoughts/ThoughtsExplorer";
import { EbookDownloadForm } from "@/components/ebook/EbookDownloadForm";
import { WorkDetailInteractive } from "@/components/work/WorkDetailInteractive";
import { FaqSection } from "@/components/sections/FaqSection";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import {
  calculateReadingTime,
  cmsPlainText,
  formatPublishedDate,
  portableTextToPlain,
  resolveSanityColor,
  safeVideoUrl,
} from "@/lib/content";
import type {
  Author,
  CaseStudyLogo,
  Ebook,
  LandingPage,
  PageDocument,
  PortableTextValue,
  SanityImage as SanityImageValue,
  Thought,
  ThoughtCategory,
  ThoughtSummary,
  Work,
  WorkSummary,
} from "@/lib/sanity/types";

type WorkGridProps = {
  works?: WorkSummary[] | null;
  heading?: string | null;
};

export function WorkGrid({ works = [], heading = "Selected work" }: WorkGridProps) {
  const items = works ?? [];
  if (!items.length) return null;
  return (
    <section className="work-section section-space">
      <Container>
        {heading ? (
          <div className="section-heading">
            <p className="eyebrow">Case studies</p>
            <h2>{heading}</h2>
          </div>
        ) : null}
        <div className="work-grid">
          {items.map((work, index) => (
            <WorkCard key={work._id} priority={index < 2} work={work} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function BrandCta({
  heading,
  text,
}: {
  heading?: string;
  text?: ReactNode;
}) {
  return (
    <section className="section section-cta-wrap">
      <div className="container cta">
        <h2 className="heading-jumbo gray">
          {heading && !heading.toLowerCase().includes("ready to reimagine") ? (
            heading
          ) : (
            <>
              Ready to reimagine your
              <br className="hide-mobile" />
              {" "}brand&apos;s{" "}
              <span className="serif-text white-text">future</span>?
            </>
          )}
        </h2>
        <div className="cta-button-wrap">
          <Link className="primary-button cc-jumbo-button w-inline-block" href="/contact">
            <div className="text-block">Let&apos;s chat!</div>
          </Link>
        </div>
      </div>
      {text ? <div className="brand-cta__text">{text}</div> : null}
    </section>
  );
}

type ThoughtGridProps = {
  thoughts?: ThoughtSummary[] | null;
  heading?: string;
};

export function ThoughtGrid({ thoughts = [], heading }: ThoughtGridProps) {
  const items = thoughts ?? [];
  if (!items.length) return null;
  return (
    <section className="thought-section section-space">
      <Container>
        {heading ? (
          <div className="section-heading">
            <p className="eyebrow">Ideas and observations</p>
            <h2>{heading}</h2>
          </div>
        ) : null}
        <div className="thought-grid">
          {items.map((thought, index) => (
            <ThoughtCard key={thought._id} priority={index < 3} thought={thought} />
          ))}
        </div>
      </Container>
    </section>
  );
}

const HOME_WORK_ORDER = [
  "renuvi",
  "dubai-font",
  "meraas",
  "adcb",
  "femmily",
  "wimera",
  "keyreply",
];

export function HomeView({
  page,
  allWorks,
}: {
  page: PageDocument;
  allWorks?: WorkSummary[];
}) {
  const worksPool = allWorks?.length ? allWorks : (page.featuredWork || []);
  const featuredWorks = HOME_WORK_ORDER.map((slug) =>
    worksPool.find((w) => w.slug?.current === slug)
  ).filter((w): w is WorkSummary => Boolean(w));

  return (
    <div className="home-page">
      {/* 1. Hero Header */}
      <section className="section home-header">
        <div className="container home-header">
          <h1 className="heading center gray">
            We are a branding and design studio in <span className="white-text">Los Angeles</span>,{" "}
            <span className="white-text">Singapore</span>, and <span className="white-text">Mumbai</span>.
            <br />
          </h1>
          <p className="heading center gray">
            In a world where AI generates logos overnight, the <span className="white-text">brands</span> that win are the ones built with{" "}
            <span className="white-text">strategy, craft and human insight.</span>
          </p>
        </div>
        <div className="container home-header block-2">
          <p className="heading center accent">
            We’re not just designing for today. We’re shaping your brand’s tomorrow.
          </p>
        </div>
      </section>

      {/* 2. Top CTA */}
      <section className="section section-cta-wrap">
        <div className="container cta">
          <h2 className="heading-jumbo gray">
            Ready to reimagine your
            <br className="hide-mobile" />
            {" "}brand&apos;s{" "}
            <span className="serif-text white-text">future</span>?
          </h2>
          <div className="cta-button-wrap">
            <Link className="primary-button cc-jumbo-button w-inline-block" href="/contact">
              <div className="text-block">Let&apos;s chat!</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 2nd Fold Intro */}
      <div className="container _2nd-fold">
        <h2 className="heading">
          We challenge marketing norms to build brands
          <br className="hide-mobile" />
          {" "}that truly connect.
        </h2>
        <h2 className="heading accent">
          We build brands that dominate their category.
          <br className="hide-mobile" />
          {" "}Strategy-first. Human-led
        </h2>
      </div>

      {/* 4. Featured Projects Collection */}
      <div className="container featured-project">
        <div className="w-dyn-list">
          <div className="w-dyn-items" role="list">
            {featuredWorks.map((work, index) => {
              const slug = work.slug?.current;
              const previewAsset = getWorkPreviewAsset(slug);
              return (
                <div className="project-wrap w-dyn-item" key={work._id} role="listitem">
                  {slug ? (
                    <Link className="featured-project-images w-inline-block" href={`/work/${slug}`}>
                      {previewAsset ? (
                        <Image
                          alt={work.mainImage?.alt || `${work.title} Branding`}
                          className="featured-project-image"
                          height={540}
                          priority={index < 2}
                          sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                          src={previewAsset}
                          width={1920}
                        />
                      ) : (
                        <SanityImage
                          alt={work.mainImage?.alt || `${work.title} Branding`}
                          className="featured-project-image"
                          image={work.mainImage}
                          priority={index < 2}
                          sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                        />
                      )}
                    </Link>
                  ) : (
                    <div className="featured-project-images">
                      {previewAsset ? (
                        <Image
                          alt={work.mainImage?.alt || `${work.title} Branding`}
                          className="featured-project-image"
                          height={540}
                          priority={index < 2}
                          sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                          src={previewAsset}
                          width={1920}
                        />
                      ) : (
                        <SanityImage
                          alt={work.mainImage?.alt || `${work.title} Branding`}
                          className="featured-project-image"
                          image={work.mainImage}
                          priority={index < 2}
                          sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                        />
                      )}
                    </div>
                  )}

                  <div className="featured-project-info">
                    <div className="featured-project-description">
                      <div className="project-title-wrap">
                        {slug ? (
                          <Link className="project-title-link w-inline-block" href={`/work/${slug}`}>
                            <h3 className="heading caps project-title">{work.title}</h3>
                            <div className="link-underline thinner" />
                          </Link>
                        ) : (
                          <h3 className="heading caps project-title">{work.title}</h3>
                        )}
                        <div className="project-arrow w-embed">
                          <svg
                            fill="none"
                            height="25"
                            viewBox="0 0 100 25"
                            width="80"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M97.0696 10.8398H1.7598C0.787891 10.8398 0 11.6277 0 12.5996C0 13.5716 0.787891 14.3594 1.7598 14.3594H97.0696V10.8398Z"
                              fill="white"
                            />
                            <path
                              d="M85.7633 24.5996C85.2177 24.5996 84.681 24.3462 84.3361 23.8728C83.7659 23.0862 83.9401 21.9845 84.7285 21.4161L95.942 13.2911C96.2288 13.0835 96.3925 12.8477 96.3925 12.6435C96.3942 12.4394 96.2306 12.2018 95.9437 11.9924L84.7197 3.77939C83.9366 3.20569 83.7659 2.10406 84.3396 1.32095C84.9115 0.536073 86.0096 0.365374 86.798 0.93907L98.022 9.15207C99.2257 10.032 99.9138 11.3078 99.9103 12.6506C99.9085 13.9933 99.2134 15.2656 98.0062 16.1402L86.7927 24.2652C86.483 24.4905 86.1223 24.5996 85.7633 24.5996Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      </div>
                      {work.tagline ? (
                        <p className="paragraph line-height-1-5">
                          {getWorkTagline(slug, work.tagline)}
                        </p>
                      ) : null}
                    </div>

                    <div className="featured-project-tags">
                      <div className="project-tags">
                        {work.industry ? (
                          <div className="featured-project-industry">
                            <p className="paragraph-tiny tags">{work.industry}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="w-dyn-list">
                      <div className="service-grid home w-dyn-items" role="list">
                        {work.services?.map((service) => (
                          <div className="service-wrap w-dyn-item" key={service._id} role="listitem">
                            <p className="paragraph-tiny tags services-tag">{service.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* More Case Studies Link */}
        <Link className="more-case-link w-inline-block" href="/work">
          <p className="paragraph-bigger orange">More Case Studies</p>
          <div className="project-arrow-wrap">
            <div className="project-arrow read-more w-embed">
              <svg
                fill="none"
                height="25"
                viewBox="0 0 117 28"
                width="80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M113.248 11.9473H2.0531C0.919206 11.9473 0 12.8665 0 14.0004C0 15.1343 0.919206 16.0535 2.0531 16.0535H113.248V11.9473Z"
                  fill="#FF6600"
                />
                <path
                  d="M100.057 28C99.4207 28 98.7945 27.7043 98.3921 27.1521C97.7269 26.2343 97.9301 24.9491 98.8499 24.2859L111.932 14.8068C112.267 14.5645 112.458 14.2894 112.458 14.0512C112.46 13.8131 112.269 13.5359 111.934 13.2916L98.8396 3.70974C97.926 3.04043 97.7269 1.75519 98.3962 0.841558C99.0634 -0.0741253 100.345 -0.273274 101.264 0.396037L114.359 9.97787C115.763 11.0044 116.566 12.4929 116.562 14.0594C116.56 15.6259 115.749 17.1103 114.341 18.1307L101.258 27.6099C100.897 27.8727 100.476 28 100.057 28Z"
                  fill="#FF6600"
                />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* 5. Bottom CTA */}
      <section className="section section-cta-wrap">
        <div className="container cta">
          <h2 className="heading-jumbo gray">
            Ready to reimagine your
            <br className="hide-mobile" />
            {" "}brand&apos;s{" "}
            <span className="serif-text white-text">future</span>?
          </h2>
          <div className="cta-button-wrap">
            <Link className="primary-button cc-jumbo-button w-inline-block" href="/contact">
              <div className="text-block">Let&apos;s chat!</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function pageSections(page: PageDocument) {
  return [1, 2, 3, 4, 5]
    .map((index) => {
      const key = `section${index}` as const;
      return {
        id: `${page._id}-${index}`,
        title: page[`${key}H3` as keyof PageDocument] as string | undefined,
        capabilities: page[`${key}H4` as keyof PageDocument] as string | undefined,
        text: page[`${key}Text` as keyof PageDocument] as PageDocument["section1Text"],
      };
    })
    .filter((section) => section.title || section.capabilities || section.text?.length);
}

function getClientIndex(logo: SanityImageValue): number {
  const alt = (logo.alt || "").toLowerCase();
  const asset = logo.asset as { url?: string; originalFilename?: string } | undefined;
  const filename = (asset?.originalFilename || asset?.url || "").toLowerCase();
  const text = `${alt} ${filename}`;

  if (text.includes("meraas")) return 0;
  if (text.includes("adcb") || text.includes("abu dhabi")) return 1;
  if (text.includes("tiger")) return 2;
  if (text.includes("sole")) return 3;
  if (text.includes("dubai municipality")) return 4;
  if (text.includes("dubai")) return 5;
  if (text.includes("singapore")) return 6;
  if (text.includes("nike")) return 7;
  if (text.includes("tata")) return 8;
  if (text.includes("fca") || text.includes("fiat")) return 9;
  return 999;
}

function sortClientLogos(logos: SanityImageValue[] | undefined) {
  if (!logos) return [];
  return [...logos].sort((a, b) => getClientIndex(a) - getClientIndex(b));
}

export function AboutView({ page }: { page: PageDocument }) {
  const sections = pageSections(page);
  const sortedLogos = sortClientLogos(page.clientLogos);

  return (
    <div className="about-page">
      {/* 1. Motto Hero Header Section */}
      <section className="section home-header">
        <h1 className="text-label">Motto</h1>
        <div className="container home-header block-1">
          <h2 className="heading center accent">
            <span>
              <em>
                Great brands are all around us. <br />
                It is a perfect blend of reason, data, and feeling.
              </em>
            </span>
          </h2>
        </div>
        <div className="container home-header">
          <h2 className="heading center gray">
            It’s what we do with equal measure: to go{" "}
            <br className="hide-mobile" />
            from data to imagination; to <span className="white-text">meaningful</span> and{" "}
            <br className="hide-mobile" />
            <span className="white-text">purposeful design</span>. To forge identities that{" "}
            <br className="hide-mobile" />
            reflect intellect, beauty and accuracy.
            <br />
          </h2>
        </div>
        <div className="container home-header block-2">
          <p className="heading center accent">
            <em>To create work that stands the test of time with a solution that is truly yours.</em>
          </p>
        </div>
      </section>

      {/* 2. Our Process Section */}
      {sections.length > 0 ? (
        <section className="section process-section">
          <div className="container alphabet">
            <h2 className="text-label">{page.sectionGroupH2 || "Our Process"}</h2>
            <div className="about-grid">
              {sections.map((section) => {
                const firstLetter = section.title ? section.title.slice(0, 1) : "";
                const restTitle = section.title ? section.title.slice(1) : "";
                const capLines = section.capabilities
                  ? section.capabilities
                      .split("\n")
                      .map((c) => c.trim())
                      .filter(Boolean)
                  : [];
                return (
                  <Fragment key={section.id}>
                    <div className="about-heading">
                      <h3 className="heading-jumbo gray">
                        <span className="white-text">{firstLetter}</span>
                        {restTitle}
                      </h3>
                    </div>
                    <div className="about-detail-wrap">
                      {capLines.length > 0 ? (
                        <h4 className="about-detail">
                          {capLines.map((line, idx) => (
                            <Fragment key={idx}>
                              {line}
                              <br />
                            </Fragment>
                          ))}
                        </h4>
                      ) : null}
                      {section.text ? (
                        <p className="about-detail white-text">{section.text}</p>
                      ) : null}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* 3. Our Ethos Section */}
      {page.ethosH2 || page.ethosH3 ? (
        <section className="section">
          <div className="container about-team">
            <div className="team-grid-banner">
              <h2 className="text-label">{page.ethosH2 || "Our Ethos"}</h2>
              <h2 className="heading white-text no-top-margin">
                {page.ethosH3?.includes("impacts your brand's future")
                  ? page.ethosH3
                  : "Culturally connected, globally experienced. We deliver groundbreaking work that impacts your brand's future."}
              </h2>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Clients Section */}
      {sortedLogos.length > 0 ? (
        <section className="section about-clients">
          <div className="container clients">
            <div className="text-label">Clients</div>
            <div className="client-grid">
              {sortedLogos.map((logo, index) => {
                const src = logo.asset?.url;
                return (
                  <div className="client-logo-wrap" key={logo._key || index}>
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={logo.alt || "Client Logo"}
                        className="client-logo"
                        decoding="async"
                        loading="eager"
                        src={src}
                      />
                    ) : (
                      <SanityImage
                        alt={logo.alt || "Client Logo"}
                        className="client-logo"
                        image={logo}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. FAQ Section */}
      {page.showFaq && page.faqs?.length ? <FaqSection faqs={page.faqs} /> : null}

      {/* 6. Jumbo Brand CTA */}
      <BrandCta />
    </div>
  );
}

export function ServicesView({ page }: { page: PageDocument }) {
  const sections = [1, 2, 3, 4, 5]
    .map((index) => {
      const key = `section${index}` as const;
      return {
        id: `${page._id}-${index}`,
        title: page[`${key}H3` as keyof PageDocument] as string | undefined,
        capabilities: page[`${key}H4` as keyof PageDocument] as string | undefined,
        text: page[`${key}Text` as keyof PageDocument] as PageDocument["section1Text"],
        caseStudyLogo: page[`${key}CaseStudyLogo` as keyof PageDocument] as
          | CaseStudyLogo
          | undefined,
      };
    })
    .filter((s) => s.title || s.capabilities || s.text?.length);

  const sortedLogos = sortClientLogos(page.clientLogos);

  return (
    <div className="services-page">
      {/* 1. Mantra Hero Header */}
      <section className="section home-header mantra-section">
        <h1 className="text-label">{page.heroH1 || "MANTRA"}</h1>
        <div className="container home-header block-1">
          <h2 className="heading center accent">
            <span>
              <strong>
                <em className="italic-text">
                  Great brands don&apos;t happen by accident.{" "}
                  <br className="hide-mobile" />
                  They&apos;re engineered.
                </em>
              </strong>
            </span>
          </h2>
        </div>
        <div className="container home-header">
          <h2 className="heading center gray">
            <strong>
              We turn strategy into identity, and identity{" "}
              <br className="hide-mobile" />
              into market share. Every service below{" "}
              <br className="hide-mobile" />
              exists to answer one question:
            </strong>
            <br />
          </h2>
        </div>
        <div className="container home-header block-2">
          <p className="heading center accent">
            <strong>
              <em className="italic-text-3">
                Does this move the brand forward, or just make it prettier?
              </em>
            </strong>
          </p>
        </div>
      </section>

      {/* 2. Our Services 2-Column Alphabet Grid */}
      {sections.length > 0 ? (
        <section className="section services-section">
          <div className="container alphabet">
            <h2 className="text-label">{page.sectionGroupH2 || "Our Services"}</h2>
            <div className="about-grid">
              {sections.map((section) => {
                const firstLetter = section.title ? section.title.slice(0, 1) : "";
                const restTitle = section.title ? section.title.slice(1) : "";
                const capLines = section.capabilities
                  ? section.capabilities
                      .split("\n")
                      .map((c) => c.trim())
                      .filter(Boolean)
                  : [];
                const logo = section.caseStudyLogo;
                const workSlug = logo?.workPage?.slug?.current;
                const workHref = workSlug ? `/work/${workSlug}` : undefined;
                const logoSrc = logo?.asset?.url;

                return (
                  <Fragment key={section.id}>
                    <div className="about-heading">
                      <h3 className="heading-jumbo gray">
                        <span className="white-text">{firstLetter}</span>
                        {restTitle}
                      </h3>
                    </div>
                    <div className="about-detail-wrap">
                      {capLines.length > 0 ? (
                        <h4 className="about-detail">
                          {capLines.map((line, idx) => (
                            <Fragment key={idx}>
                              {line}
                              <br />
                            </Fragment>
                          ))}
                        </h4>
                      ) : null}
                      {section.text ? (
                        <p className="about-detail white-text">{section.text}</p>
                      ) : null}
                      {logoSrc && workHref ? (
                        <Link
                          className="service-case-logo-link w-inline-block"
                          href={workHref}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={logo.alt || `${section.title} Case Study`}
                            className="service-case-logo"
                            loading="lazy"
                            src={logoSrc}
                          />
                        </Link>
                      ) : logoSrc ? (
                        <div className="service-case-logo-link">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={logo.alt || `${section.title} Case Study`}
                            className="service-case-logo"
                            loading="lazy"
                            src={logoSrc}
                          />
                        </div>
                      ) : null}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* 3. Clients Section */}
      {sortedLogos.length > 0 ? (
        <section className="section about-clients">
          <div className="container clients">
            <div className="text-label">Clients</div>
            <div className="client-grid">
              {sortedLogos.map((logo, index) => {
                const src = logo.asset?.url;
                return (
                  <div className="client-logo-wrap" key={logo._key || index}>
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={logo.alt || "Client Logo"}
                        className="client-logo"
                        decoding="async"
                        loading="eager"
                        src={src}
                      />
                    ) : (
                      <SanityImage
                        alt={logo.alt || "Client Logo"}
                        className="client-logo"
                        image={logo}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {page.servicesH4 ? (
            <div className="container services-summary">
              <h4 className="heading-7">
                {page.servicesH4.split("\n\n").map((para, i, arr) => (
                  <Fragment key={i}>
                    {para}
                    {i < arr.length - 1 && (
                      <>
                        <br />
                        <br />
                      </>
                    )}
                  </Fragment>
                ))}
              </h4>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* 5. FAQ Section */}
      {page.showFaq && page.faqs?.length ? <FaqSection faqs={page.faqs} /> : null}

      {/* 6. Jumbo Brand CTA */}
      <BrandCta />
    </div>
  );
}

export function ProcessPageView({
  page,
  kind,
}: {
  page: PageDocument;
  kind: "about" | "services";
}) {
  if (kind === "about") {
    return <AboutView page={page} />;
  }
  return <ServicesView page={page} />;
}

const WORK_PAGE_ORDER = [
  "renuvi",
  "femmily",
  "wimera",
  "tiger-beer-asia",
  "kite-beach",
  "sole-dxb",
  "indochino",
  "dubai-font",
  "tiger-beer-malaysia",
  "meraas",
  "keyreply",
  "adcb",
  "merdeka",
  "mubadala",
  "tiger-beer-mongolia",
];

export function WorkIndexView({ page, works }: { page: PageDocument; works: WorkSummary[] }) {
  const orderedWorks = [...works].sort((a, b) => {
    const aSlug = a.slug?.current || "";
    const bSlug = b.slug?.current || "";
    const aIndex = WORK_PAGE_ORDER.indexOf(aSlug);
    const bIndex = WORK_PAGE_ORDER.indexOf(bSlug);
    const resolvedA = aIndex === -1 ? 999 : aIndex;
    const resolvedB = bIndex === -1 ? 999 : bIndex;
    return resolvedA - resolvedB;
  });

  return (
    <div className="work-page">
      {/* 1. Header Section */}
      <section className="section work-header">
        <h1 className="text-label">{page.heroH1 || "OUR WORK"}</h1>
        <div className="container home-header">
          <h2 className="heading center gray">
            {page.pageTitleH2 ||
              "Guiding businesses on their journey to become impactful brands."}
          </h2>
        </div>
        <div className="container home-header block-2">
          <p className="heading center accent">
            Crafting brands that inspire and lead change, inside and out.
          </p>
        </div>
      </section>

      {/* 2. Featured Projects Grid */}
      <section className="section">
        <div className="container featured-project">
          <div className="w-dyn-list">
            <div className="w-dyn-items" role="list">
              {orderedWorks.map((work, index) => {
                const slug = work.slug?.current;
                const localAsset = slug ? getWorkPreviewAsset(slug) : null;
                return (
                  <div className="project-wrap w-dyn-item" key={work._id || index} role="listitem">
                    {slug ? (
                      <Link
                        className="featured-project-images w-inline-block"
                        href={`/work/${slug}`}
                      >
                        {localAsset ? (
                          <Image
                            alt={work.mainImage?.alt || `${work.title} Branding`}
                            className="featured-project-image"
                            height={540}
                            priority={index < 2}
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                            src={localAsset}
                            width={1920}
                          />
                        ) : (
                          <SanityImage
                            alt={work.mainImage?.alt || `${work.title} Branding`}
                            className="featured-project-image"
                            image={work.mainImage}
                            priority={index < 2}
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                          />
                        )}
                      </Link>
                    ) : (
                      <div className="featured-project-images">
                        {localAsset ? (
                          <Image
                            alt={work.mainImage?.alt || `${work.title} Branding`}
                            className="featured-project-image"
                            height={540}
                            priority={index < 2}
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                            src={localAsset}
                            width={1920}
                          />
                        ) : (
                          <SanityImage
                            alt={work.mainImage?.alt || `${work.title} Branding`}
                            className="featured-project-image"
                            image={work.mainImage}
                            priority={index < 2}
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 95vw, 1200px"
                          />
                        )}
                      </div>
                    )}

                    <div className="featured-project-info">
                      <div className="featured-project-description">
                        <div className="project-title-wrap">
                          {slug ? (
                            <Link
                              className="project-title-link w-inline-block"
                              href={`/work/${slug}`}
                            >
                              <h3 className="heading caps project-title">{work.title}</h3>
                              <div className="link-underline thinner" />
                            </Link>
                          ) : (
                            <h3 className="heading caps project-title">{work.title}</h3>
                          )}
                          <div className="project-arrow w-embed">
                            <svg
                              fill="none"
                              height="25"
                              viewBox="0 0 100 25"
                              width="80"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M97.0696 10.8398H1.7598C0.787891 10.8398 0 11.6277 0 12.5996C0 13.5716 0.787891 14.3594 1.7598 14.3594H97.0696V10.8398Z"
                                fill="white"
                              />
                              <path
                                d="M85.7633 24.5996C85.2177 24.5996 84.681 24.3462 84.3361 23.8728C83.7659 23.0862 83.9401 21.9845 84.7285 21.4161L95.942 13.2911C96.2288 13.0835 96.3925 12.8477 96.3925 12.6435C96.3942 12.4394 96.2306 12.2018 95.9437 11.9924L84.7197 3.77939C83.9366 3.20569 83.7659 2.10406 84.3396 1.32095C84.9115 0.536073 86.0096 0.365374 86.798 0.93907L98.022 9.15207C99.2257 10.032 99.9138 11.3078 99.9103 12.6506C99.9085 13.9933 99.2134 15.2656 98.0062 16.1402L86.7927 24.2652C86.483 24.4905 86.1223 24.5996 85.7633 24.5996Z"
                                fill="white"
                              />
                            </svg>
                          </div>
                        </div>
                        {work.tagline ? (
                          <p className="paragraph line-height-1-5">
                            {getWorkTagline(slug, work.tagline)}
                          </p>
                        ) : null}
                      </div>

                      <div className="featured-project-tags">
                        <div className="project-tags">
                          {work.industry ? (
                            <div className="featured-project-industry">
                              <p className="paragraph-tiny tags">{work.industry}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-dyn-list">
                        <div className="service-grid home w-dyn-items" role="list">
                          {work.services?.map((service) => (
                            <div
                              className="service-wrap w-dyn-item"
                              key={service._id}
                              role="listitem"
                            >
                              <p className="paragraph-tiny tags services-tag">{service.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Jumbo Brand CTA */}
      <BrandCta />
    </div>
  );
}

function VideoFrame({ url, title }: { url?: string; title: string }) {
  const src = safeVideoUrl(url);
  if (!src) return null;
  return (
    <div className="video-frame">
      <iframe
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={src}
        title={title}
      />
    </div>
  );
}

export function WorkDetailView({ work }: { work: Work }) {
  return <WorkDetailInteractive work={work} />;
}

export function ThoughtsIndexView({
  page,
  thoughts,
  categories,
}: {
  page: PageDocument;
  thoughts: ThoughtSummary[];
  categories: ThoughtCategory[];
}) {
  return (
    <div className="thoughts-index">
      <section className="section blog-header">
        <h1 className="text-label">{page.heroH1 || "Our Thoughts"}</h1>
        <div className="container home-header">
          <h2 className="heading center gray blog-headline">
            <span className="white-text">Exploring the unknown</span>, diving into the
            <br />
            depths of how you can <span className="white-text">unmarket yourself</span>
            <br />
            and your brand
          </h2>
        </div>
      </section>

      <ThoughtsExplorer categories={categories} thoughts={thoughts} />

      <BrandCta />
    </div>
  );
}

export function ThoughtDetailView({ thought }: { thought: Thought }) {
  const date = formatPublishedDate(thought.publishedAt);
  const readingTime = calculateReadingTime(thought.body);
  const backgroundColor = resolveSanityColor(
    thought.backgroundColor || thought.featuredImage?.backgroundColor,
    "#13394c",
  );
  const titleColor = resolveSanityColor(thought.titleColor, "#ffffff");
  const categories = thought.categories || [];

  return (
    <>
      <ArticleProgressBar />
      <article className="thought-detail">
        <section className="section blog-post-header">
          <div
            className="container blog-post-top"
            style={{
              backgroundColor,
              color: titleColor,
            }}
          >
            <div className="blog-post-header">
              <div className="blog-post-title-wrap">
                <nav aria-label="Breadcrumb" className="blog-title-eyebrow">
                  <Link className="blog-crawl" href="/thoughts" style={{ color: titleColor }}>
                    Thoughts
                  </Link>
                  {categories.length > 0 ? (
                    <>
                      <span aria-hidden="true" className="text-label url-crawl" style={{ color: titleColor }}>
                        •
                      </span>
                      <div className="blog-crawl-categories">
                        {categories.map((cat) =>
                          cat.slug?.current ? (
                            <Link
                              className="blog-crawl blog-crawl-category"
                              href={`/thoughts-categories/${cat.slug.current}`}
                              key={cat._id}
                              style={{ color: titleColor }}
                            >
                              {cat.title}
                            </Link>
                          ) : (
                            <span className="blog-crawl blog-crawl-category" key={cat._id} style={{ color: titleColor }}>
                              {cat.title}
                            </span>
                          ),
                        )}
                      </div>
                    </>
                  ) : null}
                  <span aria-hidden="true" className="text-label url-crawl" style={{ color: titleColor }}>
                    •
                  </span>
                  <span className="blog-crawl blog-crawl-current" style={{ color: titleColor }}>
                    {thought.title}
                  </span>
                </nav>
                <h1 className="blog-title" style={{ color: titleColor }}>
                  {thought.title}
                </h1>
              </div>
              <div className="blog-post-header-image-wrap">
                <SanityImage
                  alt={thought.featuredImage?.alt || thought.title}
                  className="blog-post-header-image"
                  fill
                  image={thought.featuredImage}
                  overrideSrc={getThoughtAnimatedAsset(thought.slug?.current) || undefined}
                  priority
                  sizes="(max-width: 991px) 100vw, 50vw"
                  unoptimized={Boolean(getThoughtAnimatedAsset(thought.slug?.current))}
                />
              </div>
            </div>
          </div>

          <div className="container blog-post">
            <aside className="blog-post-column-1">
              {categories.length > 0 ? (
                <div className="project-category">
                  <h2 className="text-label blog-sidebar">Category</h2>
                  <div className="blog-sidebar-list">
                    {categories.map((cat) =>
                      cat.slug?.current ? (
                        <Link
                          className="paragraph blog-sidebar-link"
                          href={`/thoughts-categories/${cat.slug.current}`}
                          key={cat._id}
                        >
                          {cat.title}
                        </Link>
                      ) : (
                        <p className="paragraph" key={cat._id}>
                          {cat.title}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {thought.author ? (
                <div className="author">
                  <h2 className="text-label blog-sidebar">Author</h2>
                  <div className="author-heading-wrap blog-post">
                    {thought.author.image ? (
                      <div className="author-photo-wrap">
                        <SanityImage
                          alt={thought.author.name}
                          className="author-photo"
                          image={thought.author.image}
                          sizes="80px"
                        />
                      </div>
                    ) : null}
                    {thought.author.slug?.current ? (
                      <Link className="author-name" href={`/authors/${thought.author.slug.current}`}>
                        {thought.author.name}
                      </Link>
                    ) : (
                      <span className="author-name">{thought.author.name}</span>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="share-this">
                <h2 className="text-label blog-sidebar">Share This</h2>
                <ArticleShareButtons title={thought.title} />
              </div>

              <div className="form-block blog">
                <h2 className="text-label blog-sidebar">Keep up with our thoughts</h2>
                <form action="/contact" className="form subscribe" method="get">
                  <input
                    aria-label="Email address"
                    className="text-field"
                    name="email"
                    placeholder="Email"
                    required
                    type="email"
                  />
                  <button className="primary-button subscribe" type="submit">
                    Subscribe
                  </button>
                </form>
              </div>
            </aside>

            <div className="blog-post-column-2">
              <div className="blog-post-eyebrow">
                {date ? <div className="text-label gray">{date}</div> : null}
                {date ? <div className="text-label gray">•</div> : null}
                <div className="time-to-read">
                  <span className="text-label gray">{readingTime}</span>
                  <span className="text-label gray">Min read</span>
                </div>
              </div>

              <div className="c-rich-content">
                <PortableContent value={thought.body} />
                {thought.showFaq && thought.faqs?.length ? (() => {
                  const hasFaqHeadingInBody = Boolean(
                    thought.body?.some((block) => {
                      if (typeof block !== "object" || !block || !("children" in block)) return false;
                      const b = block as { style?: string; children?: Array<{ text?: string }> };
                      return (
                        b.style === "h2" &&
                        Array.isArray(b.children) &&
                        b.children.some((child) =>
                          child.text?.toLowerCase().includes("frequently asked questions"),
                        )
                      );
                    }),
                  );
                  return (
                    <div className="blog-faq-section">
                      {!hasFaqHeadingInBody ? (
                        <h2 className="blog-faq-title">Frequently Asked Questions</h2>
                      ) : null}
                      <div className="blog-faq-list">
                        {thought.faqs
                          .map((faq, index) => ({
                            faq,
                            question: cmsPlainText(faq.question),
                            answer: cmsPlainText(faq.answer),
                            index,
                          }))
                          .filter(({ question, answer }) => question && answer)
                          .map(({ faq, question, answer, index }) => (
                            <details className="faq-item" key={faq._id || `${question}-${index}`}>
                              <summary className="faq-header">
                                <span className="faq-question">{question}</span>
                                <span aria-hidden="true" className="faq-icon">
                                  <svg fill="none" height="25" viewBox="0 0 25 25" width="25" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12.5" cy="12.5" fill="var(--orange, #ff6600)" r="12.5" />
                                    <path d="M12.5 7V18M7 12.5H18" stroke="white" strokeLinecap="square" strokeWidth="2" />
                                  </svg>
                                </span>
                              </summary>
                              <div className="faq-answer">
                                {answer.split(/\n{2,}/).map((paragraph, pIdx) => (
                                  <p key={`${faq._id}-p-${pIdx}`}>{paragraph}</p>
                                ))}
                              </div>
                            </details>
                          ))}
                      </div>
                    </div>
                  );
                })() : null}
              </div>
            </div>
          </div>
        </section>
      </article>

      <BrandCta />
    </>
  );
}

const AUTHOR_CANONICAL_ORDER: Record<string, number> = {
  "gladwyn-lewis": 1,
  "sarah-chung": 2,
  "austin-mathews": 3,
};

export function AuthorsIndexView({ authors }: { authors: Author[] }) {
  const sortedAuthors = [...authors].sort((a, b) => {
    const slugA = typeof a.slug === "string" ? a.slug : a.slug?.current;
    const slugB = typeof b.slug === "string" ? b.slug : b.slug?.current;
    const orderA = slugA ? AUTHOR_CANONICAL_ORDER[slugA] ?? 99 : 99;
    const orderB = slugB ? AUTHOR_CANONICAL_ORDER[slugB] ?? 99 : 99;
    return orderA - orderB;
  });

  return (
    <div className="authors-index">
      <PageHero
        className="authors-index__hero"
        title="Authors"
      />
      <section className="authors-section section-space">
        <Container>
          <div className="author-grid">
            {sortedAuthors.map((author) => (
              <AuthorCard author={author} key={author._id} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

export function AuthorDetailView({
  author,
  thoughts,
}: {
  author: Author;
  thoughts?: ThoughtSummary[];
}) {
  return (
    <div className="author-detail">
      <PageHero
        className="author-detail__hero"
        eyebrow="Author"
        intro={author.bio ? <p>{author.bio}</p> : undefined}
        secondary={
          <div className="author-profile__meta">
            {author.role ? <p>{author.role}</p> : null}
            {author.linkedin ? (
              <ButtonLink href={author.linkedin} target="_blank" variant="text">
                LinkedIn
              </ButtonLink>
            ) : null}
          </div>
        }
        title={author.name}
      />
      <Container className="author-profile__portrait">
        <SanityImage image={author.image} priority sizes="(max-width: 767px) 100vw, 600px" />
      </Container>
      <ThoughtGrid heading={`Thoughts by ${author.name}`} thoughts={thoughts} />
    </div>
  );
}

export function CategoryView({ category, thoughts }: { category: ThoughtCategory; thoughts?: ThoughtSummary[] }) {
  return (
    <div className="category-page">
      <PageHero className="category-page__hero" eyebrow="Thought category" intro={category.description ? <p>{category.description}</p> : undefined} title={category.title} />
      <ThoughtGrid thoughts={thoughts} />
    </div>
  );
}

export function LandingPageView({ page }: { page: LandingPage }) {
  return (
    <div className="landing-page">
      <PageHero
        className="landing-page__hero"
        intro={
          page.heroH2 ? (
            <h2>
              <Link href="/services">{page.heroH2}</Link>
            </h2>
          ) : undefined
        }
        size="display"
        title={page.heroH1 || page.title}
      />

      {page.showreelVideo ? (
        <section className="showreel section-space">
          <Container>
            <p className="eyebrow">Showreel</p>
            <VideoFrame title={`${page.title} showreel`} url={page.showreelVideo} />
          </Container>
        </section>
      ) : null}

      {page.introText ? (
        <section className="landing-page__intro section-space">
          <Container>
            {typeof page.introText === "string" ? (
              <div className="landing-intro">
                {page.introText.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={`${page._id}-intro-${index}`}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <PortableContent value={page.introText} />
            )}
          </Container>
        </section>
      ) : null}

      <WorkGrid heading="Relevant work" works={page.featuredWork} />
      {page.showFaq ? <FaqSection faqs={page.faqs} /> : null}
      <BrandCta
        heading={page.contactH2}
        text={page.contactText ? <p>{page.contactText}</p> : undefined}
      />
    </div>
  );
}

export function ContactPageView({ page }: { page: PageDocument }) {
  return (
    <ContactPanel
      className="contact-panel--page"
      eyebrow={false}
      heading={page.heroH1 || "Contact"}
      headingAs="h1"
      text={<PortableContent value={page.heroText} />}
    />
  );
}

function PendingApplicationForm() {
  return (
    <form aria-describedby="careers-integration-status" className="application-form">
      <div className="form-field">
        <label htmlFor="career-first-name">FIRST NAME*</label>
        <input autoComplete="given-name" id="career-first-name" name="firstName" placeholder="John" type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="career-last-name">LAST NAME*</label>
        <input autoComplete="family-name" id="career-last-name" name="lastName" placeholder="Doe" type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="career-email">EMAIL*</label>
        <input autoComplete="email" id="career-email" name="email" placeholder="example@email.com" type="email" />
      </div>
      <div className="form-field">
        <label htmlFor="career-phone">YOUR PREFERRED CONTACT NUMBER*</label>
        <input autoComplete="tel" id="career-phone" name="phone" placeholder="+91 8888888888" type="tel" />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="career-role">ROLE APPLYING FOR*</label>
        <input id="career-role" name="role" placeholder="e.g., Senior Backend Developer" type="text" />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="career-message">YOUR MESSAGE / COVER LETTER</label>
        <textarea
          id="career-message"
          name="message"
          placeholder="Write a short message or cover letter..."
          rows={6}
        />
      </div>
      <div className="form-field form-field--wide">
        <label htmlFor="career-resume">RESUME UPLOAD (PDF/DOC/DOCX)*</label>
        <input disabled id="career-resume" name="resume" type="file" />
      </div>
      <div className="contact-panel__submit form-field--wide">
        <button aria-disabled="true" disabled type="submit">
          Send application
        </button>
        <p aria-live="polite" id="careers-integration-status" role="status">
          Secure résumé upload and submission are being connected. Nothing entered here is sent or stored yet.
        </p>
      </div>
    </form>
  );
}

export function CareersPageView({ page }: { page: PageDocument }) {
  return (
      <section className="careers-form-section careers-page section-space">
        <Container>
          <div className="careers-page__intro">
            <h1>{page.heroH1 || "Careers"}</h1>
            <PortableContent value={page.heroText} />
          </div>
          <PendingApplicationForm />
        </Container>
      </section>
  );
}

function legalSections(body: PortableTextValue = []) {
  const sections: PortableTextValue[] = [];
  let current: PortableTextValue = [];

  for (const block of body) {
    const style = typeof block.style === "string" ? block.style : undefined;
    if (style === "h1") continue;
    if (style === "h2" && current.length) {
      sections.push(current);
      current = [];
    }
    current.push(block);
  }
  if (current.length) sections.push(current);
  return sections;
}

export function LegalPageView({ page }: { page: PageDocument }) {
  const titleBlock = page.body?.find((block) => block.style === "h1");
  const sections = legalSections(page.body);
  return (
    <div className="legal-page section-space">
      <Container>
        <h1 className="eyebrow">{titleBlock ? portableTextToPlain([titleBlock]) : "Privacy Policy"}</h1>
        <div className="legal-page__grid">
          {sections.map((section, index) => {
            const headingBlock = section[0]?.style === "h2" ? section[0] : undefined;
            const content = headingBlock ? section.slice(1) : section;

            return (
              <section className="legal-page__item" key={(section[0]?._key as string) || index}>
                {headingBlock ? <h2>{portableTextToPlain([headingBlock])}</h2> : <span aria-hidden="true" />}
                <PortableContent value={content} />
              </section>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

export function EbookPageView({ ebook }: { ebook: Ebook }) {
  const pdfUrl =
    ebook.pdfFile?.asset?.url ||
    "https://cdn.prod.website-files.com/6728d6bf31f251220224c1c2/677f6f552c4178d35f53c5f1_Brand%20Connectedness%20Ebook.pdf";

  const coverUrl =
    ebook.coverImage?.asset?.url ||
    "https://cdn.prod.website-files.com/6728dd5a0301f8954c360dfc/677f6d8850b972dff83bf265_Ebook-Preview.png";

  const descriptionHtml =
    typeof ebook.description === "string"
      ? ebook.description
      : cmsPlainText(ebook.description);

  return (
    <div className="ebook-landing-page">
      <section className="section ebook-page">
        <div className="container">
          <div className="ebook">
            <div className="ebook-detail-wrap ebook-page col-1">
              <div className="text-label ebook-page">Ebook</div>
              <h1 className="heading ebook">{ebook.title}</h1>
              {ebook.subheading ? (
                <h2 className="paragraph gray subheading">{ebook.subheading}</h2>
              ) : null}

              <div className="w-richtext">
                {descriptionHtml.startsWith("<p") ? (
                  <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                ) : (
                  descriptionHtml
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={`${ebook._id}-desc-${index}`}>{paragraph}</p>
                    ))
                )}
              </div>

              <EbookDownloadForm pdfUrl={pdfUrl} />
            </div>

            <div className="ebook-detail-wrap col-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={ebook.title}
                className="ebook-cover-image"
                loading="eager"
                src={coverUrl}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function SearchView({
  query,
  thoughts,
  works,
}: {
  query: string;
  thoughts: ThoughtSummary[];
  works: WorkSummary[];
}) {
  const normalized = query.toLocaleLowerCase("en").trim();
  const matchingThoughts = normalized
    ? thoughts.filter((thought) =>
        [thought.title, thought.bluf, thought.author?.name, ...(thought.categories?.map((item) => item.title) || [])]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("en")
          .includes(normalized),
      )
    : [];
  const matchingWorks = normalized
    ? works.filter((work) =>
        [work.title, work.tagline, work.industry, ...(work.services?.map((item) => item.title) || [])]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("en")
          .includes(normalized),
      )
    : [];
  const resultCount = matchingThoughts.length + matchingWorks.length;

  return (
    <>
      <PageHero
        intro={
          query ? (
            <p>
              {resultCount} result{resultCount === 1 ? "" : "s"} for “{query}”
            </p>
          ) : (
            <p>Search thoughts and work.</p>
          )
        }
        title="Search"
      />
      <section className="search-section section-space">
        <Container>
          <form action="/search" className="search-form" method="get" role="search">
            <label htmlFor="site-search">Search</label>
            <div>
              <input defaultValue={query} id="site-search" name="query" type="search" />
              <button type="submit">Search</button>
            </div>
          </form>
          {query && !resultCount ? <p className="empty-state">No matching published content was found.</p> : null}
        </Container>
      </section>
      <WorkGrid heading="Work" works={matchingWorks} />
      <ThoughtGrid heading="Thoughts" thoughts={matchingThoughts} />
    </>
  );
}

export function plainPageDescription(page: PageDocument) {
  return (
    page.seo?.metaDescription ||
    portableTextToPlain(page.heroText) ||
    portableTextToPlain(page.heroH2) ||
    portableTextToPlain(page.body)
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Container>
        <ol>
          {items.map((item, index) => (
            <li key={item.href}>
              {index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={["section-space", className].filter(Boolean).join(" ")}>{children}</section>;
}
