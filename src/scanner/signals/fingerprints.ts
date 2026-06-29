// 🏷️ Tool fingerprints — highest-confidence tells that a specific AI/no-code
// builder produced the page.
import type { SignalRule } from "../types";
import { metaGenerator, rawHtml, snippet } from "./util";

export const fingerprintSignals: SignalRule[] = [
  {
    id: "fingerprint.v0",
    category: "fingerprint",
    weight: 35,
    label: "Built with v0.dev",
    description: "References to Vercel's v0 generator were found in the page source.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (html.includes("v0.dev") || metaGenerator(ctx).includes("v0")) {
        return { evidence: "v0.dev reference in source" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.lovable",
    category: "fingerprint",
    weight: 35,
    label: "Built with Lovable",
    description: "Lovable / GPT-Engineer build artifacts were detected.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (html.includes("lovable.dev") || html.includes("gptengineer") || html.includes("lovable.app")) {
        return { evidence: "lovable.dev reference in source" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.bolt",
    category: "fingerprint",
    weight: 35,
    label: "Built with Bolt",
    description: "StackBlitz Bolt.new build artifacts were detected.",
    test: (ctx) => (rawHtml(ctx).includes("bolt.new") ? { evidence: "bolt.new reference in source" } : null),
  },
  {
    id: "fingerprint.framer",
    category: "fingerprint",
    weight: 28,
    label: "Made with Framer",
    description: "The page was published by Framer (no-code site builder).",
    test: (ctx) => {
      const gen = metaGenerator(ctx);
      if (gen.includes("framer") || rawHtml(ctx).includes("framerusercontent.com")) {
        return { evidence: "Framer generator / asset host" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.webflow",
    category: "fingerprint",
    weight: 26,
    label: "Made with Webflow",
    description: "Webflow generator markup was detected.",
    test: (ctx) => {
      if (metaGenerator(ctx).includes("webflow") || ctx.$("html[data-wf-page]").length > 0) {
        return { evidence: "Webflow generator markup" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.wix",
    category: "fingerprint",
    weight: 24,
    label: "Made with Wix",
    description: "Wix generator / asset hosts were detected.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (metaGenerator(ctx).includes("wix") || html.includes("wixstatic.com")) {
        return { evidence: "Wix generator / asset host" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.made-with-badge",
    category: "fingerprint",
    weight: 18,
    label: '"Made with …" builder badge',
    description: "A leftover builder attribution badge was found in the page.",
    test: (ctx) => {
      const m = ctx.html.match(/made with (?:love by )?(v0|lovable|bolt|framer|webflow|wix|builder)/i);
      return m ? { evidence: snippet(m[0]) } : null;
    },
  },
];
