// Public founder page. Shows who they are and their products, with links back
// to each one. Links are nofollow until the founder has earned dofollow.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hasEarnedDofollow } from "@/lib/founder";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ReportButton from "@/components/ReportButton";
import { SANS, MONO, card, monoLabel } from "@/components/slopdar/ui";

export const dynamic = "force-dynamic";

const domain = (url: string) => url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
const twitterHref = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://x.com/${v.replace(/^@/, "")}`);
const linkedinHref = (v: string) => (/^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`);

async function getFounder(handle: string) {
  const user = await db.user.findUnique({
    where: { handle },
    select: {
      id: true, handle: true, name: true, image: true, bio: true, role: true, twitter: true, linkedin: true, bestStreak: true, createdAt: true,
      products: { where: { hidden: false }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, url: true, pitch: true, logoUrl: true, category: true, isPrimary: true } },
    },
  });
  if (!user) return null;
  const wins = await db.featuredSite.count({ where: { userId: user.id } });
  return { user, wins, dofollow: hasEarnedDofollow({ bestStreak: user.bestStreak, wins }) };
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const data = await getFounder(handle);
  if (!data) return { title: "Founder not found | Slopdar" };
  return {
    title: `@${data.user.handle} on Slopdar`,
    description: data.user.bio ?? `${data.user.handle}'s products and daily-game standing on Slopdar.`,
    alternates: { canonical: `/u/${data.user.handle}` },
  };
}

export default async function FounderPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await getFounder(handle);
  if (!data) notFound();
  const { user, wins, dofollow } = data;
  const rel = dofollow ? "noopener" : "nofollow noopener";
  const since = new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", width: "100%", maxWidth: 680, margin: "0 auto", padding: "40px 18px 64px" }}>
        {/* Founder */}
        <div style={{ ...card, borderRadius: 18, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 22px", background: "#FFF6E0", borderBottom: "2px solid var(--ink)" }}>
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" width={56} height={56} style={{ borderRadius: "50%", border: "2px solid var(--ink)", display: "block" }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--ink)", background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24 }}>
                {(user.handle ?? "?")[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.02em" }}>@{user.handle}</div>
              <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--ink2)", marginTop: 2 }}>{user.role || "founder"}</div>
            </div>
          </div>
          <div style={{ padding: "18px 22px" }}>
            {user.bio ? (
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{user.bio}</p>
            ) : (
              <p style={{ margin: 0, fontSize: 14, color: "var(--mut)", fontStyle: "italic" }}>No bio yet.</p>
            )}
            {(user.twitter || user.linkedin) && (
              <div style={{ display: "flex", gap: 16, marginTop: 12, fontFamily: MONO, fontSize: 12 }}>
                {user.twitter && <a href={twitterHref(user.twitter)} target="_blank" rel={rel} className="h-brandtext" style={{ color: "var(--ink2)", textDecoration: "none" }}>X ↗</a>}
                {user.linkedin && <a href={linkedinHref(user.linkedin)} target="_blank" rel={rel} className="h-brandtext" style={{ color: "var(--ink2)", textDecoration: "none" }}>LinkedIn ↗</a>}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
              <span>🔥 best streak <b style={{ color: "var(--ink)" }}>{user.bestStreak}</b></span>
              <span>🏆 featured <b style={{ color: "var(--ink)" }}>{wins}×</b></span>
              <span style={{ color: "var(--mut)" }}>since {since}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div style={{ ...monoLabel, margin: "26px 0 10px" }}>Products</div>
        {user.products.length === 0 ? (
          <div style={{ ...card, borderRadius: 14, padding: "20px", fontFamily: MONO, fontSize: 12.5, color: "var(--mut)", textAlign: "center" }}>
            No products listed yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {user.products.map((p) => (
              <div key={p.id} style={{ ...card, borderRadius: 14, padding: "16px 18px", boxShadow: "0 4px 0 rgba(0,0,0,.08)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  {p.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logoUrl} alt="" width={40} height={40} style={{ borderRadius: 9, border: "2px solid var(--ink)", objectFit: "cover", display: "block", flexShrink: 0 }} />
                  ) : null}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                      <a href={p.url} target="_blank" rel={rel} className="h-brandtext" style={{ fontWeight: 900, fontSize: 17, color: "var(--ink)", textDecoration: "none" }}>
                        {p.name} <span style={{ color: "var(--brand)" }}>↗</span>
                      </a>
                      {p.isPrimary && (
                        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 7, padding: "2px 7px", flexShrink: 0 }}>in the game</span>
                      )}
                    </div>
                    {p.category && (
                      <span style={{ display: "inline-block", marginTop: 4, fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: 6, padding: "2px 7px" }}>{p.category}</span>
                    )}
                    {p.pitch && <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--ink2)", lineHeight: 1.45 }}>{p.pitch}</p>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 11.5, color: "var(--mut)" }}>{domain(p.url)}</span>
                      <ReportButton productId={p.id} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)", marginTop: 16, textAlign: "center" }}>
          {dofollow
            ? "This founder earned dofollow links by winning the daily game."
            : "Links are nofollow. Win a day or keep a 3-day streak to make them dofollow."}
        </p>

        <div style={{ ...card, borderRadius: 16, padding: "20px", textAlign: "center", marginTop: 20, boxShadow: "0 5px 0 rgba(0,0,0,.09)" }}>
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.02em" }}>Think you can spot the slop?</div>
          <p style={{ fontSize: 13.5, color: "var(--ink2)", margin: "6px 0 14px" }}>Play the daily game, climb the founders board, and get your own site featured.</p>
          <Link href="/play" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 15, padding: "12px 24px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
            Play today&apos;s game →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
