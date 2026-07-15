// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Canonical origin: the live custom domain (apex 308-redirects to www).
// Preview deploys may override with SITE_URL so canonicals stay truthful.
const site = process.env.SITE_URL ?? "https://www.mohamedelbahlool.com";

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
});
