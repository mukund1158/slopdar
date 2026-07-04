// Fingerprint rules must distinguish a page *built with* a tool from a page
// merely *talking about* it (e.g. a "Lovable vs Bolt vs Base44" comparison).
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import * as cheerio from "cheerio";
import { fingerprintSignals } from "./fingerprints";
import { dropConflictingFingerprints } from "../score";
import type { MatchedSignal, ScanContext } from "../types";

function makeCtx(html: string, url = "https://example.com/"): ScanContext {
  return {
    url: new URL(url),
    finalUrl: url,
    html,
    $: cheerio.load(html),
    headers: {},
  };
}

function matchedIds(ctx: ScanContext): string[] {
  return fingerprintSignals.filter((r) => r.test(ctx)).map((r) => r.id);
}

// ── Pages ABOUT builders must not match ─────────────────────────────────────

test("comparison article mentioning all three builders matches nothing", () => {
  const ctx = makeCtx(`
    <html><head>
      <title>Lovable vs Bolt.new vs Base44 — which AI builder wins?</title>
      <meta name="description" content="We compare lovable.dev, bolt.new and base44.com head to head.">
      <meta property="og:description" content="Sites made with Lovable, bolt.new and base44 compared.">
    </head><body>
      <h1>Lovable vs Bolt.new vs Base44</h1>
      <p>We tested lovable.dev, bolt.new and base44.com so you don't have to.</p>
      <table>
        <tr><td><a href="https://lovable.dev">Lovable</a></td>
            <td><a href="https://bolt.new">Bolt.new</a></td>
            <td><a href="https://base44.com">Base44</a></td></tr>
      </table>
    </body></html>
  `);
  const strictIds = ["fingerprint.lovable", "fingerprint.bolt", "fingerprint.base44", "fingerprint.v0"];
  const hits = matchedIds(ctx).filter((id) => strictIds.includes(id));
  assert.deepEqual(hits, []);
});

// ── Pages BUILT WITH a builder must still match ─────────────────────────────

test("real Lovable export matches via data-lov-id (strong)", () => {
  const ctx = makeCtx(`
    <html><head><script src="https://cdn.gptengineer.app/gptengineer.js"></script></head>
    <body><div data-lov-id="src/App.tsx:12">Welcome</div></body></html>
  `);
  const rule = fingerprintSignals.find((r) => r.id === "fingerprint.lovable")!;
  const hit = rule.test(ctx);
  assert.ok(hit);
  assert.notEqual(hit.weak, true); // attribute hit is strong, survives filtering
});

test("Bolt artifact in a script tag matches (weak, but survives alone)", () => {
  const ctx = makeCtx(`
    <html><head><!-- Built with bolt.new --></head><body><h1>My app</h1></body></html>
  `);
  const rule = fingerprintSignals.find((r) => r.id === "fingerprint.bolt")!;
  const hit = rule.test(ctx);
  assert.ok(hit);
  assert.equal(hit.weak, true);
});

test("site hosted on base44.app matches (strong)", () => {
  const ctx = makeCtx("<html><body>hi</body></html>", "https://myapp.base44.app/");
  const rule = fingerprintSignals.find((r) => r.id === "fingerprint.base44")!;
  const hit = rule.test(ctx);
  assert.ok(hit);
  assert.notEqual(hit.weak, true);
});

test("bare word base44 outside the known domains does not match", () => {
  const ctx = makeCtx(`<html><body><p>Our warehouse is at base44, Building C.</p></body></html>`);
  const rule = fingerprintSignals.find((r) => r.id === "fingerprint.base44")!;
  assert.equal(rule.test(ctx), null);
});

// ── Conflicting-fingerprint filter ───────────────────────────────────────────

const sig = (id: string, weak?: boolean): MatchedSignal => ({
  id,
  category: "fingerprint",
  label: id,
  description: "",
  weight: 35,
  weak,
});

test("two weak fingerprints cancel each other out", () => {
  const kept = dropConflictingFingerprints([sig("fingerprint.lovable", true), sig("fingerprint.bolt", true)]);
  assert.deepEqual(kept, []);
});

test("a single weak fingerprint survives", () => {
  const signals = [sig("fingerprint.bolt", true)];
  assert.deepEqual(dropConflictingFingerprints(signals), signals);
});

test("strong fingerprints survive alongside dropped weak ones", () => {
  const strong = sig("fingerprint.lovable");
  const kept = dropConflictingFingerprints([strong, sig("fingerprint.bolt", true), sig("fingerprint.base44", true)]);
  assert.deepEqual(kept, [strong]);
});
