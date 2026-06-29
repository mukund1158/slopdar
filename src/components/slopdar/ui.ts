// Shared style fragments for the Slopdar UI, so the components stay readable
// instead of repeating the same inline-style blobs everywhere.
import type { CSSProperties } from "react";

export const SANS = "var(--font-archivo), 'Archivo', sans-serif";
export const MONO = "var(--font-mono), 'IBM Plex Mono', monospace";

export const card: CSSProperties = {
  background: "var(--card)",
  border: "2px solid var(--ink)",
  borderRadius: 16,
  boxShadow: "0 5px 0 rgba(0,0,0,.09)",
};

export const mono: CSSProperties = { fontFamily: MONO };

export const monoLabel: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--mut)",
};

export const btnBase: CSSProperties = {
  fontFamily: SANS,
  fontWeight: 800,
  cursor: "pointer",
  border: "2px solid var(--ink)",
  borderRadius: 11,
};

export const btnBrand: CSSProperties = {
  ...btnBase,
  background: "var(--brand)",
  color: "#fff",
  boxShadow: "0 4px 0 rgba(0,0,0,.14)",
};

export const btnGhost: CSSProperties = {
  ...btnBase,
  background: "var(--card)",
  color: "var(--ink)",
};

export const sectionWrap: CSSProperties = { maxWidth: 1060, margin: "0 auto" };
