// The signed-in founder's profile: a summary (avatar, handle, rank, streak) and
// the editor for their founder details + products.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProfileEditor from "@/components/ProfileEditor";
import { SANS, MONO, card } from "@/components/slopdar/ui";

export const metadata: Metadata = { title: "Your profile | Slopdar" };
export const dynamic = "force-dynamic";

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ flex: 1, border: "2px solid var(--ink)", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
      <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.03em", color: accent ?? "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mut)", marginTop: 5 }}>{label}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { handle: true, name: true, image: true, currentStreak: true, bestStreak: true },
  });
  if (!user) redirect("/");

  const today = new Date(new Date().toISOString().slice(0, 10));
  const mine = await db.playResult.findUnique({ where: { userId_day: { userId, day: today } } });
  let rank: number | null = null;
  if (mine) {
    const better = await db.playResult.count({
      where: { day: today, OR: [{ score: { gt: mine.score } }, { score: mine.score, durationMs: { lt: mine.durationMs } }] },
    });
    rank = better + 1;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 720, margin: "0 auto", padding: "36px 18px 64px" }}>
        <div style={{ ...card, borderRadius: 16, padding: 20, marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" width={48} height={48} style={{ borderRadius: "50%", border: "2px solid var(--ink)", display: "block" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid var(--ink)", background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                {(user.handle ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.02em" }}>@{user.handle ?? "player"}</div>
              {user.handle && (
                <Link href={`/u/${user.handle}`} style={{ fontFamily: MONO, fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 700 }}>
                  View your public page →
                </Link>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Stat label="Today's rank" value={rank ? `#${rank}` : "—"} accent="var(--brand)" />
            <Stat label="Current streak" value={`${user.currentStreak}`} />
            <Stat label="Best streak" value={`${user.bestStreak}`} />
          </div>
        </div>

        <ProfileEditor />
      </main>
      <SiteFooter />
    </div>
  );
}
