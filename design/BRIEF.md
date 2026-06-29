# Slopdar — Design Brief

*Paste this whole file into Claude (or any designer) to brief the visual design.*

---

## 1. One line

**Slopdar** is a website where you paste any link and it tells you whether that
site looks **hand-coded by a real developer** or **vibe-coded / AI-generated** —
as a fun **Slop Score from 0 to 100**, with the proof behind it and a shareable
result card.

**Tagline:** *Is it built or is it slop?*

---

## 2. What it is

A free, fun, viral web tool. You type a website URL, click one button, and a few
seconds later you get:

- a **Slop Score** (0–100),
- a **tier/label** with personality (from "Hand-Crafted" to "Pure Slop"),
- a **one-line roast** (a funny verdict),
- the **"receipts"** — the exact tells we found, listed out,
- a **screenshot** of the site,
- the **tech stack** we detected,
- and a **share card** (an auto-generated image) made to be posted on social media.

It is a single-page action repeated over and over: **paste → score → proof →
share.** Everything in the product exists to serve that loop.

---

## 3. Why it exists (the problem)

Right now almost everyone ships products that are vibe-coded or AI-generated, and
there is **no place** to check whether a site was built by a person or churned
out by a tool. Slopdar fills that gap — not as a serious courtroom verdict, but
as a playful, curiosity-driven, *shareable* tool. The fun **is** the product.

The wedge is **virality and curiosity**: people love checking their own site,
their competitor's site, and famous sites, then sharing the result.

---

## 4. Who it's for

- **Indie hackers / developers** who want to flex "hand-coded" or roast a rival.
- **Designers and founders** curious how their site reads.
- **Twitter/X and LinkedIn crowds** who share screenshots and scores for fun.

Mood of the audience: online, meme-literate, opinionated, fast-scrolling.

---

## 5. Brand & voice

- **Name:** Slopdar = *slop* (internet slang for AI-generated junk) + *radar*. A
  radar for slop.
- **Voice:** playful, meme-y, a little roast-y, confident — but **honest**. It
  never claims certainty.
- **The honest framing (important):** we detect **signals, not proof.** Always
  say "we found N tells," never "this is X% AI." It's funnier *and* safer.
- **Self-aware footer joke:** *"Slopdar runs on the slop stack. We know."*

---

## 6. The Slop Score & tiers

A number from **0 (totally hand-crafted)** to **100 (pure slop)**. It maps to one
of four tiers, each with its own personality:

| Score | Tier | Feeling |
|------:|------|---------|
| 0–25 | **Hand-Crafted** | a real person sweated over this |
| 26–50 | **Suspiciously Clean** | a little too templated |
| 51–75 | **Vibe-Coded** | clearly AI-assisted |
| 76–100 | **Pure Slop** | prompt, deploy, pray |

The score is the **hero element** — it should feel big, satisfying, and
screenshot-worthy. There is also a **Nice / Brutal** toggle that swaps the roast
line between gentle and savage.

---

## 7. The "receipts" (the proof)

The magic isn't the number — it's that we **show our work**. Each result lists
the specific tells we found, each with a short label, a category, and how many
points it added. Example tells:

- *Built with v0.dev* — a known AI builder fingerprint (tool fingerprint)
- *Lorem ipsum left in the copy* — placeholder text never replaced (leftover)
- *Marketing buzzword cluster* — "elevate, seamless, supercharge" (copy)
- *The classic vibe-coding stack* — Next.js + Vercel + Supabase (stack)
- *Default lucide icons throughout* — the icon set every AI build ships (defaults)

Tell categories (for grouping/iconography ideas): **tool fingerprints,
default-stack tells, copy/text tells, layout tells, leftover junk, hosting/stack
tells.**

---

## 8. The pages to design

**Priority order: Home and Result first — they are 90% of the product.**

### A. Home (the front door)
- A large, confident headline + the tagline.
- **One** prominent input: "Paste any website link."
- **One** clear button: e.g. "Check the vibe."
- A live "sites checked" counter (real number).
- A short, plain explainer line ("We scan a site for AI / vibe-coding tells").
- A list of a few recently-checked or famous example results (clickable).

### B. Result page — `/r/[site]` (the most important page; where sharing happens)
- The **Slop Score** — big, the centerpiece.
- The **tier/label** and a **one-line roast** (with Nice/Brutal toggle).
- The **receipts** — the list of tells, with points.
- A **screenshot** of the scanned site.
- The **detected tech stack**.
- A **Share** action that produces the share-card image.
- A **"Check another site"** action.

### C. Leaderboard
- **Wall of Shame** (most slop-y sites) and **Hall of Fame** (most hand-crafted).
- A **Recently checked** live feed.

### D. Compare — two sites side by side ("me vs my competitor").

### E. Badge page — grab an embeddable badge ("Certified Hand-Coded" /
"Proudly Vibe-Coded") with copy-paste embed code.

### F. How it works — plain explanation + the honest "signals, not proof" note.

### G. About — who built it (Mukund, a solo indie hacker) and the joke behind it.

### H. Profile (logged in, optional) — your check history and saved sites.

---

## 9. The share card (design this carefully — it's the growth engine)

When someone shares a result, we generate an **image** (roughly 1200×630, the
social-preview size). This image is what spreads Slopdar, so it must look great
on its own, out of context. It should clearly show:

- the **Slop Score** (big),
- the **tier**,
- the **site name** that was checked,
- the **Slopdar** brand mark,
- ideally a hint of the verdict/roast.

Treat the share card as a first-class deliverable, not an afterthought.

---

## 10. Design constraints & the ONE big rule

**The product detects AI-generated / templated websites. So Slopdar itself must
NOT look AI-generated or templated.** If it looks like a generic AI landing page,
the whole joke collapses. Specifically **avoid the current "AI-made" clichés:**

- warm cream background + a serif + a terracotta accent,
- a purple-to-blue gradient hero,
- bento grids, big blurry gradient "blobs," fake "trusted by" logo rows,
- emoji used as section markers, everything centered, rounded cards everywhere,
- Inter / Space Grotesk as the default "safe" font.

It should feel **deliberately designed by a human with taste** — opinionated,
specific, memorable.

**Owner's taste (for reference):** likes a **brutalist base with cinematic motion
accents**, and **print/craft over tech-cosplay**. A **HUD / sci-fi / "mission
control"** direction was tried and **rejected**. (Two further attempts — a
risograph "stamp" look and a quiet editorial/critic look — were also rejected, so
the right answer is probably bolder and more distinctive than those. Push for a
strong, original point of view.)

---

## 11. Tone of the copy (write real words, not lorem)

- Confident, funny, a touch savage — but never mean-spirited or absolute.
- A control says exactly what it does ("Check the vibe", then it shows a score).
- Lean into the meme energy: "ran it through Slopdar 💀" is the reaction we want.
- Keep the honest disclaimer visible but light.

---

## 12. What to deliver

1. A visual direction / identity (color, type, mood) that is clearly **not**
   AI-template-looking.
2. **Home** and **Result** page designs (highest priority).
3. The **share card** design.
4. A few reusable pieces: the score display, a tier label, a "receipt" row,
   buttons, the input.
5. (Nice to have) Leaderboard, Compare, Badge, How-it-works, About.

---

## 13. Practical notes

- It's a real, working web app (the backend already exists). The design needs to
  cover real states: a normal result, a very high vs very low score, a site we
  couldn't reach, and the loading/scanning moment.
- Mobile matters — lots of shares are opened on phones.
- Motion is welcome but should feel intentional, not decorative.
