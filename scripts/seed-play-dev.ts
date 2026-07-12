// Dev-only: seed synthetic slop-side sites so the daily game can be generated
// and played locally. The local pool is heavy on hand-built sites and short on
// slop, and most real screenshot files live on prod, so we reuse one real
// screenshot for the seeded rows. Idempotent. NOT for production.
//
//   node --env-file=.env --import tsx scripts/seed-play-dev.ts          # seed
//   node --env-file=.env --import tsx scripts/seed-play-dev.ts --clean  # remove
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { tierOf } from "@/lib/tiers";

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const PFX = "devseed-";
// Slop and mid-band scores (built side already has plenty locally). A few per
// band so random draws never starve within a single game.
const scores = [52, 55, 58, 60, 62, 70, 72, 75, 78, 80, 82, 85, 86, 88, 90, 92, 94, 96, 98, 99, 53, 57, 84, 91, 97];

async function main() {
  if (process.argv.includes("--clean")) {
    const { count } = await db.check.deleteMany({ where: { host: { startsWith: PFX } } });
    console.log(`removed ${count} dev-seed sites`);
    return;
  }
  const real = await db.check.findFirst({ where: { screenshot: { not: null } }, select: { screenshot: true } });
  const shot = real?.screenshot ?? "/screenshots/placeholder.jpg";

  let n = 0;
  for (const [i, s] of scores.entries()) {
    const host = `${PFX}${i}-${s}.example`;
    await db.check.upsert({
      where: { urlHash: sha256(host) },
      create: {
        url: `https://${host}/`,
        urlHash: sha256(host),
        slug: `${PFX}${i}-${s}`,
        host,
        score: s,
        tier: tierOf(s).label,
        screenshot: shot,
      },
      update: {},
    });
    n++;
  }
  console.log(`seeded ${n} dev slop/mid sites (screenshot: ${shot})`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
