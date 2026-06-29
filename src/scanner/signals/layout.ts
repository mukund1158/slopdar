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
];
