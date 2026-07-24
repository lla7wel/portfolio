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
body{font-family:"IBM Plex Sans";color:var(--ink);font-size:10.65px;line-height:1.43;padding:38px 48px}
a{color:var(--ink);text-decoration:none}
h1{font-size:25px;font-weight:600;letter-spacing:-0.01em}
.tagline{font-size:12.6px;font-weight:600;color:var(--signal);margin-top:2px}
.contact{font-family:"IBM Plex Mono";font-size:9.25px;color:var(--muted);margin-top:6px;letter-spacing:.005em}
h2{font-family:"IBM Plex Mono";font-size:9.6px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;
  color:var(--signal);border-top:1px solid var(--rule);padding-top:7px;margin:10px 0 5px}
.role{display:flex;justify-content:space-between;align-items:baseline;margin-top:6px}
.role:first-of-type{margin-top:0}
.role h3{font-size:11.55px;font-weight:600}
.when{font-family:"IBM Plex Mono";font-size:9px;color:var(--muted);white-space:nowrap}
ul{padding-left:14px;margin-top:2px}
li{margin-top:1.5px}
.proj{margin-top:5px}
.proj:first-of-type{margin-top:0}
.proj b{font-weight:600}
.proj .mono{font-family:"IBM Plex Mono";font-size:8.8px;color:var(--muted)}
.skills{display:grid;grid-template-columns:1fr 1fr;column-gap:18px;row-gap:2px}
.skills p{margin:0}
.skills b{font-weight:600}
.summary{margin-top:2px}
.edu{display:flex;justify-content:space-between;align-items:baseline}
</style></head><body>

<header>
  <h1>MOHAMED KHALID ELBAHLOOL</h1>
  <p class="tagline">Computer Engineering Senior | Embedded, Digital Logic &amp; Software Systems</p>
  <p class="contact">Miami, FL &nbsp;|&nbsp; <a href="mailto:tmtmd24@gmail.com">tmtmd24@gmail.com</a> &nbsp;|&nbsp; <a href="https://github.com/lla7wel">github.com/lla7wel</a> &nbsp;|&nbsp; <a href="https://www.linkedin.com/in/mohamed-elbahlool-1373002bb/">LinkedIn</a> &nbsp;|&nbsp; <a href="https://www.mohamedelbahlool.com">mohamedelbahlool.com</a></p>
</header>

<h2>Summary</h2>
<p class="summary">Computer Engineering senior who builds complete systems from physical inputs and low-level firmware through FPGA logic, networks, backends, and production interfaces. Shipped bare-metal RP2040 software, exhaustively verified VHDL, and a self-hosted omnichannel retail platform operating in Arabic. Project evidence is documented at mohamedelbahlool.com.</p>

<h2>Education</h2>
<div class="edu"><p><b>Florida International University</b> - B.S. Computer Engineering | GPA 3.6 | Dean's List: Fall 2024, Spring 2025</p><span class="when">Expected Aug 2027</span></div>

<h2>Technical Skills</h2>
<div class="skills">
  <p><b>Languages:</b> C, C++, Python, TypeScript, VHDL, SQL, HTML/CSS</p>
  <p><b>Embedded:</b> RP2040/Pico SDK, PIO, DMA, SPI, I2S, UART, Arduino</p>
  <p><b>Systems:</b> FastAPI, PostgreSQL, Docker Compose, Caddy, WebSocket, REST/webhooks</p>
  <p><b>Web &amp; verification:</b> Next.js, React, Astro, Playwright, GHDL, Vivado, GitHub Actions</p>
</div>

<h2>Experience</h2>
<div class="role"><h3>Digital Systems &amp; Automation Specialist - English Home Libya (Remote)</h3><span class="when">2023 - Present</span></div>
<ul>
  <li>Designed, built, deployed, and operate a self-hosted omnichannel platform (TypeScript, Next.js, PostgreSQL, Docker Compose, Caddy) for Facebook and Instagram customer service, content publishing, and multi-admin operations.</li>
  <li>Grounded Libyan-Arabic product replies in a 4,700+ item catalog with photo recognition and human handoff; prices come only from verified catalog data, never model-generated values.</li>
  <li>Implemented durable jobs and a transactional outbox for resumable processing, plus webhook verification, deduplication, send-time guards, authentication, readiness checks, audit trails, and nightly backups.</li>
</ul>
<div class="role"><h3>Learning Assistant II - FIU Mastery Math Lab, Florida International University</h3><span class="when">Aug 2024 - Present</span></div>
<ul>
  <li>Support Algebra, Precalculus, and Trigonometry students about 20 hours/week through mini-lessons, guided practice, and one-on-one tutoring; diagnose misconceptions and explain technical ideas across varied backgrounds.</li>
</ul>

<h2>Projects</h2>
<div class="proj"><b>NOVA RAID - bare-metal Pico W arcade game</b> <span class="mono">C | RP2040 | Pico SDK | 2026 | <a href="https://github.com/lla7wel/nova-raid">github.com/lla7wel/nova-raid</a></span>
<ul>
  <li>Built a complete solo retro shooter with a dual-core 25 fps design, 62.5 MHz SPI and double-buffered DMA, 24.8 fixed-point math, a desktop HAL test harness, and UF2 releases; fixed a display-init defect exposed only by the first hardware run in v1.0.1.</li>
</ul></div>
<div class="proj"><b>Pico W voice terminal &amp; self-hosted control plane</b> <span class="mono">C | PIO/DMA | Python | FastAPI | 2026 | <a href="https://github.com/lla7wel/Pico-AI-Agentic-System">device repository</a></span>
<ul>
  <li>Hand-wired a push-to-talk device with custom 8-instruction PIO I2S capture and a DMA ring buffer; streamed over one TLS WebSocket to a FastAPI control plane with permission-gated tools and a fully offline end-to-end CI test.</li>
</ul></div>
<div class="proj"><b>Verified digital logic on FPGA</b> <span class="mono">VHDL | GHDL | Vivado | Basys 3 | 2026 | <a href="https://github.com/lla7wel/fpga-ripple-carry-adder">adder repository</a></span>
<ul>
  <li>Rebuilt coursework as reproducible releases with exhaustive self-checking GHDL testbenches (512/512 adder vectors, 36/36 decoder vectors) in CI, Vivado waveforms, and Basys 3 constraints.</li>
</ul></div>
<div class="proj"><b>Smart-home appliance controller</b> <span class="mono">C++ | Arduino UNO | two-person FIU team | 2026 | <a href="https://github.com/lla7wel/smart-home-appliance-controller">repository</a></span>
<ul>
  <li>Integrated DHT11 and light sensing, PWM fan control, LCD output, a four-mode state machine, and a 35&nbsp;°C safety cutoff; contributed to design, firmware, and testing and maintained the repository and schematics.</li>
</ul></div>
<div class="proj"><b>Miramar - bilingual EN/TR business website</b> <span class="mono">Next.js 16 | React 19 | TypeScript | <a href="https://tr-miramar.com">tr-miramar.com</a></span>
<ul>
  <li>Designed, built, and deployed solo for an Istanbul construction-materials supplier with typed bilingual content, a selective Three.js scene with static fallback, and Playwright smoke tests in CI.</li>
</ul></div>

<p style="margin-top:5px;font-size:9.4px;color:var(--muted)"><b>Human languages:</b> Arabic (native), English, Turkish (professional working proficiency)</p>

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
