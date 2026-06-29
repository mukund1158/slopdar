// Shared site header, matching the home page navbar exactly so every page is
// consistent. Plain component (no hooks) so it works in both server pages and
// the client SPA. Animations are CSS classes from globals.css.
import Link from "next/link";
import { MONO } from "@/components/slopdar/ui";

export default function SiteHeader() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 28px", borderBottom: "2px solid var(--ink)", background: "var(--bg)" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand)", display: "inline-block", animation: "blip 1.8s ease-in-out infinite" }} />
        <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 19 }}>Slopdar</span>
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: 22, fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
        <Link href="/leaderboard" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>Leaderboard</Link>
        <Link href="/how-it-works" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>How it works</Link>
        <Link href="/about" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>About</Link>
        <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--mut)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--t1)", display: "inline-block", animation: "flick 1.5s steps(1) infinite" }} />ROASTING LIVE
        </span>
      </nav>
    </header>
  );
}
