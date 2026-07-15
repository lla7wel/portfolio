# mohamedelbahlool.com — bilingual engineering portfolio

Static Astro 5 site, English (`/en/`) and Arabic (`/ar/`, full RTL), for
Mohamed Khalid Elbahlool. Live at <https://www.mohamedelbahlool.com>
(apex 308-redirects to `www`).

**Measured Systems** design language: an engineering field manual meets a
premium hardware launch — semantic tokens, IBM Plex (Sans / Sans Arabic /
Mono, self-hosted), figure numbering and artifact labels, project-specific
accents, and interactive system explainers with static no-JS fallbacks.

## Develop

```sh
npm install
npm run dev       # dev server
npm run build     # static build to dist/
npm run preview   # serve dist/
npm run verify    # claims + locales + astro check + build + Playwright
```

## Architecture

- `src/styles/` — cascade-layered design system (`tokens` → `reset` →
  `base` → `layout` → `prose` → `components` → `utilities`). All colors are
  semantic custom properties; per-project accents hang off
  `[data-project="<slug>"]`.
- `src/layouts/Base.astro` — shell, metadata, fonts, theme init.
  `src/layouts/CaseStudy.astro` — the shared case-study framework
  (identity → hero evidence → recruiter summary → explainer → MDX prose →
  evidence gallery → related note → prev/next).
- `src/components/global|content|home|projects/` — Astro components only;
  no UI framework, no `client:*` directives. Interactivity is small vanilla
  TS modules in `src/scripts/` loaded per page.
- `src/assets/` — rasters processed by `astro:assets` (responsive AVIF/
  WebP). `public/images/` — stable-URL SVG diagrams only. `public/og/` —
  generated social cards.
- `src/data/projectVisuals.ts` — nonlocalized per-project visual config
  (codes, figure prefixes, hero media, layer coverage).

## Content model

- `src/content/projects/{en,ar}/*.mdx` — case studies. Frontmatter `key`
  pairs the two locales (do **not** name this field `slug`: Astro's glob
  loader treats frontmatter `slug` as the entry ID and bilingual files
  collide). `summary` carries the recruiter problem/contribution/result.
- `src/content/notes/{en,ar}/*.mdx` — engineering notes.
- `src/content/claims/claims.json` — the claim registry. Every published
  factual claim carries an ID here with source, status, and safe wording.
  Do not publish anything whose claim is not `confirmed`.
- `translationStatus` on Arabic entries: `draft` until natively reviewed.

## Validation and tests

```sh
npm run validate:claims    # registry integrity, expiry, forbidden wording,
                           # EN/AR claim parity, text↔claim bindings
npm run validate:locales   # route/slug parity, ui-key parity, alt text,
                           # localized diagram labels
npm run test:e2e           # Playwright: routes, a11y (axe), interactions,
                           # visual baselines (chromium/firefox/webkit)
npm run audit:perf         # Lighthouse CI against dist/ (mobile budgets)
npm run generate:og        # rebuild public/og/*.png after design changes
```

The claim validator fails the build when any referenced or text-bound claim
(e.g. GPA 3.6+, expiring 2026-09-01) has lapsed — expiry is automatic.

## Deploy (Vercel)

Push to `main`; the connected Vercel project builds and deploys. `SITE_URL`
may override the canonical origin for previews; production defaults to
`https://www.mohamedelbahlool.com`.

## Maintenance checklist (each semester)

- Update GPA/standing/coursework in `about.astro` + `claims.json` after
  grades post; claims with `expires` dates fail `verify` when they lapse.
- Re-verify the public follower counts and catalog count (expire
  2027-01) before renewing them on the English Home case study.
- Arabic pages marked `translationStatus: draft` need native review.
- Owner photo wish list (do not fake): Basys 3 board photo, post-fix NOVA
  hardware shots, Pico close-ups, optional portrait.
