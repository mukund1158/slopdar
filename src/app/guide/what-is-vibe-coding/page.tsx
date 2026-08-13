// Definitional guide (GEO surface): answers "what is vibe coding" in the exact
// phrasing people search, then funnels toward the detection angle only Slopdar
// owns ("how to spot a vibe-coded website"). Article + FAQPage JSON-LD so
// answer engines can quote it accurately.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO, card } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "What is vibe coding? Meaning, origin, and how to spot it",
  description:
    "Vibe coding is building software by describing it to an AI and shipping what comes out. Where the term came from, how it differs from AI-assisted coding, and how to spot a vibe-coded site.",
  alternates: { canonical: "/guide/what-is-vibe-coding" },
  openGraph: {
    title: "What is vibe coding?",
    description: "The meaning and origin of vibe coding, and how to tell when a website was built that way.",
    url: "/guide/what-is-vibe-coding",
    type: "article",
  },
};

const SPECTRUM = [
  {
    t: "AI-assisted development",
    d: "A developer uses AI to move faster but stays in charge: reads the generated code, rewrites what's wrong, makes the design decisions, owns the result. The AI is a power tool. The output usually doesn't look generated, because the fingerprints got sanded off.",
  },
  {
    t: "Vibe coding",
    d: "You describe what you want, accept what comes out, and iterate by prompting rather than by reading code. Great for prototypes, demos and scratching an itch. The trade: you ship the tool's defaults, and the tool's defaults look the same on every site it produces.",
  },
  {
    t: "Prompt-and-deploy slop",
    d: "Vibe coding minus the taste: generate, deploy, walk away. Nobody read the copy, nobody replaced the placeholder text, nobody asked why the hero gradient is indigo-to-violet again. This is where vibe coding turns into slop.",
  },
];

const FAQ = [
  {
    q: "Who coined the term vibe coding?",
    a: "Andrej Karpathy, the AI researcher and former Tesla AI director, in a February 2025 post where he described 'fully giving in to the vibes' and forgetting the code even exists while an AI writes it. The term spread instantly because thousands of people recognised what they were already doing.",
  },
  {
    q: "Is vibe coding bad?",
    a: "No. It's the fastest way ever invented to go from idea to working prototype, and it lets people build things they couldn't build at all before. It becomes a problem when the prototype ships as the product with nobody having read what the machine wrote: unreviewed code, unedited copy, and a design identical to every other generated site.",
  },
  {
    q: "What tools are used for vibe coding?",
    a: "The usual suspects for websites are v0 (by Vercel), Lovable, Bolt, Base44, Replit and chat assistants like ChatGPT and Claude, often deployed on Vercel or Netlify with Supabase, Clerk or Firebase behind them. Each one leaves recognisable fingerprints in the pages it generates.",
  },
  {
    q: "Can you tell if a website was vibe-coded?",
    a: "Usually, yes. Vibe-coded sites ship the tool's defaults: builder fingerprints in the source, untouched shadcn/ui components, template layouts, AI copy patterns and default metadata. Slopdar (slopdar.com) checks ~50 of these tells automatically and returns a 0 to 100 Slop Score with the evidence. Signals, not proof.",
  },
  {
    q: "What's the difference between vibe coding and no-code?",
    a: "No-code tools (Webflow, Wix, Framer) give you a visual editor with guardrails; you assemble the site by hand, just without writing code. Vibe coding generates real code from a text prompt. The failure mode differs too: no-code sites look like their template gallery, vibe-coded sites look like the model's statistical average of every landing page it trained on.",
  },
];

export default function WhatIsVibeCodingPage() {
  const base = env.APP_URL.replace(/\/$/, "");
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "What is vibe coding? Meaning, origin, and how to spot it",
        description: metadata.description,
        author: { "@type": "Organization", name: "Slopdar", url: base },
        publisher: { "@type": "Organization", name: "Slopdar", url: base },
        datePublished: "2026-07-30",
        mainEntityOfPage: `${base}/guide/what-is-vibe-coding`,
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
  const eyebrow = { fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" } as const;
  const h2 = { fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", margin: "34px 0 0" } as const;
  const p = { fontSize: 15, lineHeight: 1.65, color: "var(--ink2)", margin: "12px 0 0" } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 760, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={eyebrow}>The field guide</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(32px,5.4vw,52px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: 1.02 }}>
          What is vibe coding?
        </h1>
        <p style={{ ...p, fontSize: 16, marginTop: 14 }}>
          <span style={{ color: "var(--ink)", fontWeight: 700 }}>Vibe coding</span> is building software by describing what you
          want to an AI and shipping whatever comes out: coding by vibes instead of by hand. You prompt, the model writes, you
          look at the result instead of the code, and you iterate by asking for changes. It&apos;s the fastest path from idea
          to deployed website that has ever existed, which is exactly why the web is now full of it.
        </p>

        <h2 style={h2}>Where the term came from</h2>
        <p style={p}>
          Andrej Karpathy coined it in February 2025, describing a way of working where you &quot;fully give in to the
          vibes&quot; and forget the code even exists. He meant it half as a joke about his weekend projects. The internet
          adopted it as a job description. Within months, tools like v0, Lovable and Bolt had turned vibe coding from a
          workflow into a product category: type a sentence, get a deployed website.
        </p>

        <div style={{ ...eyebrow, marginTop: 36, marginBottom: 14 }}>The spectrum</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SPECTRUM.map((s, i) => (
            <div key={s.t} style={{ ...card, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 900, fontSize: 26, color: "var(--brand)", lineHeight: 1.2, flexShrink: 0, width: 34 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "8px 0 0" }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 style={h2}>Why vibe-coded sites all look the same</h2>
        <p style={p}>
          A language model asked for &quot;a modern landing page&quot; produces the statistical average of every landing page
          it trained on: gradient hero, three feature cards, bento grid, indigo-to-violet palette, Inter font, shadcn/ui
          components. None of these are wrong. All of them together, untouched, means no human made a single visual decision.
          That sameness is what makes vibe-coded sites detectable, and it&apos;s the difference between using AI and{" "}
          <Link href="/guide/what-is-ai-slop" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>
            publishing slop
          </Link>
          .
        </p>

        <h2 style={h2}>How to spot a vibe-coded website</h2>
        <p style={p}>
          The tells are consistent: builder fingerprints in the source code (the tools literally sign their work; here&apos;s{" "}
          <Link href="/guide/detect-v0-lovable-bolt-websites" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>
            how to check for v0, Lovable and Bolt specifically
          </Link>
          ), untouched default stacks, AI writing patterns, leftover placeholders and default metadata. We keep the full
          ten-point checklist in{" "}
          <Link href="/guide/how-to-tell-if-a-website-is-ai-generated" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>
            how to tell if a website is AI-generated
          </Link>
          , or you can scan all of them at once.
        </p>

        <div style={{ marginTop: 24, ...card, borderRadius: 18, padding: "24px 26px", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚖️</span>
            <h2 style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.01em", margin: 0 }}>Vibe coding isn&apos;t the crime. Shipping the defaults is.</h2>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "11px 0 0" }}>
            A vibe-coded prototype that later got real copy, real design decisions and a proofread will score low on any honest
            detector, because the fingerprints are gone. That&apos;s not evasion; that&apos;s craftsmanship. Slopdar measures
            the fingerprints left behind, not whether AI was used.{" "}
            <Link href="/how-it-works" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>Here&apos;s exactly how the scoring works</Link>.
          </p>
        </div>

        <div style={{ ...eyebrow, marginTop: 34, marginBottom: 14 }}>Questions people ask</div>
        <Faq items={FAQ} />

        <div style={{ marginTop: 26 }}>
          <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 900, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>
            Check a site for vibe-coding tells →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
