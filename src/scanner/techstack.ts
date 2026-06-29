// Lightweight Wappalyzer-style tech detection — pattern matching over headers,
// HTML, scripts, and meta tags. Not exhaustive; covers the common web stack the
// result page wants to show. Extend the PATTERNS table to add more.
import type { DetectedTech, ScanContext } from "./types";

interface TechPattern {
  name: string;
  category: string;
  // any matcher hitting => detected. All tests run against lowercased inputs.
  html?: RegExp[];
  headers?: { key: string; value?: RegExp }[];
  generator?: RegExp;
}

const PATTERNS: TechPattern[] = [
  { name: "Next.js", category: "Framework", html: [/\/_next\//], headers: [{ key: "x-powered-by", value: /next\.js/ }] },
  { name: "React", category: "Framework", html: [/data-reactroot/, /__react/, /react(?:-dom)?@/] },
  { name: "Vue.js", category: "Framework", html: [/data-v-[0-9a-f]{8}/, /__vue__/] },
  { name: "Nuxt", category: "Framework", html: [/__nuxt/, /_nuxt\//] },
  { name: "Svelte / SvelteKit", category: "Framework", html: [/svelte-[0-9a-z]+/, /__sveltekit/] },
  { name: "Astro", category: "Framework", html: [/astro-island/, /astro-/], generator: /astro/ },
  { name: "Gatsby", category: "Framework", html: [/___gatsby/] },
  { name: "Tailwind CSS", category: "CSS", html: [/cdn\.tailwindcss\.com/, /\b(?:bg|text)-(?:slate|zinc|gray)-\d{2,3}\b/] },
  { name: "Bootstrap", category: "CSS", html: [/bootstrap(?:\.min)?\.css/, /class="[^"]*\b(?:container|row|col-)\b/] },
  { name: "WordPress", category: "CMS", html: [/wp-content\//, /wp-includes\//], generator: /wordpress/ },
  { name: "Framer", category: "Builder", html: [/framerusercontent\.com/], generator: /framer/ },
  { name: "Webflow", category: "Builder", html: [/data-wf-page/], generator: /webflow/ },
  { name: "Wix", category: "Builder", html: [/wixstatic\.com/], generator: /wix/ },
  { name: "Shopify", category: "Ecommerce", html: [/cdn\.shopify\.com/] },
  { name: "Vercel", category: "Hosting", headers: [{ key: "x-vercel-id" }, { key: "server", value: /vercel/ }] },
  { name: "Netlify", category: "Hosting", headers: [{ key: "x-nf-request-id" }, { key: "server", value: /netlify/ }] },
  { name: "Cloudflare", category: "CDN", headers: [{ key: "server", value: /cloudflare/ }, { key: "cf-ray" }] },
  { name: "Supabase", category: "Backend", html: [/supabase\.co/] },
  { name: "Google Analytics", category: "Analytics", html: [/googletagmanager\.com\/gtag/, /google-analytics\.com/] },
  { name: "Vite", category: "Build tool", html: [/\/@vite\//, /vite\/client/] },
];

export function detectTech(ctx: ScanContext): DetectedTech[] {
  const html = ctx.html.toLowerCase();
  const generator = (ctx.$('meta[name="generator"]').attr("content") ?? "").toLowerCase();
  const detected: DetectedTech[] = [];

  for (const p of PATTERNS) {
    let hit = false;

    if (p.html?.some((re) => re.test(html))) hit = true;
    if (!hit && p.generator?.test(generator)) hit = true;
    if (!hit && p.headers) {
      hit = p.headers.some(({ key, value }) => {
        const v = ctx.headers[key];
        if (v == null) return false;
        return value ? value.test(v.toLowerCase()) : true;
      });
    }

    if (hit) detected.push({ name: p.name, category: p.category, confidence: 100 });
  }

  return detected;
}
