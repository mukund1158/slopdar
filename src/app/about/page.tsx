// Server-rendered About / How-it-works page. This is the GEO surface: clear,
// factual, citeable Q&A content with FAQPage + WebApplication JSON-LD so AI
// answer engines (ChatGPT, Perplexity, Google AI Overviews) can extract and
// cite accurate facts about Slopdar.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO } from "@/components/slopdar/ui";

export const metadata: Metadata = {
  title: "How Slopdar works — AI & vibe-coding website detector",
  description:
    "Slopdar scans any public website and scores it 0–100 on how AI-generated or vibe-coded it looks. Learn how the Slop Score works, what tells we check, and why it's signals, not proof.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "How Slopdar works",
    description: "How the Slop Score works, what Slopdar checks for, and why it reports signals, not proof.",
    url: "/about",
    type: "article",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is Slopdar?",
    a: "Slopdar is a free web tool that scans any public website and gives it a Slop Score from 0 to 100, estimating whether the site looks hand-coded by a developer or vibe-coded / AI-generated. It shows the specific tells it found, called 'the receipts'.",
  },
  {
    q: "How does the Slop Score work?",
    a: "Slopdar fetches the page's public HTML, runs about 50 detection checks, and adds up the points from every tell it matches. The total is capped at 0–100. Signals that suggest real human effort (like a real about page or GitHub links) subtract points.",
  },
  {
    q: "What do the score tiers mean?",
    a: "0–25 is Hand-Crafted, 26–50 is Suspiciously Clean, 51–75 is Vibe-Coded, and 76–100 is Pure Slop. A higher score means more AI or vibe-coding tells were found.",
  },
  {
    q: "What does Slopdar check for?",
    a: "Tool fingerprints (v0, Lovable, Bolt, Base44, Replit, Framer, Webflow, Wix), leftover AI artifacts (lorem ipsum, 'as an AI language model' text, unfilled placeholders), default stacks (shadcn/ui, Radix, lucide, default Vite/Next builds), AI copy patterns (em-dash density, buzzwords, filler phrases), layout tropes (gradient heroes, bento grids, three-card layouts), and common hosting combos like Next.js + Vercel + Supabase.",
  },
  {
    q: "Does a high Slop Score prove a site was made by AI?",
    a: "No. Slopdar detects signals, not proof. A high score means a site looks templated or carries common AI tells, not that no human was ever involved. It is meant to be fun and shareable, not a definitive verdict.",
  },
  {
    q: "What data does Slopdar access?",
    a: "Only publicly available HTML, the same content a browser sees. Slopdar does not log in, bypass paywalls, or touch anything behind authentication.",
  },
  {
    q: "Is Slopdar free, and can I remove my site?",
    a: "Yes, Slopdar is free to use. If your site appears on the leaderboard and you want it removed, contact hi@slopdar.com.",
  },
];

export default function AboutPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "WebApplication",
        name: "Slopdar",
        url: env.APP_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description: "Scan any website for a Slop Score (0–100): hand-coded or vibe-coded / AI-generated.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 28px", borderBottom: "2px solid var(--ink)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand)" }} />
          <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 19 }}>Slopdar</span>
        </Link>
        <nav style={{ display: "flex", gap: 22, fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
          <Link href="/leaderboard" style={{ color: "inherit", textDecoration: "none" }}>Leaderboard</Link>
          <Link href="/" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Scan a site →</Link>
        </nav>
      </header>

      <main style={{ flex: "1 0 auto", maxWidth: 760, margin: "0 auto", padding: "52px 28px", width: "100%" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" }}>How it works</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,56px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .98 }}>Is it built, or is it slop?</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink2)", margin: "16px 0 0" }}>
          Slopdar scans any public website and gives it a <strong>Slop Score from 0 to 100</strong>, estimating whether it looks hand-coded by a real developer or vibe-coded / AI-generated. It reads only the public HTML, runs about 50 detection checks, and shows you exactly which tells it found. Slopdar reports <strong>signals, not proof</strong>.
        </p>

        <h2 style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", marginTop: 40 }}>How the score works</h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink2)", marginTop: 10 }}>
          Each detection check that matches adds points. Signals that suggest real human effort, like a genuine about page or GitHub links, subtract points. The total is capped between 0 and 100 and mapped to a tier:
        </p>
        <ul style={{ fontSize: 16, lineHeight: 1.8, color: "var(--ink2)", marginTop: 8, paddingLeft: 22 }}>
          <li><strong>0–25 Hand-Crafted</strong> — a real person clearly built it.</li>
          <li><strong>26–50 Suspiciously Clean</strong> — a little too templated.</li>
          <li><strong>51–75 Vibe-Coded</strong> — clearly AI-assisted.</li>
          <li><strong>76–100 Pure Slop</strong> — looks prompt-and-deploy generated.</li>
        </ul>

        <h2 style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", marginTop: 40 }}>Frequently asked questions</h2>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 18 }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 4px 0 rgba(0,0,0,.08)" }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{f.q}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink2)", margin: "8px 0 0" }}>{f.a}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36 }}>
          <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 800, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>Scan a site →</Link>
        </div>
      </main>

      <footer style={{ borderTop: "2px solid var(--ink)", padding: "22px 28px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>
        <span>Slopdar runs on the slop stack. We know.</span>
        <Link href="/leaderboard" style={{ color: "inherit" }}>See the leaderboard →</Link>
      </footer>
    </div>
  );
}
