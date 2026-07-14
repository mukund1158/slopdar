"use client";

// Today's founders leaderboard, in the Slopdar card style. Resets at midnight;
// the top 3 get their own site shown in tomorrow's games. Your own row is
// pinned to the top (with your rank), followed by today's top 10. Used on the
// landing page and the game leaderboard page (which also claims a just-finished
// guest game on login via the claimToken).
import { useEffect, useState } from "react";
import Link from "next/link";
import { SANS, MONO, card, monoLabel } from "@/components/slopdar/ui";

export interface BoardRow {
  rank: number;
  handle: string;
  product: string | null;
  score: number;
  correct: number;
  streak: number;
  you: boolean;
}
export interface Board {
  rows: BoardRow[];
  players: number;
  you: BoardRow | null;
}

const REWARD_PLACES = 3;
const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null);

function RowLine({ r }: { r: BoardRow }) {
  const reward = r.rank <= REWARD_PLACES;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderTop: "1px solid var(--line)",
        padding: "12px 18px",
        background: r.you ? "rgba(255,77,36,.08)" : reward ? "rgba(255,184,31,.06)" : "transparent",
        fontFamily: SANS,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--mut)", minWidth: 30, textAlign: "center" }}>
        {medal(r.rank) ?? `#${r.rank}`}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link href={`/u/${r.handle}`} className="h-brandtext" style={{ fontWeight: 800, fontSize: 15, color: "var(--ink)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.handle}
          </Link>
          {r.you && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--brand)" }}>you</span>}
        </span>
        {(r.product || reward) && (
          <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: "var(--mut)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
            {r.product}
            {r.product && reward ? " · " : ""}
            {reward ? "featured tomorrow" : ""}
          </span>
        )}
      </span>
      {r.streak > 1 && <span style={{ fontFamily: MONO, fontSize: 11.5, color: "var(--mut)", flexShrink: 0 }}>🔥{r.streak}</span>}
      <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--mut)", flexShrink: 0 }}>{r.correct}/5</span>
      <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-.03em", color: "var(--ink)", minWidth: 42, textAlign: "right" }}>{r.score}</span>
    </div>
  );
}

/** Presentational board: your row pinned on top, then today's top 10. */
export function BoardTable({ board }: { board: Board | null }) {
  const rows = board?.rows ?? [];
  const youInTop = rows.some((r) => r.you);
  const yourRow = board?.you && !youInTop ? board.you : null;
  const empty = rows.length === 0 && !yourRow;

  return (
    <div style={{ ...card, borderRadius: 16, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 18px", background: "#FFF6E0", borderBottom: "2px solid var(--ink)" }}>
        <span style={{ fontSize: 20 }}>🏆</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1 }}>Today&apos;s top founders</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--ink2)", marginTop: 3 }}>
            Resets at midnight · top 3 get their site in tomorrow&apos;s game
          </div>
        </div>
        {board && <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)" }}>{board.players} playing</span>}
      </div>

      {empty ? (
        <div style={{ padding: "26px 18px", fontFamily: MONO, fontSize: 12.5, color: "var(--mut)", textAlign: "center" }}>
          No scores yet today. Be the first on the board.
        </div>
      ) : (
        <>
          {yourRow && <RowLine r={yourRow} />}
          {yourRow && rows.length > 0 && (
            <div style={{ borderTop: "1px solid var(--line)", padding: "5px 18px", fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--mut)", background: "#fafafa" }}>
              Today&apos;s top
            </div>
          )}
          {rows.map((r) => (
            <RowLine key={`${r.rank}-${r.handle}`} r={r} />
          ))}
        </>
      )}
    </div>
  );
}

/** Self-fetching board. If given a claimToken, it locks that just-finished
 *  guest game to the signed-in user first, then loads the board. */
export default function FoundersBoard({ claimToken }: { claimToken?: string }) {
  const [board, setBoard] = useState<Board | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (claimToken) {
        await fetch("/api/play/claim", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: claimToken }),
        }).catch(() => {});
      }
      const data = await fetch("/api/play/leaderboard")
        .then((r) => r.json() as Promise<Board>)
        .catch(() => null);
      if (!cancelled && data) setBoard(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [claimToken]);

  return (
    <div>
      <div style={{ ...monoLabel, marginBottom: 10 }}>The founders board</div>
      <BoardTable board={board} />
    </div>
  );
}
