// 🤍 Tier F: human signals. Signs a real person put in effort. These carry
// NEGATIVE weights, so they LOWER the Slop Score — the main defense against
// wrongly roasting a genuinely hand-built site. The result page shows them
// separately as "signs a human was here".
import type { SignalRule } from "../types";
import { rawHtml } from "./util";

export const humanSignals: SignalRule[] = [
  {
    id: "human.real-pages",
    category: "human",
    weight: -8,
    label: "Real site pages",
    description: "Links to genuine pages (about, blog, pricing, docs) suggest real effort.",
    test: (ctx) => {
      const $ = ctx.$;
      const wanted = ["/about", "/blog", "/changelog", "/pricing", "/docs", "/careers", "/contact", "/work", "/case-stud"];
      const found = new Set<string>();
      $("a[href]").each((_, el) => {
        const href = ($(el).attr("href") || "").toLowerCase();
        for (const w of wanted) if (href.includes(w)) found.add(w);
      });
      return found.size >= 2 ? { evidence: `${found.size} real pages linked` } : null;
    },
  },
  {
    id: "human.github",
    category: "human",
    weight: -5,
    label: "Links to GitHub",
    description: "A real GitHub link points to actual source or a real person.",
    test: (ctx) => (rawHtml(ctx).includes("github.com/") ? { evidence: "github.com link" } : null),
  },
  {
    id: "human.rich-meta",
    category: "human",
    weight: -4,
    label: "Considered metadata",
    description: "A real meta description plus Open Graph tags show care.",
    test: (ctx) => {
      const $ = ctx.$;
      const desc = ($('meta[name="description"]').attr("content") || "").trim();
      const og = $('meta[property^="og:"]').length;
      return desc.length >= 30 && og >= 3 ? { evidence: "description + OG tags" } : null;
    },
  },
  {
    id: "human.custom-fonts",
    category: "human",
    weight: -3,
    label: "Custom typography",
    description: "Self-hosted or custom web fonts, not just system defaults.",
    test: (ctx) => (/@font-face|\.woff2?|use\.typekit|fonts\.bunny/.test(rawHtml(ctx)) ? { evidence: "custom web fonts" } : null),
  },
  {
    id: "human.custom-favicon",
    category: "human",
    weight: -3,
    label: "Custom favicon",
    description: "A real, non-default favicon, a small sign someone cared.",
    test: (ctx) => {
      const icon = (ctx.$('link[rel~="icon"], link[rel="apple-touch-icon"]').attr("href") || "").trim();
      return icon && !/^\/?favicon\.ico$/i.test(icon) ? { evidence: "custom favicon" } : null;
    },
  },
];
