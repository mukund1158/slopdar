// One-off maintenance: merge Check rows that point at different pages of the
// same site (e.g. linear.app, linear.app/contact) into a single root-level row.
// Needed after normalizeUrl started collapsing every URL to the site root.
//
// Usage:
//   npm run dedupe            # dry run — prints what would be merged
//   npm run dedupe -- --apply # actually merge + delete duplicates
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

const apply = process.argv.includes("--apply");

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Collapse a stored URL to its site root — mirrors lib/url normalizeUrl. */
function rootCanonical(raw: string): string {
  const url = new URL(raw);
  url.hostname = url.hostname.toLowerCase();
  url.pathname = "";
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function main() {
  const checks = await db.check.findMany({
    select: { id: true, url: true, urlHash: true, slug: true, host: true, checkCount: true, updatedAt: true },
  });

  // Group every row by the root URL it collapses to.
  const groups = new Map<string, typeof checks>();
  for (const c of checks) {
    const canonical = rootCanonical(c.url);
    const group = groups.get(canonical) ?? [];
    group.push(c);
    groups.set(canonical, group);
  }

  let merged = 0;
  for (const [canonical, group] of groups) {
    const canonicalHash = sha256(canonical);
    // Prefer the row that already IS the root scan; otherwise the freshest one.
    const keeper =
      group.find((c) => c.urlHash === canonicalHash) ??
      [...group].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
    const dupes = group.filter((c) => c.id !== keeper.id);
    const needsRewrite = keeper.urlHash !== canonicalHash;
    if (dupes.length === 0 && !needsRewrite) continue;

    console.log(`\n${canonical}`);
    console.log(`  keep   ${keeper.slug} (${keeper.url})`);
    for (const d of dupes) console.log(`  merge  ${d.slug} (${d.url}, scanned ${d.checkCount}x)`);
    merged += dupes.length;
    if (!apply) continue;

    await db.$transaction(async (tx) => {
      // Re-point saved sites at the keeper before the cascade delete eats them.
      for (const d of dupes) {
        const saved = await tx.savedSite.findMany({ where: { checkId: d.id } });
        for (const s of saved) {
          const already = await tx.savedSite.findUnique({
            where: { userId_checkId: { userId: s.userId, checkId: keeper.id } },
          });
          if (already) await tx.savedSite.delete({ where: { id: s.id } });
          else await tx.savedSite.update({ where: { id: s.id }, data: { checkId: keeper.id } });
        }
      }

      const extraScans = dupes.reduce((n, d) => n + d.checkCount, 0);
      if (dupes.length > 0) {
        await tx.check.deleteMany({ where: { id: { in: dupes.map((d) => d.id) } } });
      }

      // Point the keeper at the root URL and give it the plain-host slug when free.
      const bareHost = new URL(canonical).hostname.replace(/^www\./, "");
      const slugTaken =
        keeper.slug === bareHost
          ? false
          : (await tx.check.findUnique({ where: { slug: bareHost }, select: { id: true } })) !== null;
      await tx.check.update({
        where: { id: keeper.id },
        data: {
          url: canonical,
          urlHash: canonicalHash,
          ...(slugTaken ? {} : { slug: bareHost }),
          ...(extraScans > 0 ? { checkCount: { increment: extraScans } } : {}),
        },
      });
    });
  }

  console.log(
    apply
      ? `\nDone. Removed ${merged} duplicate row(s).`
      : `\nDry run only — re-run with --apply to merge. (${merged || "no"} duplicate row(s) found)`,
  );
}

main()
  .catch((err) => {
    console.error("Dedupe failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
