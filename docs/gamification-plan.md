# Slopdar Gamification Plan (Draft)

Goal: keep the current design exactly as it is, and layer game mechanics on top of it so visitors come back daily, play, and share. Every idea below reuses things Slopdar already has: scores, tiers, screenshots, roasts, the leaderboard, share cards, the rescan counter, and the stubbed User model.

Rollout is in three phases. Phase 1 needs no login and ships fast. Phase 2 is the flagship game. Phase 3 needs accounts.

---

## Phase 1: make scanning itself feel like a game

### 1. Predict Before the Reveal

**What it is:** While the scan runs, the player calls the result before the radar reveals it. The reveal is gated: fast (cached) results wait for the call, so nobody gets rushed.

**How it works (as built):**

1. User submits a URL they have never scanned before. A full-screen radar console takes over, in the site's white theme: graph-paper background, an ink-drawn radar scope with dashed rings, a sweeping beam in brand orange with a pulsing blip, "UNIDENTIFIED SITE ON RADAR" status line, the "Built, or slop?" headline, and two tinted keys: Built (0 to 50, green) and Slop (51 to 100, red), plus a "skip, just show the score" link. Re-scans of a known site never show the console.
2. If the scan finishes before the user picks, the result is held and the console status switches to a blinking "TARGET LOCKED. Your call unlocks the score."
3. A call is correct when it lands on the right side of the 50-point line. The result screen shows a verdict chip:
  - Correct: "Called it: Slop. Streak: 4"
  - Wrong: "Radar jammed. You called Slop. It's Built."
4. Accuracy and streak live in the browser (localStorage). No account needed.
5. Anti-farming: each host counts once per browser, ever. Re-scanning a site you already called skips the prompt entirely and never touches your stats.

**Data and code needed:** frontend only. State in `SlopdarApp.tsx`, localStorage records `slopdar-radar` (`{ guesses, correct, streak }`) and `slopdar-radar-called` (hosts already called, capped at 300). No database change, no API change.

**Edge cases:** skipping shows the result with no verdict and no stat change. If the scan fails (unreachable site), the call is discarded.

**Effort:** small.

---

### 2. Scanner Achievements (local trophy shelf)

**What it is:** Badges the player unlocks by using the scanner. Stored in the browser, shown as a small trophy shelf on the home screen and celebrated with a toast when unlocked.

**How it works:**

1. After every completed scan, the frontend checks the result against a list of achievement rules.
2. When a rule matches for the first time, a toast pops: "Achievement unlocked: Certified Slop Hunter" with the badge art.
3. A "Your trophies" strip on the home page shows earned badges lit up and unearned ones greyed out, which teases what is left to unlock.

**Starter achievement list:**


| Badge                 | Rule                                              |
| --------------------- | ------------------------------------------------- |
| First Roast           | complete your first scan                          |
| Certified Slop Hunter | find a site scoring 90 or higher                  |
| Truffle Pig           | find a genuine Hand-Crafted site (25 or lower)    |
| Binge Roaster         | 10 scans in one day                               |
| Perfect Radar         | 5 correct predictions in a row (ties into idea 1) |
| Full Spectrum         | find at least one site in every tier              |


**Data and code needed:** frontend only. Achievements live in localStorage. Later, when accounts exist (Phase 3), local achievements migrate to the user profile on first login.

**Honest limitation:** localStorage means trophies are lost if the user clears their browser or switches devices. That is acceptable for Phase 1 and is exactly the itch that makes people sign up in Phase 3.

**Effort:** small to medium (mostly badge art and copy).

---

### 3. Surface the Rescan Counter ("roast count")

**What it is:** Every site already has a `checkCount` in the database that nobody sees. Show it. "This site has been roasted 37 times" turns popular targets into boss fights and is free social proof.

**How it works:**

1. The result screen and the `/r/[slug]` page show a line under the score: "Roasted 37 times".
2. On the leaderboard, add a small flame count next to each entry so the most-scanned sites stand out.
3. Optional flavor thresholds: 10+ roasts shows "crowd favorite", 100+ shows "public execution".

**Data and code needed:** the number already exists in the `Check` table. This is a display change plus including the field in the leaderboard API response.

**Effort:** very small. Best effort-to-payoff ratio of anything in this document.

---

### 4. Slop of the Week

**What it is:** A weekly spotlight at the top of the leaderboard: the worst (highest scoring) newly discovered site of the week wears a crown. Its counterpart, "Craft of the Week", honors the best new low score.

**How it works:**

1. A query finds the highest-scoring site first scanned within the current week (Monday to Sunday), and the lowest-scoring one.
2. The leaderboard page shows both in a highlighted card above the tabs: crown emoji, screenshot thumbnail, score, and its roast line.
3. The card links to the site's `/r/[slug]` page, which is good for internal linking and SEO too.
4. When a week ends, the winner is frozen into a small "hall of fame/shame" archive so past weeks remain browsable.

**Data and code needed:** one query (or a tiny `WeeklyWinner` table if we want the archive), plus a card component on the leaderboard page. Redis can cache the current week's winner.

**Effort:** small.

---

## Phase 2: the flagship game

### 5. Daily "Slop or Not" (the Wordle loop)

**What it is:** A daily guessing game at a new route, for example `/play`. Every day, the same 5 sites for every player worldwide. You see each site's screenshot and guess whether it is slop or built. At the end you get a shareable emoji grid. This is the feature designed to bring people back every single day and to spread on social media.

**How it works, player side:**

1. Player opens `/play` and sees round 1 of 5: a full screenshot of a real scanned site, with the URL hidden so they cannot cheat.
2. Two big buttons: "Slop" and "Built" (same 50-point split as idea 1). A harder mode can ask for the exact tier, 4 choices.
3. After guessing, the reveal: the real score ring animates in, the site name is unmasked, the roast line shows, and a link to the full `/r/[slug]` report is offered. Correct guess turns the round green, wrong turns it red.
4. After round 5, the results screen shows the day's score and a copy-to-clipboard share text:
  ```
   SLOPDAR #42
   🟢🟢🔴🟢🟢 4/5
   Can you spot the slop? slopdar.com/play
  ```
5. Streak tracking: played days in a row, best streak, guess accuracy, all in localStorage for now. One puzzle per day; coming back later the same day shows your finished result, exactly like Wordle.

**How it works, backend side:**

1. A daily puzzle is generated deterministically from the date (so all players get the same 5 sites, and no cron job is strictly required). Selection rules:
  - only sites with a good screenshot and no scan error
  - a deliberate mix: not all obvious, at least one high scorer, at least one low scorer, and at least one in the tricky middle band
  - never reuse a site within 60 days
2. A `GET /api/play/today` endpoint returns the 5 puzzle entries: screenshot URL, masked identity, and a puzzle token. It does not return the scores.
3. A `POST /api/play/guess` endpoint takes the token and the guess, and returns the real score and roast. Keeping scores server-side until after the guess prevents cheating by reading the network response early.
4. The share text and an OpenGraph card for `/play` make shared results look good on X and LinkedIn.

**Prerequisite check before building:** the game needs a healthy pool, roughly 300+ scanned sites with usable screenshots and a spread of scores, so 60 days of puzzles never feel repetitive. First step of Phase 2 is a query to count what qualifies. If the pool is thin, we widen the reuse window or seed the database by scanning well-known sites ourselves.

**Data and code needed:** new `/play` page (client component in the same brutalist style), two small API routes, one `PuzzleDay` table (or a deterministic date-seeded selection with a Redis cache), OG image for sharing.

**Effort:** medium. This is the biggest single feature in the plan and the one with the highest payoff.

---

## Phase 3: accounts and the human leaderboard

These need login. Th

e `User` and `SavedSite` models already exist in the Prisma schema, and Google sign-in via Auth.js was already the plan, so this phase starts by wiring that up.

### 6. Slop Hunter Leaderboard (people, not sites)

**What it is:** The existing leaderboard ranks sites. This one ranks players. Scanning becomes hunting: you earn points for discoveries, and the best hunters get public rank and titles.

**How it works:**

1. When a logged-in user scans a URL nobody has scanned before, they become that site's discoverer, recorded on the `Check` row (`discoveredById`).
2. Points, first draft of the economy:
  - +10 for scanning a brand-new domain
  - +25 bonus if the new site lands in Pure Slop (76+)
  - +25 bonus if it is genuinely Hand-Crafted (25 or lower), rare finds deserve equal glory
  - +1 for rescanning an existing site (small, so grinding rescans is pointless)
3. A `/hunters` page shows the top hunters weekly and all-time, with rank titles at point thresholds: Rookie, Scout, Bloodhound, Slop Radar, Chief Roaster.
4. Each hunter gets a public profile page listing their discoveries, achievements (migrated from Phase 1 localStorage), and daily game stats.
5. Anti-abuse, must ship with it, not after: rate limits per account (already have Redis), points only for domains that resolve and return real content, no points for scanning your own flood of subdomains (one score per registrable domain per day), and a manual review flag for suspicious spikes.

**Data and code needed:** Auth.js with Google, `discoveredById` on Check, a `points` ledger table (so scores are auditable, not just a counter), the `/hunters` page, profile pages.

**Effort:** large. This is the phase where Slopdar becomes a community rather than a tool.

### 7. Weekly Bounties

**What it is:** A rotating community challenge. "This week: find slop in the recipe niche." Focused hunting gives players a reason to log in even when they have no site in mind.

**How it works:**

1. Admin (you) defines a bounty: a title, a matching rule (keyword in title or host, or a tech-stack tag), and a date range.
2. Any qualifying discovery during the week counts toward the bounty. The best find (highest score matching the rule) wins.
3. Winner gets a permanent, dated badge on their profile ("Recipe Slop Bounty, July 2026") and a shoutout on the leaderboard page.
4. Start manual: picking the winner by hand each week is fine at first. Automate only if bounties take off.

**Data and code needed:** a `Bounty` table, an admin way to create them (can literally be a script at first), a bounty card on the leaderboard or hunters page.

**Effort:** medium, but only worth doing after idea 6 exists.

---

## Suggested build order and why


| Step | Items                                           | Login needed | Effort       |
| ---- | ----------------------------------------------- | ------------ | ------------ |
| 1    | Roast counter (3), Slop of the Week (4)         | no           | days         |
| 2    | Predict Before the Reveal (1), Achievements (2) | no           | days         |
| 3    | Daily Slop or Not (5)                           | no           | 1 to 2 weeks |
| 4    | Auth + Slop Hunter Leaderboard (6)              | yes          | weeks        |
| 5    | Bounties (7)                                    | yes          | after 6      |


Reasoning: steps 1 and 2 make the existing scanner stickier immediately with near-zero risk. Step 3 is the growth engine and still needs no accounts. Steps 4 and 5 convert the audience the daily game builds into registered, returning community members, and by then the localStorage trophies give people a real reason to sign up (to stop losing their stats).

## Design notes

- Everything stays inside the current brutalist look: mono fonts, hard borders, the existing tier colors and emoji. Game elements should feel like military radar equipment, not casino confetti.
- All player-facing copy keeps the roast tone, and per house style, no em dashes anywhere in site copy.
- Nothing in this plan changes the current scanner, scoring, or result pages. It only adds around them.

