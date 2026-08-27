const IMAGE_PROJECTION = `{
  ...,
  asset->{
    _id,
    url,
    metadata{dimensions,lqip}
  }
}`;

const SEO_PROJECTION = `{
  metaTitle,
  metaDescription,
  keywords,
  noIndex,
  ogImage${IMAGE_PROJECTION}
}`;

const FAQ_PROJECTION = `{_id,question,answer,sortOrder,slug}`;
const SERVICE_PROJECTION = `{_id,title,slug,description}`;
const AUTHOR_PROJECTION = `{_id,_updatedAt,name,role,slug,bio,linkedin,image${IMAGE_PROJECTION}}`;
const CATEGORY_PROJECTION = `{_id,title,slug,description,headerTextColor}`;
const PILLAR_PROJECTION = `{_id,title,slug,thesis}`;

const WORK_SUMMARY_PROJECTION = `{
  _id,
  _updatedAt,
  title,
  slug,
  tagline,
  industry,
  featuredProject,
  mainImage${IMAGE_PROJECTION},
  clientLogo${IMAGE_PROJECTION},
  "services": services[]->${SERVICE_PROJECTION}
}`;

const THOUGHT_SUMMARY_PROJECTION = `{
  _id,
  _updatedAt,
  title,
  slug,
  bluf,
  publishedAt,
  titleColor,
  backgroundColor,
  showcase,
  featuredImage${IMAGE_PROJECTION},
  "author": author->${AUTHOR_PROJECTION},
  "categories": categories[]->${CATEGORY_PROJECTION},
  "pillar": pillar->${PILLAR_PROJECTION},
  seo${SEO_PROJECTION}
}`;

export const HOME_PAGE_QUERY = `*[_type == "page" && isHomepage == true][0]{
  ...,
  "faqs": faq[]->${FAQ_PROJECTION},
  "featuredWork": featuredWork[]->${WORK_SUMMARY_PROJECTION},
  seo${SEO_PROJECTION}
}`;

export const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  ...,
  clientLogos[]${IMAGE_PROJECTION},
  section1CaseStudyLogo{..., asset->, workPage->{slug, title}},
  section2CaseStudyLogo{..., asset->, workPage->{slug, title}},
  section3CaseStudyLogo{..., asset->, workPage->{slug, title}},
  section4CaseStudyLogo{..., asset->, workPage->{slug, title}},
  section5CaseStudyLogo{..., asset->, workPage->{slug, title}},
  "faqs": faq[]->${FAQ_PROJECTION},
  "featuredWork": featuredWork[]->${WORK_SUMMARY_PROJECTION},
  seo${SEO_PROJECTION}
}`;

export const LANDING_PAGE_BY_SLUG_QUERY = `*[_type == "landingPage" && slug.current == $slug][0]{
  ...,
  "faqs": faq[]->${FAQ_PROJECTION},
  "featuredWork": featuredWork[]->${WORK_SUMMARY_PROJECTION},
  seo${SEO_PROJECTION}
}`;

export const LANDING_PAGE_SLUGS_QUERY = `*[_type == "landingPage" && defined(slug.current)][]{"slug": slug.current}`;

export const WORK_LIST_QUERY = `*[_type == "work" && defined(slug.current)] | order(coalesce(showcaseOrder.workPage, 9999) asc, title asc)${WORK_SUMMARY_PROJECTION}`;

export const WORK_BY_SLUG_QUERY = `*[_type == "work" && slug.current == $slug][0]{
  ${WORK_SUMMARY_PROJECTION.slice(1, -1)},
  gallery[]${IMAGE_PROJECTION},
  theBrief,
  ourSolution,
  projectDetails,
  impactStats,
  videoEmbeds,
  audience
}`;

export const WORK_SLUGS_QUERY = `*[_type == "work" && defined(slug.current)][]{"slug": slug.current}`;

export const THOUGHT_LIST_QUERY = `*[_type == "thought" && defined(slug.current)] | order(publishedAt desc)${THOUGHT_SUMMARY_PROJECTION}`;

export const THOUGHT_BY_SLUG_QUERY = `*[_type == "thought" && slug.current == $slug][0]{
  ${THOUGHT_SUMMARY_PROJECTION.slice(1, -1)},
  body,
  showFaq,
  "faqs": faq[]->${FAQ_PROJECTION},
  "relatedThoughts": relatedThoughts[]->${THOUGHT_SUMMARY_PROJECTION}
}`;

export const THOUGHT_SLUGS_QUERY = `*[_type == "thought" && defined(slug.current)][]{"slug": slug.current}`;

export const AUTHOR_LIST_QUERY = `*[_type == "author" && defined(slug.current)] | order(name asc)${AUTHOR_PROJECTION}`;

export const AUTHOR_BY_SLUG_QUERY = `*[_type == "author" && slug.current == $slug][0]{
  ${AUTHOR_PROJECTION.slice(1, -1)},
  "thoughts": *[_type == "thought" && references(^._id)] | order(publishedAt desc)${THOUGHT_SUMMARY_PROJECTION}
}`;

export const AUTHOR_SLUGS_QUERY = `*[_type == "author" && defined(slug.current)][]{"slug": slug.current}`;

export const CATEGORY_LIST_QUERY = `*[_type == "thoughtCategory" && defined(slug.current)] | order(title asc)${CATEGORY_PROJECTION}`;

export const CATEGORY_BY_SLUG_QUERY = `*[_type == "thoughtCategory" && slug.current == $slug][0]{
  ${CATEGORY_PROJECTION.slice(1, -1)},
  "thoughts": *[_type == "thought" && references(^._id)] | order(publishedAt desc)${THOUGHT_SUMMARY_PROJECTION}
}`;

export const CATEGORY_SLUGS_QUERY = `*[_type == "thoughtCategory" && defined(slug.current)][]{"slug": slug.current}`;

export const EBOOK_BY_SLUG_QUERY = `*[_type == "ebook" && slug.current == $slug][0]{
  _id,
  _updatedAt,
  title,
  slug,
  subheading,
  description,
  previewTitle,
  previewText,
  coverImage${IMAGE_PROJECTION},
  downloadFile{
    ...,
    asset->{_id,url,originalFilename,mimeType}
  },
  downloadLink,
  seo${SEO_PROJECTION}
}`;

export const EBOOK_SLUGS_QUERY = `*[_type == "ebook" && defined(slug.current)][]{"slug": slug.current}`;

export const SITEMAP_QUERY = `{
  "pages": *[_type == "page"]{"slug": slug.current,"isHomepage": isHomepage,"updatedAt": _updatedAt},
  "landingPages": *[_type == "landingPage" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt},
  "thoughts": *[_type == "thought" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt},
  "works": *[_type == "work" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt},
  "authors": *[_type == "author" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt},
  "categories": *[_type == "thoughtCategory" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt},
  "ebooks": *[_type == "ebook" && defined(slug.current)]{"slug": slug.current,"updatedAt": _updatedAt}
}`;

export const SERVICE_LIST_QUERY = `*[_type == "service" && defined(slug.current)] | order(title asc)${SERVICE_PROJECTION}`;
