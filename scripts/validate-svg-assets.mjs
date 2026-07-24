#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import sharp from "sharp";
import { optimize } from "svgo";

const root = new URL("..", import.meta.url).pathname;
const publicDir = join(root, "public");

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

const svgFiles = (await walk(publicDir)).filter((file) => extname(file) === ".svg");
const failures = [];

for (const file of svgFiles) {
  try {
    const source = await readFile(file, "utf8");
    const parsed = optimize(source, {
      path: file,
      multipass: false,
      plugins: [],
    });
    if (!parsed.data.includes("<svg")) throw new Error("missing SVG root element");

    const metadata = await sharp(Buffer.from(source)).metadata();
    if (!metadata.width || !metadata.height) throw new Error("render has no measurable dimensions");
    await sharp(Buffer.from(source)).resize({ width: 96, fit: "inside" }).png().toBuffer();
  } catch (error) {
    failures.push(`${relative(root, file)}: ${error instanceof Error ? error.message : error}`);
  }
}

if (failures.length) {
  console.error(`validate-svg-assets: FAILED\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`validate-svg-assets: OK (${svgFiles.length} XML-parsed and rendered SVGs).`);
