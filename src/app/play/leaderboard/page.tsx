// The daily game's leaderboard: today's top founders. Resets nightly; the top 3
// get their site shown in tomorrow's games.
import type { Metadata } from "next";
import Link from "next/link";
import FoundersBoard from "@/components/FoundersBoard";
import ResetCountdown from "@/components/ResetCountdown";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SANS, MONO, card, monoLabel } from "@/components/slopdar/ui";

export const metadata: Metadata = {
  title: "Daily game leaderboard: today's top founders | Slopdar",
  description: "Today's best Slop or Not players. Resets nightly. Finish in the top 3 and your site is shown to everyone in tomorrow's game.",
  alternates: { canonical: "/play/leaderboard" },
};

export const dynamic = "force-dynamic";

const REWARDS: [string, string, string][] = [
  ["🏆", "Finish top 3", "Your site is shown to every player in tomorrow's game. Real eyeballs on your product."],
  ["🔗", "Win or hold a streak", "Your product links turn dofollow on your public profile, so they pass real SEO value."],
  ["🌅", "Every midnight", "The board wipes clean. A newcomer can top it on day one, no matter who played before."],
];

export default async function PlayLeaderboardPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const { claim } = await searchParams;
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 760, margin: "0 auto", padding: "40px 18px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>
            Daily game · <ResetCountdown />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(30px,5.5vw,48px)", letterSpacing: "-.035em", lineHeight: 0.95, margin: "8px 0 0" }}>
            The founders board
          </h1>
          <p style={{ maxWidth: 480, margin: "12px auto 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink2)" }}>
            Today&apos;s sharpest players. Finish in the top 3 and your own site gets shown to everyone in tomorrow&apos;s game.
          </p>
          <div style={{ marginTop: 16 }}>
            <Link href="/play" className="h-brand" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 15, padding: "12px 24px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
              Play today&apos;s game →
            </Link>
          </div>
        </div>

        <FoundersBoard claimToken={claim} />

        {/* What winning gets you */}
        <section style={{ marginTop: 40 }}>
          <div style={{ ...monoLabel, marginBottom: 14, textAlign: "center" }}>What winning gets you</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
            {REWARDS.map(([emoji, title, desc]) => (
              <div key={title} style={{ ...card, borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 26 }}>{emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 17, marginTop: 10 }}>{title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--mut)", marginTop: 5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Get on the board */}
        <section style={{ marginTop: 22 }}>
          <div style={{ ...card, borderRadius: 16, padding: "20px 22px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between", background: "#FFF6E0" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Not on the board yet?</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: "var(--ink2)", marginTop: 4 }}>Five rounds, ten seconds each. Log in to lock your score.</div>
            </div>
            <Link href="/play" className="h-brand" style={{ background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 15, padding: "12px 22px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)", whiteSpace: "nowrap" }}>
              Play now →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
