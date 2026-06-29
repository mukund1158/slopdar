// Server-rendered, crawlable leaderboard. Links to each /r/<slug> so search and
// AI crawlers can discover every scored site. (The home page keeps its own
// interactive leaderboard screen for users; this is the canonical SEO surface.)
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { tierOf } from "@/lib/tiers";
import { SANS, MONO } from "@/components/slopdar/ui";

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

function Column({ title, subtitle, headBg, rows }: { title: string; subtitle: string; headBg: string; rows: { host: string; slug: string; score: number }[] }) {
  return (
    <div style={{ flex: "1 1 360px", minWidth: 300, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, overflow: "hidden", boxShadow: "0 5px 0 rgba(0,0,0,.09)" }}>
      <div style={{ padding: "15px 18px", background: headBg, borderBottom: "2px solid var(--ink)" }}>
        <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1 }}>{title}</div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--ink2)", marginTop: 3 }}>{subtitle}</div>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: "22px 18px", fontFamily: MONO, fontSize: 12.5, color: "var(--mut)" }}>No sites yet. Be the first.</div>
      ) : rows.map((r, i) => (
        <Link key={r.slug} href={`/r/${r.slug}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderTop: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ fontFamily: MONO, fontSize: 13.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.host}</span>
          <span style={{ fontWeight: 900, fontSize: 23, letterSpacing: "-.03em", color: tierOf(r.score).color }}>{r.score}</span>
        </Link>
      ))}
    </div>
  );
}

export default async function LeaderboardPage() {
  let shame: { host: string; slug: string; score: number }[] = [];
  let fame: { host: string; slug: string; score: number }[] = [];
  try {
    [shame, fame] = await Promise.all([
      db.check.findMany({ orderBy: { score: "desc" }, take: 25, select: { host: true, slug: true, score: true } }),
      db.check.findMany({ orderBy: { score: "asc" }, take: 25, select: { host: true, slug: true, score: true } }),
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
        <Link href="/" style={{ fontFamily: MONO, fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Scan a site →</Link>
      </header>

      <main style={{ flex: "1 0 auto", maxWidth: 1060, margin: "0 auto", padding: "46px 28px", width: "100%" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" }}>The board</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,60px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>The Leaderboard</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink2)", margin: "12px 0 22px", maxWidth: 560 }}>The web&apos;s sloppiest and most hand-crafted sites, scored 0–100 by Slopdar. Tap any site to see its receipts.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <Column title="Wall of Shame" subtitle="Sloppiest sites" headBg="#FFECEA" rows={shame} />
          <Column title="Hall of Fame" subtitle="Most hand-crafted" headBg="#EAF9F0" rows={fame} />
        </div>
      </main>

      <footer style={{ borderTop: "2px solid var(--ink)", padding: "22px 28px", fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>
        Slopdar runs on the slop stack. We know.
      </footer>
    </div>
  );
}
