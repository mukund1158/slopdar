// Index for the field guides: one card per article so every guide is one click
// from anywhere that links here (footer, home). CollectionPage JSON-LD lists
// the articles for answer engines.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO, card } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Field guides to AI-generated websites",
  description:
    "Short, honest guides to AI slop, vibe coding and spotting AI-generated websites: what the terms mean, the tells to look for, and how to check any site yourself.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "Field guides to AI-generated websites",
    description: "What AI slop and vibe coding mean, and how to spot AI-generated websites yourself.",
    url: "/guide",
  },
};

const GUIDES = [
  {
    slug: "how-to-tell-if-a-website-is-ai-generated",
    t: "How to tell if a website is AI-generated",
    d: "The ten tells that give away a vibe-coded site, from builder fingerprints to template layouts, and how to check each one by hand in under a minute.",
    date: "2026-07-04",
  },
  {
    slug: "what-is-ai-slop",
    t: "What is AI slop?",
    d: "The meaning of the term the whole internet suddenly needed: where it came from, the three kinds of slop, and why the dividing line is effort, not AI.",
    date: "2026-07-30",
  },
  {
    slug: "what-is-vibe-coding",
    t: "What is vibe coding?",
    d: "Coding by vibes instead of by hand: who coined it, why it exploded, the spectrum from AI-assisted craft to prompt-and-deploy slop, and how to spot it.",
    date: "2026-07-30",
  },
  {
    slug: "detect-v0-lovable-bolt-websites",
    t: "Was this site built with v0, Lovable, or Bolt?",
    d: "AI site builders sign their work. The exact fingerprints v0, Lovable, Bolt, Base44 and Replit leave in the source code, and how to find them with Ctrl+F.",
    date: "2026-07-30",
  },
];

export default function GuideIndexPage() {
  const base = env.APP_URL.replace(/\/$/, "");
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Field guides to AI-generated websites",
    url: `${base}/guide`,
    hasPart: GUIDES.map((g) => ({
      "@type": "Article",
      headline: g.t,
      url: `${base}/guide/${g.slug}`,
      datePublished: g.date,
    })),
  };
  const eyebrow = { fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" } as const;
  const p = { fontSize: 15, lineHeight: 1.65, color: "var(--ink2)", margin: "12px 0 0" } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 760, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={eyebrow}>The field guides</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(32px,5.4vw,52px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: 1.02 }}>
          Know slop when you see it
        </h1>
        <p style={{ ...p, fontSize: 16, marginTop: 14 }}>
          Short, honest guides to the AI-generated web: what the terms actually mean, the tells that give a generated site
          away, and how to check any of it yourself. No scan required, though there&apos;s always{" "}
          <Link href="/" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>the ten-second version</Link>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guide/${g.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ ...card, padding: "22px 24px" }}>
                <div style={{ ...eyebrow, fontSize: 10.5 }}>
                  {new Date(g.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
                <h2 style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.015em", margin: "8px 0 0" }}>{g.t}</h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "8px 0 0" }}>{g.d}</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--brand)", margin: "12px 0 0" }}>Read the guide →</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
