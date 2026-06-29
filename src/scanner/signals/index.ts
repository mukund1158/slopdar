// The signal registry — every rule the scanner runs. Add new rules here.
import type { SignalRule } from "../types";
import { fingerprintSignals } from "./fingerprints";
import { defaultStackSignals } from "./default-stack";
import { copySignals } from "./copy";
import { layoutSignals } from "./layout";
import { leftoverSignals } from "./leftovers";
import { stackSignals } from "./stack";
import { qualitySignals } from "./quality";
import { humanSignals } from "./human";

export const ALL_SIGNALS: SignalRule[] = [
  ...fingerprintSignals,
  ...defaultStackSignals,
  ...copySignals,
  ...layoutSignals,
  ...leftoverSignals,
  ...stackSignals,
  ...qualitySignals,
  ...humanSignals,
];

// Guard against duplicate ids (would corrupt "the receipts").
const ids = new Set<string>();
for (const rule of ALL_SIGNALS) {
  if (ids.has(rule.id)) throw new Error(`Duplicate signal id: ${rule.id}`);
  ids.add(rule.id);
}
