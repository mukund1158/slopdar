// The fix registry must stay in lockstep with the signal registry, and its
// own copy must not trip the scanner (no em dashes, no buzzword clusters).
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_SIGNALS } from "./signals";
import { SIGNAL_FIXES, QUICK_WINS, composeFixPrompt, fixableSignals, quickWinsFor } from "./fixes";
import type { MatchedSignal } from "./types";

const sig = (id: string, weight = 10, evidence?: string): MatchedSignal => {
  const rule = ALL_SIGNALS.find((r) => r.id === id);
  return {
    id,
    category: rule?.category ?? "copy",
    label: rule?.label ?? id,
    description: rule?.description ?? "",
    weight: rule?.weight ?? weight,
    evidence,
  };
};

test("every non-human signal has a fix entry", () => {
  for (const rule of ALL_SIGNALS) {
    if (rule.category === "human") continue;
    assert.ok(SIGNAL_FIXES[rule.id], `missing fix entry for ${rule.id}`);
  }
});

test("every human signal has a quick-win entry", () => {
  const winIds = new Set(QUICK_WINS.map((w) => w.id));
  for (const rule of ALL_SIGNALS) {
    if (rule.category !== "human") continue;
    assert.ok(winIds.has(rule.id), `missing quick win for ${rule.id}`);
  }
});

test("no fix entry points at a signal that no longer exists", () => {
  const ruleIds = new Set(ALL_SIGNALS.map((r) => r.id));
  for (const id of Object.keys(SIGNAL_FIXES)) {
    assert.ok(ruleIds.has(id), `fix entry for unknown signal ${id}`);
  }
  for (const w of QUICK_WINS) {
    assert.ok(ruleIds.has(w.id), `quick win for unknown signal ${w.id}`);
    if (w.skipIfSignal) assert.ok(ruleIds.has(w.skipIfSignal), `skipIfSignal unknown: ${w.skipIfSignal}`);
  }
});

test("fixable entries have prompts; non-fixable have none", () => {
  for (const [id, fix] of Object.entries(SIGNAL_FIXES)) {
    if (fix.fixable) assert.ok(fix.prompt, `${id} is fixable but has no prompt`);
    else assert.equal(fix.prompt, undefined, `${id} is not fixable but has a prompt`);
  }
});

test("fix copy does not trip the scanner's own copy rules", () => {
  const allCopy: string[] = [];
  for (const fix of Object.values(SIGNAL_FIXES)) {
    allCopy.push(fix.summary);
    if (fix.prompt) allCopy.push(fix.prompt("EXAMPLE EVIDENCE"), fix.prompt(undefined));
  }
  for (const w of QUICK_WINS) allCopy.push(w.summary, w.prompt);

  for (const text of allCopy) {
    assert.ok(!text.includes("—"), `em dash in fix copy: "${text}"`);
  }
  // Buzzwords the copy.buzzwords rule looks for must not appear in our advice.
  const buzz = ["elevate", "seamless", "effortless", "supercharge", "empower", "revolutioni", "unleash", "game-changer", "cutting-edge"];
  const joined = allCopy.join(" ").toLowerCase();
  for (const b of buzz) {
    assert.ok(!joined.includes(b), `buzzword "${b}" in fix copy`);
  }
});

test("composeFixPrompt orders issues by weight and injects evidence", () => {
  const prompt = composeFixPrompt([
    sig("copy.buzzwords", 12, "elevate, seamless, unlock"),
    sig("leftover.lorem", 22),
  ]);
  assert.ok(prompt);
  const loremAt = prompt.indexOf("lorem ipsum");
  const buzzAt = prompt.indexOf("elevate, seamless, unlock");
  assert.ok(loremAt !== -1, "lorem fix missing");
  assert.ok(buzzAt !== -1, "evidence not injected");
  assert.ok(loremAt < buzzAt, "heavier signal should come first");
});

test("non-fixable signals never reach the prompt", () => {
  const prompt = composeFixPrompt([sig("stack.vercel")]);
  // Only quick wins remain; the Vercel tell itself must not be an issue item.
  assert.ok(prompt);
  assert.ok(!prompt.includes("Issues found"));
  assert.ok(!prompt.toLowerCase().includes("vercel"));
});

test("quick wins skip signals the site already earned or that are listed as issues", () => {
  const earned = quickWinsFor([sig("human.custom-fonts", -2)]);
  assert.ok(!earned.some((w) => w.id === "human.custom-fonts"));

  const covered = quickWinsFor([sig("quality.missing-meta", 6)]);
  assert.ok(!covered.some((w) => w.id === "human.rich-meta"), "rich-meta win should be skipped when missing-meta is an issue");
});

test("composeFixPrompt returns null only when nothing is actionable", () => {
  // Every human signal earned + only non-fixable tells matched → nothing to say.
  const allHuman = ALL_SIGNALS.filter((r) => r.category === "human").map((r) => sig(r.id, r.weight));
  assert.equal(composeFixPrompt([sig("stack.vercel"), ...allHuman]), null);
});

test("fixableSignals drops human and non-fixable entries", () => {
  const list = fixableSignals([sig("human.github", -3), sig("stack.vercel"), sig("copy.emdash")]);
  assert.deepEqual(list.map((s) => s.id), ["copy.emdash"]);
});
