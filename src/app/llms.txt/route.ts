// /llms.txt — a concise, structured overview for AI answer engines and LLM
// crawlers (the llmstxt.org convention). Plain markdown over text/plain.
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const base = env.APP_URL.replace(/\/$/, "");

export async function GET() {
  let examples: { host: string; slug: string; score: number }[] = [];
  try {
    examples = await db.check.findMany({ orderBy: { score: "desc" }, take: 5, select: { host: true, slug: true, score: true } });
  } catch {
    /* DB unavailable — omit examples */
  }

  const exampleLines = examples.length
    ? examples.map((e) => `- [${e.host}](${base}/r/${e.slug}): Slop Score ${e.score}/100`).join("\n")
    : `- (no sites scanned yet)`;

  const body = `# Slopdar

> Slopdar is a free tool that scans any public website and gives it a "Slop Score" from 0 to 100, estimating whether the site looks hand-coded by a developer or vibe-coded / AI-generated. Tagline: "Is it built or is it slop?" Slopdar reports signals, not proof.

## What it does

- You paste a website URL. Slopdar fetches the public HTML, runs ~50 detection checks, takes a screenshot, and returns a Slop Score (0-100) with the evidence ("the receipts").
- Higher score = more AI / vibe-coding tells found. It is meant to be fun and shareable, not a definitive verdict.

## The score tiers

- 0-25: Hand-Crafted (a real person clearly built it)
- 26-50: Suspiciously Clean (a little too templated)
- 51-75: Vibe-Coded (clearly AI-assisted)
- 76-100: Pure Slop (looks prompt-and-deploy generated)

## What Slopdar checks for

- Tool fingerprints: builders like v0, Lovable, Bolt, Base44, Replit, Framer, Webflow, Wix.
- Leftover AI artifacts: lorem ipsum, "as an AI language model" text, ChatGPT citation tokens, unfilled "[Your Company]" placeholders.
- Default stacks: untouched shadcn/ui, Radix, lucide icons, default Vite/Next builds.
- AI copy patterns: em-dash density, buzzwords ("elevate", "seamless"), filler phrases.
- Layout tropes: blue/indigo/violet gradients, bento grids, three-feature-card layouts.
- Hosting combos: Next.js + Vercel + Supabase, Convex, Clerk, etc.
- Human signals (these LOWER the score): real about/blog/pricing pages, GitHub links, considered metadata, custom fonts and favicons.

## Honest framing

Slopdar detects signals, not proof. A high score means a site looks templated, not that no human was ever involved. It only reads publicly available HTML, the same a browser sees. It does not log in or bypass paywalls.

## Key pages

- ${base}/ : scan a website
- ${base}/leaderboard : the sloppiest and most hand-crafted sites
- ${base}/guide/how-to-tell-if-a-website-is-ai-generated : guide to the 10 signs a site is AI-generated or vibe-coded, with manual checks
- ${base}/about : how it works and FAQ
- ${base}/r/<domain> : the result page for a scanned site (example: ${base}/r/example.com)
- ${base}/sitemap.xml : all scanned-site pages

## Example results

${exampleLines}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600" },
  });
}
