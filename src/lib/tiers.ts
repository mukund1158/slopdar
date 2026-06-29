// Tier mapping + colors, shared by the scanner and the UI. Thresholds match
// docs/06-scanner-logic.md and the approved design.
export interface TierInfo {
  label: string;
  color: string; // tier accent
  glow: string; // shadow color for the score ring
  tint: string; // soft background tint for the result hero
}

export function tierOf(score: number): TierInfo {
  if (score <= 25) return { label: "Hand-Crafted", color: "#10B95E", glow: "rgba(16,185,94,.3)", tint: "#EAF9F0" };
  if (score <= 50) return { label: "Suspiciously Clean", color: "#FFB81F", glow: "rgba(255,184,31,.3)", tint: "#FFF6E0" };
  if (score <= 75) return { label: "Vibe-Coded", color: "#FF7A1A", glow: "rgba(255,122,26,.3)", tint: "#FFF0E4" };
  return { label: "Pure Slop", color: "#FF3B30", glow: "rgba(255,59,48,.32)", tint: "#FFECEA" };
}
