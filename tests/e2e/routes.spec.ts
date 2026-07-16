import { test, expect } from "@playwright/test";

const projectSlugs = [
  "english-home-platform",
  "nova-raid",
  "pico-voice-terminal",
  "smart-home-controller",
  "miramar",
  "fpga-digital-logic",
];
const noteSlugs = ["free-tier-outage", "hardware-only-bug"];

const routes: string[] = [
  "/en/",
  "/ar/",
  "/en/work/",
  "/ar/work/",
  "/en/about/",
  "/ar/about/",
  "/en/resume/",
  "/ar/resume/",
  "/en/contact/",
  "/ar/contact/",
  "/en/notes/",
  "/ar/notes/",
  ...projectSlugs.flatMap((s) => [`/en/work/${s}/`, `/ar/work/${s}/`]),
  ...noteSlugs.flatMap((s) => [`/en/notes/${s}/`, `/ar/notes/${s}/`]),
];

for (const route of routes) {
  test(`route ${route} renders correctly`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    const failed: string[] = [];
    page.on("requestfailed", (req) => {
      // Aborted loads are browser scheduling noise, not broken assets.
      const err = req.failure()?.errorText ?? "";
      if (err !== "net::ERR_ABORTED" && err !== "NS_BINDING_ABORTED") {
        failed.push(`${req.url()} — ${req.failure()?.errorText}`);
      }
    });

    const res = await page.goto(route);
    expect(res?.status()).toBe(200);

    // Exactly one h1, correct lang/dir.
    await expect(page.locator("h1")).toHaveCount(1);
    const isAr = route.startsWith("/ar/");
    await expect(page.locator("html")).toHaveAttribute("lang", isAr ? "ar" : "en");
    await expect(page.locator("html")).toHaveAttribute("dir", isAr ? "rtl" : "ltr");

    // Canonical + hreflang trio.
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", new RegExp(route.replace(/[/]/g, "\\/") + "$"));
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);

    // OG basics.
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );

    // No broken same-origin images.
    const brokenImgs = await page.$$eval("img", (imgs) =>
      imgs
        // The lightbox <img> legitimately has no src until it is opened.
        .filter((i) => i.getAttribute("src"))
        .filter((i) => i.complete && i.naturalWidth === 0 && !i.loading?.includes("lazy"))
        .map((i) => i.src),
    );
    expect(brokenImgs).toEqual([]);

    expect(errors, `console errors on ${route}`).toEqual([]);
    expect(failed, `failed requests on ${route}`).toEqual([]);
  });
}

test("root redirects to a locale home", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/(en|ar)\/$/);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("unknown route serves the 404 page", async ({ page }) => {
  const res = await page.goto("/en/work/does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText(/not found/i);
  await expect(page.locator('a[href="/en/"]').first()).toBeVisible();
});

test("case studies expose prev/next and evidence in plain HTML", async ({ page }) => {
  await page.goto("/en/work/nova-raid/");
  await expect(page.locator("#cs-evidence figure").first()).toBeAttached();
  await expect(page.locator(".cs-nav a").first()).toBeVisible();
});

test("work index keeps all project links in the HTML", async ({ page }) => {
  await page.goto("/en/work/");
  for (const slug of projectSlugs) {
    await expect(page.locator(`a[href="/en/work/${slug}/"]`).first()).toBeAttached();
  }
});

test("language switch preserves the route", async ({ page }) => {
  await page.goto("/en/work/nova-raid/");
  const switchLink = page.locator('header a[hreflang="ar"]');
  await expect(switchLink).toHaveAttribute("href", "/ar/work/nova-raid/");
});
