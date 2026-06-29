// Server-rendered /leaderboard: SEO shell + the interactive board (tabs, search,
// pagination) as a client island, seeded with server-fetched rows so crawlers
// still see real content and links to each /r/<slug>.
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { SANS, MONO } from "@/components/slopdar/ui";
import LeaderboardView from "@/components/LeaderboardView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Leaderboard — sloppiest and most hand-crafted sites",
  description: "The web's sloppiest (Wall of Shame) and most hand-crafted (Hall of Fame) sites, scored by Slopdar. See which sites look AI-generated and which were built by hand.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Slopdar Leaderboard — Wall of Shame & Hall of Fame",
    description: "The web's sloppiest and most hand-crafted sites, scored 0–100 by Slopdar.",
    url: "/leaderboard",
    type: "website",
  },
};

interface Row { host: string; slug: string; score: number }
const toRows = (rows: Row[]) => rows.map((r) => ({ domain: r.host, slug: r.slug, score: r.score }));

export default async function LeaderboardPage() {
  let shame: Row[] = [];
  let fame: Row[] = [];
  try {
    [shame, fame] = await Promise.all([
      db.check.findMany({ orderBy: { score: "desc" }, take: 100, select: { host: true, slug: true, score: true } }),
      db.check.findMany({ orderBy: { score: "asc" }, take: 100, select: { host: true, slug: true, score: true } }),
    ]);
  } catch {
    /* DB unavailable — render empty board */
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 28px", borderBottom: "2px solid var(--ink)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand)" }} />
          <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 19 }}>Slopdar</span>
        </Link>
        <nav style={{ display: "flex", gap: 22, fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
          <Link href="/about" style={{ color: "inherit", textDecoration: "none" }}>How it works</Link>
          <Link href="/" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Scan a site →</Link>
        </nav>
      </header>

      <main style={{ flex: "1 0 auto", maxWidth: 900, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" }}>The board</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,60px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>The Leaderboard</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink2)", margin: "12px 0 0", maxWidth: 520 }}>The web&apos;s sloppiest and most hand-crafted sites, scored 0–100 by Slopdar. Tap any site to see its receipts.</p>

        <LeaderboardView shame={toRows(shame)} fame={toRows(fame)} />

        {/* Server-rendered links for crawlers (hidden from view; the island above is the UI). */}
        <div style={{ display: "none" }} aria-hidden="true">
          {[...shame, ...fame].map((r) => (
            <Link key={r.slug} href={`/r/${r.slug}`}>{r.host}</Link>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: "2px solid var(--ink)", padding: "22px 28px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>
        <span>Slopdar runs on the slop stack. We know.</span>
        <Link href="/about" style={{ color: "inherit" }}>How it works →</Link>
      </footer>
    </div>
  );
}
