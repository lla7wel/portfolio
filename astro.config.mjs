// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Canonical origin. Final domain: mohamedelbahlool.com (available as of
// 2026-07-14, not yet purchased). Until it's connected, deploys set SITE_URL
// to the Vercel production URL so canonicals/hreflang/sitemap stay truthful.
const site = process.env.SITE_URL ?? "https://mohamedelbahlool.com";

export default defineConfig({
  site,
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", ar: "ar" },
      },
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
