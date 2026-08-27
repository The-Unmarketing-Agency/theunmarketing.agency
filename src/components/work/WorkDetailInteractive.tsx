"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SanityImage } from "@/components/content/SanityImage";
import { portableTextToPlain } from "@/lib/content";
import type { Work } from "@/lib/sanity/types";
import {
  getWorkFullStory,
  getWorkOverview,
  getWorkPreviewAsset,
  getWorkServices,
  getWorkStats,
  getWorkTagline,
} from "@/lib/work-preview-assets";

export const WORK_PORTFOLIO_ORDER = [
  { slug: "renuvi", title: "Renuvi" },
  { slug: "femmily", title: "Femmily" },
  { slug: "wimera", title: "Wimera" },
  { slug: "tiger-beer-asia", title: "Tiger Beer Asia" },
  { slug: "kite-beach", title: "Kite Beach" },
  { slug: "sole-dxb", title: "Sole DXB" },
  { slug: "indochino", title: "Indochino" },
  { slug: "dubai-font", title: "Dubai Font" },
  { slug: "tiger-beer-malaysia", title: "Tiger Beer Malaysia" },
  { slug: "meraas", title: "Meraas" },
  { slug: "keyreply", title: "KeyReply" },
  { slug: "adcb", title: "Abu Dhabi Commercial Bank" },
  { slug: "merdeka", title: "Merdeka" },
  { slug: "mubadala", title: "Mubadala Health" },
  { slug: "tiger-beer-mongolia", title: "Tiger Beer Mongolia" },
];

export function WorkDetailInteractive({ work }: { work: Work }) {
  const [expanded, setExpanded] = useState(false);

  const currentSlug = work.slug?.current || "";
  const currentIndex = WORK_PORTFOLIO_ORDER.findIndex((item) => item.slug === currentSlug);

  const prevItem =
    currentIndex !== -1
      ? WORK_PORTFOLIO_ORDER[
          (currentIndex - 1 + WORK_PORTFOLIO_ORDER.length) % WORK_PORTFOLIO_ORDER.length
        ]
      : null;

  const nextItem =
    currentIndex !== -1
      ? WORK_PORTFOLIO_ORDER[(currentIndex + 1) % WORK_PORTFOLIO_ORDER.length]
      : null;

  const previewAsset = getWorkPreviewAsset(currentSlug);
  const tagline = getWorkTagline(currentSlug, work.tagline);

  // Services
  const cmsServices = (work.services || []).map((s) => s.title).filter(Boolean).join(", ");
  const servicesText = getWorkServices(currentSlug, cmsServices);

  // Overview and Story
  const firstBlock = work.theBrief?.[0];
  const cmsOverview = firstBlock ? portableTextToPlain([firstBlock]) : work.tagline || "";
  const overviewP = getWorkOverview(currentSlug, cmsOverview);

  const cmsStory = (work.theBrief || []).map((b) => portableTextToPlain([b])).filter(Boolean);
  const fullStory = getWorkFullStory(currentSlug, cmsStory.length > 0 ? cmsStory : [overviewP]);

  // Stats
  const cmsStats = (work.impactStats || [])
    .filter((s): s is typeof s & { value: string } => Boolean(s.value))
    .map((s) => ({ value: s.value.replace(/^US\$/, "$"), label: s.label || "" }));
  const stats = getWorkStats(currentSlug, cmsStats);

  // Video embeds
  const videoEmbeds = (work.videoEmbeds || []).filter((v): v is typeof v & { url: string } => Boolean(v.url));
  const gallery = work.gallery || [];

  return (
    <div className="work-detail-page">
      {/* 1. Full-Width Hero Banner */}
      <section className="section case-study-header">
        {previewAsset ? (
          <Image
            alt={work.mainImage?.alt || `${work.title} Case Study`}
            className="project-header-image"
            height={900}
            priority
            sizes="100vw"
            src={previewAsset}
            width={1920}
          />
        ) : work.mainImage ? (
          <SanityImage
            alt={work.mainImage?.alt || `${work.title} Case Study`}
            className="project-header-image"
            image={work.mainImage}
            priority
            sizes="100vw"
          />
        ) : null}

        {/* 2. Webflow-Authentic 2-Column Overview Grid (#wo-split) */}
        <div id="wo-split">
          <div className="wo-left">
            <h1 className="wo-title">{work.title}</h1>
            {servicesText ? (
              <>
                <p className="wo-metalabel">What We Did</p>
                <p className="wo-metavalue">{servicesText}</p>
              </>
            ) : null}

            {stats.map((st, idx) => (
              <div className="wo-stat" key={idx}>
                <div className="wo-num">{st.value}</div>
                <div className="wo-lab">{st.label}</div>
              </div>
            ))}
          </div>

          <div className="wo-right">
            {tagline ? <h2 className="wo-tagline">{tagline}</h2> : null}

            {!expanded ? (
              <div id="wo-preview">
                <p>{overviewP}</p>
              </div>
            ) : (
              <div id="wo-full">
                {fullStory.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            )}

            {fullStory.length > 1 ? (
              <button
                id="wo-readmore"
                onClick={() => setExpanded(!expanded)}
                type="button"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3. Responsive Videos Grid */}
      {videoEmbeds.length ? (
        <section className="section case-study-videos-section">
          <div className="container project-videos">
            <h2 className="heading video-grid">Videos</h2>
            <div className="video-grid w-dyn-items" role="list">
              {videoEmbeds.map((vid, idx) => {
                const cleanUrl = vid.url.replace(/&amp;/g, "&");
                return (
                  <div className="video-embed-grid w-dyn-item" key={vid._key || idx} role="listitem">
                    <div className="project-video w-richtext">
                      <div className="w-embed w-iframe w-script">
                        <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                          <iframe
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                            allowFullScreen
                            frameBorder="0"
                            src={cleanUrl}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              border: 0,
                            }}
                            title={`${work.title} video ${idx + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. 2-Column Masonry Media Gallery */}
      {gallery.length ? (
        <section className="section case-study-gallery-section">
          <div className="container media-gallery">
            <div className="media-gallery-grid" role="list">
              {gallery.map((img, idx) => (
                <div className="media-gallery-image-wrap" key={img._key || idx} role="listitem">
                  <SanityImage
                    alt={img.alt || `${work.title} presentation ${idx + 1}`}
                    className="media-gallery-image"
                    image={img}
                    priority={idx < 2}
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 800px"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. Previous / Next Project Pagination */}
      <section className="project-pagination">
        {prevItem ? (
          <div className="previous">
            <div className="previous-item">
              <h2 className="prevnext">Previous</h2>
              <Link className="heading previous-project" href={`/work/${prevItem.slug}`}>
                {prevItem.title}
              </Link>
            </div>
          </div>
        ) : (
          <div className="previous" />
        )}
        {nextItem ? (
          <div className="next">
            <div className="next-item">
              <h2 className="prevnext">Next</h2>
              <Link className="heading next-project" href={`/work/${nextItem.slug}`}>
                {nextItem.title}
              </Link>
            </div>
          </div>
        ) : (
          <div className="next" />
        )}
      </section>

      {/* 6. Bottom Jumbo CTA */}
      <section className="section section-cta-wrap">
        <div className="container cta">
          <div className="cta-left">
            <h2 className="heading-jumbo gray">
              Ready to reimagine your
              <br className="hide-mobile" />
              {" "}brand&apos;s{" "}
              <span className="serif-text white-text">future</span>?
            </h2>
          </div>
          <div className="cta-right">
            <Link className="primary-button cc-jumbo-button w-button" href="/contact">
              Let&apos;s chat!
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
