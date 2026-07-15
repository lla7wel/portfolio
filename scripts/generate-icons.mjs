/* Generates the raster favicon set from public/favicon.svg.
   Run: node scripts/generate-icons.mjs */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const svg = await readFile(new URL("../public/favicon.svg", import.meta.url));

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size } of targets) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(new URL(`../public/${file}`, import.meta.url).pathname);
  console.log("wrote", file);
}

// favicon.ico: single 32px BMP-in-ICO. Sharp has no ico encoder; write a
// minimal ICO container around a 32px PNG (valid per the ICO spec ≥ Vista).
const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bpp
header.writeUInt32LE(png32.length, 14); // size
header.writeUInt32LE(22, 18); // offset
await writeFile(
  new URL("../public/favicon.ico", import.meta.url).pathname,
  Buffer.concat([header, png32]),
);
console.log("wrote favicon.ico");
