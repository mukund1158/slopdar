// The daily game's leaderboard: today's top founders. Resets nightly; the top 3
// get their site shown in tomorrow's games.
import type { Metadata } from "next";
import Link from "next/link";
import FoundersBoard from "@/components/FoundersBoard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SANS, MONO } from "@/components/slopdar/ui";

export const metadata: Metadata = {
  title: "Daily game leaderboard: today's top founders | Slopdar",
  description: "Today's best Slop or Not players. Resets nightly. Finish in the top 3 and your site is shown to everyone in tomorrow's game.",
  alternates: { canonical: "/play/leaderboard" },
};

export const dynamic = "force-dynamic";

export default async function PlayLeaderboardPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const { claim } = await searchParams;
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 640, margin: "0 auto", padding: "40px 18px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>Daily game</div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(30px,5.5vw,48px)", letterSpacing: "-.035em", lineHeight: 0.95, margin: "8px 0 0" }}>
            The founders board
          </h1>
          <p style={{ maxWidth: 460, margin: "12px auto 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink2)" }}>
            Today&apos;s sharpest players. Resets at midnight. Finish in the top 3 and your own site gets shown to everyone in tomorrow&apos;s game.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/play" className="h-brand" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 15, padding: "12px 24px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
              Play today&apos;s game →
            </Link>
          </div>
        </div>
        <FoundersBoard claimToken={claim} />
      </main>
      <SiteFooter />
    </div>
  );
}
