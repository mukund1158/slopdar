// Scoring for one finished game, out of 100. Three parts: correct answers,
// speed, and streak, weighted 85 / 10 / 5.
//
// Design goal: more correct answers must ALWAYS beat fewer, so speed and streak
// only order players who tied on correct count. Because speed and streak are
// only earned on correct answers, the score range for k correct never overlaps
// the range for k+1 (proven in play-scoring.test.ts).
import {
  QUESTIONS_PER_GAME,
  QUESTION_TIMEOUT_MS,
  WEIGHT_CORRECT,
  WEIGHT_SPEED,
  WEIGHT_STREAK,
} from "./play-config";

export interface Answer {
  correct: boolean;
  elapsedMs: number; // time the player spent on this question
}

export interface GameScore {
  correct: number; // 0..5 answers right
  streak: number; // longest run of correct answers in a row
  score: number; // 0..100, rounded
  breakdown: { correct: number; speed: number; streak: number };
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Score a finished game from its per-question answers (server-side only). */
export function computeScore(answers: Answer[]): GameScore {
  const perCorrect = WEIGHT_CORRECT / QUESTIONS_PER_GAME; // 17
  const perSpeed = WEIGHT_SPEED / QUESTIONS_PER_GAME; // 2, earned only when correct
  const perStreakStep = WEIGHT_STREAK / QUESTIONS_PER_GAME; // 1

  let correct = 0;
  let speed = 0;
  let longest = 0;
  let run = 0;

  for (const a of answers) {
    if (!a.correct) {
      run = 0;
      continue;
    }
    correct += 1;
    run += 1;
    if (run > longest) longest = run;
    // Faster answers earn more; a timed-out (>= limit) answer earns nothing.
    speed += clamp01((QUESTION_TIMEOUT_MS - a.elapsedMs) / QUESTION_TIMEOUT_MS) * perSpeed;
  }

  const correctPoints = correct * perCorrect;
  const streakPoints = longest * perStreakStep;
  const round2 = (n: number) => Math.round(n * 100) / 100;

  return {
    correct,
    streak: longest,
    score: Math.round(correctPoints + speed + streakPoints),
    breakdown: { correct: correctPoints, speed: round2(speed), streak: streakPoints },
  };
}
