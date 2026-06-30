// Server-rendered About page: who's behind Slopdar, the principles, the
// self-aware disclosure, and the maker's other projects.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "About Slopdar — who's behind the radar",
  description:
    "Slopdar is a fun radar for AI-generated and vibe-coded websites, built solo by indie hacker Mukund. Paste a link, get a Slop Score, see the receipts. Signals, not proof.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Slopdar",
    description: "A dumb little radar for one question: was this site built by a person, or churned out by a tool?",
    url: "/about",
    type: "article",
  },
};

const card = { background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, boxShadow: "0 5px 0 rgba(0,0,0,.1)" } as const;
const eyebrow = { fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" } as const;

export default function AboutPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Slopdar",
    url: `${env.APP_URL.replace(/\/$/, "")}/about`,
    about: {
      "@type": "WebApplication",
      name: "Slopdar",
      url: env.APP_URL,
      applicationCategory: "UtilitiesApplication",
      creator: { "@type": "Person", name: "Mukund", url: "https://x.com/mukparekh" },
    },
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 720, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={eyebrow}>Who&apos;s behind the radar</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,58px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>About Slopdar</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink2)", margin: "14px 0 0" }}>Everyone ships AI-generated sites now. Nobody can tell anymore whether a thing was built by a person or churned out by a tool in nine minutes. Slopdar is a dumb little radar for exactly that question: paste a link, get a score, see the receipts, share the damage.</p>

        <div style={{ marginTop: 26, ...card, borderRadius: 18, padding: 24, boxShadow: "0 6px 0 rgba(0,0,0,.1)", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 74, height: 74, flexShrink: 0, border: "2px solid var(--ink)", borderRadius: 16, background: "#FFE9D6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>👨‍💻</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: "-.01em" }}>Built by Mukund</div>
            <a href="https://x.com/mukparekh" target="_blank" rel="noopener" className="h-underline" style={{ display: "inline-block", fontFamily: MONO, fontSize: 12, color: "var(--brand)", marginTop: 3, textDecoration: "none" }}>@mukparekh on X ↗</a>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", marginTop: 2 }}>solo indie hacker · ships at 2am</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "12px 0 0" }}>One person, a weekend that turned into several, and a deep suspicion about half the landing pages on the internet. No team, no funding, no roadmap deck. If something breaks, that&apos;s also Mukund.</p>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ fontSize: 24 }}>🎯</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginTop: 10 }}>Signals, not proof</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--mut)", margin: "6px 0 0" }}>We point at the tells. We don&apos;t claim a number is the truth. It&apos;s a vibe check with footnotes.</p>
          </div>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ fontSize: 24 }}>😈</div>
            <div style={{ fontWeight: 900, fontSize: 16, marginTop: 10 }}>Funny over fair</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--mut)", margin: "6px 0 0" }}>It&apos;s a toy. The roast is the point. If your site scores high, screenshot it and own the bit.</p>
          </div>
        </div>

        <div style={{ marginTop: 20, ...card, borderRadius: 18, padding: "24px 26px", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          <div style={{ ...eyebrow, color: "var(--brand)" }}>The disclosure we&apos;re legally obligated to enjoy</div>
          <p style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 800, letterSpacing: "-.01em", margin: "10px 0 0" }}>Yes, Slopdar runs on the slop stack. Next.js, a tidy little gradient, more lucide icons than we&apos;d like to admit. We know. We scored ourselves and we did not enjoy it.</p>
        </div>

        <div style={{ ...eyebrow, marginTop: 30, marginBottom: 14 }}>More from Mukund</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {[
            { href: "https://postvoy.com", emoji: "📣", host: "postvoy.com ↗", name: "Postvoy", desc: "An operator, not a bot, that runs your X account in your voice. Autonomous growth for SaaS founders who'd rather ship." },
            { href: "https://infrawhisper.com", emoji: "🖥️", host: "infrawhisper.com ↗", name: "InfraWhisper", desc: "Deploy to your own server in plain English. Connect a repo, it provisions, configures SSL, and ships, no DevOps." },
          ].map((p) => (
            <a key={p.href} href={p.href} target="_blank" rel="noopener" className="h-lift" style={{ display: "block", textDecoration: "none", ...card, padding: 20, color: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 24 }}>{p.emoji}</span><span style={{ fontFamily: MONO, fontSize: 11, color: "var(--brand)" }}>{p.host}</span></div>
              <div style={{ fontWeight: 900, fontSize: 17, marginTop: 12 }}>{p.name}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--mut)", margin: "6px 0 0" }}>{p.desc}</p>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/" className="h-brand" style={{ background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 900, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>Roast a site →</Link>
          <a href="mailto:hi@slopdar.com" className="h-ink" style={{ display: "inline-flex", alignItems: "center", background: "var(--card)", color: "var(--ink)", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 800, fontSize: 15, padding: "14px 24px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.1)" }}>Say hi ✉</a>
          <a href="https://x.com/mukparekh" target="_blank" rel="noopener" className="h-ink" style={{ display: "inline-flex", alignItems: "center", background: "var(--card)", color: "var(--ink)", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 800, fontSize: 15, padding: "14px 24px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.1)" }}>Follow @mukparekh</a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
