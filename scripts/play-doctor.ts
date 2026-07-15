// Diagnose why the daily game can or cannot be built from the current Check
// pool. Every game always uses all 5 question types, so it needs a minimum
// number of usable sites in each score band. This prints the pool health and
// flags exactly which band (if any) is starving the generator, which is what
// surfaces to players as "not enough sites to build a game yet".
//
//   npm run play-doctor
//
// Read-only: it never writes anything.
import { db } from "@/lib/db";
import { QUESTION_TYPES } from "@/lib/play-questions";

// A site is usable in a game only if it scanned cleanly and has a screenshot.
const usable = { gameHidden: false, scanError: null, screenshot: { not: null } } as const;

// How many sites each exact band must supply for one game (two slots per
// question type: bandA + bandB), summed across all types.
function requirements(): Map<string, { min: number; max: number; need: number }> {
  const req = new Map<string, { min: number; max: number; need: number }>();
  const add = (min: number, max: number) => {
    const key = `${min}-${max}`;
    const cur = req.get(key) ?? { min, max, need: 0 };
    cur.need += 1;
    req.set(key, cur);
  };
  for (const t of QUESTION_TYPES) {
    add(t.bandA[0], t.bandA[1]);
    add(t.bandB[0], t.bandB[1]);
  }
  return req;
}

async function main() {
  const [total, usableCount, noScreenshot, scanErrored, hidden] = await Promise.all([
    db.check.count(),
    db.check.count({ where: usable }),
    db.check.count({ where: { gameHidden: false, scanError: null, screenshot: null } }),
    db.check.count({ where: { NOT: { scanError: null } } }),
    db.check.count({ where: { gameHidden: true } }),
  ]);

  console.log("=== Pool health ===");
  console.log(`total checks:        ${total}`);
  console.log(`usable for a game:   ${usableCount}  (clean scan + screenshot, not hidden)`);
  console.log(`excluded: no screenshot=${noScreenshot}  scanError=${scanErrored}  gameHidden=${hidden}`);

  console.log("\n=== Score distribution (usable only) ===");
  const buckets: [number, number][] = [[0, 25], [26, 50], [51, 75], [76, 100]];
  for (const [min, max] of buckets) {
    const c = await db.check.count({ where: { ...usable, score: { gte: min, lte: max } } });
    const pct = usableCount ? Math.round((c / usableCount) * 100) : 0;
    console.log(`  ${String(min).padStart(3)}-${String(max).padStart(3)}: ${String(c).padStart(6)}  (${pct}%)`);
  }

  console.log("\n=== Band requirements per game ===");
  const req = [...requirements().values()].sort((a, b) => a.min - b.min);
  let short = 0;
  for (const b of req) {
    const have = await db.check.count({ where: { ...usable, score: { gte: b.min, lte: b.max } } });
    const ok = have >= b.need;
    if (!ok) short++;
    console.log(`  ${ok ? "OK " : "!! "} band ${String(b.min).padStart(3)}-${String(b.max).padStart(3)}  need ${b.need}, have ${have}`);
  }

  console.log("");
  if (short === 0) {
    console.log("Result: the pool CAN build a game. If players still see the error, check that");
    console.log("        screenshots are populated in this same database/environment.");
  } else {
    console.log(`Result: ${short} band(s) are short, so no game can be built. The generator needs`);
    console.log("        sites across the WHOLE 0-100 range, not just high (slop) scores. Add");
    console.log("        low/mid-scoring sites to the starved band(s) above.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[play-doctor] failed:", e);
    process.exit(1);
  });
