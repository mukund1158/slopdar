// The question types for the daily game. Each game shows 5 questions, each
// comparing two websites. A question type says which two score bands to draw
// the pair from (so there is always one clear answer) and which of the two is
// correct. The bands are picked with a wide gap so the answer is never
// ambiguous. Selection lives in play-generate.ts; correctness lives here.

/** "higher"/"lower" score wins, or the site closest to `near` wins. */
export type Target = "higher" | "lower" | { near: number };

export interface QuestionType {
  id: string;
  prompt: string;
  bandA: readonly [number, number]; // one site is drawn from this score range
  bandB: readonly [number, number]; // the other from this range
  target: Target; // which of the two is the correct answer
}

// Bands are chosen with a clear gap between them so the answer is obvious to a
// fair player. Score line: 0..50 is built, 51..100 is slop (see tiers.ts).
//
// Real scanned sites cluster heavily on the built (low) end: the vast majority
// score under 50 and genuinely sloppy sites are rare. So the "slop" bands treat
// 51+ as the slop side (rather than 76+/85+, which the pool can't fill), while
// keeping a clear score gap from the built band so answers stay unambiguous.
export const QUESTION_TYPES: readonly QuestionType[] = [
  {
    id: "which-slop",
    prompt: "Which one is slop?",
    bandA: [0, 25], // clearly hand-built
    bandB: [51, 100], // slop
    target: "higher",
  },
  {
    id: "which-built",
    prompt: "Which one is built by hand?",
    bandA: [0, 25],
    bandB: [51, 100],
    target: "lower",
  },
  {
    id: "which-worse",
    prompt: "Which one is worse?",
    bandA: [26, 40], // suspiciously clean, but still built
    bandB: [55, 100], // clearly slop
    target: "higher",
  },
  {
    id: "which-cleaner",
    prompt: "Which one is cleaner?",
    bandA: [0, 15], // very clean
    bandB: [35, 50], // borderline clean
    target: "lower",
  },
  {
    id: "which-band-20-30",
    prompt: "Which one scores around 20 to 30?",
    bandA: [20, 30], // the target site
    bandB: [55, 100], // clearly not in the band
    target: { near: 25 },
  },
] as const;

const byId = new Map(QUESTION_TYPES.map((q) => [q.id, q]));
export const questionTypeById = (id: string): QuestionType | undefined => byId.get(id);

/**
 * Which of two sites is the correct answer for a question type. Returns the
 * index (0 or 1) of the correct site given the two sites' scores. Ties resolve
 * to index 0, but the bands guarantee a clear gap so ties never happen in play.
 */
export function correctIndex(target: Target, scoreA: number, scoreB: number): 0 | 1 {
  if (target === "higher") return scoreA >= scoreB ? 0 : 1;
  if (target === "lower") return scoreA <= scoreB ? 0 : 1;
  const near = target.near;
  return Math.abs(scoreA - near) <= Math.abs(scoreB - near) ? 0 : 1;
}
