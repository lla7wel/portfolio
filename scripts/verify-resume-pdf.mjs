#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const resume = join(root, "public", "resume-mohamed-elbahlool.pdf");

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: "utf8" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`${command} failed: ${detail}`);
  }
}

const info = run("pdfinfo", [resume]);
const text = run("pdftotext", ["-layout", resume, "-"]);
const required = [
  "MOHAMED KHALID ELBAHLOOL",
  "Expected Aug 2027",
  "GPA 3.6",
  "English (professional fluency)",
  "Digital Systems & Automation Specialist",
  "NOVA RAID",
  "Pico W voice terminal",
  "Verified digital logic on FPGA",
  "Smart-home appliance controller",
  "Miramar",
];
const missing = required.filter((value) => !text.includes(value));
const phonePattern = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

if (!/^Pages:\s+1$/m.test(info)) throw new Error("resume must contain exactly one page");
if (!/^Page size:\s+612 x 792 pts \(letter\)$/m.test(info)) {
  throw new Error("resume must use US Letter dimensions");
}
if (missing.length) throw new Error(`resume text is missing: ${missing.join(", ")}`);
if (phonePattern.test(text)) throw new Error("resume must not publish a phone number");

console.log("verify-resume-pdf: OK (one US Letter page, required text present, phone-free).");
