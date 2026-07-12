// Scoring math for the daily game, and the key guarantee: more correct answers
// always beats fewer, no matter how fast or streaky the lower score is.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeScore, type Answer } from "./play-scoring";
import { QUESTIONS_PER_GAME, QUESTION_TIMEOUT_MS } from "./play-config";

const answers = (pattern: boolean[], elapsedMs: number): Answer[] =>
  pattern.map((correct) => ({ correct, elapsedMs }));

test("all 5 correct and instant scores a perfect 100", () => {
  const s = computeScore(answers([true, true, true, true, true], 0));
  assert.equal(s.correct, 5);
  assert.equal(s.streak, 5);
  assert.equal(s.score, 100);
});

test("all 5 correct in 3 seconds scores 97 (matches the plan example)", () => {
  const s = computeScore(answers([true, true, true, true, true], 3000));
  assert.equal(s.score, 97); // 85 + (5 * 1.4) + 5
});

test("all 5 correct but at the buzzer earns no speed: 90", () => {
  const s = computeScore(answers([true, true, true, true, true], QUESTION_TIMEOUT_MS));
  assert.equal(s.score, 90); // 85 + 0 + 5
});

test("wrong answers earn nothing and reset the streak", () => {
  const s = computeScore([
    { correct: true, elapsedMs: 0 },
    { correct: true, elapsedMs: 0 },
    { correct: false, elapsedMs: 0 },
    { correct: true, elapsedMs: 0 },
    { correct: false, elapsedMs: 0 },
  ]);
  assert.equal(s.correct, 3);
  assert.equal(s.streak, 2); // longest run is the first two
});

test("more correct ALWAYS wins: max score for k never reaches min for k+1", () => {
  // Brute-force every correctness pattern over the 5 questions. For each, the
  // best case is all-instant (max speed) and the worst is at-the-buzzer (no
  // speed). Aggregate the achievable score range per correct-count, then prove
  // the ranges never overlap.
  const n = QUESTIONS_PER_GAME;
  const maxByK = Array(n + 1).fill(-Infinity);
  const minByK = Array(n + 1).fill(Infinity);

  for (let mask = 0; mask < 1 << n; mask++) {
    const pattern = Array.from({ length: n }, (_, i) => (mask & (1 << i)) !== 0);
    const k = pattern.filter(Boolean).length;
    const best = computeScore(answers(pattern, 0)).score;
    const worst = computeScore(answers(pattern, QUESTION_TIMEOUT_MS)).score;
    maxByK[k] = Math.max(maxByK[k], best);
    minByK[k] = Math.min(minByK[k], worst);
  }

  for (let k = 0; k < n; k++) {
    assert.ok(
      maxByK[k] < minByK[k + 1],
      `range overlap: best with ${k} correct (${maxByK[k]}) >= worst with ${k + 1} correct (${minByK[k + 1]})`,
    );
  }
});
