#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:3210";
const REQUEST_TIMEOUT_MS = 30_000;
const CONCURRENCY = 8;

function parseArguments(argv) {
  const options = {
    baseUrl: process.env.ROUTE_AUDIT_BASE_URL || DEFAULT_BASE_URL,
    canonicalOrigin:
      process.env.ROUTE_AUDIT_CANONICAL_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      undefined,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--base-url") {
      options.baseUrl = argv[index + 1];
      index += 1;
    } else if (argument === "--canonical-origin") {
      options.canonicalOrigin = argv[index + 1];
      index += 1;
    } else if (argument === "--json") {
      options.json = true;
    } else if (argument === "--help" || argument === "-h") {
      console.log(`Usage: node scripts/audit-routes.mjs [options]

Options:
  --base-url URL          Server to audit (default: ${DEFAULT_BASE_URL})
  --canonical-origin URL  Expected canonical origin (default: sitemap origin)
  --json                  Print the full machine-readable report
  --help                  Show this help

Environment equivalents:
  ROUTE_AUDIT_BASE_URL, ROUTE_AUDIT_CANONICAL_ORIGIN, NEXT_PUBLIC_SITE_URL`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  options.baseUrl = normalizeOrigin(options.baseUrl);
  if (options.canonicalOrigin) {
    options.canonicalOrigin = normalizeOrigin(options.canonicalOrigin);
  }
  return options;
}

function normalizeOrigin(value) {
  const url = new URL(value);
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`Expected an origin-only URL, received: ${value}`);
  }
  return url.origin;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function attributesOf(tag) {
  const attributes = {};
  const source = tag.replace(/^<\/?[\w:-]+\s*|\/?>$/g, "");
  const expression = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = expression.exec(source))) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function findTags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => ({
    raw: match[0],
    attributes: attributesOf(match[0]),
  }));
}

function classIncludes(attributes, className) {
  return (attributes.class || "").split(/\s+/).includes(className);
}

function normalizeComparableUrl(value) {
  const url = new URL(value);
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return `${url.origin}${path}${url.search}`;
}

function typeIncludes(node, type) {
  const nodeType = node?.["@type"];
  return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
}

function graphNodes(value) {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(graphNodes);
  if (Array.isArray(value["@graph"])) return value["@graph"];
  return value["@type"] ? [value] : [];
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeEntities(match[1].trim()))
    .filter(Boolean);
}

function internalAssetUrls(html, pageUrl, baseOrigin) {
  const candidates = [];

  for (const { attributes } of [...findTags(html, "img"), ...findTags(html, "script")]) {
    if (attributes.src) candidates.push(attributes.src);
  }

  for (const { attributes } of findTags(html, "source")) {
    if (attributes.src) candidates.push(attributes.src);
  }

  for (const { attributes } of findTags(html, "link")) {
    const relationship = (attributes.rel || "").toLowerCase().split(/\s+/);
    if (
      attributes.href &&
      relationship.some((value) =>
        ["stylesheet", "icon", "preload", "modulepreload", "manifest"].includes(value),
      )
    ) {
      candidates.push(attributes.href);
    }
  }

  return [...new Set(candidates)]
    .map((candidate) => {
      try {
        return new URL(candidate, pageUrl);
      } catch {
        return null;
      }
    })
    .filter((url) => url && url.origin === baseOrigin)
    .map((url) => url.href);
}

function assetKey(value) {
  const url = new URL(value);
  return url.pathname === "/_next/image" && url.searchParams.has("url")
    ? `${url.origin}${url.pathname}?url=${url.searchParams.get("url")}`
    : url.href;
}

function deduplicateAssetUrls(urls) {
  const unique = new Map();
  for (const value of urls) {
    // next/image emits many width variants for the same source. Exercising one
    // representative optimizer URL per source catches breakage without turning
    // the audit into hundreds of redundant upstream image requests.
    const key = assetKey(value);
    if (!unique.has(key)) unique.set(key, value);
  }
  return [...unique.values()];
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "user-agent": "UnmarketingRouteAudit/1.0",
      ...options.headers,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function pooledMap(items, worker, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => run()),
  );
  return results;
}

function inspectDocument({ html, expectedCanonical, localUrl, routePath }) {
  const errors = [];
  const warnings = [];

  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const titles = titleMatches.map((match) => stripTags(match[1])).filter(Boolean);
  if (titles.length !== 1) {
    errors.push(`expected one non-empty <title>; found ${titles.length}`);
  }

  const metas = findTags(html, "meta").map(({ attributes }) => attributes);
  const descriptions = metas
    .filter((attributes) => (attributes.name || "").toLowerCase() === "description")
    .map((attributes) => attributes.content?.trim())
    .filter(Boolean);
  if (descriptions.length !== 1) {
    errors.push(`expected one non-empty meta description; found ${descriptions.length}`);
  }

  const robots = metas
    .filter((attributes) => (attributes.name || "").toLowerCase() === "robots")
    .map((attributes) => attributes.content?.trim())
    .filter(Boolean);
  if (robots.length !== 1) {
    errors.push(`expected one non-empty robots meta tag; found ${robots.length}`);
  } else {
    const directives = robots[0].toLowerCase().split(/\s*,\s*/);
    if (!directives.some((directive) => directive === "index" || directive === "noindex")) {
      errors.push("robots metadata is missing an index/noindex directive");
    }
    if (!directives.some((directive) => directive === "follow" || directive === "nofollow")) {
      errors.push("robots metadata is missing a follow/nofollow directive");
    }
    if (directives.includes("noindex")) {
      errors.push("a URL included in sitemap.xml is marked noindex");
    }
  }

  const canonicals = findTags(html, "link")
    .filter(({ attributes }) =>
      (attributes.rel || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .map(({ attributes }) => attributes.href)
    .filter(Boolean);
  if (canonicals.length !== 1) {
    errors.push(`expected one canonical link; found ${canonicals.length}`);
  } else {
    try {
      if (normalizeComparableUrl(canonicals[0]) !== normalizeComparableUrl(expectedCanonical)) {
        errors.push(`canonical mismatch: ${canonicals[0]} (expected ${expectedCanonical})`);
      }
    } catch {
      errors.push(`invalid canonical URL: ${canonicals[0]}`);
    }
  }

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) {
    errors.push(`expected exactly one <h1>; found ${h1Count}`);
  }

  const jsonLdScripts = findTags(html, "script").filter(
    ({ attributes }) => (attributes.type || "").toLowerCase() === "application/ld+json",
  );
  const jsonLdBodies = [...html.matchAll(
    /<script\b[^>]*type\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi,
  )].map((match) => match[1].trim());

  let parsedJsonLd;
  if (jsonLdScripts.length !== 1 || jsonLdBodies.length !== 1) {
    errors.push(
      `expected one JSON-LD script; found ${jsonLdScripts.length} tag(s) and ${jsonLdBodies.length} body/bodies`,
    );
  } else {
    try {
      parsedJsonLd = JSON.parse(jsonLdBodies[0]);
    } catch (error) {
      errors.push(`JSON-LD is not parseable: ${error.message}`);
    }
  }

  const details = findTags(html, "details");
  const visibleFaqCount = details.filter(({ attributes }) => classIncludes(attributes, "faq-item"))
    .length;
  const faqSections = findTags(html, "section").filter(({ attributes }) =>
    classIncludes(attributes, "faq-section"),
  ).length;
  const visibleFaq = visibleFaqCount > 0 || faqSections > 0;
  const nodes = graphNodes(parsedJsonLd);
  const faqNodes = nodes.filter((node) => typeIncludes(node, "FAQPage"));

  if (faqNodes.length > 1) {
    errors.push(`expected at most one FAQPage node; found ${faqNodes.length}`);
  }
  if (visibleFaq && faqNodes.length !== 1) {
    errors.push(`visible FAQ (${visibleFaqCount} item(s)) has no single FAQPage schema`);
  }
  if (!visibleFaq && faqNodes.length !== 0) {
    errors.push("FAQPage schema exists without a visible FAQ section");
  }
  if (faqNodes.length === 1) {
    const entities = Array.isArray(faqNodes[0].mainEntity) ? faqNodes[0].mainEntity : [];
    if (entities.length !== visibleFaqCount) {
      errors.push(
        `FAQ schema/render count mismatch: ${entities.length} schema question(s), ${visibleFaqCount} visible item(s)`,
      );
    }
  }

  if (routePath === "/privacy-policy" && h1Count === 1) {
    const bodyStart = html.search(/<body\b/i);
    const h1Start = html.search(/<h1\b/i);
    if (bodyStart >= 0 && h1Start < bodyStart) {
      warnings.push("privacy-policy H1 was not found in the rendered body");
    }
  }

  return {
    errors,
    warnings,
    title: titles[0],
    description: descriptions[0],
    canonical: canonicals[0],
    robots: robots[0],
    h1Count,
    jsonLdScriptCount: jsonLdScripts.length,
    schemaTypes: [...new Set(nodes.flatMap((node) => node["@type"] || []))],
    faqSchemaCount: faqNodes.length,
    visibleFaqCount,
    assets: internalAssetUrls(html, localUrl, new URL(localUrl).origin),
  };
}

async function auditRoute({ localUrl, expectedCanonical, routePath }) {
  const result = {
    route: routePath,
    localUrl,
    expectedCanonical,
    status: undefined,
    errors: [],
    warnings: [],
  };

  try {
    const response = await fetchWithTimeout(localUrl, { redirect: "manual" });
    result.status = response.status;
    if (response.status !== 200) {
      result.errors.push(`expected HTTP 200; received ${response.status}`);
      await response.body?.cancel();
      return result;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      result.errors.push(`expected HTML response; received ${contentType || "no content-type"}`);
    }
    const html = await response.text();
    Object.assign(
      result,
      inspectDocument({ html, expectedCanonical, localUrl, routePath }),
    );
  } catch (error) {
    result.errors.push(`request failed: ${error.message}`);
  }

  return result;
}

async function auditAsset(assetUrl) {
  try {
    const response = await fetchWithTimeout(assetUrl, { redirect: "follow" });
    const result = {
      url: assetUrl,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get("content-type") || undefined,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
    await response.body?.cancel();
    return result;
  } catch (error) {
    return { url: assetUrl, ok: false, error: error.message };
  }
}

const LEGACY_REDIRECTS = [
  {
    from: "/project/meraas",
    to: "/work/meraas",
    label: "legacy project",
  },
  {
    from: "/post/employer-branding-the-power-of-people",
    to: "/thoughts/employer-branding-the-power-of-people",
    label: "legacy Webflow post",
  },
  {
    from: "/thoughts/why-we-dont-let-ai-design-your-brand",
    to: "/thoughts/should-i-use-ai-for-branding",
    label: "renamed thought",
  },
];

async function auditRedirect(baseUrl, redirect) {
  const url = new URL(redirect.from, baseUrl).href;
  const result = { ...redirect, url, errors: [], status: undefined, location: undefined };
  try {
    const response = await fetchWithTimeout(url, { redirect: "manual" });
    result.status = response.status;
    result.location = response.headers.get("location") || undefined;
    await response.body?.cancel();
    if (response.status !== 301) {
      result.errors.push(`expected exact HTTP 301; received ${response.status}`);
    }
    if (!result.location) {
      result.errors.push("missing Location header");
    } else {
      const actual = new URL(result.location, url);
      const expected = new URL(redirect.to, baseUrl);
      if (`${actual.pathname}${actual.search}` !== `${expected.pathname}${expected.search}`) {
        result.errors.push(
          `redirect target mismatch: ${actual.pathname}${actual.search} (expected ${redirect.to})`,
        );
      }
    }
  } catch (error) {
    result.errors.push(`request failed: ${error.message}`);
  }
  return result;
}

function printReport(report) {
  console.log("Production route / SEO / schema audit");
  console.log(`Server: ${report.baseUrl}`);
  console.log(`Canonical origin: ${report.canonicalOrigin}`);
  console.log(
    `Routes: ${report.summary.routesPassed}/${report.summary.routesChecked} passed; ` +
      `redirects: ${report.summary.redirectsPassed}/${report.summary.redirectsChecked} passed; ` +
      `assets: ${report.summary.assetsPassed}/${report.summary.assetsChecked} passed`,
  );

  for (const route of report.routes) {
    if (!route.errors.length && !route.warnings.length) continue;
    const state = route.errors.length ? "FAIL" : "WARN";
    console.log(`\n${state} ${route.route}${route.status ? ` (HTTP ${route.status})` : ""}`);
    route.errors.forEach((error) => console.log(`  ERROR ${error}`));
    route.warnings.forEach((warning) => console.log(`  WARN  ${warning}`));
  }

  for (const redirect of report.redirects) {
    if (!redirect.errors.length) continue;
    console.log(`\nFAIL ${redirect.from} (${redirect.label})`);
    redirect.errors.forEach((error) => console.log(`  ERROR ${error}`));
  }

  for (const asset of report.assets.filter((item) => !item.ok)) {
    console.log(`\nFAIL asset ${asset.url}`);
    console.log(`  ERROR ${asset.error}`);
    if (asset.usedBy?.length) console.log(`  ROUTES ${asset.usedBy.join(", ")}`);
  }

  if (report.ok) {
    console.log("\nPASS All route, SEO, schema, redirect, and internal asset checks passed.");
  } else {
    console.log(`\nFAIL ${report.summary.errors} blocking issue(s) found.`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const sitemapUrl = new URL("/sitemap.xml", options.baseUrl).href;
  let sitemapResponse;
  try {
    sitemapResponse = await fetchWithTimeout(sitemapUrl, { redirect: "manual" });
  } catch (error) {
    throw new Error(`Could not fetch ${sitemapUrl}: ${error.message}`);
  }
  if (sitemapResponse.status !== 200) {
    throw new Error(`Could not fetch ${sitemapUrl}: HTTP ${sitemapResponse.status}`);
  }
  const sitemapXml = await sitemapResponse.text();
  const sitemapUrls = [...new Set(sitemapLocations(sitemapXml))];
  if (!sitemapUrls.length) {
    throw new Error(`${sitemapUrl} did not contain any <loc> entries`);
  }

  const sitemapOrigins = [...new Set(sitemapUrls.map((value) => new URL(value).origin))];
  if (sitemapOrigins.length !== 1) {
    throw new Error(`Sitemap contains multiple origins: ${sitemapOrigins.join(", ")}`);
  }
  const canonicalOrigin = options.canonicalOrigin || sitemapOrigins[0];

  const routes = await pooledMap(sitemapUrls, async (sitemapUrlValue) => {
    const sitemapEntry = new URL(sitemapUrlValue);
    const routePath = `${sitemapEntry.pathname}${sitemapEntry.search}`;
    const localUrl = new URL(routePath, options.baseUrl).href;
    const expectedCanonical = new URL(routePath, canonicalOrigin).href;
    return auditRoute({ localUrl, expectedCanonical, routePath });
  });

  const assetUrls = deduplicateAssetUrls(routes.flatMap((route) => route.assets || []));
  const assetUsage = new Map();
  for (const route of routes) {
    for (const assetUrl of route.assets || []) {
      const key = assetKey(assetUrl);
      const usage = assetUsage.get(key) || new Set();
      usage.add(route.route);
      assetUsage.set(key, usage);
    }
  }
  const assets = (await pooledMap(assetUrls, auditAsset, 12)).map((asset) => ({
    ...asset,
    usedBy: [...(assetUsage.get(assetKey(asset.url)) || [])].sort(),
  }));
  const redirects = await pooledMap(LEGACY_REDIRECTS, (item) =>
    auditRedirect(options.baseUrl, item),
  );

  const routeErrors = routes.reduce((sum, route) => sum + route.errors.length, 0);
  const redirectErrors = redirects.reduce((sum, redirect) => sum + redirect.errors.length, 0);
  const assetErrors = assets.filter((asset) => !asset.ok).length;
  const report = {
    ok: routeErrors + redirectErrors + assetErrors === 0,
    baseUrl: options.baseUrl,
    canonicalOrigin,
    generatedAt: new Date().toISOString(),
    summary: {
      routesChecked: routes.length,
      routesPassed: routes.filter((route) => !route.errors.length).length,
      redirectsChecked: redirects.length,
      redirectsPassed: redirects.filter((redirect) => !redirect.errors.length).length,
      assetsChecked: assets.length,
      assetsPassed: assets.filter((asset) => asset.ok).length,
      warnings: routes.reduce((sum, route) => sum + route.warnings.length, 0),
      errors: routeErrors + redirectErrors + assetErrors,
    },
    routes,
    redirects,
    assets,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (!report.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Route audit could not run: ${error.message}`);
  process.exitCode = 1;
});
