const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "lozn0fsa";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-24";

const query = `*[_type in [
  "author","ebook","faqItem","landingPage","page","pillar",
  "service","thought","thoughtCategory","work"
]]`;

const url = new URL(
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
);
url.searchParams.set("query", query);

const response = await fetch(url, {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(30_000),
});

if (!response.ok) {
  throw new Error(`Sanity content audit failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const documents = payload.result || [];
const documentsById = new Map(documents.map((document) => [document._id, document]));
const warnings = [];
const errors = [];

function collect(value, predicate, path = [], result = []) {
  if (predicate(value)) result.push({ value, path });
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collect(entry, predicate, [...path, index], result));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) =>
      collect(entry, predicate, [...path, key], result),
    );
  }
  return result;
}

function slugOf(document) {
  return document.slug?.current;
}

function routeOf(document) {
  if (document._type === "page") return document.isHomepage ? "/" : `/${slugOf(document)}`;
  if (document._type === "landingPage") return `/${slugOf(document)}`;
  if (document._type === "thought") return `/thoughts/${slugOf(document)}`;
  if (document._type === "work") return `/work/${slugOf(document)}`;
  if (document._type === "author") return `/authors/${slugOf(document)}`;
  if (document._type === "thoughtCategory") return `/thoughts-categories/${slugOf(document)}`;
  if (document._type === "ebook") return `/ebook/${slugOf(document)}`;
  return undefined;
}

const publicTypes = new Set([
  "page",
  "landingPage",
  "thought",
  "work",
  "author",
  "thoughtCategory",
  "ebook",
]);

const routes = documents
  .filter((document) => publicTypes.has(document._type))
  .map((document) => ({ document, route: routeOf(document) }))
  .filter(({ route }) => route && !route.includes("undefined"));

const routesByPath = new Map();
for (const item of routes) {
  const existing = routesByPath.get(item.route) || [];
  existing.push(item.document);
  routesByPath.set(item.route, existing);
}

for (const [route, routeDocuments] of routesByPath) {
  if (routeDocuments.length > 1) {
    errors.push(`Duplicate public route ${route}: ${routeDocuments.map((item) => item._id).join(", ")}`);
  }
}

const reservedLandingSlugs = new Set([
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

for (const landingPage of documents.filter((document) => document._type === "landingPage")) {
  if (reservedLandingSlugs.has(slugOf(landingPage))) {
    errors.push(`Landing page slug collides with a reserved route: ${slugOf(landingPage)}`);
  }
}

for (const document of documents) {
  const references = collect(
    document,
    (value) => value && typeof value === "object" && typeof value._ref === "string",
  );
  for (const reference of references) {
    if (!documentsById.has(reference.value._ref) && !reference.value._ref.startsWith("image-") && !reference.value._ref.startsWith("file-")) {
      errors.push(
        `Dangling reference ${reference.value._ref} in ${document._type}:${document._id} at ${reference.path.join(".")}`,
      );
    }
  }
}

for (const { document, route } of routes) {
  if (!["author", "thoughtCategory", "work"].includes(document._type)) {
    if (!document.seo?.metaTitle || !document.seo?.metaDescription) {
      warnings.push(`${route} is missing a complete SEO title/description pair`);
    }
  }

  const images = collect(document, (value) => value?._type === "image");
  for (const image of images) {
    const isSeoImage = image.path.includes("seo") || image.path.includes("ogImage");
    if (!isSeoImage && !image.value.alt?.trim()) {
      warnings.push(`${route} has an image without alt text at ${image.path.join(".")}`);
    }
  }
}

const pageFaqs = [];
for (const { document, route } of routes.filter(({ document }) =>
  ["page", "landingPage", "thought"].includes(document._type),
)) {
  for (const reference of document.faq || []) {
    const faq = documentsById.get(reference._ref);
    if (!faq) continue;
    const normalized = `${faq.question || ""}\n${faq.answer || ""}`
      .toLocaleLowerCase("en")
      .replace(/\s+/g, " ")
      .trim();
    pageFaqs.push({ route, faq, normalized });
  }
}

const faqUsage = new Map();
for (const item of pageFaqs) {
  const key = item.normalized;
  const usage = faqUsage.get(key) || [];
  usage.push(item);
  faqUsage.set(key, usage);
}

for (const usage of faqUsage.values()) {
  const uniqueRoutes = [...new Set(usage.map((item) => item.route))];
  if (uniqueRoutes.length > 1) {
    warnings.push(
      `Exact FAQ duplicate across ${uniqueRoutes.join(", ")}: “${usage[0].faq.question}”`,
    );
  }
}

const realEstate = documents.find(
  (document) => document._type === "landingPage" && slugOf(document) === "real-estate-branding",
);
const healthcare = documents.find(
  (document) => document._type === "landingPage" && slugOf(document) === "healthcare-branding",
);
if (
  realEstate &&
  healthcare &&
  JSON.stringify((realEstate.faq || []).map((item) => item._ref)) ===
    JSON.stringify((healthcare.faq || []).map((item) => item._ref))
) {
  warnings.push(
    "/real-estate-branding references the complete /healthcare-branding FAQ set; editorial correction required in Sanity",
  );
}

for (const document of documents) {
  const externalStrings = collect(
    document,
    (value) => typeof value === "string" && /(?:website-files\.com|webflow\.io)/i.test(value),
  );
  for (const match of externalStrings) {
    warnings.push(
      `${document._type}:${document._id} still contains a Webflow URL at ${match.path.join(".")}`,
    );
  }
}

const typeCounts = Object.fromEntries(
  [...new Set(documents.map((document) => document._type))]
    .sort()
    .map((type) => [type, documents.filter((document) => document._type === type).length]),
);

console.log("Sanity published-content audit");
console.log(`Project: ${projectId}; dataset: ${dataset}; API version: ${apiVersion}`);
console.log(`Documents: ${documents.length}; public routes: ${routes.length}`);
console.log("Type counts:", JSON.stringify(typeCounts, null, 2));
console.log("Routes:");
routes
  .map(({ route }) => route)
  .sort()
  .forEach((route) => console.log(`  ${route}`));

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  [...new Set(warnings)].forEach((warning) => console.log(`  WARN ${warning}`));
}

if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  [...new Set(errors)].forEach((error) => console.error(`  ERROR ${error}`));
  process.exitCode = 1;
} else {
  console.log("\nNo blocking content-integrity errors found.");
}
