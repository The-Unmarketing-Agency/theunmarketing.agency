export const SITE_NAME = "The Unmarketing Agency";
export const SITE_DESCRIPTION =
  "Strategy-first branding and design studio in Los Angeles, Singapore, and Mumbai.";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (configuredSiteUrl || "https://www.theunmarketing.agency").replace(
  /\/$/,
  "",
);

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export const PRIMARY_NAVIGATION = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/thoughts", label: "Thoughts" },
  { href: "/unmarketing-careers", label: "Careers" },
  { href: "/contact", label: "Contact us" },
] as const;

export const INDUSTRY_ROUTES = [
  "/startups",
  "/vc",
  "/branding-for-startups",
  "/branding-for-professional-services",
  "/real-estate-branding",
  "/luxury-branding",
  "/healthcare-branding",
] as const;

export const RESERVED_ROOT_SLUGS = new Set([
  "about",
  "api",
  "authors",
  "contact",
  "ebook",
  "privacy-policy",
  "project",
  "search",
  "services",
  "thoughts",
  "thoughts-categories",
  "unmarketing-careers",
  "work",
]);

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function canonicalPath(path = "/") {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}
