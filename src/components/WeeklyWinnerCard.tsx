// One crowned weekly-winner card (Slop of the Week / Craft of the Week).
// Shared by the home page board section and /leaderboard so the two pages
// can never drift apart. Purely presentational: works as a server component
// on /leaderboard and inside the client island on the home page.
import Link from "next/link";
import { tierOf } from "@/lib/tiers";
import { roastSetFor } from "@/lib/roasts";
import { MONO } from "@/components/slopdar/ui";

export interface WeeklyWinner { domain: string; slug: string; score: number; screenshot: string | null }

export default function WeeklyWinnerCard({ title, emoji, winner: w, weekStartIso }: { title: string; emoji: string; winner: WeeklyWinner; weekStartIso: string }) {
  const t = tierOf(w.score);
  const roast = roastSetFor(t.label).roasts[0];
  const start = new Date(weekStartIso);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <Link href={`/r/${w.slug}`} className="h-lift" style={{ flex: "1 1 320px", minWidth: 280, display: "flex", gap: 16, alignItems: "center", background: t.tint, border: "2px solid var(--ink)", borderRadius: 16, padding: 18, boxShadow: "0 6px 0 rgba(0,0,0,.1)", textDecoration: "none", color: "inherit" }}>
      {w.screenshot && (
        <span style={{ width: 96, flexShrink: 0, border: "2px solid var(--ink)", borderRadius: 10, overflow: "hidden", background: "var(--card)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={w.screenshot} alt={`Screenshot of ${w.domain}`} style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "top" }} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ink2)", fontWeight: 600 }}>{emoji} {title} · {fmt(start)} to {fmt(end)}</span>
        <span style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
          <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.domain}</span>
          <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-.03em", color: t.color, flexShrink: 0 }}>{w.score}</span>
        </span>
        <span style={{ display: "block", fontSize: 13, lineHeight: 1.45, color: "var(--ink2)", marginTop: 4, fontStyle: "italic" }}>&ldquo;{roast}&rdquo;</span>
      </span>
    </Link>
  );
}
