# Slopdar — Scanner Logic (Detection Signals)

> This is the **moat**. The fun and the accuracy both live here. To be expanded
> in detail before the build phase. Below is the working signal list.

## How scoring works

- Each signal has a **weight** (points) and a **category**.
- A check runs every signal against the fetched HTML, headers, and rendered page.
- Matched signals become **"the receipts"** shown on the result page.
- Total weighted points map to a **Slop Score (0–100)** and a tier.

> Honest framing: signals indicate *likelihood*, not proof. Higher score = more
> vibe-coding tells found, not "definitely AI".

## Signal categories & example tells

### 🏷️ Tool fingerprints (highest confidence)
- `v0.dev`, `lovable.dev`, `bolt.new` meta tags / generator tags
- Builder asset URLs / build IDs in bundle paths
- Cursor / Copilot artifacts, telltale comment headers
- Framer / Webflow / Wix generator tags (no-code tells)

### 🎨 Default-stack tells
- Untouched shadcn/ui component classes & default radius/spacing
- Default Tailwind color palette (no custom theme)
- lucide-react icons everywhere
- Default Next.js favicon / `_next` default setup

### 📝 Copy / text tells
- High em-dash (—) density
- Buzzwords: "Elevate", "Seamless", "Effortless", "Unlock", "Supercharge"
- Emoji-prefixed headers
- Suspiciously uniform, marketing-perfect sentences
- (Later, optional) LLM-based copy judging

### 🧱 Layout / design tells
- Bento-grid layouts
- Gradient blobs / aurora backgrounds
- "Trusted by" rows with placeholder/fake logos
- Hero + 3 feature cards + CTA — the generic AI landing template

### 🔧 Leftover junk
- "Lorem ipsum" text
- "Your Company", "Acme", placeholder names
- Dead `#` / `example.com` links
- Default meta description / title ("Create Next App")

### ☁️ Stack tells
- Vercel / Netlify hosting headers
- Next.js + Supabase + Tailwind combo
- Common vibe-coding header signatures

## Tech detection

Wappalyzer-style pattern matching on headers, scripts, meta tags, and cookies to
list the detected stack (shown on the result page).

## Tiers (score → label)

| Score | Tier | Emoji |
|---|---|---|
| 0–25 | Hand-Crafted | 🛠️ |
| 26–50 | Suspiciously Clean | ✨ |
| 51–75 | Vibe-Coded | 🌊 |
| 76–100 | Pure Slop | 🤖 |

(Exact thresholds & weights to be tuned during build.)

## TODO before build

- [ ] Finalize the full weighted signal list
- [ ] Decide regex-only vs. optional LLM copy analysis (cost)
- [ ] Tune score thresholds against real example sites
- [ ] Build a seed set of famous sites for the leaderboard
