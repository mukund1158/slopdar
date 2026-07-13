"use client";

// Shared site header used on every page. Full nav on desktop; a hamburger menu
// on mobile (≤640px, see globals.css). `onLogoClick` lets the home SPA reset to
// the home screen in place; server pages omit it and the logo is a normal link.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { MONO } from "@/components/slopdar/ui";

const itemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "11px 16px",
  fontFamily: MONO,
  fontSize: 12.5,
  color: "var(--ink)",
  textDecoration: "none",
  background: "none",
  border: 0,
  cursor: "pointer",
};

/** A click-to-open menu that closes on outside click or item selection. */
function Dropdown({ label, triggerStyle, children }: { label: React.ReactNode; triggerStyle: React.CSSProperties; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button onClick={() => setOpen((o) => !o)} style={triggerStyle} aria-expanded={open}>
        {label} <span style={{ fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, minWidth: 172, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 12, boxShadow: "0 6px 0 rgba(0,0,0,.14)", overflow: "hidden", zIndex: 60 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader({ onLogoClick }: { onLogoClick?: () => void }) {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = status === "authenticated" ? session?.user : null;

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
  const gameTrigger: React.CSSProperties = { background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "var(--brand)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 };
  const profileTrigger: React.CSSProperties = { background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "var(--ink)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7 };

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
        <Dropdown label="Game" triggerStyle={gameTrigger}>
          <Link href="/play" className="h-rowfaint" style={itemStyle} onClick={close}>Play</Link>
          <Link href="/play/leaderboard" className="h-rowfaint" style={{ ...itemStyle, borderTop: "1px solid var(--line)" }} onClick={close}>Leaderboard</Link>
        </Dropdown>
        <Link href="/leaderboard" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>Leaderboard</Link>
        <Link href="/how-it-works" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>How it works</Link>
        <Link href="/about" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }} onClick={close}>About</Link>
        {user ? (
          <Dropdown
            label={
              <>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" width={22} height={22} style={{ borderRadius: "50%", border: "1.5px solid var(--ink)", display: "block" }} />
                ) : null}
                <span>@{user.handle ?? user.name ?? "you"}</span>
              </>
            }
            triggerStyle={profileTrigger}
          >
            <Link href="/profile" className="h-rowfaint" style={itemStyle} onClick={close}>Profile</Link>
            <button className="h-rowfaint" style={{ ...itemStyle, borderTop: "1px solid var(--line)" }} onClick={() => { close(); signOut(); }}>Sign out</button>
          </Dropdown>
        ) : (
          <button onClick={() => signIn("google")} className="h-brandtext" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "var(--brand)", fontWeight: 700 }}>
            Log in
          </button>
        )}
      </nav>
    </header>
  );
}
