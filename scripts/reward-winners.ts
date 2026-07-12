// Daily reward job: lock in the featured winner sites for today, taken from
// yesterday's top 3 players who have a website set. Run once a day just after
// midnight (server time), e.g. from cron:
//
//   10 0 * * *  cd /var/www/slopdar && npm run reward-winners
//
// Idempotent, so a re-run is safe.
import { lockFeaturedForDay } from "@/lib/play-board";

async function main() {
  const today = new Date();
  const count = await lockFeaturedForDay(today);
  console.log(`[reward-winners] featured ${count} winner site(s) for ${today.toISOString().slice(0, 10)}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("[reward-winners] failed:", e);
    process.exit(1);
  });
