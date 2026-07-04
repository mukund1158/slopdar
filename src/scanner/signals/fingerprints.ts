// 🏷️ Tool fingerprints — highest-confidence tells that a specific AI/no-code
// builder produced the page.
// Matching runs against techSurface() — script/link URLs, meta tags, HTML
// comments — never the full page HTML, so an article that merely *mentions* a
// builder (e.g. a "Lovable vs Bolt vs Base44" comparison) doesn't get flagged
// as *built with* all of them. Name-string hits are marked `weak`; score.ts
// discards weak fingerprints when several match at once, since no real site
// is built by multiple competing builders.
import type { SignalRule } from "../types";
import { metaGenerator, rawHtml, snippet, techSurface } from "./util";

export const fingerprintSignals: SignalRule[] = [
  {
    id: "fingerprint.v0",
    category: "fingerprint",
    weight: 35,
    label: "Built with v0.dev",
    description: "References to Vercel's v0 generator were found in the page source.",
    test: (ctx) => {
      if (metaGenerator(ctx).includes("v0")) {
        return { evidence: "v0 generator meta tag" };
      }
      if (techSurface(ctx).includes("v0.dev")) {
        return { evidence: "v0.dev script/meta artifact", weak: true };
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
      if (ctx.$("[data-lov-id]").length > 0) {
        return { evidence: "data-lov-id attribute" };
      }
      if (ctx.url.hostname.endsWith("lovable.app")) {
        return { evidence: "hosted on lovable.app" };
      }
      const tech = techSurface(ctx);
      if (tech.includes("gptengineer") || tech.includes("lovable.dev") || tech.includes("lovable.app")) {
        return { evidence: "Lovable script/meta artifact", weak: true };
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
    test: (ctx) =>
      techSurface(ctx).includes("bolt.new")
        ? { evidence: "bolt.new script/meta artifact", weak: true }
        : null,
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
      // weak: prose like "sites made with Lovable…" also matches this.
      return m ? { evidence: snippet(m[0]), weak: true } : null;
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
      if (ctx.url.hostname.endsWith("base44.app")) {
        return { evidence: "hosted on base44.app" };
      }
      const tech = techSurface(ctx);
      // Match the actual domains, not the bare word "base44".
      if (tech.includes("base44.app") || tech.includes("base44.com")) {
        return { evidence: "Base44 script/meta artifact", weak: true };
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
      if (host.endsWith("replit.app") || host.endsWith("repl.co") || host.endsWith("replit.dev")) {
        return { evidence: "Replit hosting" };
      }
      const tech = techSurface(ctx);
      if (tech.includes("replit.app") || tech.includes(".repl.co")) {
        return { evidence: "Replit script/meta artifact", weak: true };
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
      const markers = ["create.xyz", "rocket.new", "tempolabs", "tempo.new", "tempo.build", "new.website", "databutton", "softgen.ai"];
      const hostHit = markers.find((m) => ctx.url.hostname.endsWith(m));
      if (hostHit) return { evidence: `hosted on ${hostHit}` };
      const tech = techSurface(ctx);
      const techHit = markers.find((m) => tech.includes(m));
      return techHit ? { evidence: techHit, weak: true } : null;
    },
  },
];
