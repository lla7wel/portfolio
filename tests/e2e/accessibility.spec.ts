import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/en/",
  "/ar/",
  "/en/work/",
  "/en/work/nova-raid/",
  "/en/work/english-home-platform/",
  "/ar/work/pico-voice-terminal/",
  "/en/notes/",
  "/en/notes/hardware-only-bug/",
  "/en/about/",
  "/en/resume/",
  "/ar/resume/",
  "/en/contact/",
];

for (const path of pages) {
  for (const theme of ["light", "dark"] as const) {
    test(`axe: ${path} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      );
      expect(
        serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`),
      ).toEqual([]);
    });
  }
}

test("skip link jumps to main content", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "WebKit does not Tab to links without OS-level settings");
  await page.goto("/en/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("headings are hierarchical on the home page", async ({ page }) => {
  await page.goto("/en/");
  const levels = await page.$$eval("h1, h2, h3, h4", (hs) =>
    hs.map((h) => Number(h.tagName[1])),
  );
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
  }
});

test("reduced motion pauses the 3D engineering view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/");
  const scene = page.locator("[data-engineering-scene]").first();
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-ready", /true|fallback/);
  await expect(scene.locator("[data-scene-toggle]")).toHaveAttribute("aria-pressed", "false");
});

test("interactive diagrams keep a static no-JS fallback", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4325/en/work/english-home-platform/");
  // All eight stage descriptions visible without JS.
  const panels = page.locator("[data-stage-panel]");
  await expect(panels).toHaveCount(8);
  for (let i = 0; i < 8; i++) await expect(panels.nth(i)).toBeVisible();
  await context.close();
});
