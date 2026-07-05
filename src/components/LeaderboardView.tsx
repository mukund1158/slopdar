"use client";

// Interactive leaderboard board (tabs, search, pagination). Rendered inside the
// server /leaderboard page, seeded with the first page of each tab. Every other
// page (and every search) is fetched from /api/leaderboard, so all scanned
// sites are reachable, not just a client-side batch. Each row links to the
// site's result page.
import { useEffect, useState } from "react";
import Link from "next/link";
import { tierOf } from "@/lib/tiers";
import { SANS, MONO, card, btnGhost, btnBrand } from "@/components/slopdar/ui";

const PAGE_SIZE = 10;

interface Row { domain: string; slug: string; score: number }
interface Board { rows: Row[]; total: number; totalPages: number }

export default function LeaderboardView({ shame, fame, total }: { shame: Row[]; fame: Row[]; total: number }) {
  const [tab, setTab] = useState<"shame" | "fame">("shame");
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const seededPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [board, setBoard] = useState<Board>({ rows: shame, total, totalPages: seededPages });

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    // The first page of each tab (unfiltered) was server-rendered — no fetch.
    if (debouncedQuery === "" && page === 0) {
      setBoard({ rows: tab === "fame" ? fame : shame, total, totalPages: seededPages });
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/leaderboard?tab=${tab}&page=${page}&q=${encodeURIComponent(debouncedQuery)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        setBoard({ rows: d.rows ?? [], total: d.total ?? 0, totalPages: Math.max(1, d.totalPages ?? 1) });
        // The server clamps out-of-range pages (e.g. the total shrank); follow it.
        if (typeof d.page === "number" && d.page !== page) setPage(d.page);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if ((err as Error)?.name !== "AbortError") setLoading(false);
      });
    return () => ctrl.abort();
  }, [tab, page, debouncedQuery, shame, fame, total, seededPages]);

  return (
    <>
      <div style={{ display: "inline-flex", marginTop: 22, background: "#F1F1F1", border: "2px solid var(--ink)", borderRadius: 11, padding: 4, gap: 4 }}>
        {(["shame", "fame"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(0); }} style={{ background: tab === t ? "#191512" : "transparent", color: tab === t ? "#fff" : "#191512", border: "none", borderRadius: 7, fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: "9px 17px", cursor: "pointer" }}>{t === "shame" ? "🔥 Wall of Shame" : "✨ Hall of Fame"}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 11, padding: "11px 14px", flex: 1, minWidth: 240, maxWidth: 420 }}>
          <span style={{ fontFamily: MONO, color: "var(--mut)", fontSize: 15 }}>⌕</span>
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="Search sites…" style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontFamily: MONO, fontSize: 14, color: "var(--ink)" }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>{board.total} {board.total === 1 ? "site" : "sites"}</span>
      </div>

      <div style={{ marginTop: 14, ...card, borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.1)", opacity: loading ? .55 : 1, transition: "opacity .15s" }}>
        {board.rows.length === 0 ? (
          <div style={{ padding: "42px 20px", textAlign: "center", fontFamily: MONO, fontSize: 13, color: "var(--mut)" }}>{debouncedQuery ? "No sites match that search." : "No sites yet. Go roast one."}</div>
        ) : board.rows.map((r, i) => {
          const t = tierOf(r.score);
          return (
            <Link key={r.slug} href={`/r/${r.slug}`} className="h-rowfaint" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", borderTop: "1px solid var(--line)", padding: "14px 20px", textAlign: "left", fontFamily: SANS, textDecoration: "none", color: "inherit" }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--mut)", minWidth: 26 }}>{String(page * PAGE_SIZE + i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: MONO, fontSize: 14, color: "var(--ink)", width: 180, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.domain}</span>
              <span style={{ flex: 1, height: 8, background: "var(--line)", borderRadius: 5, overflow: "hidden", minWidth: 50 }}><span style={{ display: "block", height: "100%", width: `${r.score}%`, background: t.color }} /></span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", textTransform: "uppercase", color: t.color, width: 118, textAlign: "right", flexShrink: 0 }}>{t.label}</span>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.03em", color: t.color, minWidth: 42, textAlign: "right" }}>{r.score}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 18 }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ ...btnGhost, fontWeight: 800, fontSize: 13, padding: "9px 16px", borderRadius: 9, opacity: page > 0 ? 1 : .3, cursor: page > 0 ? "pointer" : "default" }}>← Prev</button>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>Page {page + 1} of {board.totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(board.totalPages - 1, p + 1))} style={{ ...btnGhost, fontWeight: 800, fontSize: 13, padding: "9px 16px", borderRadius: 9, opacity: page < board.totalPages - 1 ? 1 : .3, cursor: page < board.totalPages - 1 ? "pointer" : "default" }}>Next →</button>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link href="/" className="h-brand" style={{ ...btnBrand, display: "inline-block", fontSize: 15, padding: "14px 26px", borderRadius: 12, textDecoration: "none" }}>Roast your own site →</Link>
      </div>
    </>
  );
}
