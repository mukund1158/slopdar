// Dev CLI: scan a URL straight from the terminal without the DB/screenshot.
// Usage:  npm run scan -- https://example.com
import { normalizeUrl } from "@/lib/url";
import { runScan } from "@/scanner";
import { TIER_EMOJI } from "@/scanner/score";

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: npm run scan -- <url>");
    process.exit(1);
  }

  const url = normalizeUrl(input);
  console.log(`\n🛰️  Scanning ${url.toString()} ...\n`);

  const result = await runScan(url);

  console.log(`Slop Score: ${result.score}/100  ${TIER_EMOJI[result.tier]} ${result.tier}`);
  if (result.title) console.log(`Title: ${result.title}`);
  console.log(`\nReceipts (${result.signals.length}):`);
  for (const s of result.signals) {
    console.log(`  • [${s.category}] ${s.label} (+${s.weight})${s.evidence ? ` — ${s.evidence}` : ""}`);
  }
  console.log(`\nTech detected: ${result.tech.map((t) => t.name).join(", ") || "—"}`);
  if (result.fetchError) console.log(`\n⚠️  Fetch note: ${result.fetchError}`);
}

main().catch((err) => {
  console.error("Scan failed:", err.message);
  process.exit(1);
});
