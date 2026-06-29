// Server-rendered, crawlable per-site result page: slopdar.com/r/<slug>.
// This is the SEO/GEO surface — real HTML with the score, the receipts, and
// JSON-LD, generated from the DB. (The home page stays an interactive SPA.)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { tierOf } from "@/lib/tiers";
import { roastSetFor } from "@/lib/roasts";
import { categoryLabel } from "@/lib/categories";
import { SANS, MONO } from "@/components/slopdar/ui";

export const dynamic = "force-dynamic";

async function getCheck(slug: string) {
  return db.check.findUnique({ where: { slug }, include: { signals: true, techStacks: true } });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const check = await db.check.findUnique({
    where: { slug },
    select: { host: true, score: true, tier: true },
  });
  if (!check) return { title: "Result not found", robots: { index: false } };

  const title = `${check.host} scored ${check.score}/100 on Slopdar`;
  const description = `${check.host} looks ${check.tier} (Slop Score ${check.score}/100). See the AI and vibe-coding tells Slopdar found. Signals, not proof.`;
  const url = `/r/${slug}`;

  // og:image / twitter:image are provided automatically by opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const check = await getCheck(slug);
  if (!check) notFound();

  const tier = tierOf(check.score);
  const rset = roastSetFor(tier.label);
  const tells = check.signals.filter((s) => s.weight > 0).sort((a, b) => b.weight - a.weight);
  const human = check.signals.filter((s) => s.weight < 0);
  const ang = (check.score / 100) * 360;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Review",
    name: `Slopdar Slop Score for ${check.host}`,
    itemReviewed: { "@type": "WebSite", name: check.host, url: check.url },
    reviewRating: { "@type": "Rating", ratingValue: check.score, bestRating: 100, worstRating: 0, alternateName: tier.label },
    author: { "@type": "Organization", name: "Slopdar", url: env.APP_URL },
    reviewBody: `${check.host} scored ${check.score}/100 (${tier.label}). Slopdar found ${tells.length} AI / vibe-coding tells. These are signals, not proof.`,
    datePublished: check.createdAt.toISOString(),
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 28px", borderBottom: "2px solid var(--ink)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand)" }} />
          <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 19 }}>Slopdar</span>
        </Link>
        <nav style={{ display: "flex", gap: 22, fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
          <Link href="/leaderboard" style={{ color: "inherit", textDecoration: "none" }}>Leaderboard</Link>
          <Link href="/" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Scan a site →</Link>
        </nav>
      </header>

      <main style={{ flex: "1 0 auto" }}>
        <section style={{ background: tier.tint, borderBottom: "2px solid var(--ink)" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 28px", display: "flex", flexWrap: "wrap", gap: 34, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ flex: "0 0 auto" }}>
              <div style={{ position: "relative", width: 240, height: 240 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from 0deg, ${tier.color} 0deg ${ang}deg, #EAE5D8 ${ang}deg 360deg)`, boxShadow: `0 10px 30px ${tier.glow}` }} />
                <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "var(--card)", border: "2px solid var(--ink)" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontWeight: 900, fontSize: 88, lineHeight: .78, letterSpacing: "-.06em", color: tier.color }}>{check.score}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)", marginTop: 4 }}>slop score / 100</span>
                </div>
              </div>
              <div style={{ display: "inline-flex", fontFamily: SANS, fontWeight: 900, fontSize: 18, letterSpacing: ".02em", textTransform: "uppercase", color: "#fff", background: tier.color, border: "2px solid var(--ink)", borderRadius: 8, padding: "7px 16px", marginTop: 14, transform: "rotate(-3deg)", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>{tier.label}</div>
            </div>
            <div style={{ flex: "1 1 360px", minWidth: 300, textAlign: "left" }}>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(28px,5vw,44px)", letterSpacing: "-.03em", lineHeight: 1.02, margin: 0, wordBreak: "break-word" }}>
                Is <span style={{ color: tier.color }}>{check.host}</span> built or slop?
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.5, color: "var(--ink2)", margin: "14px 0 0", maxWidth: 540 }}>
                Slopdar scanned <strong>{check.host}</strong> and gave it a Slop Score of <strong>{check.score}/100</strong> ({tier.label}). {tells.length} AI / vibe-coding tells were found. These are signals, not proof.
              </p>
              <div style={{ background: "var(--card)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: "18px 20px", marginTop: 16, boxShadow: "0 6px 0 rgba(0,0,0,.12)" }}>
                <p style={{ margin: 0, fontSize: 19, lineHeight: 1.34, fontWeight: 600 }}>&ldquo;{rset.roasts[0]}&rdquo;</p>
              </div>
              <Link href="/" style={{ display: "inline-block", marginTop: 16, background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 11, fontWeight: 800, fontSize: 14, padding: "12px 18px", textDecoration: "none", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>Scan your own site →</Link>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1060, margin: "0 auto", padding: "34px 28px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {check.screenshot && (
              <div style={{ flex: "1 1 360px", minWidth: 300, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, padding: 20, boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 12 }}>Caught on camera</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={check.screenshot} alt={`Screenshot of ${check.host}`} style={{ display: "block", width: "100%", border: "2px solid var(--ink)", borderRadius: 10 }} />
              </div>
            )}
            <div style={{ flex: "1 1 240px", minWidth: 240, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, padding: 20, boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 12 }}>The usual suspects</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {check.techStacks.length === 0 ? <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>Nothing obvious detected.</span> :
                  check.techStacks.map((t) => <span key={t.id} style={{ fontFamily: MONO, border: "2px solid var(--ink)", fontSize: 12, padding: "5px 10px", borderRadius: 7 }}>{t.name}</span>)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 16, padding: "22px 24px", boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "2px solid var(--ink)", paddingBottom: 13 }}>
              <h2 style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.02em", margin: 0 }}>The receipts</h2>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>{tells.length} tells found</span>
            </div>
            {tells.length === 0 ? (
              <p style={{ margin: "16px 0 0", fontSize: 15, color: "var(--ink2)" }}>No tells found. Suspiciously clean. A human probably touched this. Respect.</p>
            ) : tells.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 15, padding: "14px 2px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700 }}>{r.label}</div>
                  <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 2 }}>{r.description}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--mut)", minWidth: 108, textAlign: "right" }}>{categoryLabel(r.category)}</span>
                <span style={{ fontWeight: 900, fontSize: 17, minWidth: 46, textAlign: "right", color: tier.color }}>+{r.weight}</span>
              </div>
            ))}

            {human.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 2px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#10B95E", fontWeight: 600 }}>Signs a human was here</span>
                  <span style={{ flex: 1, height: 2, background: "var(--line)" }} />
                </div>
                {human.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 15, padding: "14px 2px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontFamily: MONO, fontSize: 15, color: "#10B95E", minWidth: 22, textAlign: "center" }}>✓</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700 }}>{r.label}</div>
                      <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 2 }}>{r.description}</div>
                    </div>
                    <span style={{ fontWeight: 900, fontSize: 17, minWidth: 46, textAlign: "right", color: "#10B95E" }}>{r.weight}</span>
                  </div>
                ))}
              </>
            )}
            <p style={{ margin: "15px 0 0", fontSize: 13, color: "var(--mut)", lineHeight: 1.55, maxWidth: 640 }}>Slopdar reports <strong style={{ color: "var(--ink2)" }}>signals, not proof</strong>. A high score means a site smells templated, not that no human was ever involved.</p>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "2px solid var(--ink)", padding: "22px 28px", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>
        <span>Slopdar runs on the slop stack. We know.</span>
        <Link href="/leaderboard" style={{ color: "inherit" }}>See the leaderboard →</Link>
      </footer>
    </div>
  );
}
