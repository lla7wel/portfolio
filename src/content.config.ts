import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/**
 * Claim registry (plan §4): every publishable factual claim carries an ID.
 * status: confirmed | conditional | conflicting | unsupported
 * Conditional/conflicting claims must not render on the public site until
 * OWNER-DECISIONS.md resolves them.
 */
const claims = defineCollection({
  loader: file("src/content/claims/claims.json"),
  schema: z.object({
    id: z.string(),
    claim: z.string(),
    source: z.string(),
    status: z.enum(["confirmed", "conditional", "conflicting", "unsupported"]),
    safeWording: z.string().optional(),
    lastVerified: z.string(),
    expires: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z.object({
    key: z.string(),
    locale: z.enum(["en", "ar"]),
    title: z.string(),
    outcome: z.string(), // one-sentence outcome (card + hero of case study)
    tier: z.enum(["flagship", "supporting"]),
    order: z.number(),
    status: z.enum(["production", "released", "team", "live", "coursework"]),
    role: z.string(),
    timeframe: z.string(),
    stack: z.array(z.string()),
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
    claims: z.array(z.string()).default([]), // claim IDs used on this page
    translationStatus: z.enum(["reviewed", "draft", "machine"]).default("draft"),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/notes" }),
  schema: z.object({
    key: z.string(),
    locale: z.enum(["en", "ar"]),
    title: z.string(),
    description: z.string(),
    published: z.coerce.date(),
    project: z.string().optional(), // related project slug
    claims: z.array(z.string()).default([]),
    translationStatus: z.enum(["reviewed", "draft", "machine"]).default("draft"),
  }),
});

export const collections = { claims, projects, notes };
