import fs from "node:fs";
import path from "node:path";
import { chromium, devices } from "playwright";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const AUDIT_DIR = path.resolve(process.cwd(), "artifacts/apple-devices-audit");

// Curated suite of Apple mobile and tablet devices
const APPLE_DEVICES = [
  {
    name: "iPhone SE (1st gen) / Compact",
    slug: "iphone-se-1st-gen",
    settings: {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      viewport: { width: 320, height: 568 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
  {
    name: "iPhone SE (3rd gen)",
    slug: "iphone-se-3rd-gen",
    settings: devices["iPhone SE (3rd gen)"],
  },
  {
    name: "iPhone 14 / 15",
    slug: "iphone-14-15",
    settings: devices["iPhone 14"],
  },
  {
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    settings: devices["iPhone 15 Pro Max"],
  },
  {
    name: "iPad Mini",
    slug: "ipad-mini",
    settings: devices["iPad Mini"],
  },
  {
    name: "iPad Pro 11",
    slug: "ipad-pro-11",
    settings: devices["iPad Pro 11"],
  },
];

// Comprehensive route matrix representing all page templates
const ROUTES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/services", name: "Services" },
  { path: "/work", name: "Work Portfolio" },
  { path: "/work/dubai-font", name: "Work Detail (Dubai Font)" },
  { path: "/work/renuvi", name: "Work Detail (Renuvi)" },
  { path: "/thoughts", name: "Thoughts Index" },
  { path: "/thoughts/should-i-use-ai-for-branding", name: "Thought Detail (AI Branding)" },
  { path: "/contact", name: "Contact Us" },
  { path: "/unmarketing-careers", name: "Careers" },
  { path: "/privacy-policy", name: "Privacy Policy" },
  { path: "/startups", name: "Startups Landing" },
  { path: "/authors/gladwyn-lewis", name: "Author (Gladwyn Lewis)" },
  { path: "/thoughts-categories/branding", name: "Category (Branding)" },
];

async function runAppleDeviceAudit() {
  console.log("================================================================================");
  console.log("            APPLE MOBILE & TABLET RESPONSIVENESS AUDIT SUITE                   ");
  console.log("================================================================================");
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Devices:    ${APPLE_DEVICES.map((d) => d.name).join(", ")}`);
  console.log(`Routes:     ${ROUTES_TO_TEST.length} primary page templates`);
  console.log(`Total runs: ${APPLE_DEVICES.length * ROUTES_TO_TEST.length} tests\n`);

  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const device of APPLE_DEVICES) {
    const deviceDir = path.join(AUDIT_DIR, device.slug);
    fs.mkdirSync(deviceDir, { recursive: true });

    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`📱 Testing Device: ${device.name} (${device.settings.viewport.width}x${device.settings.viewport.height})`);
    console.log(`--------------------------------------------------------------------------------`);

    const context = await browser.newContext(device.settings);
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
          timeout: 15000,
        });

        if (!response || response.status() >= 400) {
          status = "FAIL";
          issues.push(`HTTP Status ${response ? response.status() : "No response"}`);
        }

        // Wait for web fonts to settle
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(300);

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const windowWidth = window.innerWidth;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          const hasOverflow = scrollWidth > windowWidth + 1; // 1px rounding tolerance

          let offendingElements = [];
          if (hasOverflow) {
            const allElements = Array.from(document.querySelectorAll("*"));
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > windowWidth + 2 && rect.width > 0 && rect.height > 0) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${String(el.className).trim().split(/\s+/).slice(0, 2).join(".")}` : "";
                const id = el.id ? `#${el.id}` : "";
                offendingElements.push(`${tag}${id}${cls} (right: ${Math.round(rect.right)}px, view: ${windowWidth}px)`);
                if (offendingElements.length >= 3) break;
              }
            }
          }

          return {
            windowWidth,
            scrollWidth,
            hasOverflow,
            offendingElements,
          };
        });

        if (overflowData.hasOverflow) {
          status = "FAIL";
          issues.push(
            `Horizontal overflow detected: scrollWidth ${overflowData.scrollWidth}px > viewport ${overflowData.windowWidth}px. Offending: ${overflowData.offendingElements.join("; ")}`
          );
        }

        // Check mobile hamburger menu on phones
        if (device.settings.viewport.width <= 768) {
          const navCheck = await page.evaluate(async () => {
            const toggle = document.querySelector(".w-nav-button, button[aria-label*='menu' i], .menu-button");
            if (!toggle) return { found: false };

            const isVisible = window.getComputedStyle(toggle).display !== "none";
            return { found: true, isVisible };
          });

          if (navCheck.found && !navCheck.isVisible) {
            // Note if hamburger button is hidden on mobile
            issues.push("Mobile navigation toggle is hidden (display: none)");
          }
        }

        // Capture screenshot
        await page.screenshot({ path: screenshotPath, fullPage: false });

      } catch (err) {
        status = "FAIL";
        issues.push(`Runtime error: ${err.message}`);
      }

      if (status === "PASS") {
        passedTests++;
        console.log(`  ✓ [PASS] ${route.name.padEnd(28)} (${route.path})`);
      } else {
        failedTests++;
        console.log(`  ✗ [FAIL] ${route.name.padEnd(28)} (${route.path})`);
        for (const issue of issues) {
          console.log(`      ↳ ${issue}`);
        }
      }

      results.push({
        device: device.name,
        deviceSlug: device.slug,
        viewport: `${device.settings.viewport.width}x${device.settings.viewport.height}`,
        route: route.path,
        routeName: route.name,
        status,
        issues,
        screenshot: screenshotPath,
      });
    }

    await context.close();
  }

  await browser.close();

  // Save summary JSON
  const summaryFile = path.join(AUDIT_DIR, "apple-audit-summary.json");
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalTests,
    passedTests,
    failedTests,
    passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    results,
  };
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  console.log("\n================================================================================");
  console.log("                           AUDIT SUMMARY REPORT                                 ");
  console.log("================================================================================");
  console.log(`Total Tests Executed: ${totalTests}`);
  console.log(`Passed:               ${passedTests} (${summary.passRate})`);
  console.log(`Failed:               ${failedTests}`);
  console.log(`Summary Report Saved: ${summaryFile}`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAppleDeviceAudit().catch((err) => {
  console.error("Fatal error running Apple device audit:", err);
  process.exit(1);
});
