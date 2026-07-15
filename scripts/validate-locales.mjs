#!/usr/bin/env node
/* Locale-parity validator. Fails (exit 1) when:
   - an EN project/note has no matching AR file (or vice versa);
   - the `key` (slug) differs between the two locale files;
   - a `locale:` field disagrees with its directory;
   - a ui dictionary key exists in one language but not the other;
   - an <img> in MDX lacks alt text;
   - localized structural fields (title/outcome/description) are missing.
   Machine checks are not native review: translationStatus stays honest. */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const errors = [];

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  return m ? m[1] : "";
}
function fmField(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, "m"));
  return m?.[1];
}

for (const dir of ["projects", "notes"]) {
  const en = (await readdir(join(root, "src/content", dir, "en"))).filter((f) => f.endsWith(".mdx"));
  const ar = (await readdir(join(root, "src/content", dir, "ar"))).filter((f) => f.endsWith(".mdx"));

  for (const f of en) if (!ar.includes(f)) errors.push(`${dir}: ${f} exists in EN but not AR`);
  for (const f of ar) if (!en.includes(f)) errors.push(`${dir}: ${f} exists in AR but not EN`);

  for (const f of en.filter((f) => ar.includes(f))) {
    const enText = await readFile(join(root, "src/content", dir, "en", f), "utf8");
    const arText = await readFile(join(root, "src/content", dir, "ar", f), "utf8");
    const enFm = frontmatter(enText);
    const arFm = frontmatter(arText);

    const enKey = fmField(enFm, "key");
    const arKey = fmField(arFm, "key");
    if (enKey !== arKey) errors.push(`${dir}/${f}: key mismatch ("${enKey}" vs "${arKey}")`);
    if (fmField(enFm, "locale") !== "en") errors.push(`${dir}/en/${f}: locale field is not "en"`);
    if (fmField(arFm, "locale") !== "ar") errors.push(`${dir}/ar/${f}: locale field is not "ar"`);

    for (const [loc, fm] of [["en", enFm], ["ar", arFm]]) {
      for (const req of dir === "projects" ? ["title", "outcome"] : ["title", "description"]) {
        if (!fmField(fm, req)) errors.push(`${dir}/${loc}/${f}: missing required "${req}"`);
      }
    }

    // Alt text on any MDX-embedded images.
    for (const [loc, text] of [["en", enText], ["ar", arText]]) {
      for (const img of text.matchAll(/<img\b[^>]*>/g)) {
        if (!/\balt="[^"]+"/.test(img[0]))
          errors.push(`${dir}/${loc}/${f}: <img> without alt text`);
      }
    }
  }
}

// -- UI dictionary parity ---------------------------------------------------
const i18n = await readFile(join(root, "src/lib/i18n.ts"), "utf8");
function keysOf(block) {
  return [...block.matchAll(/^\s{4}"([^"]+)":/gm)].map((m) => m[1]);
}
const enBlock = i18n.slice(i18n.indexOf("en: {"), i18n.indexOf("ar: {"));
const arBlock = i18n.slice(i18n.indexOf("ar: {"), i18n.indexOf("} as const"));
const enKeys = new Set(keysOf(enBlock));
const arKeys = new Set(keysOf(arBlock));
for (const k of enKeys) if (!arKeys.has(k)) errors.push(`i18n: key "${k}" missing in AR`);
for (const k of arKeys) if (!enKeys.has(k)) errors.push(`i18n: key "${k}" missing in EN`);

// -- Interactive diagrams: every stage must carry both en/ar labels ---------
const projComponents = join(root, "src/components/projects");
for (const f of await readdir(projComponents)) {
  if (!f.endsWith(".astro")) continue;
  const text = await readFile(join(projComponents, f), "utf8");
  const stageObjs = [...text.matchAll(/\{\s*id:\s*"[^"]+",[\s\S]*?\}/g)];
  for (const s of stageObjs) {
    const hasEn = /(?:^|\W)en\s*[:?]/.test(s[0]) || /\bar\s*\?\s*"/.test(s[0]);
    const hasAr = /[؀-ۿ]/.test(s[0]);
    if (text.includes("stages") && s[0].includes("detail") && !(hasEn && hasAr)) {
      errors.push(`components/projects/${f}: a stage lacks localized labels`);
    }
  }
  if (text.includes("data-stage-explainer") && !text.includes("diagramText") && !text.includes("visually-hidden")) {
    errors.push(`components/projects/${f}: interactive diagram without a text alternative`);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\nvalidate-locales: ${errors.length} error(s).`);
  process.exit(1);
}
console.log("validate-locales: OK (EN/AR parity holds; translation status unchanged).");
