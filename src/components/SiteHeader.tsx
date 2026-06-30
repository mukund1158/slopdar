"use client";

// Shared site header used on every page. Full nav on desktop; a hamburger menu
// on mobile (≤640px, see globals.css). `onLogoClick` lets the home SPA reset to
// the home screen in place; server pages omit it and the logo is a normal link.
import { useState } from "react";
import Link from "next/link";
import { MONO } from "@/components/slopdar/ui";

export default function SiteHeader({ onLogoClick }: { onLogoClick?: () => void }) {
  const [open, setOpen] = useState(false);

  const brandInner = (
    <>
      <span style={{ display: "inline-flex", filter: "drop-shadow(0 3px 0 rgba(0,0,0,.16))" }}>
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Slopdar logo">
          <rect x="1.5" y="1.5" width="37" height="37" rx="10" fill="var(--brand)" />
          <text x="20" y="29.5" textAnchor="middle" style={{ fontFamily: "var(--font-archivo), Archivo, sans-serif", fontWeight: 900, fontSize: "27px", letterSpacing: "-1px", fill: "var(--bg)" }}>S</text>
        </svg>
      </span>
      <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: 20 }}>
        <span style={{ color: "var(--ink)" }}>Slop</span><span style={{ color: "var(--brand)" }}>dar</span>
      </span>
    </>
  );
  const brandStyle = { display: "flex", alignItems: "center", gap: 11, textDecoration: "none", color: "inherit", background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: "inherit" } as const;

  const close = () => setOpen(false);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 28px", borderBottom: "2px solid var(--ink)", background: "var(--bg)" }}>
      {onLogoClick ? (
        <button onClick={onLogoClick} style={brandStyle}>{brandInner}</button>
      ) : (
        <Link href="/" style={brandStyle}>{brandInner}</Link>
      )}

      <button className="nav-burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "✕" : "☰"}
      </button>

      <nav className={`site-nav${open ? " is-open" : ""}`} style={{ fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>
        <Link href="/leaderboard" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>Leaderboard</Link>
        <Link href="/how-it-works" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>How it works</Link>
        <Link href="/about" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>About</Link>
        <span className="roasting" style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--mut)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--t1)", display: "inline-block", animation: "flick 1.5s steps(1) infinite" }} />ROASTING LIVE
        </span>
      </nav>
    </header>
  );
}
