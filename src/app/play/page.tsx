// The daily game page. Server shell; the game itself is a client component.
import type { Metadata } from "next";
import Link from "next/link";
import PlayGame from "@/components/PlayGame";
import FoundersBoard from "@/components/FoundersBoard";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSessionUserId } from "@/lib/auth";
import { SANS, MONO, card, monoLabel } from "@/components/slopdar/ui";

export const metadata: Metadata = {
  title: "Slop or Not: the daily game | Slopdar",
  description: "Two websites, one question: which is slop? Five rounds a day. Beat the clock, top the board.",
};

export const dynamic = "force-dynamic";

const RULES: [string, string, string, string][] = [
  ["01", "🖼️", "Two sites, one question", "Each round shows two real websites. Spot which one is slop, which is built by hand, which is cleaner, and so on."],
  ["02", "⏱️", "Beat the clock", "Ten seconds a round. Tap your answer fast. Quicker calls score more, and a streak earns a bonus."],
  ["03", "🏆", "Win the day", "Correct answers matter most. Finish in today's top 3 and your own site gets shown to everyone in tomorrow's game."],
];

export default async function PlayPage() {
  const loggedIn = Boolean(await getSessionUserId());
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 1060, margin: "0 auto", padding: "36px clamp(16px,3vw,44px) 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>Daily game</div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(36px,7vw,60px)", letterSpacing: "-.04em", lineHeight: 0.92, margin: "8px 0 6px" }}>
            Slop, or <span style={{ fontStyle: "italic", color: "var(--brand)" }}>not</span>?
          </h1>
          <Link href="/play/leaderboard" className="h-brandtext" style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: "var(--brand)", textDecoration: "none" }}>
            Today&apos;s leaderboard →
          </Link>
        </div>

        <PlayGame loggedIn={loggedIn} />

        {/* Top founders */}
        <section style={{ marginTop: 44 }}>
          <FoundersBoard />
        </section>

        {/* How to play */}
        <section style={{ marginTop: 44 }}>
          <div style={{ ...monoLabel, marginBottom: 14 }}>How to play</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {RULES.map(([n, emoji, title, desc]) => (
              <div key={n} style={{ ...card, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 28, color: "var(--brand)", lineHeight: 1 }}>{n}</span>
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, marginTop: 12 }}>{title}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--mut)", marginTop: 5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring note */}
        <section style={{ marginTop: 22 }}>
          <div style={{ ...card, borderRadius: 16, padding: "16px 20px", fontFamily: MONO, fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.6 }}>
            <b style={{ color: "var(--ink)" }}>Scoring:</b> out of 100. Correct answers are 85, speed is 10, streak is 5. More correct always beats fewer. Speed and streak only break ties.
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
