"use client";

// The daily "Slop or Not" game. On load it deals the two websites straight away
// and drops a Play button between them; the clock only starts when you tap Play.
// Each round is a diagonal split screen; click a side to answer and the verdict
// appears in place beneath it. Five rounds, then a result card with the
// leaderboard below. Timing and scoring happen on the server.
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { tierOf } from "@/lib/tiers";
import { SANS, MONO, card, btnBrand, btnGhost, monoLabel } from "@/components/slopdar/ui";

interface MaskedSite {
  checkId: string;
  screenshot: string;
}
interface MaskedQuestion {
  index: number;
  total: number;
  prompt: string;
  secondsPerQuestion: number;
  sites: MaskedSite[];
}
interface RevealSite {
  checkId: string;
  score: number;
  tier: string;
  host: string;
  slug: string;
  featured: boolean;
  ownerHandle: string | null;
  picked: boolean;
}
interface AnswerResponse {
  correct: boolean;
  correctCheckId: string;
  reveal: RevealSite[];
  next: MaskedQuestion | null;
}
interface FinishResponse {
  correct: number;
  score: number;
  streak: number;
  breakdown: { correct: number; speed: number; streak: number };
  ranked: boolean;
  alreadyPlayedToday: boolean;
  rank: number | null;
  players: number | null;
}

type Phase = "loading" | "playing" | "done" | "played";

async function postJSON<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export default function PlayGame({ loggedIn = false }: { loggedIn?: boolean }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [question, setQuestion] = useState<MaskedQuestion | null>(null);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [armed, setArmed] = useState(false); // false until the player taps Play (round 1)
  const [marks, setMarks] = useState<boolean[]>([]);
  const [finish, setFinish] = useState<FinishResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answering = useRef(false);

  const start = useCallback(async () => {
    setError(null);
    setPhase("loading");
    setArmed(false);
    try {
      const res = await postJSON<{ alreadyPlayedToday: boolean; token?: string; question?: MaskedQuestion }>("/api/play/start");
      if (res.alreadyPlayedToday || !res.token || !res.question) {
        setPhase("played");
        return;
      }
      setToken(res.token);
      setMarks([]);
      setAnswer(null);
      setFinish(null);
      setQuestion(res.question);
      setPhase("playing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not start a game");
    }
  }, []);

  // Deal the first round once on mount. The clock does not run yet.
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void start();
  }, [start]);

  // Tapping Play starts the clock (server + client) for round 1.
  const arm = useCallback(async () => {
    if (!token || armed) return;
    try {
      await postJSON("/api/play/arm", { token });
    } catch {
      /* non-fatal: the client timer still starts */
    }
    setArmed(true);
  }, [token, armed]);

  const pick = useCallback(
    async (checkId: string, timedOut = false) => {
      if (answering.current || !token || answer) return;
      answering.current = true;
      try {
        const res = await postJSON<AnswerResponse>("/api/play/answer", { token, checkId });
        setAnswer(res);
        setMarks((m) => [...m, timedOut ? false : res.correct]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "could not submit");
      } finally {
        answering.current = false;
      }
    },
    [token, answer],
  );

  // Per-question countdown; only runs once armed and before an answer.
  useEffect(() => {
    if (phase !== "playing" || !question || !armed || answer) return;
    setTimeLeft(question.secondsPerQuestion);
    const started = Date.now();
    const id = setInterval(() => {
      const left = question.secondsPerQuestion - (Date.now() - started) / 1000;
      if (left <= 0) {
        clearInterval(id);
        setTimeLeft(0);
        void pick(question.sites[0].checkId, true);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, question, armed, answer, pick]);

  const next = useCallback(async () => {
    if (!answer) return;
    if (answer.next) {
      setQuestion(answer.next);
      setAnswer(null); // rounds 2+ are already armed (clock set server-side on answer)
      return;
    }
    setBusy(true);
    try {
      const fin = await postJSON<FinishResponse>("/api/play/finish", { token });
      setFinish(fin);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not finish the game");
    } finally {
      setBusy(false);
    }
  }, [answer, token]);

  const outer: React.CSSProperties = { width: "100%" }; // full width; the page/section controls padding

  return (
    <div style={outer}>
      {error && (
        <div style={{ ...card, borderColor: "var(--t4)", background: "#FFECEA", padding: "12px 16px", marginBottom: 16, fontFamily: MONO, fontSize: 13, textAlign: "center" }}>
          {error} <button onClick={start} style={{ ...btnGhost, marginLeft: 8, padding: "4px 10px", fontSize: 12 }}>Try again</button>
        </div>
      )}

      {phase === "loading" && !error && (
        <div style={{ ...card, borderRadius: 14, aspectRatio: "20 / 9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, color: "var(--mut)" }}>
          Dealing today&apos;s sites…
        </div>
      )}

      {phase === "playing" && question && (
        <Round q={question} answer={answer} armed={armed} timeLeft={timeLeft} onArm={arm} onPick={(id) => pick(id)} onNext={next} busy={busy} />
      )}

      {phase === "played" && (
        <div style={{ ...card, borderRadius: 18, padding: "34px 28px", textAlign: "center", boxShadow: "0 7px 0 rgba(0,0,0,.1)", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 44 }}>✅</div>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(22px,4vw,30px)", letterSpacing: "-.03em", margin: "10px 0 0" }}>You&apos;ve played today.</h2>
          <p style={{ maxWidth: 400, margin: "10px auto 0", fontSize: 15, lineHeight: 1.5, color: "var(--ink2)" }}>
            One game a day keeps it fair. Your score is locked on today&apos;s board. Come back tomorrow for a fresh set.
          </p>
          <a href="/play/leaderboard" className="h-brand" style={{ ...btnBrand, display: "inline-block", textDecoration: "none", marginTop: 20, fontSize: 15, padding: "13px 26px" }}>
            See where you rank →
          </a>
        </div>
      )}

      {phase === "done" && finish && <DoneView finish={finish} marks={marks} loggedIn={loggedIn} token={token} />}
    </div>
  );
}

function Round({
  q,
  answer,
  armed,
  timeLeft,
  onArm,
  onPick,
  onNext,
  busy,
}: {
  q: MaskedQuestion;
  answer: AnswerResponse | null;
  armed: boolean;
  timeLeft: number;
  onArm: () => void;
  onPick: (id: string) => void;
  onNext: () => void;
  busy: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const answered = Boolean(answer);
  const clickable = armed && !answered;
  const last = answered && !answer!.next;
  const pct = Math.max(0, Math.min(100, (timeLeft / q.secondsPerQuestion) * 100));
  const low = timeLeft <= 3;
  const revealBy: Record<string, RevealSite> = {};
  if (answer) for (const r of answer.reveal) revealBy[r.checkId] = r;

  const CLIP = ["polygon(0 0, 58% 0, 42% 100%, 0 100%)", "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)"];

  return (
    <div>
      {armed && (
        <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(22px,4.4vw,36px)", letterSpacing: "-.03em", margin: "0 0 14px" }}>
          {q.prompt}
        </h2>
      )}

      <div style={{ position: "relative", width: "100%", aspectRatio: "20 / 9", border: "2px solid var(--ink)", borderRadius: 14, overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,.12)", background: "#f3efe4" }}>
        {q.sites.map((s, i) => {
          const rv = revealBy[s.checkId];
          const isAnswer = answered && answer!.correctCheckId === s.checkId;
          const isPicked = rv?.picked;
          const tint = !answered ? (armed ? "transparent" : "rgba(0,0,0,.10)") : isAnswer ? "rgba(16,185,94,.30)" : isPicked ? "rgba(255,59,48,.34)" : "rgba(0,0,0,.42)";
          return (
            <button
              key={s.checkId}
              onClick={() => clickable && onPick(s.checkId)}
              onMouseEnter={() => clickable && setHover(i)}
              onMouseLeave={() => setHover(null)}
              disabled={!clickable}
              aria-label={`Site ${i === 0 ? "A" : "B"}`}
              style={{ position: "absolute", inset: 0, clipPath: CLIP[i], padding: 0, border: "none", background: "transparent", cursor: clickable ? "pointer" : "default", overflow: "hidden" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.screenshot} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: hover === i && clickable ? "brightness(1.08)" : "none", transition: "filter .12s" }} />
              <span style={{ position: "absolute", inset: 0, background: tint, transition: "background .2s" }} />
              {answered && (isAnswer || isPicked) && (
                <span style={{ position: "absolute", top: 10, [i === 0 ? "left" : "right"]: 14, fontFamily: SANS, fontWeight: 900, fontSize: 30, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,.5)" }}>
                  {isAnswer ? "✓" : "✗"}
                </span>
              )}
            </button>
          );
        })}

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <line x1="58" y1="0" x2="42" y2="100" stroke="var(--ink)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Centered overlay: Play before the round starts, a quiet VS while playing. */}
        {!answered && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            {!armed ? (
              <button
                onClick={onArm}
                className="h-brand"
                style={{ ...btnBrand, pointerEvents: "auto", borderWidth: 3, fontSize: 18, padding: "14px 28px", display: "flex", alignItems: "center", gap: 8, animation: "glowpulse 2.4s ease-in-out infinite" }}
              >
                ▶ Play
              </button>
            ) : (
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--ink)", color: "var(--bg)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 15, boxShadow: "0 4px 0 rgba(0,0,0,.25)" }}>
                VS
              </span>
            )}
          </div>
        )}
      </div>

      {/* Round + timer, below the card. */}
      {!answered && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...monoLabel, marginBottom: 7 }}>
            <span>Round {q.index + 1} / {q.total}</span>
            {armed && <span style={{ color: low ? "var(--t4)" : "var(--mut)", fontSize: 13 }}>{Math.ceil(timeLeft)}s</span>}
          </div>
          <div style={{ height: 10, background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 8, overflow: "hidden", opacity: armed ? 1 : 0.35 }}>
            <div style={{ height: "100%", width: `${armed ? pct : 100}%`, background: low && armed ? "var(--t4)" : "var(--brand)", transition: "width .1s linear" }} />
          </div>
        </div>
      )}

      {answered && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            {q.sites.map((s) => {
              const rv = revealBy[s.checkId];
              const isAnswer = answer!.correctCheckId === s.checkId;
              const t = tierOf(rv.score);
              const border = isAnswer ? "var(--t1)" : rv.picked ? "var(--t4)" : "var(--ink)";
              return (
                <div key={s.checkId} style={{ ...card, borderRadius: 12, border: `3px solid ${border}`, overflow: "hidden", boxShadow: "0 4px 0 rgba(0,0,0,.1)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "10px 13px", background: t.tint, borderBottom: "2px solid var(--ink)" }}>
                    <span style={{ fontWeight: 900, fontSize: 26, letterSpacing: "-.04em", color: t.color }}>{rv.score}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink2)" }}>{rv.tier}</span>
                  </div>
                  <div style={{ padding: "9px 13px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", color: isAnswer ? "var(--t1)" : rv.picked ? "var(--t4)" : "var(--mut)", marginBottom: 5 }}>
                      {isAnswer ? "✓ THE ANSWER" : rv.picked ? "✗ YOUR PICK" : " "}
                    </div>
                    <a href={`/r/${rv.slug}`} target="_blank" rel="noreferrer" style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, color: "var(--ink)", textDecoration: "none", borderBottom: "2px solid var(--line2)" }}>
                      {rv.host}
                    </a>
                    {rv.featured && (
                      <div style={{ marginTop: 7, display: "inline-block", fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 7, padding: "3px 7px" }}>
                        {rv.ownerHandle ? `@${rv.ownerHandle}'s site` : "featured"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button onClick={onNext} disabled={busy} className="h-brand" style={{ ...btnBrand, fontSize: 16, padding: "13px 30px", opacity: busy ? 0.6 : 1 }}>
              {busy ? "…" : last ? "See your result →" : "Next round →"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ flex: 1, border: "2px solid var(--ink)", borderRadius: 12, padding: "12px 8px", background: "var(--bg)" }}>
      <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: "-.03em", color: accent ?? "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--mut)", marginTop: 5 }}>{label}</div>
    </div>
  );
}

function DoneView({ finish, marks, loggedIn, token }: { finish: FinishResponse; marks: boolean[]; loggedIn: boolean; token: string | null }) {
  const login = () => signIn("google", { callbackUrl: `/play/leaderboard${token ? `?claim=${token}` : ""}` });
  const [copied, setCopied] = useState(false);
  const grid = marks.map((m) => (m ? "🟢" : "🔴")).join("");
  const ang = (finish.score / 100) * 360;
  const reaction = finish.correct === 5 ? "Flawless." : finish.correct === 4 ? "Sharp eye." : finish.correct >= 2 ? "Not bad." : "Slop got you.";
  const shareText = `SLOPDAR · Slop or Not\n${grid} ${finish.correct}/5 · ${finish.score} pts\nCan you spot the slop?`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/play` : "https://slopdar.com/play";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const shareX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");
  const shareLinkedIn = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");

  const rewardLine = finish.ranked
    ? finish.rank != null && finish.rank <= 3
      ? "You're in the top 3, your site gets shown to everyone tomorrow. 👀"
      : "Finish in today's top 3 and your site gets shown to everyone tomorrow."
    : null;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ ...card, borderRadius: 18, overflow: "hidden", boxShadow: "0 7px 0 rgba(0,0,0,.1)", display: "flex", flexWrap: "wrap" }}>
        {/* Hero: reaction, score ring, result grid */}
        <div style={{ flex: "1 1 300px", background: "#FFF6E0", padding: "26px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontStyle: "italic", fontSize: "clamp(24px,4.4vw,34px)", letterSpacing: "-.02em", color: "var(--brand)" }}>{reaction}</div>
          <div style={{ position: "relative", width: 172, height: 172, margin: "14px auto 0" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from 0deg, var(--brand) 0deg ${ang}deg, #eee6d0 ${ang}deg 360deg)`, boxShadow: "0 10px 28px rgba(255,77,36,.24)" }} />
            <div style={{ position: "absolute", inset: 13, borderRadius: "50%", background: "var(--card)", border: "2px solid var(--ink)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontWeight: 900, fontSize: 58, lineHeight: 0.8, letterSpacing: "-.05em", color: "var(--brand)" }}>{finish.score}</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)", marginTop: 4 }}>points / 100</span>
            </div>
          </div>
          <div style={{ fontSize: 24, letterSpacing: 2, marginTop: 14 }}>{grid}</div>
        </div>

        {/* Details: stats, reward, share */}
        <div style={{ flex: "1 1 340px", padding: "24px 24px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, textAlign: "center" }}>
            <StatTile label="Correct" value={`${finish.correct}/5`} />
            <StatTile label="Streak" value={`${finish.streak}`} />
            {finish.ranked && finish.rank != null ? (
              <StatTile label={`of ${finish.players}`} value={`#${finish.rank}`} accent="var(--brand)" />
            ) : (
              <StatTile label="Points" value={`${finish.score}`} />
            )}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)", textAlign: "center" }}>
            {finish.breakdown.correct} correct + {finish.breakdown.speed} speed + {finish.breakdown.streak} streak
          </div>

          <div style={{ textAlign: "center" }}>
            {rewardLine ? (
              <p style={{ fontSize: 13.5, color: "var(--ink2)", margin: 0 }}>{rewardLine}</p>
            ) : loggedIn ? (
              <p style={{ fontSize: 13.5, color: "var(--ink2)", margin: 0 }}>You already played your ranked game today. This one was practice.</p>
            ) : (
              <>
                <button onClick={login} className="h-brand" style={{ ...btnBrand, fontSize: 15, padding: "12px 22px" }}>
                  Log in to lock your rank
                </button>
                <p style={{ fontSize: 12, color: "var(--mut)", margin: "9px auto 0", maxWidth: 320 }}>Sign in with Google to lock this score on today&apos;s board and put your own site in the game.</p>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 9, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
            <button onClick={copy} className="h-ink" style={{ ...btnGhost, fontSize: 12.5, padding: "9px 13px" }}>{copied ? "Copied ✓" : "Copy result"}</button>
            <button onClick={shareX} className="h-ink" style={{ ...btnGhost, fontSize: 12.5, padding: "9px 13px" }}>Share on X</button>
            <button onClick={shareLinkedIn} className="h-ink" style={{ ...btnGhost, fontSize: 12.5, padding: "9px 13px" }}>LinkedIn</button>
          </div>
        </div>
      </div>
    </div>
  );
}
