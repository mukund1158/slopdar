// High-intent guide (GEO surface): answers "was this site built with v0 /
// Lovable / Bolt?" with the actual fingerprints Slopdar's scanner checks, so
// the article states facts the product can back up. Article + FAQPage JSON-LD.
import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { SANS, MONO, card } from "@/components/slopdar/ui";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Faq from "@/components/Faq";

export const metadata: Metadata = {
  title: "How to check if a website was built with v0, Lovable, or Bolt",
  description:
    "AI site builders sign their work. The exact fingerprints v0, Lovable, Bolt, Base44 and Replit leave in a page's source code, and how to check for each one yourself.",
  alternates: { canonical: "/guide/detect-v0-lovable-bolt-websites" },
  openGraph: {
    title: "How to check if a website was built with v0, Lovable, or Bolt",
    description: "The exact fingerprints AI site builders leave behind, and how to find them in ten seconds.",
    url: "/guide/detect-v0-lovable-bolt-websites",
    type: "article",
  },
};

const BUILDERS = [
  {
    t: "v0 (by Vercel)",
    d: "v0 generates React pages from prompts and deploys to Vercel. It announces itself in the page's metadata: a generator meta tag naming v0, or references to v0.dev among the scripts and meta tags.",
    check: "View Page Source and search for 'v0'. A <meta name=\"generator\"> tag mentioning v0, or v0.dev in script URLs, is the tell.",
  },
  {
    t: "Lovable",
    d: "Lovable (formerly GPT Engineer) is the loudest signer of the bunch. Its pages carry data-lov-id attributes on elements, projects often stay on a lovable.app subdomain, and older builds reference gptengineer scripts.",
    check: "Search the source for 'data-lov-id' or 'lovable'. A site still hosted at something.lovable.app is a giveaway before you even open the source.",
  },
  {
    t: "Bolt (by StackBlitz)",
    d: "Bolt.new generates and deploys full-stack apps from a chat prompt. It leaves bolt.new references among the page's scripts and meta tags, and unedited projects tend to keep the default Vite build artifacts too.",
    check: "Search the source for 'bolt.new'. Pair it with the other defaults: stock favicon, empty metadata, untouched component stack.",
  },
  {
    t: "Base44",
    d: "Base44 builds full apps from prompts and hosts them on its own domain. Unedited projects live on a base44.app subdomain and reference base44.app or base44.com in their scripts.",
    check: "Check the address bar first (something.base44.app), then search the source for 'base44'.",
  },
  {
    t: "Replit",
    d: "Replit's agent deploys straight to Replit hosting: replit.app, replit.dev or the older repl.co. The hosting domain is the fingerprint; code exported elsewhere is harder to attribute.",
    check: "Look at the domain. Anything ending in replit.app, replit.dev or repl.co was built and shipped on Replit.",
  },
  {
    t: "The long tail",
    d: "Create.xyz, Rocket.new, Tempo, Databutton, Softgen and friends follow the same pattern: default hosting on their own subdomain, plus script and meta references to the mothership. New builders appear monthly; the pattern never changes.",
    check: "If the domain ends in the builder's name, the mystery is solved. Otherwise search the source for the builder domains listed above.",
  },
];

const FAQ = [
  {
    q: "How can I tell if a site was made with Lovable?",
    a: "Check three things: the domain (unedited projects stay on a lovable.app subdomain), the page source for data-lov-id attributes that Lovable stamps on elements, and script references to lovable.dev or gptengineer. Any of these is strong evidence; data-lov-id is close to conclusive.",
  },
  {
    q: "Does v0 leave a watermark?",
    a: "Not a visible one, but it typically leaves a generator meta tag naming v0 and references to v0.dev in the page metadata. A developer who exports the code and cleans it up can remove these, which is why absence of fingerprints doesn't prove absence of v0.",
  },
  {
    q: "Can these fingerprints be removed?",
    a: "Yes, and that's fine. Moving to a custom domain, cleaning the metadata, replacing default components and rewriting the copy removes most tells. That's not cheating a detector; that's finishing the work. Detectors like Slopdar measure the craftsmanship applied after generation, not whether AI was involved at the start.",
  },
  {
    q: "Is it bad if a site was built with v0, Lovable, or Bolt?",
    a: "No. They're legitimate tools that let people ship things they couldn't build before. The fingerprints matter for context: a portfolio claiming 'hand-crafted with care' on an unedited Lovable subdomain is a different story from a weekend prototype that says what it is.",
  },
  {
    q: "What's the fastest way to check for all builders at once?",
    a: "Slopdar (slopdar.com) checks fingerprints for v0, Lovable, Bolt, Base44, Replit, Framer, Webflow, Wix and a dozen smaller builders in one scan, alongside ~40 other tells, and shows the exact evidence found. Free, about ten seconds per site.",
  },
];

export default function DetectBuildersPage() {
  const base = env.APP_URL.replace(/\/$/, "");
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: "How to check if a website was built with v0, Lovable, or Bolt",
        description: metadata.description,
        author: { "@type": "Organization", name: "Slopdar", url: base },
        publisher: { "@type": "Organization", name: "Slopdar", url: base },
        datePublished: "2026-07-30",
        mainEntityOfPage: `${base}/guide/detect-v0-lovable-bolt-websites`,
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
  const eyebrow = { fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--mut)" } as const;
  const h2 = { fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", margin: "34px 0 0" } as const;
  const p = { fontSize: 15, lineHeight: 1.65, color: "var(--ink2)", margin: "12px 0 0" } as const;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <main style={{ flex: "1 0 auto", maxWidth: 760, margin: "0 auto", padding: "46px 28px 30px", width: "100%" }}>
        <div style={eyebrow}>The field guide</div>
        <h1 style={{ fontWeight: 900, fontSize: "clamp(32px,5.4vw,52px)", letterSpacing: "-.035em", margin: "8px 0 0", lineHeight: 1.02 }}>
          Was this site built with v0, Lovable, or Bolt?
        </h1>
        <p style={{ ...p, fontSize: 16, marginTop: 14 }}>
          Here&apos;s the secret about AI site builders: <span style={{ color: "var(--ink)", fontWeight: 700 }}>they sign
          their work</span>. Generator meta tags, stamped element attributes, scripts pointing home, default hosting
          subdomains. If nobody cleaned up after the tool, attribution takes one View Source and one Ctrl+F. Below are the
          exact fingerprints each builder leaves, straight from the checks{" "}
          <Link href="/" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>Slopdar</Link> runs on
          every scan.
        </p>

        <h2 style={h2}>Before you start: open the source</h2>
        <p style={p}>
          Every check below happens in the page source: right-click the page, choose View Page Source, and search with Ctrl+F
          (Cmd+F on a Mac). You&apos;re looking in three places: meta tags near the top (especially{" "}
          <span style={{ fontFamily: MONO, fontSize: 13.5 }}>&lt;meta name=&quot;generator&quot;&gt;</span>), script URLs, and
          attributes on elements. The address bar counts too: builders host unedited projects on their own subdomains.
        </p>

        <div style={{ ...eyebrow, marginTop: 36, marginBottom: 14 }}>The fingerprints, builder by builder</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {BUILDERS.map((b, i) => (
            <div key={b.t} style={{ ...card, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <span style={{ fontWeight: 900, fontSize: 26, color: "var(--brand)", lineHeight: 1.2, flexShrink: 0, width: 34 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 style={{ fontWeight: 900, fontSize: 18, margin: 0 }}>{b.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "8px 0 0" }}>{b.d}</p>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: "10px 0 0" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 700 }}>How to check → </span>
                  <span style={{ color: "var(--ink2)" }}>{b.check}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 style={h2}>When the fingerprints are gone</h2>
        <p style={p}>
          A cleaned-up site isn&apos;t unattributable so much as unfingerprinted: you can no longer say which tool made it,
          and honestly, at that point it stops mattering. What remains detectable is the style: untouched default components,
          template layouts, AI copy patterns. Those are the softer tells covered in{" "}
          <Link href="/guide/how-to-tell-if-a-website-is-ai-generated" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>
            the ten signs a website is AI-generated
          </Link>
          . And if you&apos;re wondering why so many sites ship with the fingerprints still in place, that&apos;s{" "}
          <Link href="/guide/what-is-vibe-coding" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>
            vibe coding
          </Link>{" "}
          for you.
        </p>

        <div style={{ marginTop: 24, ...card, borderRadius: 18, padding: "24px 26px", boxShadow: "0 6px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔍</span>
            <h2 style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.01em", margin: 0 }}>Or check all of them in one scan</h2>
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink2)", margin: "11px 0 0" }}>
            Slopdar runs every fingerprint check on this page, plus ~40 more tells (default stacks, AI copy patterns, leftover
            placeholders, template layouts), and returns a 0 to 100 Slop Score with the exact evidence found. When several
            builder names appear at once it discards the weak matches, because no real site was built by three competing
            tools; an article about Lovable shouldn&apos;t get flagged as built with it.{" "}
            <Link href="/how-it-works" className="h-brandtext" style={{ color: "var(--brand)", fontWeight: 700 }}>Here&apos;s how the scoring works</Link>.
          </p>
        </div>

        <div style={{ ...eyebrow, marginTop: 34, marginBottom: 14 }}>Questions people ask</div>
        <Faq items={FAQ} />

        <div style={{ marginTop: 26 }}>
          <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", border: "2px solid var(--ink)", borderRadius: 12, fontWeight: 900, fontSize: 15, padding: "14px 26px", textDecoration: "none", boxShadow: "0 5px 0 rgba(0,0,0,.14)" }}>
            Run the fingerprint check →
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
