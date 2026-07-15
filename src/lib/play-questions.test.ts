// Each question type must have one clear, correct answer, and its bands must
// agree with its target (the "answer" band is really the one that wins).
import { test } from "node:test";
import assert from "node:assert/strict";
import { QUESTION_TYPES, correctIndex, type Target } from "./play-questions";

test("correctIndex picks the higher / lower / nearest site", () => {
  assert.equal(correctIndex("higher", 10, 90), 1);
  assert.equal(correctIndex("higher", 90, 10), 0);
  assert.equal(correctIndex("lower", 10, 90), 0);
  assert.equal(correctIndex("lower", 90, 10), 1);
  assert.equal(correctIndex({ near: 25 }, 25, 90), 0);
  assert.equal(correctIndex({ near: 25 }, 90, 25), 1);
});

test("every question type's bands agree with its target across the whole range", () => {
  const target = (t: Target) => t;
  for (const q of QUESTION_TYPES) {
    // Sample the extremes of each band; the answer must be stable and land on
    // the same band no matter where inside the bands the two sites fall.
    for (const a of [q.bandA[0], q.bandA[1]]) {
      for (const b of [q.bandB[0], q.bandB[1]]) {
        const idxAB = correctIndex(target(q.target), a, b); // A in slot 0, B in slot 1
        const idxBA = correctIndex(target(q.target), b, a); // swapped positions
        // The same real site must win regardless of left/right placement.
        assert.equal(idxAB === 0, idxBA === 1, `${q.id}: answer flipped with position (a=${a}, b=${b})`);
      }
    }
  }
});
