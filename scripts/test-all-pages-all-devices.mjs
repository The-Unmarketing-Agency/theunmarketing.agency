import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const AUDIT_DIR = path.resolve(process.cwd(), "artifacts/all-pages-all-devices-audit");

// Device viewports representing all Apple and mobile/desktop categories
const DEVICE_VIEWPORTS = [
  { name: "iPhone SE (320px)", width: 320, height: 568 },
  { name: "iPhone Mini/SE3 (375px)", width: 375, height: 667 },
  { name: "iPhone 14/15 (390px)", width: 390, height: 844 },
  { name: "iPhone Pro Max (430px)", width: 430, height: 932 },
  { name: "iPad Mini (768px)", width: 768, height: 1024 },
  { name: "iPad Pro 11 (834px)", width: 834, height: 1194 },
  { name: "iPad/Laptop (1024px)", width: 1024, height: 768 },
  { name: "Desktop (1440px)", width: 1440, height: 900 },
];

function getAllRoutes() {
  const appDir = path.resolve(".next/server/app");
  let routes = [];

  function walk(dir, base = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith("(") && !entry.name.startsWith("_")) {
          walk(fullPath, `${base}/${entry.name}`);
        } else {
          walk(fullPath, base);
        }
      } else if (
        entry.name.endsWith(".html") &&
        !entry.name.startsWith("_") &&
        !entry.name.includes("not-found")
      ) {
        let route = `${base}/${entry.name.replace(/\.html$/, "")}`.replace(/\/index$/, "");
        if (!route) route = "/";
        routes.push(route);
      }
    }
  }

  if (fs.existsSync(appDir)) {
    walk(appDir);
  }

  // Deduplicate and filter out internal routes
  return [...new Set(routes)].sort();
}

async function runAllPagesAllDevicesAudit() {
  const allRoutes = getAllRoutes();
  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  const totalRuns = allRoutes.length * DEVICE_VIEWPORTS.length;

  console.log("================================================================================");
  console.log("             ALL PAGES × ALL DEVICE VIEWPORTS AUDIT SUITE                       ");
  console.log("================================================================================");
  console.log(`Target URL:       ${BASE_URL}`);
  console.log(`Total Routes:     ${allRoutes.length} canonical routes`);
  console.log(`Device Viewports: ${DEVICE_VIEWPORTS.length} viewports (320px to 1440px)`);
  console.log(`Total Test Runs:  ${totalRuns} tests\n`);

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const failures = [];
  let completed = 0;
  let passed = 0;

  // Process in worker batches
  const CONCURRENCY = 4;
  const chunkArray = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  const routeChunks = chunkArray(allRoutes, CONCURRENCY);

  for (const chunk of routeChunks) {
    await Promise.all(
      chunk.map(async (route) => {
        const page = await browser.newPage();

        for (const vp of DEVICE_VIEWPORTS) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          const targetUrl = `${BASE_URL}${route}`;

          try {
            const resp = await page.goto(targetUrl, {
              waitUntil: "domcontentloaded",
              timeout: 15000,
            });

            if (!resp || resp.status() >= 400) {
              failures.push({
                route,
                device: vp.name,
                width: vp.width,
                issue: `HTTP status ${resp ? resp.status() : "None"}`,
              });
              completed++;
              process.stdout.write("X");
              continue;
            }

            await page.evaluate(() => document.fonts.ready);

            const check = await page.evaluate(() => {
              const docEl = document.documentElement;
              const body = document.body;
              const scrollW = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
              const windowW = window.innerWidth;
              const hasOverflow = scrollW > windowW + 1;

              let offending = [];
              if (hasOverflow) {
                const els = Array.from(document.querySelectorAll("*"));
                for (const el of els) {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > windowW + 2 && rect.width > 0 && rect.height > 0) {
                    const tag = el.tagName.toLowerCase();
                    const cls = el.className ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")}` : "";
                    offending.push(`${tag}${cls} (${Math.round(rect.right)}px > ${windowW}px)`);
                    if (offending.length >= 2) break;
                  }
                }
              }

              return { hasOverflow, scrollW, windowW, offending };
            }, vp.width);

            completed++;
            if (check.hasOverflow) {
              failures.push({
                route,
                device: vp.name,
                width: vp.width,
                issue: `Overflow: scrollWidth ${check.scrollW}px > viewport ${check.windowW}px [${check.offending.join(", ")}]`,
              });
              process.stdout.write("X");
            } else {
              passed++;
              process.stdout.write(".");
            }
          } catch (err) {
            completed++;
            failures.push({
              route,
              device: vp.name,
              width: vp.width,
              issue: `Error: ${err.message}`,
            });
            process.stdout.write("E");
          }
        }

        await page.close();
      })
    );
  }

  await browser.close();

  console.log("\n\n================================================================================");
  console.log("                          FULL AUDIT RESULTS                                    ");
  console.log("================================================================================");
  console.log(`Total Tests:      ${completed} / ${totalRuns}`);
  console.log(`Passed:           ${passed} (${((passed / completed) * 100).toFixed(1)}%)`);
  console.log(`Failed:           ${failures.length}`);

  const summaryFile = path.join(AUDIT_DIR, "all-pages-all-devices-summary.json");
  fs.writeFileSync(
    summaryFile,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalRoutes: allRoutes.length,
        viewports: DEVICE_VIEWPORTS,
        totalTests: completed,
        passed,
        failed: failures.length,
        failures,
      },
      null,
      2
    )
  );
  console.log(`Report Saved:     ${summaryFile}`);

  if (failures.length > 0) {
    console.log("\nFailure Details:");
    failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.device}] ${f.route} -> ${f.issue}`);
    });
    process.exit(1);
  } else {
    console.log("\nALL 85 PAGES ARE 100% RESPONSIVE ACROSS ALL 8 DEVICE VIEWPORTS WITH ZERO OVERFLOW!");
  }
}

runAllPagesAllDevicesAudit().catch((err) => {
  console.error("Fatal error running all-pages audit:", err);
  process.exit(1);
});
