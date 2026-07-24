import { test, expect } from "@playwright/test";

/* Intentional visual baselines: home, one flagship case study, one
   supporting case study, Arabic mobile, both themes. Chromium only —
   cross-engine AA noise makes multi-browser baselines brittle. */

test.skip(({ browserName }) => browserName !== "chromium", "baselines are chromium-only");

async function settlePage(page: import("@playwright/test").Page) {
  await page.locator("main").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

const shots = [
  { name: "home-en-light", path: "/en/", theme: "light" as const },
  { name: "home-en-dark", path: "/en/", theme: "dark" as const },
  { name: "home-ar-light", path: "/ar/", theme: "light" as const },
  { name: "home-ar-dark", path: "/ar/", theme: "dark" as const },
  { name: "resume-en-light", path: "/en/resume/", theme: "light" as const },
  { name: "case-english-home-dark", path: "/en/work/english-home-platform/", theme: "dark" as const },
  { name: "case-pico-light", path: "/en/work/pico-voice-terminal/", theme: "light" as const },
  { name: "case-nova-dark", path: "/en/work/nova-raid/", theme: "dark" as const },
  { name: "case-fpga-light", path: "/en/work/fpga-digital-logic/", theme: "light" as const },
];

for (const s of shots) {
  test(`visual: ${s.name}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: s.theme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(s.path);
    await settlePage(page);
    await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: false });
  });
}

test("visual: home-ar-mobile", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar/");
  await settlePage(page);
  await expect(page).toHaveScreenshot("home-ar-mobile.png", { fullPage: false });
});

test("visual: home-en-mobile", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  await settlePage(page);
  await expect(page).toHaveScreenshot("home-en-mobile.png", { fullPage: false });
});
