"use client";

// Slopdar — the full single-page experience, implementing the approved design.
// Home / Scanning / Result / Unreachable / Leaderboard / Legal + Share & Badge
// modals. Home and Result are wired to the live POST /api/check scanner; the
// leaderboard reads GET /api/leaderboard. Roast/reaction copy comes from lib.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { tierOf } from "@/lib/tiers";
import { categoryLabel } from "@/lib/categories";
import { roastSetFor, pickRoast } from "@/lib/roasts";
import { roastCountLine } from "@/lib/roast-count";
import { SANS, MONO, card, btnBrand, btnGhost } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LaunchBadges from "@/components/LaunchBadges";
import WeeklyWinnerCard from "@/components/WeeklyWinnerCard";
import PlayGame from "@/components/PlayGame";

type Screen = "home" | "scanning" | "result" | "unreachable";

interface Receipt { id: string; category: string; label: string; description: string; weight: number; evidence?: string }
interface Tech { name: string; category?: string; confidence: number }
interface CheckResult {
  slug: string; url: string; host: string; score: number; tier: string;
  screenshot: string | null; title: string | null;
  signals: Receipt[]; tech: Tech[]; scanError: string | null; scannedAt?: string;
  checkCount?: number; // optional: older cached results predate the field
}
interface LeaderRow { domain: string; slug: string; score: number; checkCount?: number }
interface WeeklyWinner { domain: string; slug: string; score: number; screenshot: string | null }
interface Weekly { weekStart: string; slop: WeeklyWinner | null; craft: WeeklyWinner | null }

const SCAN_QUIPS = [
  "Sniffing for lucide icons…", "Measuring gradient blob radius…", "Counting the bento boxes…",
  "Grepping for lorem ipsum…", "Is this just a v0 export?", "Interrogating the footer…",
  "Calibrating the roast cannon…", "Detecting “seamless” density…", "Judging silently…",
];
const TELLS = [
  { no: "01", title: "Tool fingerprints", desc: "v0, Lovable, Bolt and Replit all leave marks in the markup." },
  { no: "02", title: "Default assets", desc: "The same lucide icons and shadcn buttons, never touched." },
  { no: "03", title: "The usual stack", desc: "Next.js on Vercel with Supabase, every single time." },
  { no: "04", title: "Layout tropes", desc: "Centered hero, gradient blob, the obligatory bento grid." },
  { no: "05", title: "Leftover junk", desc: "Lorem ipsum, “Your Company”, links that go nowhere." },
];
const BURNS = ["100% organic free-range slop", "is your hero just a v0 export?", "we found the lorem ipsum", "prompted, deployed, prayed over", "that gradient blob again", "certified hand-crafted?"];
const EXAMPLE_DOMAINS = ["stripe.com", "linear.app", "vercel.com"];

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Predict-before-the-reveal: lifetime radar stats live in localStorage ──
const RADAR_KEY = "slopdar-radar";
const SEEN_KEY = "slopdar-scanned-hosts"; // hosts this browser has scanned — repeats get no prediction
interface RadarStats { guesses: number; correct: number; streak: number }
function loadRadarStats(): RadarStats {
  try {
    const parsed = JSON.parse(localStorage.getItem(RADAR_KEY) ?? "");
    if (typeof parsed?.guesses === "number" && typeof parsed?.correct === "number" && typeof parsed?.streak === "number") return parsed;
  } catch { /* first visit or corrupted value — start fresh */ }
  return { guesses: 0, correct: 0, streak: 0 };
}
function saveRadarStats(stats: RadarStats) {
  try { localStorage.setItem(RADAR_KEY, JSON.stringify(stats)); } catch { /* private mode — stats just won't persist */ }
}
function loadSeenHosts(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "");
    if (Array.isArray(parsed)) return parsed.filter((h) => typeof h === "string");
  } catch { /* first visit or corrupted value */ }
  return [];
}
function markSeenHost(host: string) {
  if (loadSeenHosts().includes(host)) return;
  // Cap the list so localStorage can't grow forever; oldest entries drop off.
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...loadSeenHosts(), host].slice(-300))); } catch { /* non-fatal */ }
}
// The two calls: Built covers scores 0-50, Slop covers 51-100.
const GUESS_OPTIONS = [
  { label: "Built", emoji: "✨", color: "#10B95E", tint: "#EAF9F0", caption: "a human touched this", cls: "stamp-call-built" },
  { label: "Slop", emoji: "🔥", color: "#FF3B30", tint: "#FFECEA", caption: "prompted and prayed", cls: "stamp-call-slop" },
] as const;
// Anonymous fire-and-forget counter: did the visitor play the call or skip?
// keepalive lets the request survive an immediate navigation away.
function trackGuess(payload: { action: "call" | "skip"; correct?: boolean }) {
  try {
    fetch("/api/guess-stat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  } catch { /* non-fatal */ }
}
function displayDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}
function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo > 1 ? "s" : ""} ago`;
  const y = Math.floor(mo / 12);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

export default function SlopdarApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [toneMode, setToneMode] = useState<"roast" | "nice">("roast");
  const [roastIdx, setRoastIdx] = useState(0);
  const [roastTick, setRoastTick] = useState(0);
  const [scanQuipIdx, setScanQuipIdx] = useState(0);
  const [scanPct, setScanPct] = useState(0);
  // Falls back to the emoji until a real photo exists at /public/mukund.jpg
  const [founderImgOk, setFounderImgOk] = useState(true);
  // Predict-before-the-reveal state. The refs mirror state so the async
  // doCheck always sees the latest values. When the scan finishes before the
  // user has called it, the result parks in pendingRef and the reveal waits.
  const [guess, setGuess] = useState<string | null>(null);
  const guessRef = useRef<string | null>(null);
  const [awaitingCall, setAwaitingCall] = useState(false); // prompt shown for this scan?
  const awaitingRef = useRef(false);
  const [scanDone, setScanDone] = useState(false); // scan finished, reveal gated on the call
  const pendingRef = useRef<CheckResult | null>(null);
  const skippedRef = useRef(false);
  const [radarVerdict, setRadarVerdict] = useState<{ correct: boolean; streak: number; called: string; actual: string } | null>(null);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedDomain, setEmbedDomain] = useState("yoursite.com");
  const [embedScore, setEmbedScore] = useState<number | null>(null);

  const [board, setBoard] = useState<{ shame: LeaderRow[]; fame: LeaderRow[]; total: number; weekly?: Weekly } | null>(null);
  const [liveCount, setLiveCount] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const quipRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) setBoard(await res.json());
    } catch { /* best-effort */ }
  }, []);

  // Live "sites roasted" counter — polled so it ticks up without a refresh.
  const refreshCount = useCallback(async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.ok) setLiveCount((await res.json()).total);
    } catch { /* best-effort */ }
  }, []);

  useEffect(() => {
    refreshLeaderboard();
    refreshCount();
    // Poll only while the tab is actually visible: background tabs and
    // headless crawlers parked on the page must not keep hitting the API.
    const startPoll = () => {
      if (pollRef.current == null) pollRef.current = setInterval(refreshCount, 30000);
    };
    const stopPoll = () => {
      if (pollRef.current != null) { clearInterval(pollRef.current); pollRef.current = null; }
    };
    const onVisibility = () => {
      if (document.hidden) stopPoll();
      else { refreshCount(); startPoll(); }
    };
    if (!document.hidden) startPoll();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopPoll();
      if (quipRef.current) clearInterval(quipRef.current);
      if (progRef.current) clearInterval(progRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [refreshLeaderboard, refreshCount]);

  const cleanupScan = useCallback(() => {
    if (quipRef.current) clearInterval(quipRef.current);
    if (progRef.current) clearInterval(progRef.current);
  }, []);

  const animateScore = useCallback((target: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTimeout(() => setRevealed(true), 90);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1000);
      const e = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(target * e));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplayScore(target);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const reveal = useCallback((data: CheckResult, disp: string) => {
    setResult(data); setDomain(data.host || disp);
    setScreen("result"); animateScore(data.score);
    refreshLeaderboard();
    refreshCount();
  }, [animateScore, refreshLeaderboard, refreshCount]);

  // Score the user's call (exact tier match), persist the stats, mark the
  // host as called (each site can only ever count once), then reveal.
  const judgeAndReveal = useCallback((data: CheckResult, called: string | null, disp: string) => {
    if (called && data.scanError == null) {
      const actual = data.score >= 51 ? "Slop" : "Built";
      const isCorrect = actual === called;
      const s = loadRadarStats();
      const next = { guesses: s.guesses + 1, correct: s.correct + (isCorrect ? 1 : 0), streak: isCorrect ? s.streak + 1 : 0 };
      saveRadarStats(next);
      setRadarVerdict({ correct: isCorrect, streak: next.streak, called, actual });
      trackGuess({ action: "call", correct: isCorrect });
    }
    reveal(data, disp);
  }, [reveal]);

  const doCheck = useCallback(async (raw: string, opts: { force?: boolean } = {}) => {
    const url = raw.trim();
    if (!url) return;
    const disp = displayDomain(url);
    setScreen("scanning"); setDomain(disp); setResult(null);
    setDisplayScore(0); setRevealed(false); setToneMode("roast"); setRoastIdx(0);
    setShareOpen(false); setEmbedOpen(false); setScanPct(8); setScanQuipIdx(0);
    setGuess(null); guessRef.current = null; setRadarVerdict(null);
    skippedRef.current = false; pendingRef.current = null; setScanDone(false);
    // Only prompt for websites this browser has never scanned before.
    const prompt = !loadSeenHosts().includes(disp);
    setAwaitingCall(prompt); awaitingRef.current = prompt;

    cleanupScan();
    quipRef.current = setInterval(() => setScanQuipIdx((i) => (i + 1) % SCAN_QUIPS.length), 280);
    progRef.current = setInterval(() => setScanPct((p) => (p < 90 ? p + Math.max(1, Math.round((90 - p) * 0.08)) : p)), 200);

    try {
      const [res] = await Promise.all([
        fetch("/api/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, force: opts.force ?? false }) }),
        delay(900),
      ]);
      if (!res.ok) throw new Error("unreachable");
      const data: CheckResult = await res.json();
      cleanupScan(); setScanPct(100);
      markSeenHost(disp); // future scans of this host skip the prediction
      if (!awaitingRef.current || guessRef.current || skippedRef.current) {
        judgeAndReveal(data, guessRef.current, disp);
      } else {
        // Scan finished first — hold the reveal until the user calls or skips.
        pendingRef.current = data;
        setScanDone(true);
      }
    } catch {
      cleanupScan(); pendingRef.current = null; setScreen("unreachable");
    }
  }, [cleanupScan, judgeAndReveal]);

  const makeCall = (label: string) => {
    setGuess(label); guessRef.current = label;
    // If the scan already finished, the reveal was waiting on this call.
    if (pendingRef.current) judgeAndReveal(pendingRef.current, label, domain);
  };

  const skipCall = () => {
    skippedRef.current = true;
    setAwaitingCall(false); awaitingRef.current = false;
    trackGuess({ action: "skip" });
    if (pendingRef.current) reveal(pendingRef.current, domain);
  };

  const reset = useCallback(() => {
    cleanupScan();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setScreen("home"); setShareOpen(false); setEmbedOpen(false); setRevealed(false);
  }, [cleanupScan]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") doCheck(inputRef.current?.value ?? ""); };
  // Pasted URLs usually carry the scheme — drop it so the box shows a bare domain.
  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const cleaned = el.value.replace(/^\s*https?:\/\//i, "");
    if (cleaned !== el.value) el.value = cleaned;
  };
  const embedCodeFor = (dom: string) =>
    `<a href="https://slopdar.com/r/${dom}">\n  <img src="https://slopdar.com/badge/${dom}.svg" alt="Slopdar score" height="28">\n</a>`;
  const copyEmbed = () => {
    try { navigator.clipboard.writeText(embedCodeFor(embedDomain || "yoursite.com")); } catch { /* ignore */ }
    setEmbedCopied(true);
  };

  // Copy/Download rasterize the actual on-screen share card, so the saved image
  // matches the preview exactly.
  const shareCardRef = useRef<HTMLDivElement>(null);
  const exportCard = useCallback(async (): Promise<Blob | null> => {
    const node = shareCardRef.current;
    if (!node) return null;
    const { toBlob } = await import("html-to-image");
    return toBlob(node, { pixelRatio: 2, cacheBust: true });
  }, []);
  const copyShareImage = useCallback(async () => {
    try {
      const blob = await exportCard();
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1600);
    } catch {
      // Clipboard image write unsupported on this browser — Download still works.
    }
  }, [exportCard]);
  const downloadShareImage = useCallback(async () => {
    try {
      const blob = await exportCard();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `slopdar-${result?.host ?? "site"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [exportCard, result]);

  // Social share: post the result-page URL so X/LinkedIn render its OG card.
  const resultShareUrl = useCallback(() => (result ? `${window.location.origin}/r/${result.slug}` : ""), [result]);
  const shareToX = useCallback(() => {
    if (!result) return;
    const t = tierOf(result.score);
    // Don't put the scanned domain in the text — it looks like a URL and X would
    // link it (two URLs → X picks the wrong card). The result link carries the card.
    const text = `Scored ${result.score}/100 on Slopdar (${t.label}). Is it built or is it slop?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(resultShareUrl())}`, "_blank", "noopener");
  }, [result, resultShareUrl]);
  const shareToLinkedIn = useCallback(() => {
    if (!result) return;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resultShareUrl())}`, "_blank", "noopener");
  }, [result, resultShareUrl]);

  // ── derived (result) ─────────────────────────────────────────────────────
  const tier = useMemo(() => tierOf(result?.score ?? 0), [result]);
  const rset = useMemo(() => roastSetFor(tier.label), [tier.label]);
  const tellIds = useMemo(() => (result?.signals ?? []).filter((s) => s.weight > 0).map((s) => s.id), [result]);
  const roast = toneMode === "nice" ? rset.nice : pickRoast(tier.label, result?.slug ?? "", tellIds, roastIdx);
  const ang = (displayScore / 100) * 360;
  const maxW = Math.max(1, ...(result?.signals ?? []).map((s) => s.weight).filter((w) => w > 0));
  const isSlop = screen === "result" && (result?.score ?? 0) > 75;

  const counterFmt = (liveCount ?? board?.total ?? null) != null ? (liveCount ?? board!.total).toLocaleString("en-US") : "…";

  // ───────────────────────────── render helpers ───────────────────────────
  const Header = <SiteHeader onLogoClick={reset} />;

  const Footer = <SiteFooter />;

  const ticker = (
    <div style={{ marginTop: 30, borderTop: "2px solid var(--ink)", borderBottom: "2px solid var(--ink)", background: "var(--ink)", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", alignItems: "center", fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 18, color: "var(--bg)", padding: "11px 0", animation: "marquee 26s linear infinite" }}>
        {[0, 1].map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center" }}>{BURNS.join("   ✦   ")}   ✦   </span>
        ))}
      </div>
    </div>
  );

  function boardCard(title: string, sub: string, emoji: string, headBg: string, rowHover: string, rows: LeaderRow[]) {
    return (
      <div style={{ flex: "1 1 360px", minWidth: 300, ...card, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 18px", background: headBg, borderBottom: "2px solid var(--ink)" }}>
          <span style={{ fontSize: 21 }}>{emoji}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1 }}>{title}</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--ink2)", marginTop: 3 }}>{sub}</div>
          </div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: "22px 18px", fontFamily: MONO, fontSize: 12.5, color: "var(--mut)" }}>No sites yet. Be the first.</div>
        ) : rows.map((r, i) => (
          <button key={r.slug} className={rowHover} onClick={() => doCheck(r.domain)} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", background: "transparent", border: "none", borderTop: "1px solid var(--line)", padding: "13px 18px", cursor: "pointer", textAlign: "left", fontFamily: SANS }}>
            <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontFamily: MONO, fontSize: 13.5, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.domain}</span>
            {typeof r.checkCount === "number" && <span style={{ fontFamily: MONO, fontSize: 11.5, color: "var(--mut)", flexShrink: 0 }}>🔥 {r.checkCount}</span>}
            <span style={{ fontWeight: 900, fontSize: 23, letterSpacing: "-.03em", color: tierOf(r.score).color }}>{r.score}</span>
          </button>
        ))}
      </div>
    );
  }

  const renderHome = () => (
    <>
      <section style={{ position: "relative", maxWidth: 880, margin: "0 auto", padding: "78px 28px 30px", textAlign: "center" }}>
        <div className="hero-tag" style={{ position: "absolute", top: 120, left: "4%", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", background: "var(--t1)", color: "#fff", padding: "8px 12px", borderRadius: 8, transform: "rotate(-9deg)", animation: "wobble 4s ease-in-out infinite", boxShadow: "0 4px 0 rgba(0,0,0,.12)" }}>Certified?</div>
        <div className="hero-tag" style={{ position: "absolute", top: 150, right: "3%", fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", background: "var(--ink)", color: "var(--bg)", padding: "8px 12px", borderRadius: 8, transform: "rotate(8deg)", animation: "wobble 4.6s ease-in-out infinite", boxShadow: "0 4px 0 rgba(0,0,0,.12)" }}>100% organic slop</div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>A radar for slop · est. 2026</div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(48px,8.5vw,104px)", lineHeight: .9, letterSpacing: "-.045em", margin: "18px 0 0" }}>Is it built,<br />or is it <span style={{ fontStyle: "italic", color: "var(--brand)" }}>slop</span>?</h1>
          <p style={{ maxWidth: 520, margin: "22px auto 0", fontSize: 17, lineHeight: 1.5, color: "var(--ink2)" }}>Paste any URL. We sniff out the AI fingerprints, score the vibe 0–100, and roast it accordingly. <span style={{ color: "var(--ink)", fontWeight: 600 }}>No mercy. Some mercy. Your call.</span></p>

          <div style={{ maxWidth: 560, margin: "34px auto 0" }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "var(--card)", border: "2.5px solid var(--ink)", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 0 rgba(0,0,0,.12)" }}>
              <span style={{ display: "flex", alignItems: "center", paddingLeft: 16, color: "var(--mut)", fontFamily: MONO, fontSize: 14, userSelect: "none" }}>https://</span>
              <input ref={inputRef} onKeyDown={onKey} onInput={onInput} placeholder="any-website.com" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", color: "var(--ink)", fontFamily: MONO, fontSize: 15, padding: "17px 10px", outline: "none" }} />
            </div>
            <button className="h-brand" onClick={() => doCheck(inputRef.current?.value ?? "")} style={{ marginTop: 16, background: "var(--brand)", color: "#fff", border: "none", borderRadius: 13, fontFamily: SANS, fontWeight: 900, fontSize: 19, letterSpacing: "-.01em", padding: "17px 38px", cursor: "pointer", animation: "glowpulse 2.6s ease-in-out infinite" }}>Roast it 🔥</button>
            <div style={{ marginTop: 16, fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}><span style={{ color: "var(--ink2)", fontWeight: 600 }}>{counterFmt}</span> sites roasted · we&apos;re not judging (we are)</div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9, marginTop: 30 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mut)", alignSelf: "center" }}>Try:</span>
            {EXAMPLE_DOMAINS.map((ex) => (
              <button key={ex} className="h-ink" onClick={() => doCheck(ex)} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 10, fontFamily: MONO, fontSize: 12.5, color: "var(--ink)", padding: "8px 12px", cursor: "pointer" }}>{ex} <span style={{ fontWeight: 700, color: "var(--brand)" }}>↗</span></button>
            ))}
          </div>
        </div>
      </section>

      {ticker}

      <section style={{ ...sectionPad }} id="play">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(30px,4.8vw,46px)", letterSpacing: "-.03em", margin: 0 }}>Spot the slop</h2>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", marginTop: 5 }}>The daily game. Two sites, one question, ten seconds.</div>
          </div>
          <Link href="/play/leaderboard" className="h-underline" style={{ fontFamily: MONO, fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Leaderboard →</Link>
        </div>
        <div>
          <PlayGame />
        </div>
      </section>

      <section style={{ ...sectionPad }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(30px,4.8vw,46px)", letterSpacing: "-.03em", margin: 0 }}>The leaderboard</h2>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", marginTop: 5 }}>Updated live. Mostly slop. Tap any site to re-roast it.</div>
          </div>
          <Link href="/leaderboard" className="h-underline" style={{ fontFamily: MONO, fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>Full board →</Link>
        </div>
        {(board?.weekly?.slop || board?.weekly?.craft) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
            {board?.weekly?.slop && <WeeklyWinnerCard title="Slop of the Week" emoji="👑" winner={board.weekly.slop} weekStartIso={board.weekly.weekStart} />}
            {board?.weekly?.craft && <WeeklyWinnerCard title="Craft of the Week" emoji="✨" winner={board.weekly.craft} weekStartIso={board.weekly.weekStart} />}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {boardCard("Wall of Shame", "Today's sloppiest finds", "🔥", "#FFECEA", "h-rowshame", (board?.shame ?? []).slice(0, 5))}
          {boardCard("Hall of Fame", "Today's cleanest, allegedly", "✨", "#EAF9F0", "h-rowfame", (board?.fame ?? []).slice(0, 5))}
        </div>
      </section>

      <section style={{ ...sectionPad }}>
        <div style={{ maxWidth: 700, marginBottom: 22 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)" }}>The tells</div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(28px,4.6vw,44px)", letterSpacing: "-.03em", margin: "8px 0 0", lineHeight: .98 }}>What gives slop away</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink2)", margin: "12px 0 0" }}>Five things templates and AI builders can&apos;t help but leave behind. We check for every one, and weight them by how guilty they are.</p>
        </div>
        <div style={{ ...card, borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          {TELLS.map((t) => (
            <div key={t.no} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, padding: "18px 22px", borderTop: "1px solid var(--line)" }}>
              <span style={{ display: "inline-flex", width: 40, height: 40, flexShrink: 0, borderRadius: 10, alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 15, background: "var(--ink)", color: "#fff" }}>{t.no}</span>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink)", flex: "0 0 auto", width: 190 }}>{t.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--mut)", flex: 1, minWidth: 200 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...sectionPad }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 16 }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {[["01", "🔗", "Paste a link", "Any URL: yours, a rival's, or that startup you've been side-eyeing."],
            ["02", "📡", "We scan it", "We sniff the markup, stack, copy and assets for every AI tell we know."],
            ["03", "🔥", "Get roasted", "A 0–100 score, the receipts, and a roast worth screenshotting."]].map(([n, e, t, d]) => (
            <div key={n} style={{ ...card, borderRadius: 16, padding: 22, boxShadow: "0 5px 0 rgba(0,0,0,.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontWeight: 900, fontSize: 30, color: "var(--brand)", lineHeight: 1 }}>{n}</span><span style={{ fontSize: 26 }}>{e}</span></div>
              <div style={{ fontWeight: 900, fontSize: 19, marginTop: 14 }}>{t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--mut)", marginTop: 5 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...sectionPad }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 44, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "0 0 auto", transform: "rotate(-3deg)", background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 4, padding: "10px 10px 40px", boxShadow: "0 8px 0 rgba(0,0,0,.1)", margin: "14px 26px 0 0" }}>
            <span style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%) rotate(2deg)", width: 92, height: 24, background: "rgba(255,184,31,.75)", borderLeft: "1px dashed rgba(0,0,0,.15)", borderRight: "1px dashed rgba(0,0,0,.15)" }} />
            <span style={{ position: "absolute", right: -26, top: -14, fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", background: "var(--brand)", color: "#fff", padding: "7px 11px", borderRadius: 8, transform: "rotate(8deg)", animation: "wobble 4.6s ease-in-out infinite", boxShadow: "0 4px 0 rgba(0,0,0,.12)" }}>The human</span>
            {founderImgOk ? (
              <img src="/mukund.jpg" alt="Mukund, the person who built Slopdar" onError={() => setFounderImgOk(false)} style={{ display: "block", width: 210, aspectRatio: "1", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 210, aspectRatio: "1", background: "#FFE9D6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>👨‍💻</div>
            )}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: MONO, fontSize: 11.5, color: "var(--mut)" }}>mukund · est. 2am</div>
          </div>
          <div style={{ flex: "1 1 340px", minWidth: 280 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)" }}>Who&apos;s behind the radar</div>
            <h2 style={{ fontWeight: 900, fontStyle: "italic", fontSize: "clamp(30px,5vw,46px)", letterSpacing: "-.035em", lineHeight: .95, margin: "8px 0 0" }}>One guy.<br />Zero <span style={{ color: "var(--brand)" }}>slop</span>.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink2)", margin: "14px 0 0", maxWidth: 480 }}>Hey, I&apos;m Mukund. I built Slopdar solo: no team, no funding, just me shipping at 2am because I got suspicious of half the landing pages on the internet. If something breaks, that&apos;s also me.</p>
            <div style={{ marginTop: 18 }}>
              <Link href="/about" className="h-brandtext" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--brand)", textDecoration: "none", borderBottom: "2px solid var(--brand)", paddingBottom: 2 }}>More about me →</Link>
            </div>
          </div>
        </div>
      </section>

      <LaunchBadges />

      <section style={{ ...sectionPad }}>
        <div style={{ ...card, borderRadius: 18, padding: 30, boxShadow: "0 6px 0 rgba(0,0,0,.1)", display: "flex", flexWrap: "wrap", gap: 30, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 10 }}>Get your badge</div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(26px,4vw,40px)", letterSpacing: "-.03em", margin: 0, lineHeight: .98 }}>Wear it with pride.<br />Or shame.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink2)", margin: "14px 0 0", maxWidth: 420 }}>Scored low? Flex a Certified Hand-Crafted badge on your site. Scored high? Honestly, respect for owning it.</p>
            <button className="h-ink-strong" onClick={() => { setEmbedDomain("yoursite.com"); setEmbedScore(null); setEmbedCopied(false); setEmbedOpen(true); }} style={{ marginTop: 18, background: "var(--ink)", color: "var(--bg)", border: "none", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "12px 20px", cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>Grab the embed code →</button>
          </div>
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {[["9 · hand-crafted", "#10B95E", "#fff"], ["84 · pure slop", "#FF3B30", "#fff"], ["42 · suspiciously clean", "#FFB81F", "#191512"]].map(([txt, bg, fg]) => (
              <div key={txt} style={{ display: "inline-flex", fontFamily: MONO, fontSize: 13, border: "2px solid var(--ink)", borderRadius: 9, overflow: "hidden", boxShadow: "0 4px 0 rgba(0,0,0,.14)" }}>
                <span style={{ background: "var(--ink)", color: "var(--bg)", padding: "9px 13px", fontWeight: 600 }}>slopdar</span>
                <span style={{ background: bg, color: fg, padding: "9px 13px", fontWeight: 700 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  );

  const renderScanning = () => (
    <section style={{ maxWidth: 620, margin: "0 auto", padding: "90px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 74, marginBottom: 22 }}>📡</div>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--mut)" }}>Scanning</div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: "clamp(26px,5vw,40px)", marginTop: 6, wordBreak: "break-all" }}>{domain}</div>
      {!scanDone && (
        <div style={{ fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 20, color: "var(--brand)", marginTop: 18, minHeight: 28 }}>{SCAN_QUIPS[scanQuipIdx]}</div>
      )}
      <div style={{ maxWidth: 380, height: 12, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 8, margin: `${scanDone ? 20 : 24}px auto 0`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${scanPct}%`, background: "var(--brand)", transition: "width .3s ease" }} />
      </div>

      {/* Scan finished first: hold the reveal until the call (or skip) lands. */}
      {scanDone && awaitingCall && guess === null && (
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", marginTop: 22, color: "var(--brand)", fontWeight: 600, animation: "flick 1.2s ease-in-out infinite" }}>▸ target locked · your call unlocks the score</div>
      )}

      {/* The call: rubber-stamp buttons under the progress bar. */}
      {awaitingCall && guess === null && (
        <>
          <div style={{ display: "flex", gap: 18, margin: `${scanDone ? 26 : 36}px auto 0`, justifyContent: "center", flexWrap: "wrap", maxWidth: 560 }}>
            {GUESS_OPTIONS.map((o) => (
              <button key={o.label} className={`stamp-call ${o.cls}`} onClick={() => makeCall(o.label)} style={{ flex: "1 1 180px", maxWidth: 250, cursor: "pointer", fontFamily: SANS, borderRadius: 12, padding: "18px 12px 15px", background: o.tint, border: `3px double ${o.color}`, boxShadow: "0 0 0 2.5px var(--ink), 0 6px 0 rgba(0,0,0,.12)" }}>
                <span style={{ display: "block", fontWeight: 900, fontSize: 26, letterSpacing: ".06em", textTransform: "uppercase", color: o.color }}>{o.emoji} {o.label}</span>
                <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "var(--ink2)", marginTop: 6 }}>{o.caption}</span>
              </button>
            ))}
          </div>
          <button onClick={skipCall} className="stamp-skip" style={{ marginTop: 26, fontFamily: SANS, fontWeight: 700, fontSize: 13, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 9, padding: "9px 16px", cursor: "pointer", boxShadow: "0 3px 0 rgba(0,0,0,.1)", color: "var(--ink)" }}>Skip · just show the score</button>
        </>
      )}

      {awaitingCall && guess !== null && (
        <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 12.5, color: "var(--ink2)" }}>Call locked in: <span style={{ fontWeight: 700 }}>{guess}</span> · the radar will judge you shortly</div>
      )}
    </section>
  );

  const renderResult = () => {
    if (!result) return null;
    const signals = result.signals ?? [];
    const tells = signals.filter((s) => s.weight > 0);
    const humanHits = signals.filter((s) => s.weight < 0);
    return (
      <>
        <section style={{ position: "relative", background: tier.tint, borderBottom: "2px solid var(--ink)" }}>
          <div style={{ ...sectionWrapInner, padding: "30px 28px 36px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: "var(--ink2)" }}>
                Verdict for <span style={{ color: "var(--ink)", fontWeight: 600 }}>{domain}</span>
                {result.scannedAt && <span style={{ color: "var(--mut)" }}> · scanned {timeAgo(result.scannedAt)}</span>}
                {typeof result.checkCount === "number" && <span style={{ color: "var(--mut)" }}> · 🔥 {roastCountLine(result.checkCount)}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <button className="h-ink" onClick={() => doCheck(result.url, { force: true })} style={{ background: "var(--card)", border: "2px solid var(--ink)", color: "var(--ink)", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "9px 15px", borderRadius: 9, cursor: "pointer" }}>↻ Re-scan</button>
                <button className="h-ink" onClick={reset} style={{ background: "var(--card)", border: "2px solid var(--ink)", color: "var(--ink)", fontFamily: SANS, fontWeight: 700, fontSize: 13, padding: "9px 15px", borderRadius: 9, cursor: "pointer" }}>Roast another →</button>
              </div>
            </div>

            {radarVerdict && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, background: radarVerdict.correct ? "#EAF9F0" : "#FFECEA", border: "2px solid var(--ink)", borderRadius: 9, padding: "9px 15px", boxShadow: "0 3px 0 rgba(0,0,0,.1)" }}>
                  {radarVerdict.correct ? `📡 Called it: ${radarVerdict.actual}. Streak: ${radarVerdict.streak}` : `📡 Radar jammed. You called ${radarVerdict.called} · it's ${radarVerdict.actual}.`}
                </span>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 34, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ flex: "0 0 auto", animation: "shake .55s ease both" }}>
                <div style={{ position: "relative", width: 260, height: 260 }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from 0deg, ${tier.color} 0deg ${ang}deg, #EAE5D8 ${ang}deg 360deg)`, boxShadow: `0 10px 30px ${tier.glow}` }} />
                  <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: "var(--card)", border: "2px solid var(--ink)" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontWeight: 900, fontSize: 96, lineHeight: .78, letterSpacing: "-.06em", color: tier.color }}>{displayScore}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)", marginTop: 4 }}>slop score / 100</span>
                  </div>
                </div>
                <div style={{ display: "inline-flex", fontFamily: SANS, fontWeight: 900, fontSize: 18, letterSpacing: ".02em", textTransform: "uppercase", color: "#fff", background: tier.color, border: "2px solid var(--ink)", borderRadius: 8, padding: "7px 16px", marginTop: 14, opacity: revealed ? 1 : 0, transform: revealed ? "scale(1) rotate(-4deg)" : "scale(2.1) rotate(9deg)", transition: "opacity .4s ease .1s, transform .55s cubic-bezier(.2,1.5,.4,1) .1s", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>{tier.label}</div>
              </div>

              <div style={{ flex: "1 1 360px", minWidth: 320, textAlign: "left" }}>
                <div style={{ fontWeight: 900, fontStyle: "italic", fontSize: "clamp(40px,8vw,72px)", lineHeight: .92, color: tier.color, opacity: revealed ? 1 : 0, transform: revealed ? "scale(1) rotate(-3deg)" : "scale(.2) rotate(-14deg)", transition: "opacity .45s ease, transform .55s cubic-bezier(.2,1.6,.45,1)" }}>{rset.reaction}</div>
                <div key={roastTick} style={{ background: "var(--card)", border: "2.5px solid var(--ink)", borderRadius: 14, padding: "20px 22px", marginTop: 16, boxShadow: "0 6px 0 rgba(0,0,0,.12)", animation: `${roastTick % 2 ? "popA" : "popB"} .5s ease both` }}>
                  <p style={{ margin: 0, fontSize: 20, lineHeight: 1.34, fontWeight: 600, color: "var(--ink)" }}>&ldquo;{roast}&rdquo;</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                  <button className="h-brand" onClick={() => { setToneMode("roast"); setRoastIdx((i) => (toneMode === "nice" ? i : i + 1)); setRoastTick((t) => t + 1); }} style={{ ...btnBrand, fontSize: 14, padding: "12px 18px" }}>Roast harder 🔥</button>
                  <button className="h-ink" onClick={() => { setToneMode((m) => (m === "nice" ? "roast" : "nice")); setRoastTick((t) => t + 1); }} style={{ ...btnGhost, background: toneMode === "nice" ? "#10B95E" : "#fff", color: toneMode === "nice" ? "#fff" : "var(--ink)", fontSize: 14, padding: "12px 18px" }}>{toneMode === "nice" ? "Roast me 🔥" : "Be nice 🕊"}</button>
                  <button className="h-ink" onClick={() => setShareOpen(true)} style={{ ...btnGhost, fontSize: 14, padding: "12px 18px" }}>Share 📸</button>
                  <button className="h-ink" onClick={() => { setEmbedDomain(domain); setEmbedScore(result.score); setEmbedCopied(false); setEmbedOpen(true); }} style={{ ...btnGhost, fontSize: 14, padding: "12px 18px" }}>Get badge 🏷</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...sectionWrapInner, padding: "34px 28px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch" }}>
            <div style={{ flex: "1 1 360px", minWidth: 320, ...card, borderRadius: 16, padding: 20, boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 12 }}>Caught on camera</div>
              <div style={{ border: "2px solid var(--ink)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", background: "var(--bg)", borderBottom: "2px solid var(--ink)" }}>
                  {["#FF3B30", "#FFB81F", "#10B95E"].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }} />)}
                  <span style={{ marginLeft: 6, fontFamily: MONO, fontSize: 10, color: "var(--mut)", background: "#fff", border: "1px solid var(--line2)", borderRadius: 4, padding: "3px 9px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{domain}</span>
                </div>
                <div style={{ position: "relative", height: 198, overflow: "hidden", background: "#fbfbfc" }}>
                  {result.screenshot ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={result.screenshot} alt={`Screenshot of ${domain}`} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>No screenshot available</div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ flex: "1 1 240px", minWidth: 240, ...card, borderRadius: 16, padding: 20, boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", marginBottom: 12 }}>The usual suspects</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {result.tech.length === 0 ? <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>Nothing obvious detected.</span> :
                  result.tech.map((t) => <span key={t.name} style={{ fontFamily: MONO, border: "2px solid var(--ink)", color: "var(--ink)", fontSize: 12, padding: "5px 10px", borderRadius: 7 }}>{t.name}</span>)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, ...card, borderRadius: 16, padding: "22px 24px", boxShadow: "0 5px 0 rgba(0,0,0,.08)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "2px solid var(--ink)", paddingBottom: 13 }}>
              <h2 style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.02em", margin: 0 }}>The receipts</h2>
              <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>{tells.length} tells found</span>
            </div>
            {tells.length === 0 ? (
              <p style={{ margin: "16px 0 0", fontSize: 15, color: "var(--ink2)", lineHeight: 1.55 }}>No tells found. Suspiciously clean. A human probably touched this. Respect.</p>
            ) : tells.map((r, i) => (
              <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 2px", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", minWidth: 22, paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{r.label}</span>
                    <span style={{ fontWeight: 900, fontSize: 17, color: tier.color, flexShrink: 0 }}>+{r.weight}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 3 }}>{r.description}</div>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--line)", marginTop: 9, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.round((r.weight / maxW) * 100)}%`, background: tier.color, transformOrigin: "left", animation: "barfill .6s ease both" }} /></div>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--mut)", marginTop: 8 }}>{categoryLabel(r.category)}</div>
                </div>
              </div>
            ))}

            {humanHits.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 2px" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#10B95E", fontWeight: 600 }}>Signs a human was here</span>
                  <span style={{ flex: 1, height: 2, background: "var(--line)" }} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)", whiteSpace: "nowrap" }}>lowers the score</span>
                </div>
                {humanHits.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 2px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontFamily: MONO, fontSize: 15, color: "#10B95E", minWidth: 22, textAlign: "center", paddingTop: 2 }}>✓</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                        <span style={{ fontSize: 15.5, fontWeight: 700, color: "var(--ink)" }}>{r.label}</span>
                        <span style={{ fontWeight: 900, fontSize: 17, color: "#10B95E", flexShrink: 0 }}>{r.weight}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--mut)", marginTop: 3 }}>{r.description}</div>
                      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--mut)", marginTop: 8 }}>{categoryLabel(r.category)}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <p style={{ margin: "15px 0 0", fontSize: 13, color: "var(--mut)", lineHeight: 1.55, maxWidth: 640 }}>It&apos;s all in good fun. Slopdar reports <span style={{ color: "var(--ink2)", fontWeight: 600 }}>signals, not proof</span>. A high score means a site smells templated, not that no human was ever involved.</p>
          </div>
        </section>
      </>
    );
  };

  const renderUnreachable = () => (
    <section style={{ maxWidth: 540, margin: "0 auto", padding: "84px 28px", textAlign: "center" }}>
      <div style={{ fontSize: 64 }}>🤷</div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--brand)", marginTop: 10 }}>Can&apos;t roast what we can&apos;t reach</div>
      <h1 style={{ fontWeight: 900, fontSize: "clamp(30px,6vw,52px)", lineHeight: .95, letterSpacing: "-.03em", margin: "12px 0 0" }}>It didn&apos;t pick up.</h1>
      <p style={{ maxWidth: 380, margin: "16px auto 0", fontSize: 15, lineHeight: 1.55, color: "var(--ink2)" }}><span style={{ color: "var(--ink)", fontWeight: 700, wordBreak: "break-all" }}>{domain}</span> ghosted us. It&apos;s offline, blocking our crawler, or, let&apos;s be honest, it might not exist.</p>
      <button className="h-brand" onClick={reset} style={{ marginTop: 26, ...btnBrand, fontSize: 15, padding: "14px 28px", borderRadius: 12 }}>Try another →</button>
    </section>
  );

  // particles for the result reveal
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    left: `${4 + (i * 4.8) % 92}%`, delay: `${(i % 10) * 0.06}s`, dur: `${1.5 + (i % 5) * 0.22}s`, size: `${18 + (i % 4) * 8}px`,
  })), []);

  // Share-modal button styles (cohesive brutalist pills + a quiet ghost).
  const pillBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", color: "var(--ink)", border: "2px solid var(--ink)", borderRadius: 11, fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: "11px 16px", cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,.28)" };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", fontFamily: SANS, color: "var(--ink)" }}>
      {Header}
      <main style={{ position: "relative", zIndex: 10, flex: "1 0 auto" }}>
        {screen === "home" && renderHome()}
        {screen === "scanning" && renderScanning()}
        {screen === "result" && renderResult()}
        {screen === "unreachable" && renderUnreachable()}
      </main>
      {Footer}

      {/* particle rain + slop alarm on the result reveal */}
      {screen === "result" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 55, pointerEvents: "none", overflow: "hidden" }}>
          {particles.map((p, i) => (
            <span key={i} style={{ position: "absolute", top: 0, left: p.left, fontSize: p.size, animation: `fall ${p.dur} ease-out ${p.delay} both` }}>{rset.particle}</span>
          ))}
        </div>
      )}
      {isSlop && <div style={{ position: "fixed", inset: 0, zIndex: 54, pointerEvents: "none", boxShadow: "inset 0 0 140px rgba(255,59,48,.55)", animation: "alarm 1s ease-in-out 2" }} />}

      {/* share modal */}
      {shareOpen && result && (
        <div onClick={() => setShareOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(25,21,18,.55)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "#fff", opacity: .85, marginBottom: 14 }}>Share card · 1200 × 630</div>
          <div ref={shareCardRef} onClick={(e) => e.stopPropagation()} style={{ width: "min(92vw,720px)", aspectRatio: "1200/630", background: tier.tint, border: "3px solid var(--ink)", borderRadius: 16, boxShadow: "0 30px 80px rgba(0,0,0,.4)", position: "relative", overflow: "hidden", display: "flex", containerType: "inline-size" }}>
            <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "5% 6%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1.8%" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "5cqw", height: "5cqw", borderRadius: "1.3cqw", background: "var(--brand)" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: "3.2cqw" }}>S</span></span>
                  <span style={{ fontWeight: 900, letterSpacing: "-.02em", fontSize: "3.6cqw" }}><span style={{ color: "var(--ink)" }}>Slop</span><span style={{ color: "var(--brand)" }}>dar</span></span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: "2cqw", color: "var(--ink2)", wordBreak: "break-all" }}>{domain}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5%" }}>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: .78 }}>
                  <span style={{ fontWeight: 900, fontSize: "25cqw", letterSpacing: "-.06em", color: tier.color }}>{result.score}</span>
                  <span style={{ fontFamily: MONO, fontSize: "2.2cqw", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--mut)", paddingLeft: ".5cqw" }}>slop score / 100</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-block", background: tier.color, color: "#fff", fontWeight: 900, fontSize: "3cqw", letterSpacing: ".02em", textTransform: "uppercase", border: "2px solid var(--ink)", borderRadius: 8, padding: "1% 2.6%" }}>{tier.label}</div>
                  <p style={{ margin: "4% 0 0", fontWeight: 700, fontStyle: "italic", fontSize: "3.8cqw", lineHeight: 1.24, color: "var(--ink)" }}>&ldquo;{roast}&rdquo;</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontSize: "2cqw", color: "var(--ink2)", borderTop: "2px solid var(--ink)", paddingTop: "3%" }}>
                <span>{result.signals.filter((s) => s.weight > 0).length} tells · roasted by Slopdar</span>
                <span style={{ color: "var(--brand)", fontWeight: 600 }}>slopdar.com</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 22, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            {/* Share */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="share-btn" onClick={(e) => { e.stopPropagation(); shareToX(); }} style={pillBtn}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Post on X
              </button>
              <button className="share-btn" onClick={(e) => { e.stopPropagation(); shareToLinkedIn(); }} style={pillBtn}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                LinkedIn
              </button>
            </div>
            {/* Save */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="share-btn" onClick={(e) => { e.stopPropagation(); copyShareImage(); }} style={pillBtn}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                {shareCopied ? "Copied ✓" : "Copy"}
              </button>
              <button className="share-btn" onClick={(e) => { e.stopPropagation(); downloadShareImage(); }} style={pillBtn}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* badge / embed modal */}
      {embedOpen && (
        <div onClick={() => setEmbedOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(25,21,18,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(94vw,540px)", background: "var(--card)", border: "2.5px solid var(--ink)", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.35)", overflow: "hidden" }}>
            <div style={{ padding: "24px 24px 0" }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)" }}>Embed your badge</div>
              <h3 style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", margin: "8px 0 0" }}>Drop this on your site</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--ink2)", margin: "10px 0 0" }}>{embedScore != null ? `A live badge for ${embedDomain}. It updates automatically as the score changes.` : "Paste this into your HTML. Swap yoursite.com for your own domain and the badge auto-updates."}</p>
              <div style={{ display: "inline-flex", marginTop: 16, fontFamily: MONO, fontSize: 13, border: "2px solid var(--ink)", borderRadius: 9, overflow: "hidden", boxShadow: "0 3px 0 rgba(0,0,0,.12)" }}>
                <span style={{ background: "var(--ink)", color: "var(--bg)", padding: "8px 12px", fontWeight: 600 }}>slopdar</span>
                <span style={{ background: tierOf(embedScore ?? 16).color, color: "#fff", padding: "8px 12px", fontWeight: 700 }}>{(embedScore ?? 16)} · {tierOf(embedScore ?? 16).label.toLowerCase()}</span>
              </div>
            </div>
            <pre style={{ margin: "18px 0 0", background: "#15140f", color: "#F3EFE4", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.6, padding: "18px 22px", overflowX: "auto", whiteSpace: "pre" }}>{embedCodeFor(embedDomain || "yoursite.com")}</pre>
            <div style={{ display: "flex", gap: 10, padding: "16px 24px 22px" }}>
              <button onClick={copyEmbed} style={{ background: "var(--brand)", color: "#fff", border: "none", borderRadius: 10, fontFamily: SANS, fontWeight: 800, fontSize: 14, padding: "12px 22px", cursor: "pointer" }}>{embedCopied ? "Copied ✓" : "Copy code"}</button>
              <button onClick={() => setEmbedOpen(false)} style={{ background: "transparent", color: "var(--ink)", border: "2px solid var(--line2)", borderRadius: 10, fontFamily: SANS, fontWeight: 700, fontSize: 14, padding: "12px 20px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionPad: React.CSSProperties = { maxWidth: 1060, margin: "0 auto", padding: "56px 28px 0" };
const sectionWrapInner: React.CSSProperties = { maxWidth: 1060, margin: "0 auto" };
