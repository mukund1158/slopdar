// Build one fresh game: 5 distinct questions, each a pair of real websites
// drawn from the Check pool so there is always one clear answer. Today's
// featured winner sites (the reward) are injected wherever their score fits.
//
// Every game is generated fresh and randomly, which is what stops replay
// cheating: refreshing or a private tab just yields a different game.
import { db } from "@/lib/db";
import { QUESTIONS_PER_GAME } from "./play-config";
import { QUESTION_TYPES, correctIndex, type QuestionType } from "./play-questions";

export interface GameSite {
  checkId: string;
  slug: string;
  host: string;
  screenshot: string;
  score: number; // server-side only, never send to the client before a guess
  featured: boolean; // a winner's site earning its reward slot
  ownerHandle: string | null; // shown on the reveal when featured
}

export interface GameQuestion {
  index: number; // 0..4
  questionTypeId: string;
  prompt: string;
  sites: [GameSite, GameSite]; // left, right (already shuffled)
  correctCheckId: string; // server-side only
}

export interface GeneratedGame {
  questions: GameQuestion[];
}

/** Thrown when the pool cannot fill a game (too few sites in a score band). */
export class PoolShortageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PoolShortageError";
  }
}

type CheckRow = { id: string; slug: string; host: string; screenshot: string | null; score: number };

const SELECT = { id: true, slug: true, host: true, screenshot: true, score: true } as const;
const bandKey = (min: number, max: number) => `${min}-${max}`;

/** Fisher-Yates, using Math.random (fine in app code; only Workflow scripts forbid it). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const usableWhere = (exclude: Iterable<string>) => ({
  gameHidden: false,
  scanError: null,
  screenshot: { not: null },
  id: { notIn: [...new Set(exclude)] },
});

/** Draw `count` distinct usable sites with a score in [min,max], excluding `used`. */
async function drawFromBand(min: number, max: number, count: number, used: Set<string>): Promise<CheckRow[]> {
  if (count <= 0) return [];
  const where = { ...usableWhere(used), score: { gte: min, lte: max } };
  const total = await db.check.count({ where });
  if (total < count) {
    throw new PoolShortageError(`need ${count} sites scoring ${min}-${max}, pool has ${total}`);
  }
  // Random window over the band, then shuffle, so games vary without ORDER BY RAND().
  const take = Math.min(total, Math.max(count * 6, 12));
  const skip = Math.floor(Math.random() * (total - take + 1));
  const rows = (await db.check.findMany({ where, select: SELECT, skip, take, orderBy: { id: "asc" } })) as CheckRow[];
  return shuffle(rows).slice(0, count);
}

/**
 * Generate a full game. `day` decides which featured sites are injected;
 * `excludeCheckId` drops the player's own website so they never judge it.
 */
export async function generateGame(opts: { day: Date; excludeCheckId?: string | null }): Promise<GeneratedGame> {
  const { day } = opts;
  const used = new Set<string>();
  if (opts.excludeCheckId) used.add(opts.excludeCheckId);

  // 5 distinct question types in random order.
  const types = shuffle([...QUESTION_TYPES]).slice(0, QUESTIONS_PER_GAME);

  // Every slot that needs a site: two per question (bandA, bandB).
  type Slot = { q: number; side: 0 | 1; min: number; max: number; site?: CheckRow };
  const slots: Slot[] = [];
  types.forEach((t, q) => {
    slots.push({ q, side: 0, min: t.bandA[0], max: t.bandA[1] });
    slots.push({ q, side: 1, min: t.bandB[0], max: t.bandB[1] });
  });

  // Inject today's featured winner sites into any slot whose band fits, so
  // every player sees them. A featured site the player owns is already excluded.
  const featured = await db.featuredSite.findMany({
    where: { day },
    orderBy: { rank: "asc" },
    include: { check: { select: { ...SELECT, gameHidden: true, scanError: true } }, user: { select: { handle: true } } },
  });
  const ownerHandle = new Map<string, string | null>();
  for (const f of featured) {
    const c = f.check;
    if (used.has(c.id) || c.gameHidden || c.scanError || !c.screenshot) continue;
    const slot = slots.find((s) => !s.site && !used.has(c.id) && c.score >= s.min && c.score <= s.max);
    if (!slot) continue;
    slot.site = { id: c.id, slug: c.slug, host: c.host, screenshot: c.screenshot, score: c.score };
    used.add(c.id);
    ownerHandle.set(c.id, f.user.handle);
  }

  // Fill the rest, scarcest bands first so a tight band can't be starved by a
  // looser one that overlaps it.
  const groups = new Map<string, { min: number; max: number; slots: Slot[] }>();
  for (const s of slots) {
    if (s.site) continue;
    const key = bandKey(s.min, s.max);
    (groups.get(key) ?? groups.set(key, { min: s.min, max: s.max, slots: [] }).get(key)!).slots.push(s);
  }
  const groupList = [...groups.values()];
  const counts = await Promise.all(
    groupList.map((g) => db.check.count({ where: { ...usableWhere(used), score: { gte: g.min, lte: g.max } } })),
  );
  const ordered = groupList
    .map((g, i) => ({ g, avail: counts[i] }))
    .sort((a, b) => a.avail - b.avail);

  for (const { g } of ordered) {
    const rows = await drawFromBand(g.min, g.max, g.slots.length, used);
    rows.forEach((row, i) => {
      g.slots[i].site = row;
      used.add(row.id);
    });
  }

  // Assemble the questions: mark the correct site, then shuffle left/right.
  const bySlot = (q: number, side: 0 | 1) => slots.find((s) => s.q === q && s.side === side)!.site!;
  const questions: GameQuestion[] = types.map((t: QuestionType, q) => {
    const a = bySlot(q, 0);
    const b = bySlot(q, 1);
    const correct = correctIndex(t.target, a.score, b.score) === 0 ? a : b;
    const toSite = (r: CheckRow): GameSite => ({
      checkId: r.id,
      slug: r.slug,
      host: r.host,
      screenshot: r.screenshot as string,
      score: r.score,
      featured: ownerHandle.has(r.id),
      ownerHandle: ownerHandle.get(r.id) ?? null,
    });
    const pair = shuffle([toSite(a), toSite(b)]) as [GameSite, GameSite];
    return { index: q, questionTypeId: t.id, prompt: t.prompt, sites: pair, correctCheckId: correct.id };
  });

  return { questions };
}
