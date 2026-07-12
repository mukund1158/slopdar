// Tunable numbers for the daily "Slop or Not" game, all in one place so the
// scorer, the generator and the UI can never drift apart. See
// docs/gamification-daily-game-build-plan.md.

export const QUESTIONS_PER_GAME = 5;
export const SITES_PER_QUESTION = 2;
export const SITES_PER_GAME = QUESTIONS_PER_GAME * SITES_PER_QUESTION; // 10

/** Seconds allowed per question. Running out counts that question as wrong. */
export const SECONDS_PER_QUESTION = 10;
export const QUESTION_TIMEOUT_MS = SECONDS_PER_QUESTION * 1000;

/** Score weights, out of 100. Correct dominates so more-correct always wins. */
export const WEIGHT_CORRECT = 85;
export const WEIGHT_SPEED = 10;
export const WEIGHT_STREAK = 5;

/** Score boundary: <= 50 reads as "built", >= 51 as "slop" (matches tiers.ts). */
export const SLOP_LINE = 50;

/** How many winners each day earn a slot in the next day's games (the reward). */
export const FEATURED_PER_DAY = 3;
