"use client";

// Interactive leaderboard board (tabs, search, pagination). Rendered inside the
// server /leaderboard page, seeded with server-fetched rows. Each row links to
// the site's result page. Moved here from the old in-app SPA leaderboard screen.
import { useMemo, useState } from "react";
import Link from "next/link";
import { tierOf } from "@/lib/tiers";
import { SANS, MONO, card, btnGhost, btnBrand } from "@/components/slopdar/ui";

interface Row { domain: string; slug: string; score: number }

export default function LeaderboardView({ shame, fame }: { shame: Row[]; fame: Row[] }) {
  const [tab, setTab] = useState<"shame" | "fame">("shame");
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");

  const lb = useMemo(() => {
    const all = tab === "fame" ? fame : shame;
    const q = query.trim().toLowerCase();
    const filtered = q ? all.filter((r) => r.domain.toLowerCase().includes(q)) : all;
    const size = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const p = Math.min(page, totalPages - 1);
    return {
      rows: filtered.slice(p * size, p * size + size),
      empty: filtered.length === 0,
      count: `${filtered.length} ${filtered.length === 1 ? "site" : "sites"}`,
      page: p,
      totalPages,
    };
  }, [shame, fame, tab, query, page]);

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
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>{lb.count}</span>
      </div>

      <div style={{ marginTop: 14, ...card, borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
        {lb.empty ? (
          <div style={{ padding: "42px 20px", textAlign: "center", fontFamily: MONO, fontSize: 13, color: "var(--mut)" }}>No sites yet. Go roast one.</div>
        ) : lb.rows.map((r, i) => {
          const t = tierOf(r.score);
          return (
            <Link key={r.slug} href={`/r/${r.slug}`} className="h-rowfaint" style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", borderTop: "1px solid var(--line)", padding: "14px 20px", textAlign: "left", fontFamily: SANS, textDecoration: "none", color: "inherit" }}>
              <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--mut)", minWidth: 26 }}>{String(lb.page * 10 + i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: MONO, fontSize: 14, color: "var(--ink)", width: 180, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.domain}</span>
              <span style={{ flex: 1, height: 8, background: "var(--line)", borderRadius: 5, overflow: "hidden", minWidth: 50 }}><span style={{ display: "block", height: "100%", width: `${r.score}%`, background: t.color }} /></span>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".04em", textTransform: "uppercase", color: t.color, width: 118, textAlign: "right", flexShrink: 0 }}>{t.label}</span>
              <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.03em", color: t.color, minWidth: 42, textAlign: "right" }}>{r.score}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 18 }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} style={{ ...btnGhost, fontWeight: 800, fontSize: 13, padding: "9px 16px", borderRadius: 9, opacity: lb.page > 0 ? 1 : .3, cursor: lb.page > 0 ? "pointer" : "default" }}>← Prev</button>
        <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--ink2)" }}>Page {lb.page + 1} of {lb.totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(lb.totalPages - 1, p + 1))} style={{ ...btnGhost, fontWeight: 800, fontSize: 13, padding: "9px 16px", borderRadius: 9, opacity: lb.page < lb.totalPages - 1 ? 1 : .3, cursor: lb.page < lb.totalPages - 1 ? "pointer" : "default" }}>Next →</button>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Link href="/" className="h-brand" style={{ ...btnBrand, display: "inline-block", fontSize: 15, padding: "14px 26px", borderRadius: 12, textDecoration: "none" }}>Roast your own site →</Link>
      </div>
    </>
  );
}
