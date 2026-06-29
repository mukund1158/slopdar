// ☁️ Stack tells — hosting/framework combinations common to vibe-coded sites.
// These read response headers (case-insensitive, lowercased in ScanContext).
import type { SignalRule } from "../types";
import { rawHtml } from "./util";

export const stackSignals: SignalRule[] = [
  {
    id: "stack.vercel",
    category: "stack",
    weight: 6,
    label: "Hosted on Vercel",
    description: "Vercel hosting headers were present.",
    test: (ctx) => {
      const h = ctx.headers;
      if (h["x-vercel-id"] || (h["server"] || "").toLowerCase().includes("vercel")) {
        return { evidence: "x-vercel-id header" };
      }
      return null;
    },
  },
  {
    id: "stack.netlify",
    category: "stack",
    weight: 5,
    label: "Hosted on Netlify",
    description: "Netlify hosting headers were present.",
    test: (ctx) => {
      const h = ctx.headers;
      if (h["x-nf-request-id"] || (h["server"] || "").toLowerCase().includes("netlify")) {
        return { evidence: "Netlify header" };
      }
      return null;
    },
  },
  {
    id: "stack.supabase",
    category: "stack",
    weight: 7,
    label: "Supabase backend",
    description: "Supabase client / project references were found.",
    test: (ctx) => (rawHtml(ctx).includes("supabase.co") ? { evidence: "supabase.co reference" } : null),
  },
  {
    id: "stack.vibe-combo",
    category: "stack",
    weight: 10,
    label: "Classic vibe-coding stack",
    description: "Next.js + Vercel + Supabase together: the default AI-build combo.",
    test: (ctx) => {
      const h = ctx.headers;
      const html = rawHtml(ctx);
      const onVercel = !!h["x-vercel-id"];
      const isNext = html.includes("/_next/") || (h["x-powered-by"] || "").toLowerCase().includes("next");
      const hasSupabase = html.includes("supabase.co");
      return onVercel && isNext && hasSupabase ? { evidence: "Next + Vercel + Supabase" } : null;
    },
  },
];
