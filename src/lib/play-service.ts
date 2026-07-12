// The daily game's server-side brain: start a game, answer one question at a
// time, and finish. Questions are revealed one at a time and timed on the
// server (from when each question was handed out) so speed can't be faked, and
// the real scores never reach the browser until a guess is in.
//
// A game lives in Redis under an opaque token. Guest games are practice and are
// never scored; a logged-in player's first game of the day is their ranked run.
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { generateGame, PoolShortageError } from "@/lib/play-generate";
import { computeScore, type GameScore } from "@/lib/play-scoring";
import { QUESTIONS_PER_GAME, QUESTION_TIMEOUT_MS, SECONDS_PER_QUESTION } from "@/lib/play-config";
import { tierOf } from "@/lib/tiers";

const SESSION_TTL_SECONDS = 15 * 60;
const key = (token: string) => `play:g:${token}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const dayDate = (s: string) => new Date(s);

interface StoredSite {
  checkId: string;
  slug: string;
  host: string;
  screenshot: string;
  score: number;
  featured: boolean;
  ownerHandle: string | null;
}
interface StoredQuestion {
  index: number;
  questionTypeId: string;
  prompt: string;
  sites: [StoredSite, StoredSite];
  correctCheckId: string;
}
interface GameSession {
  token: string;
  userId: string | null;
  ranked: boolean; // true only for a logged-in player's first game of the day
  day: string;
  questions: StoredQuestion[];
  answers: { index: number; correct: boolean; elapsedMs: number }[];
  currentIndex: number;
  shownAt: number; // ms epoch when currentIndex was handed to the client
  finished: boolean;
}

// The shared redis client is lazy-connect with the offline queue off, so a
// command issued before the socket is ready throws. The game can't degrade
// without its session store, so make sure we're connected first.
let redisReady: Promise<void> | null = null;
async function ensureRedis(): Promise<void> {
  if ((redis.status as string) === "ready") return;
  // Memoize so concurrent callers share one listener (no leak) and one connect.
  if (!redisReady) {
    redisReady = new Promise<void>((resolve) => {
      const done = () => {
        redis.off("ready", done);
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(done, 3000); // never hang the request forever
      redis.once("ready", done);
      const status = redis.status as string;
      if (status === "wait" || status === "end") redis.connect().catch(() => {});
      else if (status === "ready") done();
    }).finally(() => {
      redisReady = null;
    });
  }
  await redisReady;
}

async function load(token: string): Promise<GameSession | null> {
  await ensureRedis();
  const raw = await redis.get(key(token));
  return raw ? (JSON.parse(raw) as GameSession) : null;
}
async function save(s: GameSession): Promise<void> {
  await ensureRedis();
  await redis.set(key(s.token), JSON.stringify(s), "EX", SESSION_TTL_SECONDS);
}

/** The current question, with everything the player must not see stripped out. */
function maskedQuestion(s: GameSession) {
  const q = s.questions[s.currentIndex];
  return {
    index: q.index,
    total: QUESTIONS_PER_GAME,
    prompt: q.prompt,
    secondsPerQuestion: SECONDS_PER_QUESTION,
    sites: q.sites.map((site) => ({ checkId: site.checkId, screenshot: site.screenshot })),
  };
}

export interface StartResult {
  token: string;
  ranked: boolean;
  alreadyPlayedToday: boolean;
  question: ReturnType<typeof maskedQuestion>;
}

/** Begin a fresh game. Identity (guest vs logged-in) is fixed here. */
export async function startGame(userId: string | null): Promise<StartResult> {
  const day = todayStr();

  // Ranked = logged in AND haven't already recorded a game today.
  let alreadyPlayedToday = false;
  let excludeCheckId: string | null = null;
  if (userId) {
    const [existing, user] = await Promise.all([
      db.playResult.findUnique({ where: { userId_day: { userId, day: dayDate(day) } }, select: { id: true } }),
      db.user.findUnique({ where: { id: userId }, select: { websiteCheckId: true } }),
    ]);
    alreadyPlayedToday = Boolean(existing);
    excludeCheckId = user?.websiteCheckId ?? null;
  }

  const game = await generateGame({ day: dayDate(day), excludeCheckId });
  const session: GameSession = {
    token: randomUUID(),
    userId,
    ranked: Boolean(userId) && !alreadyPlayedToday,
    day,
    questions: game.questions,
    answers: [],
    currentIndex: 0,
    shownAt: Date.now(),
    finished: false,
  };
  await save(session);
  return { token: session.token, ranked: session.ranked, alreadyPlayedToday, question: maskedQuestion(session) };
}

/** Start the clock for the current (first) question, called when the player
 *  taps Play, so the page-load-to-Play gap never counts against them. */
export async function armGame(token: string): Promise<void> {
  const s = await load(token);
  if (!s) throw new PlayError("game not found or expired", 404);
  if (s.finished) throw new PlayError("game already finished", 409);
  s.shownAt = Date.now();
  await save(s);
}

export interface AnswerResult {
  correct: boolean;
  correctCheckId: string;
  reveal: {
    checkId: string;
    score: number;
    tier: string;
    host: string;
    slug: string;
    featured: boolean;
    ownerHandle: string | null;
    picked: boolean;
  }[];
  next: ReturnType<typeof maskedQuestion> | null;
}

/** Answer the current question. Timing is measured from when it was handed out. */
export async function submitAnswer(token: string, choiceCheckId: string): Promise<AnswerResult> {
  const s = await load(token);
  if (!s) throw new PlayError("game not found or expired", 404);
  if (s.finished || s.currentIndex >= QUESTIONS_PER_GAME) throw new PlayError("game already finished", 409);

  const q = s.questions[s.currentIndex];
  const validChoice = q.sites.some((site) => site.checkId === choiceCheckId);
  if (!validChoice) throw new PlayError("choice is not one of the two sites", 400);

  const elapsed = Date.now() - s.shownAt;
  const timedOut = elapsed >= QUESTION_TIMEOUT_MS;
  const correct = !timedOut && choiceCheckId === q.correctCheckId;
  s.answers.push({ index: q.index, correct, elapsedMs: Math.min(elapsed, QUESTION_TIMEOUT_MS) });

  const reveal = q.sites.map((site) => ({
    checkId: site.checkId,
    score: site.score,
    tier: tierOf(site.score).label,
    host: site.host,
    slug: site.slug,
    featured: site.featured,
    ownerHandle: site.ownerHandle,
    picked: site.checkId === choiceCheckId,
  }));

  s.currentIndex += 1;
  const done = s.currentIndex >= QUESTIONS_PER_GAME;
  if (!done) s.shownAt = Date.now();
  await save(s);

  return { correct, correctCheckId: q.correctCheckId, reveal, next: done ? null : maskedQuestion(s) };
}

export interface FinishResult {
  correct: number;
  score: number;
  streak: number;
  breakdown: GameScore["breakdown"];
  ranked: boolean;
  alreadyPlayedToday: boolean;
  rank: number | null;
  players: number | null;
}

/** Finish the game: score it and, for a ranked run, save the result + streak. */
export async function finishGame(token: string): Promise<FinishResult> {
  const s = await load(token);
  if (!s) throw new PlayError("game not found or expired", 404);
  if (s.currentIndex < QUESTIONS_PER_GAME) throw new PlayError("game not complete", 409);

  const scored = computeScore(s.answers);
  const durationMs = s.answers.reduce((sum, a) => sum + a.elapsedMs, 0);

  let rank: number | null = null;
  let players: number | null = null;
  let alreadyPlayedToday = false;

  if (s.ranked && s.userId) {
    const day = dayDate(s.day);
    const persisted = await recordRankedResult(s.userId, day, scored, durationMs);
    alreadyPlayedToday = !persisted.created;
    const mine = persisted.result;
    [rank, players] = await Promise.all([
      db.playResult
        .count({
          where: {
            day,
            OR: [{ score: { gt: mine.score } }, { score: mine.score, durationMs: { lt: mine.durationMs } }],
          },
        })
        .then((better) => better + 1),
      db.playResult.count({ where: { day } }),
    ]);
  }

  s.finished = true;
  await save(s);

  return {
    correct: scored.correct,
    score: scored.score,
    streak: scored.streak,
    breakdown: scored.breakdown,
    ranked: s.ranked,
    alreadyPlayedToday,
    rank,
    players,
  };
}

export interface ClaimResult {
  recorded: boolean; // false if the user already had a result today
  score: number;
  correct: number;
  rank: number | null;
  players: number | null;
}

/** Attach a just-finished guest game to a now-logged-in user (one result / day). */
export async function claimGame(token: string, userId: string): Promise<ClaimResult> {
  const s = await load(token);
  if (!s) throw new PlayError("game not found or expired", 404);
  if (s.currentIndex < QUESTIONS_PER_GAME) throw new PlayError("game not complete", 409);

  const scored = computeScore(s.answers);
  const durationMs = s.answers.reduce((sum, a) => sum + a.elapsedMs, 0);
  const day = dayDate(s.day);
  const persisted = await recordRankedResult(userId, day, scored, durationMs);
  const mine = persisted.result;
  const [better, players] = await Promise.all([
    db.playResult.count({
      where: { day, OR: [{ score: { gt: mine.score } }, { score: mine.score, durationMs: { lt: mine.durationMs } }] },
    }),
    db.playResult.count({ where: { day } }),
  ]);
  return { recorded: persisted.created, score: mine.score, correct: mine.correct, rank: better + 1, players };
}

/** Write the ranked result and advance the daily streak, atomically. */
async function recordRankedResult(userId: string, day: Date, s: GameScore, durationMs: number) {
  return db.$transaction(async (tx) => {
    const existing = await tx.playResult.findUnique({ where: { userId_day: { userId, day } } });
    if (existing) return { created: false, result: existing };

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { lastPlayedDay: true, currentStreak: true, bestStreak: true },
    });
    let current = 1;
    if (user?.lastPlayedDay) {
      const diffDays = Math.round((day.getTime() - user.lastPlayedDay.getTime()) / 86_400_000);
      if (diffDays === 1) current = user.currentStreak + 1;
      else if (diffDays === 0) current = Math.max(1, user.currentStreak);
    }
    const best = Math.max(user?.bestStreak ?? 0, current);
    await tx.user.update({ where: { id: userId }, data: { lastPlayedDay: day, currentStreak: current, bestStreak: best } });

    const result = await tx.playResult.create({
      data: { userId, day, correct: s.correct, score: s.score, streak: s.streak, durationMs },
    });
    return { created: true, result };
  });
}

/** Carries an HTTP status so routes can map service errors to responses. */
export class PlayError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "PlayError";
    this.status = status;
  }
}

export { PoolShortageError };
