// 🧹 Tier E: low-effort / quality tells. Vibe-coded sites often ship without the
// polish a real dev adds. Individually weak (a minimalist hand-built site can
// trip these too), so weights stay low and only matter in aggregate.
import type { SignalRule } from "../types";

export const qualitySignals: SignalRule[] = [
  {
    id: "quality.missing-meta",
    category: "quality",
    weight: 6,
    label: "Missing social/meta tags",
    description: "No meta description and no Open Graph tags, a low-effort sign.",
    test: (ctx) => {
      const $ = ctx.$;
      const desc = ($('meta[name="description"]').attr("content") || "").trim();
      const og = $('meta[property^="og:"]').length;
      return !desc && og === 0 ? { evidence: "no description / OG tags" } : null;
    },
  },
  {
    id: "quality.default-favicon",
    category: "quality",
    weight: 5,
    label: "No custom favicon",
    description: "The site ships without a favicon link.",
    test: (ctx) => {
      const has = ctx.$('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').length > 0;
      return !has ? { evidence: "no <link rel=icon>" } : null;
    },
  },
  {
    id: "quality.no-alt-text",
    category: "quality",
    weight: 6,
    label: "Images missing alt text",
    description: "Most images have no alt text, a sign of unreviewed output.",
    test: (ctx) => {
      const $ = ctx.$;
      const imgs = $("img");
      if (imgs.length < 4) return null;
      let missing = 0;
      imgs.each((_, el) => {
        if (!($(el).attr("alt") ?? "").trim()) missing++;
      });
      return missing >= Math.ceil(imgs.length * 0.6) ? { evidence: `${missing}/${imgs.length} images missing alt` } : null;
    },
  },
  {
    id: "quality.missing-lang",
    category: "quality",
    weight: 4,
    label: "No lang attribute",
    description: "The <html> tag has no lang attribute set.",
    test: (ctx) => (!(ctx.$("html").attr("lang") || "").trim() ? { evidence: "<html> missing lang" } : null),
  },
  {
    id: "quality.generic-title",
    category: "quality",
    weight: 5,
    label: "Generic page title",
    description: 'The page title is a default like "Home" or "Vite App".',
    test: (ctx) => {
      const title = (ctx.$("title").first().text() || "").trim().toLowerCase();
      const generic = ["", "home", "index", "react app", "vite app", "next app", "app", "create next app", "document", "untitled"];
      return generic.includes(title) ? { evidence: title || "(empty title)" } : null;
    },
  },
];
