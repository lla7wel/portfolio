import { test, expect } from "@playwright/test";

/* Intentional visual baselines: home, one flagship case study, one
   supporting case study, Arabic mobile, both themes. Chromium only —
   cross-engine AA noise makes multi-browser baselines brittle. */

test.skip(({ browserName }) => browserName !== "chromium", "baselines are chromium-only");

const shots = [
  { name: "home-en-light", path: "/en/", theme: "light" as const },
  { name: "home-en-dark", path: "/en/", theme: "dark" as const },
  { name: "case-nova-dark", path: "/en/work/nova-raid/", theme: "dark" as const },
  { name: "case-fpga-light", path: "/en/work/fpga-digital-logic/", theme: "light" as const },
];

for (const s of shots) {
  test(`visual: ${s.name}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: s.theme, reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(s.path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${s.name}.png`, { fullPage: false });
  });
}

test("visual: home-ar-mobile", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("home-ar-mobile.png", { fullPage: false });
});
