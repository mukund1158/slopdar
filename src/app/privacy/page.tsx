// Server-rendered Privacy & Terms page (moved out of the SPA's in-app screen so
// the footer link works on every page).
import type { Metadata } from "next";
import Link from "next/link";
import { SANS, MONO } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy & Terms: the short version",
  description: "What Slopdar does with the URLs you scan, what data it keeps, and what the Slop Score actually means. Signals, not proof.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS: [string, string, string][] = [
  ["🔍", "What we collect", "When you scan a URL, we store that URL and its score so the leaderboard and “sites checked” counter work. If you leave your email to unlock the fix prompt, we keep it and use it only for Slopdar updates, and we'll delete it if you ask. We keep basic, anonymous analytics. We don't sell your data, and we don't run creepy ad trackers."],
  ["🌎", "Public URLs only", "Slopdar only looks at publicly available pages, the same HTML your browser sees. We don't log in, bypass paywalls, or touch anything behind authentication. Please don't paste private or internal links."],
  ["🙃", "It's a toy, not a verdict", "The Slop Score is automated, opinionated, and meant for fun. We detect signals, not proof. A high score means a site looks templated, not that no human ever touched it."],
  ["🧹", "Get yourself removed", "Own a site on the leaderboard and want off? Email support@slopdar.com and we'll pull it. By scanning a site you confirm you're cool with its public score appearing here."],
];

export default function PrivacyPage() {
  const card = { background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, boxShadow: "0 5px 0 rgba(0,0,0,.1)" } as const;
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", maxWidth: 720, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" }}>The fine print (it&apos;s short)</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,58px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>Privacy &amp; Terms</h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink2)", margin: "12px 0 0" }}>No 40-page scroll, no dark patterns. Here&apos;s the honest version of what Slopdar does with your clicks, and what these scores actually mean.</p>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 14 }}>
          {SECTIONS.map(([e, t, d]) => (
            <div key={t} style={{ ...card, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22 }}>{e}</span><h2 style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.01em", margin: 0 }}>{t}</h2></div>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "11px 0 0" }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 900, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>← Back to scanning</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
