/* Claim-registry helpers. Every published factual/quantitative claim must be
   traceable to a confirmed claim ID; expired or unsupported claims fail the
   build (also enforced by scripts/validate-claims.mjs). */

import registry from "../content/claims/claims.json";

export interface Claim {
  id: string;
  claim: string;
  source: string;
  status: "confirmed" | "conditional" | "conflicting" | "unsupported";
  safeWording?: string;
  lastVerified: string;
  expires?: string;
}

const claims = registry as Claim[];
const byId = new Map(claims.map((c) => [c.id, c]));

export function getClaim(id: string): Claim | undefined {
  return byId.get(id);
}

export function isExpired(claim: Claim, now = new Date()): boolean {
  if (!claim.expires) return false;
  return new Date(`${claim.expires}T00:00:00Z`).valueOf() <= now.valueOf();
}

/** True when the claim may be published today. */
export function isPublishable(id: string, now = new Date()): boolean {
  const claim = byId.get(id);
  return !!claim && claim.status === "confirmed" && !isExpired(claim, now);
}

/**
 * Build-time assertion for structured metric components: throws (failing the
 * static build) when a referenced claim is missing, unconfirmed, or expired.
 */
export function requireClaim(id: string): Claim {
  const claim = byId.get(id);
  if (!claim) {
    throw new Error(`[claims] Unknown claim ID "${id}" referenced in a component.`);
  }
  if (claim.status !== "confirmed") {
    throw new Error(
      `[claims] Claim "${id}" has status "${claim.status}" and must not be published.`,
    );
  }
  if (isExpired(claim)) {
    throw new Error(
      `[claims] Claim "${id}" expired on ${claim.expires}. Re-verify it (see OWNER-DECISIONS.md) before building.`,
    );
  }
  return claim;
}

export const allClaims = claims;
