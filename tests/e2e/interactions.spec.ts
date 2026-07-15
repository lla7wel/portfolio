import { test, expect } from "@playwright/test";

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, closes with Escape, and returns focus", async ({ page }) => {
    await page.goto("/en/");
    const toggle = page.locator("[data-nav-toggle]");
    const panel = page.locator("#mobile-nav-panel");

    await expect(toggle).toBeVisible();
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel.locator('a[href="/en/work/"]')).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("header stays on one line at 390px", async ({ page }) => {
    await page.goto("/en/");
    const bar = page.locator(".site-header .bar");
    const box = await bar.boundingBox();
    expect(box!.height).toBeLessThan(80);
  });
});

test("theme switch initializes and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/en/");
  const btn = page.locator("[data-theme-switch]").first();
  // Initial aria-pressed reflects the actual (system dark) theme.
  await expect(btn).toHaveAttribute("aria-pressed", "true");

  await btn.click();
  await expect(btn).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("[data-theme-switch]").first()).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("stage explainer is keyboard operable", async ({ page }) => {
  await page.goto("/en/work/english-home-platform/");
  const explainer = page.locator("[data-stage-explainer]").first();
  await expect(explainer).toHaveAttribute("data-enhanced", "true");

  const first = explainer.locator("button[data-stage]").first();
  await expect(first).toHaveAttribute("aria-current", "step");

  await first.focus();
  await page.keyboard.press("ArrowDown");
  const second = explainer.locator("button[data-stage]").nth(1);
  await expect(second).toHaveAttribute("aria-current", "step");
  await expect(second).toBeFocused();

  // Exactly one visible panel matching the selected stage.
  const visible = explainer.locator("[data-stage-panel]:not([hidden])");
  await expect(visible).toHaveCount(1);
});

test("lightbox opens, traps Escape, and restores focus", async ({ page }) => {
  await page.goto("/en/work/nova-raid/");
  const trigger = page.locator("[data-lightbox-trigger]").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const dialog = page.locator("#figure-lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("src", /.+/);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("copy-email announces success", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permission API is Chromium-only");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/contact/");
  await page.locator("[data-copy-email]").click();
  await expect(page.locator("[data-copy-status]")).toHaveText(/copied/i);
  const value = await page.evaluate(() => navigator.clipboard.readText());
  expect(value).toBe("tmtmd24@gmail.com");
});

test("locale switch stores the preference for the root redirect", async ({ page }) => {
  await page.goto("/en/");
  await page.locator("header [data-lang-switch]").click();
  await page.waitForURL("/ar/");
  const stored = await page.evaluate(() => localStorage.getItem("locale"));
  expect(stored).toBe("ar");
});

test("case-study ToC tracks scrolling with a non-color indicator", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "the sticky ToC is desktop-only");
  await page.goto("/en/work/nova-raid/");
  await page.locator("#cs-evidence").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const current = page.locator(".desktop-toc a[aria-current='true']");
  await expect(current).toHaveCount(1);
  const weight = await current.evaluate((el) => getComputedStyle(el).fontWeight);
  expect(Number(weight)).toBeGreaterThanOrEqual(600);
});
