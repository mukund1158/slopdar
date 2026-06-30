// Server-rendered "How it works" page (GEO surface): the 3 steps, what the score
// means, the signals-not-proof note, and a FAQ accordion. FAQPage + WebApplication
// JSON-LD so AI answer engines can extract accurate facts.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "How Slopdar works — the Slop Score explained",
  description:
    "How Slopdar scores any website 0–100 for how AI-generated or vibe-coded it looks: the three steps, what each tier means, the tells we check, and why it's signals, not proof.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Slopdar works",
    description: "Paste a link, get a score, see the receipts. Here's the whole trick.",
    url: "/how-it-works",
    type: "article",
  },
};

const STEPS = [
  { n: "01", t: "You paste a link", d: "Any public URL. We fetch the same HTML, CSS, and scripts your browser would, nothing behind a login." },
  { n: "02", t: "We check for tells", d: "Each known signal, builder fingerprints, default assets, the usual stack, layout tropes, leftover junk, carries a weight. We add up what we find." },
  { n: "03", t: "You get a score and the receipts", d: "A 0 to 100 Slop Score, a tier, a roast, and the exact list of what we found. Share it, or argue with it." },
];

const TIERS = [
  { range: "0–25", color: "#10B95E", name: "Hand-Crafted", desc: "A real person sweated over this." },
  { range: "26–50", color: "#FFB81F", name: "Suspiciously Clean", desc: "A little too templated." },
  { range: "51–75", color: "#FF7A1A", name: "Vibe-Coded", desc: "Clearly AI-assisted." },
  { range: "76–100", color: "#FF3B30", name: "Pure Slop", desc: "Prompt, deploy, pray." },
];

const FAQ = [
  { q: "Is the score actually accurate?", a: "It's directional, not gospel. We detect known tells and weight them, so a high score means a site looks templated, not that no human touched it. Treat it as a vibe check with footnotes." },
  { q: "Can it tell exactly which AI tool built a site?", a: "Sometimes. Builders like v0, Lovable and Bolt leave recognisable fingerprints in the markup. When we spot one we name it in the receipts; when we don't, we score on the other tells instead." },
  { q: "My hand-coded site scored high. Why?", a: "Probably because you use a popular stack (Next.js, Tailwind, lucide) or a few common layout patterns. Those are slop signals on average, even when a real person made deliberate choices. It's a roast, not a court ruling." },
  { q: "Do you store the sites I scan?", a: "We keep the URL and its score to power the leaderboard and the counter. We only look at public pages, never anything behind a login." },
  { q: "Is this serious or a joke?", a: "Both. The detection is real, the tone is not. It's built to be fun and shareable first. Please don't fire anyone over a number from a site called Slopdar." },
];

export default function HowItWorksPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "WebApplication", name: "Slopdar", url: env.APP_URL, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: "Scan any website for a Slop Score (0–100): hand-coded or vibe-coded / AI-generated." },
    ],
  };
  const card = { background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, boxShadow: "0 5px 0 rgba(0,0,0,.1)" } as const;
  const eyebrow = { fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 760, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={eyebrow}>No magic, just tells</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,58px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>How it works</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink2)", margin: "14px 0 0" }}>Paste a link, get a score, see the receipts. Under the hood it&apos;s pattern-matching, not mind-reading. Here&apos;s the whole trick.</p>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ ...card, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 900, fontSize: 30, color: "var(--brand)", lineHeight: 1, flexShrink: 0 }}>{s.n}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 19 }}>{s.t}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "8px 0 0" }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...eyebrow, marginTop: 30, marginBottom: 14 }}>What the score means</div>
        <div style={{ ...card, overflow: "hidden" }}>
          {TIERS.map((t, i) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
              <span style={{ width: 60, fontWeight: 900, fontSize: 15, color: t.color }}>{t.range}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--mut)" }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, ...card, borderRadius: 18, padding: "24px 26px", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22 }}>🎯</span><h2 style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.01em", margin: 0 }}>Signals, not proof</h2></div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "11px 0 0" }}>A high score means a site <span style={{ color: "var(--ink)", fontWeight: 700 }}>looks</span> templated, not that no human ever touched it. Plenty of great sites use Next.js and lucide. Slopdar is a vibe check with footnotes, take it in the spirit it&apos;s given.</p>
        </div>

        <div style={{ ...eyebrow, marginTop: 30, marginBottom: 14 }}>Questions a skeptic asks</div>
        <Faq items={FAQ} />

        <div style={{ marginTop: 26 }}>
          <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 900, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>Try it on a site →</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
