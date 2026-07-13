// The signed-in player's profile: handle, streaks, their site, today's rank.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { tierOf } from "@/lib/tiers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SANS, MONO, card, monoLabel } from "@/components/slopdar/ui";

export const metadata: Metadata = { title: "Your profile | Slopdar" };
export const dynamic = "force-dynamic";

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ flex: 1, border: "2px solid var(--ink)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-.03em", color: accent ?? "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mut)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      handle: true,
      name: true,
      image: true,
      websiteUrl: true,
      currentStreak: true,
      bestStreak: true,
      website: { select: { host: true, slug: true, score: true } },
    },
  });
  if (!user) redirect("/");

  const today = new Date(new Date().toISOString().slice(0, 10));
  const mine = await db.playResult.findUnique({ where: { userId_day: { userId, day: today } } });
  let rank: number | null = null;
  let players: number | null = null;
  if (mine) {
    const [better, total] = await Promise.all([
      db.playResult.count({
        where: { day: today, OR: [{ score: { gt: mine.score } }, { score: mine.score, durationMs: { lt: mine.durationMs } }] },
      }),
      db.playResult.count({ where: { day: today } }),
    ]);
    rank = better + 1;
    players = total;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 620, margin: "0 auto", padding: "40px 18px 64px" }}>
        <div style={{ ...card, borderRadius: 18, overflow: "hidden", boxShadow: "0 7px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 22px", background: "#FFF6E0", borderBottom: "2px solid var(--ink)" }}>
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" width={56} height={56} style={{ borderRadius: "50%", border: "2px solid var(--ink)", display: "block" }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--ink)", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 24 }}>
                {(user.handle ?? user.name ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.02em" }}>@{user.handle ?? "player"}</div>
              {user.name && <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{user.name}</div>}
            </div>
          </div>

          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Stat label="Today's rank" value={rank ? `#${rank}` : "—"} accent="var(--brand)" />
              <Stat label="Current streak" value={`${user.currentStreak}`} />
              <Stat label="Best streak" value={`${user.bestStreak}`} />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ ...monoLabel, marginBottom: 8 }}>Your site in the game</div>
              {user.website ? (
                <Link href={`/r/${user.website.slug}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...card, borderRadius: 12, padding: "12px 15px", textDecoration: "none", color: "var(--ink)" }}>
                  <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 15 }}>{user.website.host}</span>
                  <span style={{ fontWeight: 900, fontSize: 20, color: tierOf(user.website.score).color }}>{user.website.score}</span>
                </Link>
              ) : (
                <div style={{ ...card, borderRadius: 12, padding: "14px 15px", fontFamily: MONO, fontSize: 12.5, color: "var(--mut)" }}>
                  No site yet. Win a day and your site gets shown to everyone. (Adding your site comes next.)
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/play" style={{ background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "12px 20px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
                {mine ? "You've played today" : "Play today's game"}
              </Link>
              <Link href="/play/leaderboard" style={{ background: "var(--card)", color: "var(--ink)", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "12px 20px", textDecoration: "none" }}>
                Leaderboard{players ? ` · ${players} today` : ""}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
