// Screenshot service — captures a website thumbnail with Playwright (headless
// Chromium) for the result page and share card. Reuses one browser instance.
//
// SECURITY: only ever call this with a URL already validated by the scanner's
// SSRF check. Playwright navigates with its own networking that this app cannot
// fully constrain, so in production the screenshot worker should additionally
// run with an egress-restricted network policy.
import { mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { chromium, type Browser } from "playwright";
import { env } from "@/lib/env";

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
  }
  return browserPromise;
}

export interface ScreenshotResult {
  /** Public path (under /public) or null if capture failed. */
  publicPath: string | null;
  error?: string;
}

/** Capture a screenshot; returns a public path like /screenshots/<hash>.jpg. */
export async function captureScreenshot(url: string): Promise<ScreenshotResult> {
  const fileName = `${createHash("sha256").update(url).digest("hex").slice(0, 32)}.jpg`;
  const outDir = path.resolve(env.SCREENSHOT_DIR);
  const outPath = path.join(outDir, fileName);

  let context;
  try {
    await mkdir(outDir, { recursive: true });
    const browser = await getBrowser();
    context = await browser.newContext({
      viewport: { width: env.SCREENSHOT_WIDTH, height: env.SCREENSHOT_HEIGHT },
      deviceScaleFactor: 1,
      userAgent: env.SCAN_USER_AGENT,
      // Don't surface insecure-cert pages as failures; we only want a thumbnail.
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(env.SCREENSHOT_TIMEOUT_MS);

    await page.goto(url, { waitUntil: "networkidle", timeout: env.SCREENSHOT_TIMEOUT_MS }).catch(async () => {
      // networkidle can hang on chatty sites; fall back to DOM-ready.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: env.SCREENSHOT_TIMEOUT_MS });
    });

    await page.screenshot({ path: outPath, type: "jpeg", quality: 70 });

    return { publicPath: `/screenshots/${fileName}` };
  } catch (err) {
    return { publicPath: null, error: err instanceof Error ? err.message : "Screenshot failed" };
  } finally {
    await context?.close().catch(() => {});
  }
}

/** Close the shared browser (call on graceful shutdown). */
export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    await browser?.close().catch(() => {});
    browserPromise = null;
  }
}
