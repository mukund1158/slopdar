// www.example.com and example.com are the same check; real subdomains are not.
import { test } from "node:test";
import assert from "node:assert/strict";

// lib/url imports the SSRF module, which validates env at import time and
// requires DATABASE_URL — stub it before the module loads. The import stays
// dynamic (a static one would be hoisted above the env stub).
process.env.DATABASE_URL ??= "postgres://test:test@localhost/test";
const mod = import("./url");

test("www is stripped: www.google.com equals google.com", async () => {
  const { normalizeUrl } = await mod;
  assert.equal(normalizeUrl("www.google.com").toString(), normalizeUrl("google.com").toString());
});

test("real subdomains stay distinct from the apex", async () => {
  const { normalizeUrl } = await mod;
  assert.notEqual(normalizeUrl("mukund.google.com").toString(), normalizeUrl("google.com").toString());
  assert.equal(normalizeUrl("mukund.google.com").hostname, "mukund.google.com");
});

test("www stripping combines with case, path and scheme handling", async () => {
  const { normalizeUrl } = await mod;
  assert.equal(normalizeUrl("https://WWW.Google.com/search?q=x#top").toString(), "https://google.com/");
});

test("www on a deeper subdomain is also stripped", async () => {
  const { normalizeUrl } = await mod;
  assert.equal(normalizeUrl("www.blog.google.com").hostname, "blog.google.com");
});

test("stripWww never reduces a host to a bare TLD", async () => {
  const { stripWww } = await mod;
  assert.equal(stripWww("www.com"), "www.com");
});
