// Server-rendered /leaderboard: SEO shell + the interactive board (tabs, search,
// pagination) as a client island, seeded with the first server-fetched page of
// each tab so crawlers still see real content and links to each /r/<slug>.
// Paging and search hit /api/leaderboard, so every scanned site is reachable.
import type { Metadata } from "next";
import Link from "next/link";
import { boardPage, type BoardRow } from "@/lib/leaderboard";
import { weeklyWinners, type WeeklyWinners } from "@/lib/weekly";
import { SANS, MONO } from "@/components/slopdar/ui";
import LeaderboardView from "@/components/LeaderboardView";
import WeeklyWinnerCard from "@/components/WeeklyWinnerCard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Leaderboard — sloppiest and most hand-crafted sites",
  description: "The web's sloppiest (Wall of Shame) and most hand-crafted (Hall of Fame) sites, scored 0–100 by Slopdar. See which sites look AI-generated.",
  alternates: { canonical: "/leaderboard" },
  openGraph: {
    title: "Slopdar Leaderboard — Wall of Shame & Hall of Fame",
    description: "The web's sloppiest and most hand-crafted sites, scored 0–100 by Slopdar.",
    url: "/leaderboard",
    type: "website",
  },
};

export default async function LeaderboardPage() {
  let shame: BoardRow[] = [];
  let fame: BoardRow[] = [];
  let total = 0;
  let weekly: WeeklyWinners | null = null;
  try {
    const [s, f, w] = await Promise.all([boardPage("shame"), boardPage("fame"), weeklyWinners()]);
    shame = s.rows;
    fame = f.rows;
    total = s.total;
    weekly = w;
  } catch {
    /* DB unavailable — render empty board */
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 900, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" }}>The board</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(34px,6vw,60px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: .96 }}>The Leaderboard</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink2)", margin: "12px 0 0", maxWidth: 520 }}>The web&apos;s sloppiest and most hand-crafted sites, scored 0–100 by Slopdar. Tap any site to see its receipts.</p>

        {(weekly?.slop || weekly?.craft) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 24 }}>
            {weekly?.slop && <WeeklyWinnerCard title="Slop of the Week" emoji="👑" winner={weekly.slop} weekStartIso={weekly.weekStart.toISOString()} />}
            {weekly?.craft && <WeeklyWinnerCard title="Craft of the Week" emoji="✨" winner={weekly.craft} weekStartIso={weekly.weekStart.toISOString()} />}
          </div>
        )}

        <LeaderboardView shame={shame} fame={fame} total={total} />

        {/* Server-rendered links for crawlers (hidden from view; the island above
            is the UI). Only the seeded first pages are linked here — the sitemap
            covers every /r/<slug>. Dedupe by slug — shame and fame overlap when
            there are < 20 sites. */}
        <div style={{ display: "none" }} aria-hidden="true">
          {Array.from(new Map([...shame, ...fame].map((r) => [r.slug, r])).values()).map((r) => (
            <Link key={r.slug} href={`/r/${r.slug}`}>{r.domain}</Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
