#!/usr/bin/env node
/* Claim-registry validator. Fails (exit 1) when:
   - a referenced claim ID does not exist in the registry;
   - a page references a claim that is unsupported/conflicting/conditional;
   - a confirmed claim referenced anywhere has expired;
   - EN and AR versions of the same page reference different claim sets;
   - registry-required safe wording is provably bypassed (spot checks for
     known-dangerous phrasings that the registry forbids). */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const registry = JSON.parse(
  await readFile(join(root, "src/content/claims/claims.json"), "utf8"),
);
const byId = new Map(registry.map((c) => [c.id, c]));
const now = new Date();
const errors = [];
const warnings = [];

function isExpired(claim) {
  return claim.expires && new Date(`${claim.expires}T00:00:00Z`) <= now;
}

// -- Collect MDX front-matter claim references, keyed by collection/slug --
async function collectMdx(dir) {
  const out = {};
  for (const locale of ["en", "ar"]) {
    const base = join(root, "src/content", dir, locale);
    for (const file of await readdir(base)) {
      if (!file.endsWith(".mdx")) continue;
      const text = await readFile(join(base, file), "utf8");
      const m = text.match(/^claims:\s*\[([^\]]*)\]/m);
      const ids = m
        ? m[1]
            .split(",")
            .map((s) => s.trim().replace(/["']/g, ""))
            .filter(Boolean)
        : [];
      (out[file] ??= {})[locale] = { ids, text };
    }
  }
  return out;
}

const collections = {
  projects: await collectMdx("projects"),
  notes: await collectMdx("notes"),
};

for (const [collection, pages] of Object.entries(collections)) {
  for (const [file, locales] of Object.entries(pages)) {
    for (const [locale, { ids }] of Object.entries(locales)) {
      for (const id of ids) {
        const claim = byId.get(id);
        if (!claim) {
          errors.push(`${collection}/${locale}/${file}: unknown claim ID "${id}"`);
          continue;
        }
        if (claim.status !== "confirmed") {
          errors.push(
            `${collection}/${locale}/${file}: claim "${id}" has status "${claim.status}" and must not be published`,
          );
        }
        if (isExpired(claim)) {
          errors.push(
            `${collection}/${locale}/${file}: claim "${id}" expired ${claim.expires} — re-verify before building`,
          );
        }
      }
    }
    const en = locales.en?.ids?.slice().sort().join(",");
    const ar = locales.ar?.ids?.slice().sort().join(",");
    if (en !== undefined && ar !== undefined && en !== ar) {
      errors.push(
        `${collection}/${file}: EN claims [${en}] and AR claims [${ar}] differ — align them or document why`,
      );
    }
  }
}

// -- Expiry check for claims used by components (VerifiedClaim ids in src) --
const srcFiles = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(astro|ts|mdx)$/.test(e.name)) srcFiles.push(p);
  }
}
await walk(join(root, "src"));

for (const file of srcFiles) {
  const text = await readFile(file, "utf8");
  for (const m of text.matchAll(/VerifiedClaim\s[^>]*?\bid="([^"]+)"/gs)) {
    const claim = byId.get(m[1]);
    const rel = file.replace(root, "");
    if (!claim) errors.push(`${rel}: <VerifiedClaim id="${m[1]}"> not in registry`);
    else {
      if (claim.status !== "confirmed")
        errors.push(`${rel}: <VerifiedClaim id="${m[1]}"> has status "${claim.status}"`);
      if (isExpired(claim))
        errors.push(`${rel}: <VerifiedClaim id="${m[1]}"> expired ${claim.expires}`);
    }
  }
}

// -- Safe-wording bypass spot checks (registry-forbidden phrasings) --
const forbidden = [
  { re: /Honors\s+College/i, why: "A5: never publish Honors College" },
  { re: /\b2[05]0[,.]?000\b/, why: "outdated résumé reach numbers are not authorized" },
  { re: /reach(?:ing|es)?\s+(?:of\s+)?\d{2,}[,.]?\d*k?\s*(?:people|monthly|users)/i, why: "B2: never convert follower counts into reach" },
  { re: /Dean'?s List[^.\n]*Fall 2025/i, why: "A3: Fall 2025 Dean's List is contradicted by the transcript" },
  { re: /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/, why: "H2: never publish a phone number" },
];
for (const file of srcFiles) {
  const text = await readFile(file, "utf8");
  const rel = file.replace(root, "");
  if (rel.includes("validate-claims")) continue;
  for (const { re, why } of forbidden) {
    if (re.test(text)) errors.push(`${rel}: forbidden wording (${why})`);
  }
}

// -- Text↔claim bindings: prose metrics must have a live backing claim -----
// (makes expiration automatic even where a metric appears as plain text)
const bindings = [
  { re: /GPA\s*3\.6|معدل تراكمي\s*\+?3\.6|\+3\.6/, id: "A2", what: "GPA 3.6+" },
  { re: /93\s*credits|93\s*ساعة/, id: "A6b", what: "senior / 93 credits" },
  { re: /4,?700/, id: "B3", what: "4,700+ products" },
  { re: /61,?000|61\s*ألف/, id: "B2", what: "~61k followers" },
  { re: /Dean'?s List|قائمة العميد/, id: "A3", what: "Dean's List" },
  { re: /August 2027|أغسطس 2027/, id: "A7", what: "expected graduation" },
];
for (const file of srcFiles) {
  const text = await readFile(file, "utf8");
  const rel = file.replace(root, "");
  for (const { re, id, what } of bindings) {
    if (!re.test(text)) continue;
    const claim = byId.get(id);
    if (!claim) errors.push(`${rel}: mentions ${what} but claim "${id}" is missing from the registry`);
    else if (claim.status !== "confirmed")
      errors.push(`${rel}: mentions ${what} but claim "${id}" is ${claim.status}`);
    else if (isExpired(claim))
      errors.push(`${rel}: mentions ${what} but claim "${id}" expired ${claim.expires} — re-verify or remove the text`);
  }
}

// -- Registry hygiene: warn about claims that expire within 30 days --
for (const claim of registry) {
  if (claim.expires && !isExpired(claim)) {
    const days = Math.floor(
      (new Date(`${claim.expires}T00:00:00Z`) - now) / 86_400_000,
    );
    if (days <= 30)
      warnings.push(`registry: claim "${claim.id}" expires in ${days} days (${claim.expires})`);
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✖ ${e}`);
  console.error(`\nvalidate-claims: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`validate-claims: OK (${registry.length} claims, ${warnings.length} warning(s)).`);
