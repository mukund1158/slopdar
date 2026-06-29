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
      if (
        html.includes("lovable.dev") ||
        html.includes("gptengineer") ||
        html.includes("lovable.app") ||
        html.includes("data-lov-id") ||
        ctx.url.hostname.endsWith("lovable.app")
      ) {
        return { evidence: html.includes("data-lov-id") ? "data-lov-id attribute" : "lovable reference in source" };
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

  // ── Tier B: additional AI builders ────────────────────────────────────────
  {
    id: "fingerprint.base44",
    category: "fingerprint",
    weight: 32,
    label: "Built with Base44",
    description: "Base44 (an AI app builder) artifacts were detected.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (ctx.url.hostname.endsWith("base44.app") || html.includes("base44")) {
        return { evidence: "base44 reference" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.replit",
    category: "fingerprint",
    weight: 22,
    label: "Built on Replit",
    description: "Replit hosting or build artifacts were detected.",
    test: (ctx) => {
      const host = ctx.url.hostname;
      const html = rawHtml(ctx);
      if (
        host.endsWith("replit.app") || host.endsWith("repl.co") || host.endsWith("replit.dev") ||
        html.includes("replit.app") || html.includes(".repl.co")
      ) {
        return { evidence: "Replit hosting / reference" };
      }
      return null;
    },
  },
  {
    id: "fingerprint.ai-builder-misc",
    category: "fingerprint",
    weight: 22,
    label: "AI website builder detected",
    description: "Markers from an AI website builder (Tempo, Create.xyz, Rocket, etc.) were found.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      const markers = ["create.xyz", "rocket.new", "tempolabs", "tempo.new", "tempo.build", "new.website", "databutton", "softgen.ai"];
      const hit = markers.find((m) => html.includes(m) || ctx.url.hostname.endsWith(m));
      return hit ? { evidence: hit } : null;
    },
  },
];
