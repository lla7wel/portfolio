/* Shared, nonlocalized visual configuration keyed by project slug.
   Localized captions live with the components that render them; this file
   owns codes, figure prefixes, hero media, and cross-references so the EN
   and AR MDX files never duplicate media config. */

import type { ImageMetadata } from "astro";

import novaSplash from "../assets/nova-raid/hardware-splash.jpg";
import novaGameplay from "../assets/nova-raid/hardware-gameplay.jpg";
import picoHero from "../assets/pico/hero.jpg";
import smartHomeFull from "../assets/smart-home/full-system.jpg";
import miramarDesktop from "../assets/miramar/home-desktop.png";

export interface ProjectVisual {
  /** Mono project code shown in headers/annotations, e.g. SYS-01. */
  code: string;
  /** Figure numbering prefix: FIG {prefix}.{n}. */
  figPrefix: string;
  /** Hero evidence for the case study and work index. */
  hero?: ImageMetadata;
  /** Public-path hero for projects whose lead artifact is an SVG diagram. */
  heroSvg?: string;
  heroKind: "photo" | "screenshot" | "diagram" | "render";
  /** Related note slug, when one exists. */
  relatedNote?: string;
  /** Layer coverage for the systems matrix (work index). */
  layers: {
    hardware: boolean;
    firmware: boolean;
    fpga: boolean;
    backend: boolean;
    interface: boolean;
    validation: boolean;
  };
}

export const projectVisuals: Record<string, ProjectVisual> = {
  "english-home-platform": {
    code: "SYS-01",
    figPrefix: "01",
    heroSvg: "/images/csa/architecture.svg",
    heroKind: "diagram",
    relatedNote: "free-tier-outage",
    layers: { hardware: false, firmware: false, fpga: false, backend: true, interface: true, validation: true },
  },
  "nova-raid": {
    code: "EMB-01",
    figPrefix: "02",
    hero: novaSplash,
    heroKind: "photo",
    relatedNote: "hardware-only-bug",
    layers: { hardware: true, firmware: true, fpga: false, backend: false, interface: true, validation: true },
  },
  "pico-voice-terminal": {
    code: "EMB-02",
    figPrefix: "03",
    hero: picoHero,
    heroKind: "photo",
    layers: { hardware: true, firmware: true, fpga: false, backend: true, interface: true, validation: true },
  },
  "smart-home-controller": {
    code: "EMB-03",
    figPrefix: "04",
    hero: smartHomeFull,
    heroKind: "photo",
    layers: { hardware: true, firmware: true, fpga: false, backend: false, interface: false, validation: true },
  },
  miramar: {
    code: "WEB-01",
    figPrefix: "05",
    hero: miramarDesktop,
    heroKind: "screenshot",
    layers: { hardware: false, firmware: false, fpga: false, backend: false, interface: true, validation: true },
  },
  "fpga-digital-logic": {
    code: "RTL-01",
    figPrefix: "06",
    heroSvg: "/images/fpga/ripple-carry-chain.svg",
    heroKind: "diagram",
    layers: { hardware: true, firmware: false, fpga: true, backend: false, interface: false, validation: true },
  },
};

export const novaGameplayImg = novaGameplay;
