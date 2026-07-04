// Scoring: human signals soften the score but may never erase it — their
// discount is capped at 50% of the AI-evidence points.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreSignals } from "./score";
import type { MatchedSignal, SignalCategory } from "./types";

const sig = (weight: number, category: SignalCategory = "copy"): MatchedSignal => ({
  id: `test.${category}.${weight}`,
  category,
  label: "",
  description: "",
  weight,
});

test("human discount is capped at half the AI points", () => {
  // 20 AI points, 18 human points: previously 2, now 20 - 10 = 10.
  const { score } = scoreSignals([sig(20), sig(-18, "human")]);
  assert.equal(score, 10);
});

test("no cliff: one extra AI point moves the score by one, not seventeen", () => {
  const at20 = scoreSignals([sig(20), sig(-18, "human")]).score;
  const at21 = scoreSignals([sig(21), sig(-18, "human")]).score;
  assert.equal(at21 - at20, 1);
});

test("small human discount still applies in full", () => {
  // 40 AI points, 13 human points: 13 < 40 * 0.5, so full discount.
  const { score } = scoreSignals([sig(40), sig(-13, "human")]);
  assert.equal(score, 27);
});

test("no AI evidence scores zero regardless of human signals", () => {
  const { score, tier } = scoreSignals([sig(-13, "human")]);
  assert.equal(score, 0);
  assert.equal(tier, "Hand-Crafted");
});

test("score still caps at 100", () => {
  const { score, tier } = scoreSignals([sig(80), sig(60)]);
  assert.equal(score, 100);
  assert.equal(tier, "Pure Slop");
});
