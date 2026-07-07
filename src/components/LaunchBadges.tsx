// Launch badges — the "where I launched Slopdar" wall on the home page.
//
// When a platform's official badge snippet arrives (usually an <a><img …></a>
// or an <iframe>), paste it as JSX into that platform's `embed` field below
// and set `href` to the real launch page. Until then each slot renders a
// styled Slopdar placeholder chip, so the section looks finished either way.
import { MONO } from "@/components/slopdar/ui";

interface LaunchBadge {
  name: string; // platform name shown on the placeholder chip
  href: string; // the launch page the badge links to
  embed?: React.ReactNode; // the platform's official badge snippet, as JSX
}

/* eslint-disable @next/next/no-img-element -- external badge images from the launch platforms */
const LAUNCH_BADGES: LaunchBadge[] = [
  {
    name: "Startup Fame",
    href: "https://startupfa.me/s/slopdar?utm_source=slopdar.com",
    embed: <img src="https://startupfa.me/badges/featured-badge.webp" alt="Slopdar - Featured on Startup Fame" width={171} height={54} style={{ display: "block" }} />,
  },
  {
    name: "Product Hunt",
    href: "https://www.producthunt.com/products/slopdar?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-slopdar",
    embed: <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1185162&theme=neutral&t=1783414541485" alt="Slopdar - Is it built, or is it slop? | Product Hunt" width={250} height={54} style={{ display: "block" }} />,
  },
  {
    name: "TinyLaunch",
    href: "https://tinylaunch.com",
    embed: <img src="https://tinylaunch.com/tinylaunch_badge_launching_soon.svg" alt="TinyLaunch Badge" style={{ display: "block", width: 202, height: "auto" }} />,
  },
  {
    name: "Twelve Tools",
    href: "https://twelve.tools",
    embed: <img src="https://twelve.tools/badge0-white.svg" alt="Featured on Twelve Tools" width={200} height={54} style={{ display: "block" }} />,
  },
  {
    name: "Wired Business",
    href: "https://wired.business",
    embed: <img src="https://wired.business/badge0-white.svg" alt="Featured on Wired Business" width={200} height={54} style={{ display: "block" }} />,
  },
];
/* eslint-enable @next/next/no-img-element */

// Stickers lean alternately left and right, like the hero tags.
const tilt = (i: number) => `rotate(${i % 2 === 0 ? -2 : 1.6}deg)`;

export default function LaunchBadges() {
  return (
    <section style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 28px 0" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 34, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)" }}>Out in the wild</div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(28px,4.6vw,44px)", letterSpacing: "-.03em", margin: "8px 0 0", lineHeight: .98 }}>Launched, <span style={{ fontStyle: "italic", color: "var(--brand)" }}>loudly</span>.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink2)", margin: "12px 0 0", maxWidth: 440 }}>I launched Slopdar on these platforms, live and in public. If you spotted us there, an upvote keeps the radar spinning.</p>
        </div>

        <div style={{ flex: "1 1 340px", minWidth: 280, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "center" }}>
          {LAUNCH_BADGES.map((b, i) => (
            <div key={b.name} style={{ transform: tilt(i) }}>
              {b.embed ? (
                // Real platform badge: frame it so it sits in the design.
                <a href={b.href} target="_blank" rel="noopener noreferrer" className="h-lift" aria-label={`Slopdar on ${b.name}`} style={{ display: "inline-flex", background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 12, padding: 8, boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
                  {b.embed}
                </a>
              ) : (
                // Placeholder chip until the platform's snippet is pasted in.
                <a href={b.href} target="_blank" rel="noopener noreferrer" className="h-lift" aria-label={`Slopdar on ${b.name}`} style={{ display: "inline-flex", textDecoration: "none", fontFamily: MONO, fontSize: 13, border: "2px solid var(--ink)", borderRadius: 9, overflow: "hidden", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
                  <span style={{ background: "var(--brand)", color: "#fff", padding: "10px 13px", fontWeight: 700 }}>live on</span>
                  <span style={{ background: "var(--card)", color: "var(--ink)", padding: "10px 13px", fontWeight: 700 }}>{b.name} <span style={{ color: "var(--brand)" }}>↗</span></span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
