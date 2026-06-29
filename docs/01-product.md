# Slopdar — The Product (Full Vision)

This is the **complete product**, not an MVP.

## What we are building

A free, viral "is this site vibe-coded?" tool. You paste any website URL and get
an instant **Slop Score** out of 100, a roast-y verdict, and a screenshot-worthy
card showing exactly which tells gave it away.

The magic is not the number — it's that we **show our work** with specific,
screenshottable evidence ("the receipts"). People share results that feel
uncannily accurate.

## The score & tiers

A **Slop Score** from 0 to 100, mapped to a tier with personality:

| Score range | Tier | Emoji |
|---|---|---|
| Low | Hand-Crafted | 🛠️ |
| Medium-low | Suspiciously Clean | ✨ |
| Medium-high | Vibe-Coded | 🌊 |
| High | Pure Slop | 🤖 |

Each result also gets a **roast line** (funny one-liner verdict) and a
**Nice 😇 / Brutal 😈** tone toggle.

## How a check works (plain language)

When someone pastes a URL, the backend:

1. **Fetches the page** — HTML + server headers.
2. **Runs detection checks** — fingerprints, default stacks, copy patterns, etc.
   Each check adds points. (See `06-scanner-logic.md`.)
3. **Detects the tech stack** — Wappalyzer-style pattern matching.
4. **Takes a screenshot** — via Playwright on the VPS.
5. **Calculates the Slop Score** → saves to DB → shows the result.

## What makes it shareable

- The **share card** (auto-generated image) is the real product.
- **"Check your competitor"** is the killer use case.
- **Leaderboard** (Wall of Shame / Hall of Fame) gives social proof.
- **Badges** (both "Hand-Coded" and "Proudly Vibe-Coded") spread the brand.

## What it is NOT

- Not a courtroom — it detects *signals*, not proof.
- Not an "AI text detector" service (those are unreliable & legally shaky).
- Not a paid wall at launch — free and fun first; money features come later.
