#!/usr/bin/env node
/* Generates the official one-page resume PDF (Letter) with the real IBM Plex
   webfonts, in the Measured Systems print voice. Outputs to
   public/resume-mohamed-elbahlool.pdf. Run: node scripts/generate-resume-pdf.mjs

   Facts mirror the claim registry (src/content/claims/claims.json). Per owner
   rule H2 the published PDF carries no phone number. */

import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const sansReg = join(root, "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2");
const sansSemi = join(root, "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2");
const mono = join(root, "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2");

const fontFace = async (path, family, weight) =>
  `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/woff2;base64,${(await readFile(path)).toString("base64")}) format("woff2")}`;

const css = [
  await fontFace(sansReg, "IBM Plex Sans", 400),
  await fontFace(sansSemi, "IBM Plex Sans", 600),
  await fontFace(mono, "IBM Plex Mono", 500),
].join("\n");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
${css}
*{margin:0;box-sizing:border-box}
:root{--ink:#141a1c;--muted:#4c585d;--rule:#d8d4c8;--signal:#0c7a54}
body{font-family:"IBM Plex Sans";color:var(--ink);font-size:10.3px;line-height:1.44;padding:36px 48px}
a{color:var(--ink);text-decoration:none}
h1{font-size:25px;font-weight:600;letter-spacing:-0.01em}
.tagline{font-size:12.5px;font-weight:600;color:var(--signal);margin-top:3px}
.contact{font-family:"IBM Plex Mono";font-size:9.4px;color:var(--muted);margin-top:6px;letter-spacing:.01em}
h2{font-family:"IBM Plex Mono";font-size:9.6px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  color:var(--signal);border-top:1px solid var(--rule);padding-top:8px;margin:10px 0 5px}
.role{display:flex;justify-content:space-between;align-items:baseline;margin-top:7px}
.role:first-of-type{margin-top:0}
.role h3{font-size:11.6px;font-weight:600}
.when{font-family:"IBM Plex Mono";font-size:9.2px;color:var(--muted)}
ul{padding-left:14px;margin-top:3px}
li{margin-top:2px}
.proj{margin-top:6px}
.proj:first-of-type{margin-top:0}
.proj b{font-weight:600}
.proj .mono{font-family:"IBM Plex Mono";font-size:9px;color:var(--muted)}
.skills p{margin-top:3px}
.skills b{font-weight:600}
.summary{margin-top:2px}
.edu{display:flex;justify-content:space-between;align-items:baseline}
</style></head><body>

<header>
  <h1>MOHAMED KHALID ELBAHLOOL</h1>
  <p class="tagline">Computer Engineering Senior — Embedded Systems &amp; Software Platforms</p>
  <p class="contact">Miami, FL &nbsp;·&nbsp; tmtmd24@gmail.com &nbsp;·&nbsp; github.com/lla7wel &nbsp;·&nbsp; linkedin.com/in/mohamed-elbahlool-1373002bb &nbsp;·&nbsp; www.mohamedelbahlool.com</p>
</header>

<h2>Summary</h2>
<p class="summary">Computer Engineering senior (B.S. expected Aug 2027) who designs, ships, and operates complete systems: bare-metal firmware debugged on real hardware, FPGA logic verified exhaustively in CI, and a self-hosted customer-service platform in production for a retail business. Trilingual — Arabic, English, Turkish. Every claim below is documented and traceable at www.mohamedelbahlool.com.</p>

<h2>Experience</h2>
<div class="role"><h3>Digital Systems &amp; Automation Specialist — English Home Libya (Remote)</h3><span class="when">2023 – Present</span></div>
<ul>
  <li>Run the digital operations of a retail brand serving customers in Libya: Arabic/English customer messaging, product catalogs, domain/DNS, and branded email for a Facebook page with ~61,000 followers (public page count, July 2026).</li>
  <li>Designed, built, and operate a self-hosted customer-service platform (TypeScript, Next.js, PostgreSQL, Docker Compose, Caddy, Gemini API, Meta Graph API) answering product inquiries in Libyan Arabic — catalog-true prices across 4,700+ products, photo-based product recognition, and instant human handoff.</li>
  <li>Migrated the platform off a paused free-tier database host to a self-hosted VPS with nightly backups; added safety mechanisms (burst batching, supersede guard, send-time re-checks, output sanitizer) that each trace to a real production incident.</li>
  <li>Built the catalog pipeline: a scraper that assembled the full catalog (image set exceeding 11 GB during the documented build) plus a trilingual (AR/EN/TR) product-matching engine.</li>
</ul>
<div class="role"><h3>Learning Assistant II — FIU Mastery Math Lab, Florida International University</h3><span class="when">Aug 2024 – Present</span></div>
<ul>
  <li>Support Algebra, Precalculus, and Trigonometry students ~20 hours/week through mini-lessons, guided practice, and one-on-one tutoring — daily practice explaining technical ideas to students from very different backgrounds.</li>
</ul>

<h2>Projects</h2>
<div class="proj"><b>NOVA RAID — bare-metal arcade game, Raspberry Pi Pico W</b> <span class="mono">C · RP2040 · Pico SDK · 2026 · github.com/lla7wel/nova-raid</span>
<ul>
  <li>Complete retro space shooter written bare-metal, solo: dual-core 25 fps render pipeline, SPI at 62.5&nbsp;MHz with double-buffered DMA, 24.8 fixed-point math; testable HAL with a desktop host harness; released as drag-and-drop UF2s with green CI.</li>
  <li>First run on real hardware exposed a display-init defect no simulator caught — diagnosed, fixed, and documented same day in v1.0.1.</li>
</ul></div>
<div class="proj"><b>Pico W voice terminal &amp; self-hosted control plane</b> <span class="mono">C · PIO/DMA · Python · FastAPI · 2026 · github.com/lla7wel/Pico-AI-Agentic-System</span>
<ul>
  <li>Hand-wired push-to-talk voice assistant: SPH0645 I2S microphone captured via a custom 8-instruction PIO program with a DMA ring buffer, streaming over one long-lived TLS WebSocket to a self-hosted FastAPI control plane with permission-gated tools; verified end-to-end by a fully offline integration test in CI.</li>
</ul></div>
<div class="proj"><b>Verified digital logic on FPGA</b> <span class="mono">VHDL · GHDL · Vivado · Basys 3 · Summer 2026 · github.com/lla7wel/fpga-ripple-carry-adder</span>
<ul>
  <li>Coursework rebuilt as real releases: exhaustive self-checking testbenches (512/512 adder vectors, 36/36 decoder vectors) in GHDL simulation on every push, with Vivado waveforms and Basys 3 pin constraints.</li>
</ul></div>
<div class="proj"><b>Smart-home appliance controller</b> <span class="mono">C++ · Arduino UNO · two-person team (with Paola Dorado Galicia) · Spring 2026</span>
<ul>
  <li>DHT11 sensing, PWM fan control, four-mode state machine, 35&nbsp;°C over-temperature cutoff; maintained the repository, documentation, and schematics.</li>
</ul></div>
<div class="proj"><b>Miramar — bilingual EN/TR business website</b> <span class="mono">Next.js 16 · React 19 · TypeScript · live at tr-miramar.com</span>
<ul>
  <li>Designed, built, and deployed solo for an Istanbul construction-materials supplier; Playwright smoke suite green in CI.</li>
</ul></div>

<h2>Skills</h2>
<div class="skills">
  <p><b>Languages:</b> C, C++, Python, TypeScript/JavaScript, VHDL, SQL, HTML/CSS</p>
  <p><b>Embedded:</b> RP2040 / Pico SDK, PIO, DMA, SPI/I2S/UART, Arduino, sensor integration, fixed-point math</p>
  <p><b>Systems &amp; web:</b> Next.js, React, Astro, FastAPI, PostgreSQL, Docker Compose, Caddy, REST/webhooks/WebSocket, Meta Graph API, DNS</p>
  <p><b>Verification:</b> GitHub Actions CI, Playwright, GHDL simulation, Vivado, Git/GitHub &nbsp;·&nbsp; <b>Human languages:</b> Arabic, English, Turkish</p>
</div>

<h2>Education</h2>
<div class="edu"><p><b>Florida International University</b> — B.S. Computer Engineering · GPA 3.6 · Dean's List Fall 2024, Spring 2025 · senior (93 credits)</p><span class="when">Expected Aug 2027</span></div>

</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle" });
await page.pdf({
  path: join(root, "public/resume-mohamed-elbahlool.pdf"),
  format: "Letter",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});
await browser.close();
console.log("wrote public/resume-mohamed-elbahlool.pdf");
