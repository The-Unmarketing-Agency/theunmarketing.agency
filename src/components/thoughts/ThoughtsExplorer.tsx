"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useMemo, useState, type FormEvent, type MouseEvent } from "react";

import { SanityImage } from "@/components/content/SanityImage";
import { Container } from "@/components/ui/Container";
import type { ThoughtCategory, ThoughtSummary } from "@/lib/sanity/types";
import { getThoughtAnimatedAsset, getThoughtSummary } from "@/lib/thought-summaries";

type ThoughtsExplorerProps = {
  categories: ThoughtCategory[];
  thoughts: ThoughtSummary[];
};

const THOUGHTS_BATCH_SIZE = 9;

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Singapore",
  "India",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "United Arab Emirates",
  "Indonesia",
  "Japan",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Saudi Arabia",
  "South Africa",
  "Spain",
  "Switzerland",
  "Thailand",
  "Other",
];

const CATEGORY_ORDER = [
  "advertising",
  "ai-vs-human-branding",
  "branding",
  "marketing",
  "sonic-identity",
  "storytelling",
  "strategy",
  "user-experience",
];

const WEBFLOW_COLLECTION_ORDER = [
  "should-i-use-ai-for-branding",
  "ai-logo-generator-vs-branding-agency",
  "building-a-strong-community-in-the-age-of-digital-overload",
  "a-foray-into-the-world-of-flat-design",
  "marketing-dos-and-don-ts",
  "the-greys-in-branding",
  "from-the-worst-to-the-best-commercial-in-the-world",
  "how-to-build-a-sonic-identity-that-sells",
  "tech-and-its-cults-of-personalities",
  "ads-that-celebrate-women",
  "left-brain-marketing-vs-right-brain-marketing",
  "gamification-and-video-games-the-power-of-immersive-marketing",
  "the-power-of-sound-and-audio-in-branding-superpower",
  "how-apple-uses-pablo-picasso-s-bull-to-teach-innovation",
  "building-a-formidable-brand-community",
];

export function ThoughtsExplorer({ categories, thoughts }: ThoughtsExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(THOUGHTS_BATCH_SIZE);
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterStatus("submitting");
    setTimeout(() => {
      setNewsletterStatus("success");
    }, 500);
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const slugA = a.slug?.current || "";
      const slugB = b.slug?.current || "";
      const idxA = CATEGORY_ORDER.indexOf(slugA);
      const idxB = CATEGORY_ORDER.indexOf(slugB);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [categories]);

  const sortedThoughts = useMemo(() => {
    return [...thoughts].sort((a, b) => {
      const slugA = a.slug?.current || "";
      const slugB = b.slug?.current || "";
      const idxA = WEBFLOW_COLLECTION_ORDER.indexOf(slugA);
      const idxB = WEBFLOW_COLLECTION_ORDER.indexOf(slugB);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    });
  }, [thoughts]);

  // Top featured and sidebar showcase posts (derived from Sanity CMS showcase field)
  const { featuredThoughts, sidebarNewThoughts } = useMemo(() => {
    const explicitFeatured = sortedThoughts
      .filter((t) => t.showcase?.includes("featured"))
      .sort((a, b) => {
        if (a.slug?.current === "how-apple-uses-pablo-picasso-s-bull-to-teach-innovation") return -1;
        if (b.slug?.current === "how-apple-uses-pablo-picasso-s-bull-to-teach-innovation") return 1;
        if (a.slug?.current === "building-a-formidable-brand-community") return -1;
        if (b.slug?.current === "building-a-formidable-brand-community") return 1;
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      })
      .slice(0, 2);

    const featuredList = explicitFeatured.length >= 2 ? explicitFeatured : sortedThoughts.slice(0, 2);
    const featuredIds = new Set(featuredList.map((f) => f._id));

    const explicitSidebar = sortedThoughts
      .filter((t) => t.showcase?.includes("new-post-sidebar"))
      .sort((a, b) => {
        if (a.slug?.current === "should-i-use-ai-for-branding") return -1;
        if (b.slug?.current === "should-i-use-ai-for-branding") return 1;
        if (a.slug?.current === "ai-logo-generator-vs-branding-agency") return -1;
        if (b.slug?.current === "ai-logo-generator-vs-branding-agency") return 1;
        if (a.slug?.current === "building-a-strong-community-in-the-age-of-digital-overload") return -1;
        if (b.slug?.current === "building-a-strong-community-in-the-age-of-digital-overload") return 1;
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      })
      .slice(0, 3);

    const sidebarList =
      explicitSidebar.length >= 3
        ? explicitSidebar
        : sortedThoughts.filter((t) => !featuredIds.has(t._id)).slice(0, 3);

    return {
      featuredThoughts: featuredList,
      sidebarNewThoughts: sidebarList,
    };
  }, [sortedThoughts]);

  const fuse = useMemo(
    () =>
      new Fuse(sortedThoughts, {
        keys: [
          { name: "title", weight: 0.55 },
          { name: "bluf", weight: 0.2 },
          { name: "author.name", weight: 0.1 },
          { name: "categories.title", weight: 0.15 },
        ],
        minMatchCharLength: 2,
        threshold: 0.32,
      }),
    [sortedThoughts],
  );

  const filteredThoughts = useMemo(() => {
    const searched = query.trim() ? fuse.search(query.trim()).map(({ item }) => item) : sortedThoughts;
    if (!activeCategory) return searched;
    return searched.filter((thought) =>
      thought.categories?.some((category) => category.slug?.current === activeCategory),
    );
  }, [activeCategory, fuse, query, sortedThoughts]);

  const visibleThoughts = filteredThoughts.slice(0, visibleCount);
  const remainingThoughts = filteredThoughts.length - visibleThoughts.length;

  function selectCategory(
    event: MouseEvent<HTMLAnchorElement>,
    categorySlug: string | null,
  ) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setActiveCategory(categorySlug);
    setVisibleCount(THOUGHTS_BATCH_SIZE);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resultsElement = document.getElementById("thought-results");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      {/* 1. Top Search Bar & Featured / New Showcase */}
      <section className="section blog-collection">
        <Container>
          <div className="search-wrap">
            <form className="search-bar" onSubmit={handleSearchSubmit}>
              <input
                aria-label="Search thoughts"
                autoComplete="off"
                className="text-field search"
                id="search"
                name="query"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(THOUGHTS_BATCH_SIZE);
                }}
                placeholder="Search…"
                type="search"
                value={query}
              />
              <button className="primary-button search" type="submit">
                Search
              </button>
            </form>
          </div>

          <div className="featured-blog-grid">
            {/* Left 2 Featured posts */}
            <div className="featured-blog-post-wrap">
              {featuredThoughts.map((thought, idx) => (
                <article className="featured-blog-post" key={thought._id}>
                  {thought.slug?.current ? (
                    <Link
                      aria-label={thought.title}
                      className="post-thumbnail-link-block"
                      href={`/thoughts/${thought.slug.current}`}
                    >
                      <SanityImage
                        alt={thought.featuredImage?.alt || thought.title}
                        className="post-thumbnail"
                        image={thought.featuredImage}
                        overrideSrc={getThoughtAnimatedAsset(thought.slug.current) || undefined}
                        priority={idx < 2}
                        sizes="(max-width: 991px) 100vw, 60vw"
                        unoptimized={Boolean(getThoughtAnimatedAsset(thought.slug.current))}
                      />
                    </Link>
                  ) : null}
                  <h2 className="text-label">Featured</h2>
                  {thought.slug?.current ? (
                    <Link
                      aria-label={thought.title}
                      className="blog-title-link"
                      href={`/thoughts/${thought.slug.current}`}
                    >
                      <h3 className="heading blog-title">{thought.title}</h3>
                    </Link>
                  ) : (
                    <h3 className="heading blog-title">{thought.title}</h3>
                  )}
                  {(() => {
                    const summary = getThoughtSummary(thought.slug?.current, thought.bluf);
                    return summary ? <p className="paragraph gray">{summary}</p> : null;
                  })()}
                </article>
              ))}
            </div>

            {/* Right 3 Sidebar New posts */}
            <div className="featured-blog-side-wrap">
              {sidebarNewThoughts.map((thought, idx) => (
                <article className="featured-blog-side" key={thought._id}>
                  {thought.slug?.current ? (
                    <Link
                      aria-label={thought.title}
                      className="post-thumbnail-link-block sidebar"
                      href={`/thoughts/${thought.slug.current}`}
                    >
                      <SanityImage
                        alt={thought.featuredImage?.alt || thought.title}
                        className="post-thumbnail sidebar"
                        image={thought.featuredImage}
                        overrideSrc={getThoughtAnimatedAsset(thought.slug.current) || undefined}
                        priority={idx < 1}
                        sizes="(max-width: 991px) 100vw, 420px"
                        unoptimized={Boolean(getThoughtAnimatedAsset(thought.slug.current))}
                      />
                    </Link>
                  ) : null}
                  <h2 className="text-label">New</h2>
                  {thought.slug?.current ? (
                    <Link
                      aria-label={thought.title}
                      className="blog-title-link"
                      href={`/thoughts/${thought.slug.current}`}
                    >
                      <h3 className="heading blog-title">{thought.title}</h3>
                    </Link>
                  ) : (
                    <h3 className="heading blog-title">{thought.title}</h3>
                  )}
                  {(() => {
                    const summary = getThoughtSummary(thought.slug?.current, thought.bluf);
                    return summary ? <p className="paragraph gray">{summary}</p> : null;
                  })()}
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Wide Newsletter Banner */}
      <section className="section subscribe-wide">
        <Container>
          <div className="form-block blog wide w-form">
            {newsletterStatus === "success" ? (
              <div className="w-form-done" style={{ display: "block" }}>
                <div>Thank you! Your submission has been received!</div>
              </div>
            ) : (
              <form
                className="form subscribe wide"
                data-name="UNM Blog"
                id="wf-form-UNM-Blog"
                name="wf-form-UNM-Blog"
                onSubmit={handleNewsletterSubmit}
              >
                <div className="subscribe-wide-wrap col-1">
                  <h2 className="heading accent">
                    Keep up with
                    <br />
                    our
                    <br />
                    thoughts.
                  </h2>
                </div>
                <div className="subscribe-wide-wrap col-2">
                  <input
                    aria-label="Email address"
                    className="text-field w-input"
                    maxLength={256}
                    name="email-3"
                    placeholder="Email"
                    required
                    type="email"
                  />
                  <select
                    aria-label="Select your country"
                    className="select-field w-select"
                    defaultValue=""
                    name="Select-Country-2"
                    required
                  >
                    <option disabled value="">
                      Select country
                    </option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <label className="w-checkbox form-checkbox-sub-wide">
                    <input
                      aria-label="Marketing communications consent"
                      className="w-checkbox-input"
                      name="checkbox-2"
                      required
                      type="checkbox"
                    />
                    <span className="text-label gray subscribe w-form-label">
                      I ACKNOWLEDGE THAT SUBMITTING THIS FORM SUBSCRIBES ME TO MARKETING COMMUNICATIONS. I
                      UNDERSTAND I CAN UNSUBSCRIBE AT ANY TIME.
                    </span>
                  </label>
                  <button
                    className="primary-button subscribe w-button"
                    disabled={newsletterStatus === "submitting"}
                    type="submit"
                  >
                    {newsletterStatus === "submitting" ? "Please wait..." : "Subscribe"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Container>
      </section>

      {/* 3. Category Filter Section */}
      <section className="section category-filter" id="thought-results">
        <div className="blog-categories-wrap">
          <div className="form-block-2 w-form">
            <h2 className="text-label">Filter by Category</h2>
            <div className="category-filter">
              <div className="blog-categories-wrap">
                {sortedCategories.map((category) => {
                  const slug = category.slug?.current;
                  if (!slug) return null;
                  const isActive = activeCategory === slug;
                  return (
                    <div className="w-dyn-item" key={category._id}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={`categories-checkbox-wrap ${
                          isActive ? "is-active fs-cmsfilter_active" : ""
                        }`}
                        href={isActive ? "/thoughts" : `/thoughts-categories/${slug}`}
                        onClick={(event) => selectCategory(event, isActive ? null : slug)}
                      >
                        <span className="blog-category-link">{category.title}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main 3-Column Blog Grid with eBook Card */}
      <section className="section blog-collection">
        <Container>
          {filteredThoughts.length ? (
            <>
              <div className="blog-grid">
                {visibleThoughts.map((thought, index) => {
                  const items = [];

                  // Insert eBook promo card at index 4 (5th card) if unfiltered or in main list
                  if (index === 4 && !activeCategory && !query) {
                    items.push(
                      <div className="ebook-element" key="ebook-promo-card">
                        <div className="ebook-wrap">
                          <h2 className="text-label black">eBook</h2>
                          <div className="ebook-detail-wrap">
                            <h3 className="heading ebook-preview-title">
                              Learn how to humanize your brand.
                            </h3>
                            <p className="paragraph black">
                              In a world of uncertainty, brands must foster human connections to build
                              trust and loyalty. By focusing on the &apos;human experience&apos;, brands can
                              create deeper relationships with their audience and establish a strong emotional
                              bond that drives engagement and preference.
                            </p>
                          </div>
                          <Link className="primary-button read-ebook" href="/ebook/brand-connectedness">
                            Read Ebook
                          </Link>
                        </div>
                      </div>,
                    );
                  }

                  items.push(
                    <article className="featured-blog-cell" key={thought._id}>
                      {thought.slug?.current ? (
                        <Link
                          aria-label={thought.title}
                          className="post-thumbnail-link-block"
                          href={`/thoughts/${thought.slug.current}`}
                        >
                          <SanityImage
                            alt={thought.featuredImage?.alt || thought.title}
                            className="post-thumbnail"
                            image={thought.featuredImage}
                            overrideSrc={getThoughtAnimatedAsset(thought.slug.current) || undefined}
                            priority={index < 3}
                            sizes="(max-width: 767px) 100vw, (max-width: 991px) 50vw, 33vw"
                            unoptimized={Boolean(getThoughtAnimatedAsset(thought.slug.current))}
                          />
                        </Link>
                      ) : null}
                      {thought.slug?.current ? (
                        <Link
                          aria-label={thought.title}
                          className="blog-title-link"
                          href={`/thoughts/${thought.slug.current}`}
                        >
                          <h3 className="heading blog-title">{thought.title}</h3>
                        </Link>
                      ) : (
                        <h3 className="heading blog-title">{thought.title}</h3>
                      )}
                      {(() => {
                        const summary = getThoughtSummary(thought.slug?.current, thought.bluf);
                        return summary ? <p className="paragraph gray">{summary}</p> : null;
                      })()}
                      {thought.categories?.length ? (
                        <div className="post-category-list">
                          {thought.categories.map((cat) => (
                            <div className="post-category" key={cat._id}>
                              <span className="text-label">{cat.title}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>,
                  );

                  return items;
                })}
              </div>

              {remainingThoughts > 0 ? (
                <div className="w-pagination-wrapper pagination">
                  <button
                    aria-controls="thought-results"
                    aria-label={`Load ${Math.min(THOUGHTS_BATCH_SIZE, remainingThoughts)} more thoughts; ${remainingThoughts} remaining`}
                    className="w-pagination-next primary-button"
                    onClick={() =>
                      setVisibleCount((count) =>
                        Math.min(count + THOUGHTS_BATCH_SIZE, filteredThoughts.length),
                      )
                    }
                    type="button"
                  >
                    <div className="w-inline-block">Load More</div>
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              <p>No items found matching this search or category filter.</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
