# mohamedelbahlool.com — bilingual engineering portfolio

Static Astro 5 site, English (`/en/`) and Arabic (`/ar/`, full RTL), for
Mohamed Khalid Elbahlool.

## Develop

```sh
npm install
npm run dev       # dev server
npm run build     # static build to dist/
npm run preview   # serve dist/
```

## Content model

- `src/content/projects/{en,ar}/*.mdx` — case studies. Frontmatter `key`
  pairs the two locales (do **not** name this field `slug`: Astro's glob
  loader treats frontmatter `slug` as the entry ID and bilingual files
  collide).
- `src/content/notes/{en,ar}/*.mdx` — engineering notes.
- `src/content/claims/claims.json` — the claim registry. Every published
  factual claim carries an ID here with source, status, and safe wording.
  Do not publish anything whose claim is not `confirmed`.
- `translationStatus` on Arabic entries: `draft` until natively reviewed.

## Deploy (Vercel)

1. Import the GitHub repo `lla7wel/portfolio` in Vercel (framework:
   Astro; defaults work).
2. Set the environment variable `SITE_URL` to the deployment origin
   (e.g. `https://<project>.vercel.app`). Canonicals, hreflang, sitemap
   and robots.txt derive from it.
3. When `mohamedelbahlool.com` is purchased and attached, change
   `SITE_URL` to `https://mohamedelbahlool.com` and redeploy — nothing
   else needs to change. (The domain was confirmed available on
   2026-07-14 but is not yet registered.)

## Maintenance checklist (each semester)

- Update GPA/standing/coursework in `about.astro` + `claims.json` after
  grades post; claims with `expires` dates trigger re-verification.
- Re-verify the public follower counts and catalog count (expire
  2027-01) before renewing them on the English Home case study.
- Arabic pages marked `translationStatus: draft` need native review.
