import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const AUDIT_DIR = path.resolve(process.cwd(), "artifacts/all-iphones-audit");

// Get all 39 iPhone models available in Playwright (portrait)
const ALL_IPHONE_NAMES = Object.keys(devices)
  .filter((k) => k.startsWith("iPhone") && !k.includes("landscape"))
  .sort();

// Core routes to test on every single iPhone model
const ROUTES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/services", name: "Services" },
  { path: "/work", name: "Work" },
  { path: "/work/dubai-font", name: "Work: Dubai Font" },
  { path: "/thoughts", name: "Thoughts" },
  { path: "/thoughts/should-i-use-ai-for-branding", name: "Thought Article" },
  { path: "/contact", name: "Contact" },
];

async function runAllIphonesAudit() {
  console.log("================================================================================");
  console.log("             COMPREHENSIVE ALL-iPHONE RESPONSIVENESS AUDIT                     ");
  console.log("================================================================================");
  console.log(`Target URL:     ${BASE_URL}`);
  console.log(`Total iPhones:  ${ALL_IPHONE_NAMES.length} iPhone models (iPhone 6 to iPhone 17 Pro Max)`);
  console.log(`Routes/iPhone:  ${ROUTES_TO_TEST.length} primary page templates`);
  console.log(`Total Tests:    ${ALL_IPHONE_NAMES.length * ROUTES_TO_TEST.length} tests\n`);

  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const iphoneName of ALL_IPHONE_NAMES) {
    const devConfig = devices[iphoneName];
    const width = devConfig.viewport.width;
    const height = devConfig.viewport.height;
    const dpr = devConfig.deviceScaleFactor;
    const slug = iphoneName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const deviceDir = path.join(AUDIT_DIR, slug);
    fs.mkdirSync(deviceDir, { recursive: true });

    console.log(`\n📱 ${iphoneName.padEnd(22)} [${width}x${height}, DPR ${dpr}]`);

    const context = await browser.newContext(devConfig);
    const page = await context.newPage();

    for (const route of ROUTES_TO_TEST) {
      totalTests++;
      const targetUrl = `${BASE_URL}${route.path}`;
      const routeSlug = route.path === "/" ? "home" : route.path.replace(/^\//, "").replace(/\//g, "-");
      const screenshotPath = path.join(deviceDir, `${routeSlug}.png`);

      let status = "PASS";
      const issues = [];

      try {
        const response = await page.goto(targetUrl, {
          waitUntil: "domcontentloaded",
          timeout: 12000,
        });

        if (!response || response.status() >= 400) {
          status = "FAIL";
          issues.push(`HTTP status ${response ? response.status() : "None"}`);
        }

        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(200);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const windowWidth = window.innerWidth;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const hasOverflow = scrollWidth > windowWidth + 1;

          let offending = [];
          if (hasOverflow) {
            const allElements = Array.from(document.querySelectorAll("*"));
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > windowWidth + 2 && rect.width > 0 && rect.height > 0) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")}` : "";
                offending.push(`${tag}${cls} (${Math.round(rect.right)}px > ${windowWidth}px)`);
                if (offending.length >= 2) break;
              }
            }
          }

          return { scrollWidth, windowWidth, hasOverflow, offending };
        });

        if (overflow.hasOverflow) {
          status = "FAIL";
          issues.push(`Overflow: scrollWidth ${overflow.scrollWidth}px > viewport ${overflow.windowWidth}px. [${overflow.offending.join(", ")}]`);
        }

        // Capture screenshot on Home and Dubai Font
        if (route.path === "/" || route.path === "/work/dubai-font") {
          await page.screenshot({ path: screenshotPath, fullPage: false });
        }
      } catch (err) {
        status = "FAIL";
        issues.push(`Runtime error: ${err.message}`);
      }

      if (status === "PASS") {
        passedTests++;
        process.stdout.write(`.`);
      } else {
        failedTests++;
        process.stdout.write(`X`);
        console.log(`\n    FAIL: ${route.name} (${route.path}) -> ${issues.join("; ")}`);
      }

      results.push({
        device: iphoneName,
        width,
        height,
        dpr,
        route: route.path,
        routeName: route.name,
        status,
        issues,
      });
    }

    await context.close();
  }

  await browser.close();

  const summaryFile = path.join(AUDIT_DIR, "all-iphones-summary.json");
  const summary = {
    timestamp: new Date().toISOString(),
    totalIphonesTested: ALL_IPHONE_NAMES.length,
    totalTests,
    passedTests,
    failedTests,
    passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    iphoneModels: ALL_IPHONE_NAMES,
    results,
  };
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log("\n\n================================================================================");
  console.log("                     ALL-iPHONE AUDIT SUMMARY REPORT                            ");
  console.log("================================================================================");
  console.log(`iPhone Models Tested: ${ALL_IPHONE_NAMES.length} models`);
  console.log(`Total Tests Executed: ${totalTests}`);
  console.log(`Passed:               ${passedTests} (${summary.passRate})`);
  console.log(`Failed:               ${failedTests}`);
  console.log(`Summary Report Saved: ${summaryFile}`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllIphonesAudit().catch((err) => {
  console.error("Fatal error running all iPhone audit:", err);
  process.exit(1);
});
