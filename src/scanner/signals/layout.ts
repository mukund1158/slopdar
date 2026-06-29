// 🧱 Layout / design tells — the generic AI landing-page shape.
import type { SignalRule } from "../types";
import { rawHtml, snippet, visibleText } from "./util";

export const layoutSignals: SignalRule[] = [
  {
    id: "layout.bento",
    category: "layout",
    weight: 9,
    label: "Bento-grid layout",
    description: "Bento-style grid markup: a default AI landing-page pattern.",
    test: (ctx) => (rawHtml(ctx).includes("bento") ? { evidence: "bento grid markup" } : null),
  },
  {
    id: "layout.gradient-blob",
    category: "layout",
    weight: 9,
    label: "Gradient blobs / aurora",
    description: "Large blurred gradient backgrounds: a stock decorative pattern.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      const hasBlur = html.includes("blur-3xl") || html.includes("blur-2xl");
      const hasGradient = html.includes("bg-gradient-to") || html.includes("radial-gradient");
      if (hasBlur && hasGradient) return { evidence: "blurred gradient backgrounds" };
      if (html.includes("aurora")) return { evidence: "aurora background" };
      return null;
    },
  },
  {
    id: "layout.trusted-by",
    category: "layout",
    weight: 7,
    label: '"Trusted by" logo row',
    description: 'A "Trusted by" / "As seen in" social-proof row was found.',
    test: (ctx) => {
      const text = visibleText(ctx).toLowerCase();
      const m = text.match(/trusted by|as seen (in|on)|powering teams at/);
      return m ? { evidence: snippet(m[0]) } : null;
    },
  },

  // ── Tier D: template-skeleton / signature visual tells ────────────────────
  {
    id: "layout.ai-palette",
    category: "layout",
    weight: 8,
    label: "Signature AI gradient palette",
    description: "The blue/indigo/violet gradient AI builds reach for by default.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (html.includes("bg-gradient") && /(?:from|via|to)-(?:indigo|violet|purple|fuchsia)-/.test(html)) {
        return { evidence: "indigo/violet gradient" };
      }
      return null;
    },
  },
  {
    id: "layout.three-card-grid",
    category: "layout",
    weight: 6,
    label: "Three-feature-card grid",
    description: "The hero-plus-three-cards layout AI builders default to.",
    test: (ctx) => (/\b(?:sm:|md:|lg:)?grid-cols-3\b/.test(rawHtml(ctx)) ? { evidence: "3-column feature grid" } : null),
  },
  {
    id: "layout.dark-neon",
    category: "layout",
    weight: 5,
    label: "Dark mode with neon accents",
    description: "A near-black background with saturated neon accents, a common AI look.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      const dark = /bg-(?:black|zinc-9\d{2}|slate-9\d{2}|gray-9\d{2}|neutral-9\d{2})/.test(html);
      const neon = /(?:text|from|to|via)-(?:cyan|fuchsia|emerald|lime|violet)-[345]\d{2}/.test(html);
      return dark && neon ? { evidence: "dark bg + neon accent" } : null;
    },
  },
];
