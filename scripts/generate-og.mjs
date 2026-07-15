#!/usr/bin/env node
/* Generates 1200×630 Open Graph images from the design system using
   Playwright (so the real IBM Plex webfonts render). Outputs to public/og/.
   Run: node scripts/generate-og.mjs */

import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
await mkdir(join(root, "public/og"), { recursive: true });

const sans = join(root, "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2");
const sansReg = join(root, "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2");
const mono = join(root, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2");

const cards = [
  {
    file: "default.png",
    code: "MEASURED SYSTEMS",
    title: "Mohamed Khalid Elbahlool",
    sub: "Computer Engineer building complete systems — from low-level embedded systems and FPGA logic to self-hosted platforms used by real businesses.",
  },
  {
    file: "english-home-platform.png",
    code: "SYS-01 · IN PRODUCTION",
    title: "Retail customer-service platform",
    sub: "Self-hosted Facebook customer service for English Home Libya in Arabic — catalog-true prices, photo product recognition, human handoff.",
  },
  {
    file: "nova-raid.png",
    code: "EMB-01 · RELEASED",
    title: "NOVA RAID — bare-metal Pico W arcade game",
    sub: "A complete retro space shooter in bare-metal C — fixed after its first run on real hardware exposed a defect no simulator caught.",
  },
  {
    file: "pico-voice-terminal.png",
    code: "EMB-02 · RELEASED",
    title: "Pico W voice terminal & control plane",
    sub: "Custom PIO audio capture on the device; streaming speech recognition and permission-gated tools in a self-hosted backend.",
  },
  {
    file: "smart-home-controller.png",
    code: "EMB-03 · TEAM PROJECT",
    title: "Smart-home appliance controller",
    sub: "Sensor-driven fan control, a four-mode state machine, and an over-temperature safety cutoff — a two-person university team build.",
  },
  {
    file: "miramar.png",
    code: "WEB-01 · LIVE",
    title: "Miramar — bilingual business website",
    sub: "A live English/Turkish site for an Istanbul construction-materials supplier — static-first Next.js with a Playwright smoke suite.",
  },
  {
    file: "fpga-digital-logic.png",
    code: "RTL-01 · COURSEWORK, EXTENDED",
    title: "Verified digital logic on FPGA",
    sub: "Exhaustive self-checking testbenches, CI simulation with GHDL, Vivado waveforms, and Basys 3 pin constraints.",
  },
];

const fontFace = async (path, family, weight) =>
  `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${(await readFile(path)).toString("base64")}) format("woff2")}`;

const css = [
  await fontFace(sansReg, "IBM Plex Sans", 400),
  await fontFace(sans, "IBM Plex Sans", 600),
  await fontFace(mono, "IBM Plex Mono", 500),
].join("\n");

const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#090d0f;color:#f0f3f2;font-family:"IBM Plex Sans";
  padding:72px 84px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.glow{position:absolute;inset:0;background:radial-gradient(90% 70% at 85% 10%, rgba(99,230,175,.14), transparent 60%)}
.code{font-family:"IBM Plex Mono";font-weight:500;font-size:26px;letter-spacing:.14em;color:#63e6af}
h1{font-weight:600;font-size:${c.title.length > 32 ? 64 : 76}px;letter-spacing:-0.02em;line-height:1.08;max-width:980px;text-wrap:balance}
p{font-weight:400;font-size:30px;line-height:1.45;color:#aab4b8;max-width:940px}
.foot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #2d383d;padding-top:28px}
.name{font-weight:600;font-size:28px}
.domain{font-family:"IBM Plex Mono";font-size:24px;color:#aab4b8}
.sig{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#63e6af,#6ed1e8)}
</style></head><body>
<div class="glow"></div>
<div><div class="code">${c.code}</div><h1 style="margin-top:28px">${c.title}</h1></div>
<p>${c.sub}</p>
<div class="foot"><span class="name">Mohamed Khalid Elbahlool</span><span class="domain">www.mohamedelbahlool.com</span></div>
<div class="sig"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of cards) {
  await page.setContent(html(c), { waitUntil: "networkidle" });
  await page.screenshot({ path: join(root, "public/og", c.file) });
  console.log("wrote og/" + c.file);
}
await browser.close();
