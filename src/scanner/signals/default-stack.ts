// 🎨 Default-stack tells — frameworks used with their defaults left untouched.
// NOTE: these are weak proxies on their own (plenty of hand-built sites use
// shadcn/Tailwind/lucide). Keep weights modest; the score earns confidence from
// many tells stacking, not any single one. (See docs/06 false-positive note.)
import type { SignalRule } from "../types";
import { rawHtml } from "./util";

export const defaultStackSignals: SignalRule[] = [
  {
    id: "default.lucide",
    category: "default-stack",
    weight: 8,
    label: "lucide-react icons",
    description: "The default icon set shipped with most AI-generated UIs.",
    test: (ctx) => {
      const $ = ctx.$;
      if ($("svg.lucide, [class*='lucide-']").length >= 3 || rawHtml(ctx).includes("lucide-react")) {
        return { evidence: "lucide icons present" };
      }
      return null;
    },
  },
  {
    id: "default.shadcn",
    category: "default-stack",
    weight: 12,
    label: "Untouched shadcn/ui",
    description: "Default shadcn/ui class signatures with no custom theming.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      const tells = [
        "inline-flex items-center justify-center whitespace-nowrap rounded-md",
        "bg-background text-foreground",
        "ring-offset-background",
        "text-muted-foreground",
      ];
      const hits = tells.filter((t) => html.includes(t)).length;
      return hits >= 2 ? { evidence: `${hits} default shadcn signatures` } : null;
    },
  },
  {
    id: "default.tailwind-cdn",
    category: "default-stack",
    weight: 14,
    label: "Tailwind via CDN",
    description: "Tailwind loaded from the play CDN: a prototyping/quick-build tell.",
    test: (ctx) => (rawHtml(ctx).includes("cdn.tailwindcss.com") ? { evidence: "cdn.tailwindcss.com" } : null),
  },
  {
    id: "default.next-default",
    category: "default-stack",
    weight: 6,
    label: "Stock Next.js setup",
    description: "Next.js with no apparent customisation of the default scaffold.",
    test: (ctx) => {
      const html = rawHtml(ctx);
      if (html.includes("/_next/static") && html.includes("__next_f")) {
        return { evidence: "default _next scaffold" };
      }
      return null;
    },
  },
];
