"use client";

// The de-slop kit — turns the receipts into an action plan plus one
// copy-paste prompt for whatever AI tool built the site. Rendered on both the
// SPA result screen (SlopdarApp) and the crawlable /r/[slug] page.
// The prompt is gated behind a one-time email ask (stored in localStorage, so
// returning visitors are never asked twice).
import { useMemo, useRef, useState } from "react";
import { composeFixPrompt, fixableSignals, quickWinsFor, SIGNAL_FIXES } from "@/scanner/fixes";
import { MONO, SANS, card, btnBrand } from "@/components/slopdar/ui";

export interface FixItSignal {
  id: string;
  label: string;
  weight: number;
  evidence?: string;
}

type LeadAction = "copy" | "peek";

const EMAIL_STORAGE_KEY = "slopdar-fix-email";

function storedEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_STORAGE_KEY);
  } catch {
    return null; // storage blocked (private mode etc.) — the form will ask
  }
}

export default function FixItSection({ signals, accentColor, siteSlug, siteHost }: { signals: FixItSignal[]; accentColor: string; siteSlug?: string; siteHost?: string }) {
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [pending, setPending] = useState<LeadAction | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  // One row per action per visit is plenty — don't log every repeat click.
  const recorded = useRef<Set<LeadAction>>(new Set());

  const fixables = useMemo(() => fixableSignals(signals), [signals]);
  const wins = useMemo(() => quickWinsFor(signals), [signals]);
  const prompt = useMemo(() => composeFixPrompt(signals), [signals]);
  // Nothing fixable → no card. A clean site doesn't need de-slopping advice.
  if (!prompt || fixables.length === 0) return null;

  const points = fixables.reduce((sum, s) => sum + s.weight, 0);

  const recordLead = (addr: string, action: LeadAction) => {
    if (recorded.current.has(action)) return Promise.resolve();
    recorded.current.add(action);
    return fetch("/api/fix-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addr, action, slug: siteSlug, host: siteHost }),
    }).then(() => undefined, () => undefined); // never let a lost lead break the kit
  };

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked (permissions / http) — open the preview so the
      // visitor can select and copy the text by hand.
      setPromptOpen(true);
    }
  };

  const runAction = (action: LeadAction) => {
    if (action === "copy") void doCopy();
    else setPromptOpen(true);
  };

  /** Both buttons come through here: known email → straight through, else ask. */
  const gate = (action: LeadAction) => {
    if (action === "peek" && promptOpen) {
      setPromptOpen(false); // hiding is always free
      return;
    }
    const saved = storedEmail();
    if (saved) {
      void recordLead(saved, action);
      runAction(action);
      return;
    }
    setPending(action);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(addr) || addr.length > 320) {
      setEmailError("That doesn't look like an email.");
      return;
    }
    setEmailError("");
    setSending(true);
    const action = pending;
    await recordLead(addr, action ?? "copy");
    try {
      localStorage.setItem(EMAIL_STORAGE_KEY, addr);
    } catch {
      /* private mode — they'll just be asked again next visit */
    }
    setSending(false);
    setPending(null);
    if (action) runAction(action);
  };

  return (
    <div id="fix-it" style={{ marginTop: 18, ...card, padding: "22px 24px", scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, borderBottom: "2px solid var(--ink)", paddingBottom: 13 }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.02em", margin: 0 }}>Fix your slop</h2>
        {points > 0 && <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", whiteSpace: "nowrap" }}>up to {points} points on the table</span>}
      </div>

      {fixables.length > 0 && (
        <>
          <p style={{ margin: "14px 0 0", fontSize: 14, color: "var(--ink2)", lineHeight: 1.55, maxWidth: 640 }}>
            Every tell below can be cleared. Do it by hand, or copy the fix prompt and paste it into whatever built this (Claude Code, Cursor, Lovable, you name it). Then re-scan and watch the score drop.
          </p>
          {fixables.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 2px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", minWidth: 22, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{s.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accentColor, flexShrink: 0 }}>clears +{s.weight}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 3, lineHeight: 1.5 }}>{SIGNAL_FIXES[s.id].summary}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {wins.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 2px" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#10B95E", fontWeight: 600 }}>Quick wins</span>
            <span style={{ flex: 1, height: 2, background: "var(--line)" }} />
            <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)", whiteSpace: "nowrap" }}>human signs the radar rewards</span>
          </div>
          {wins.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "11px 2px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ fontFamily: MONO, fontSize: 15, color: "#10B95E", minWidth: 22, textAlign: "center", paddingTop: 1 }}>+</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}>{w.label}</span>
                <span style={{ fontSize: 13, color: "var(--mut)", marginLeft: 8 }}>{w.summary}</span>
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 18 }}>
        <button className="h-brand" onClick={() => gate("copy")} style={{ ...btnBrand, fontFamily: SANS, fontSize: 14, padding: "13px 20px" }}>
          {copied ? "Copied ✓ now go fix it" : "Copy fix prompt 📋"}
        </button>
        <button className="h-ink" onClick={() => gate("peek")} style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: MONO, fontSize: 12.5, color: "var(--ink2)", textDecoration: "underline", padding: "6px 2px" }}>
          {promptOpen ? "hide the prompt" : "peek at the prompt"}
        </button>
      </div>

      {pending && (
        <form onSubmit={submitEmail} style={{ margin: "14px 0 0", padding: "16px 18px", background: "var(--bg)", border: "2px solid var(--ink)", borderRadius: 10, maxWidth: 480 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)" }}>One thing before the prompt</div>
          <p style={{ margin: "6px 0 12px", fontSize: 13, color: "var(--ink2)", lineHeight: 1.55 }}>
            Drop your email and the fix prompt is yours. I only use it for Slopdar updates. No spam, ever.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              placeholder="you@yoursite.com"
              autoFocus
              required
              style={{ flex: "1 1 200px", minWidth: 0, padding: "11px 14px", fontFamily: MONO, fontSize: 13, color: "var(--ink)", background: "var(--card, #fff)", border: "2px solid var(--ink)", borderRadius: 8, outline: "none" }}
            />
            <button type="submit" disabled={sending} className="h-brand" style={{ ...btnBrand, fontFamily: SANS, fontSize: 13.5, padding: "11px 18px", opacity: sending ? 0.7 : 1 }}>
              {sending ? "Unlocking…" : pending === "copy" ? "Unlock + copy" : "Unlock the prompt"}
            </button>
          </div>
          {emailError && <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: "#D6453C" }}>{emailError}</div>}
        </form>
      )}

      {promptOpen && (
        <pre style={{ margin: "14px 0 0", padding: "16px 18px", background: "var(--bg)", border: "2px solid var(--ink)", borderRadius: 10, fontFamily: MONO, fontSize: 12, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 340, overflowY: "auto" }}>{prompt}</pre>
      )}

      <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "var(--mut)", lineHeight: 1.55, maxWidth: 640 }}>
        The prompt only removes the tells Slopdar can see. Making the site genuinely good is still on you.
      </p>
    </div>
  );
}
