#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const productionOrigin = "https://www.mohamedelbahlool.com";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat();
}

function htmlPathFor(pathname) {
  if (pathname.endsWith("/")) return join(dist, pathname, "index.html");
  if (extname(pathname)) return join(dist, pathname);
  return join(dist, pathname, "index.html");
}

function attributeValues(html, name) {
  const values = [];
  const pattern = new RegExp(`\\b${name}=(?:\"([^\"]+)\"|'([^']+)')`, "gi");
  for (const match of html.matchAll(pattern)) values.push(match[1] ?? match[2]);
  return values;
}

const htmlFiles = (await walk(dist)).filter((file) => extname(file) === ".html");
const htmlByPath = new Map();
for (const file of htmlFiles) {
  htmlByPath.set(file, await readFile(file, "utf8"));
}

const failures = [];
let checked = 0;

for (const [sourceFile, html] of htmlByPath) {
  const sourceRelative = relative(dist, sourceFile).replaceAll("\\", "/");
  const sourceRoute = sourceRelative.endsWith("index.html")
    ? `/${sourceRelative.slice(0, -"index.html".length)}`
    : `/${sourceRelative}`;
  const rawTargets = [
    ...attributeValues(html, "href"),
    ...attributeValues(html, "src"),
    ...attributeValues(html, "poster"),
    ...attributeValues(html, "srcset").flatMap((set) =>
      set.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]),
    ),
  ];

  for (const rawTarget of rawTargets) {
    if (
      !rawTarget ||
      rawTarget.startsWith("data:") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("tel:") ||
      rawTarget.startsWith("javascript:")
    ) {
      continue;
    }

    let url;
    try {
      url = new URL(rawTarget, new URL(sourceRoute, productionOrigin));
    } catch {
      failures.push(`${relative(dist, sourceFile)} -> invalid URL: ${rawTarget}`);
      continue;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    if (url.origin !== productionOrigin) continue;

    const targetFile = htmlPathFor(decodeURIComponent(url.pathname));
    const hash = url.hash;

    try {
      await access(targetFile);
      checked += 1;
    } catch {
      failures.push(
        `${relative(dist, sourceFile)} -> missing ${relative(dist, targetFile)} (${rawTarget})`,
      );
      continue;
    }

    if (hash && extname(targetFile) === ".html") {
      const targetHtml = htmlByPath.get(targetFile) ?? (await readFile(targetFile, "utf8"));
      const id = decodeURIComponent(hash.slice(1));
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\b(?:id|name)=(?:\"${escaped}\"|'${escaped}')`).test(targetHtml)) {
        failures.push(
          `${relative(dist, sourceFile)} -> missing fragment ${hash} in ${relative(dist, targetFile)}`,
        );
      }
    }
  }
}

if (failures.length) {
  console.error(`validate-built-links: FAILED\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(
  `validate-built-links: OK (${checked} internal links/assets across ${htmlFiles.length} pages).`,
);
