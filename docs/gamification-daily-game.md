# Slopdar Daily Game and Leaderboards (Locked Design)

This doc builds on idea #5 ("Daily Slop or Not") in [gamification-plan.md](./gamification-plan.md) and locks in the decisions we made about how the daily game, the founder exposure loop, and the leaderboards actually work.

Goal, in one line: **a free daily guessing game whose shareable results pull in a casual crowd, and whose logged-in founders compete daily to keep their own product in front of that crowd, losing their turn if they stop showing up.**

---

## Why this design (the retention logic)

The scanner is a novelty tool. A person scans a few sites they care about and leaves. That is great for reach, but it gives nobody a reason to return daily. So the daily habit has to come from something other than the scan.

Two facts shape the whole design:

1. **Our audience is founders and builders.** Traffic comes from X and Reddit, where we target founders. The people who care whether a site is "vibe-coded or hand-crafted" are mostly builders themselves. So this is a peer audience (closer to Indie Hackers than to a random consumer tool).
2. **For founders, the thing worth returning for is exposure, not a streak.** Founders do not come back daily for an emoji grid. They come back for eyeballs on the product they built.

So the reward the whole game hands out is **distribution**: a founder's own product gets shown to the crowd. Everything below exists to make that reward real, fresh, and fair.

---

## The two sides

The game only works because it serves two different groups at once:

- **Players (the demand / the eyeballs):** mostly casual visitors arriving from shared result grids. They play the game for fun and never sign up. They are the audience founders want to reach.
- **Founders (the supply):** logged-in builders who put their own product into the game to be seen by those players.

**The load-bearing metric: players must always outnumber founders (players-per-founder well above 1).** If the only people looking are other founders farming exposure, the "exposure" becomes circular (an engagement pod) and dies. The shareable emoji grid is what keeps pumping in fresh casual players, so it is not optional decoration, it is what keeps the founder reward worth anything.

---

## The daily game (player side)

Built on idea #5, with these locked choices:

- **10 sites per day**, a deliberate mix of **5 slop and 5 built**. The same 10 for every player worldwide that day.
- **Free to play. No login required to play.** Nothing gates the fun at the top of the funnel.
- Each round shows a real website screenshot with the identity hidden so nobody can cheat.
- Two buttons: **Slop** or **Built** (the same 50-point split the scanner uses).
- **The reveal is the exposure moment.** After a guess, the score animates in and the site is unmasked. If that site belongs to a founder, the reveal also shows their **founder profile**: name and avatar, one line of positioning in their own words, and a single link to the product. A genuinely hand-crafted score is worn as a badge of honor.
- After all 10, a shareable emoji grid (`SLOPDAR #42, 8/10`) with a link back to the game. This is the growth pump.
- One puzzle per day. Coming back later the same day shows the finished result, Wordle-style.

The reward for a founder is simple and real: if 2,000 people play today and your product is one of the 10, then 2,000 builders looked at your product and read your one-line pitch.

---

## Login timing

Ask for login **after** the fun, at the moment the player most wants something they cannot get without it.

- **Guest finishes the day:** "You scored 8/10. Log in to claim your seat and put your own product into tomorrow's game." The hook is getting their product shown, not a leaderboard row.
- **Already logged in:** go straight to their rank, their product's current rotation status, and their live numbers ("your product is in the game today, seen 340 times"). Founders return for their own numbers.

---

## How a founder's product gets shown: rotation, not ranking

**Decision: game slots are filled by a rotation (a line / queue), never by leaderboard rank.**

Why not by rank: a ranking sticks. The same top players stay on top, so the same products would show for days. That is stale for players and unfair to everyone outside the top few. It breaks the game for both sides.

The rotation, in plain terms, is a line at a counter:

1. Every founder who signs up and plays puts their product **in line**.
2. Each day, the game pulls the **next 10 in line** to be shown.
3. Once shown, a product goes to the **back of the line**.
4. So tomorrow is a different 10, and the day after a different 10 again.

What this buys us:

- **Players** get fresh sites every day, so the game stays fun and worth returning to.
- **Founders** all get a fair turn, not just a frozen top 10. The pitch to a newcomer becomes "sign up and your product **will** get its turn," not "get featured only if you beat everyone."

**The founder daily-return driver: you only stay in line if you keep playing.**

- Play today, you stay in the active line and your turn keeps approaching.
- Go quiet for a few days, you drop out of the line and your turn never arrives.
- Come back, you rejoin at the back.

So founders return daily to keep their place in line so their turn actually comes. No stale top 10, and still a real daily reason to show up.

Worked example, 100 founders in line:
- Monday: the game shows founders 1 to 10.
- Tuesday: 11 to 20 (Monday's founders are now at the back).
- Wednesday: 21 to 30.

Different products every day, and anyone who stopped playing is quietly pulled from the line.

---

## Leaderboards

The leaderboards are a **separate thing** from the game content. They decide *status and bragging rights*, not who gets shown. Keeping them separate is what lets the boards have winners without freezing the game content.

**The core rule that ties all of this together: the live, competitive boards must never rank by total points piled up over time.** Cumulative all-time totals lock the door behind early players. A person who joins on day 90 can never catch three months of someone else's accumulated points, sees they are nowhere near the top, and quits. Every live board must stay winnable no matter when someone joins.

Four boards, each doing one job:

### 1. Today (resets every night)
- Everyone starts at zero each morning. The board shows only how you did today. It clears tonight.
- Anyone can win today, even someone who joined this morning. If a newcomer guesses 10 out of 10, they top today's board on day one.
- Doubles as a daily-return reason: to be on the board you have to play *today*, because yesterday's board is gone.

### 2. This week (resets Monday)
- A slightly longer race for the more committed, for people who do not want the pressure of literally every single day.

### 3. All-time best (never resets, but still beatable)
- **This is NOT total points added up.** It ranks each person's **single best performance** (or longest streak), so a pile of points cannot grow forever and lock people out.
- Because it is about your best single result, a newcomer can break the record on their first day.
- Metric options to keep it interesting long term (pick one when we build it):
  - **longest streak** of days played in a row, or
  - **best accuracy across at least ~50 games** (rewards being consistently good, not one lucky day), or
  - **most days won** total (this one leans slightly toward veterans, but as an achievement it is fair).

### 4. Hall of Fame (permanent archive)
- The record of past winners: "Winner, July 9", "Winner, July 10". Once you win a day, your name is carved there forever.
- This is where loyal early players collect permanent trophies, so a resetting live board never makes their history feel like it vanished.

The split to remember: **live boards reset (Today, Week) or rank by personal best (All-time). The permanent record (Hall of Fame) is a separate archive.** Mix those up and the newcomer lock-out comes straight back.

---

## Keeping exposure honest (ships with the feature, not after)

- One product slot per founder per registrable domain. No flooding.
- A founder's own product never appears in their own daily 10.
- Quality gate on submitted products: real content, working screenshot, resolves. Same bar the puzzle pool already uses.
- Rate-limit guessing so nobody can bot-farm a leaderboard spot.
- Watch **players-per-founder**. If the casual crowd ever shrinks below the founder crowd, the exposure goes circular. That metric is the health check for the whole loop.

---

## What we deliberately are NOT adding yet

Points economies, rank titles, bounties, and achievements (Phase 3 in the main plan) stay parked. They are decoration until the core loop proves itself. Ship the smallest version that answers one question: **do founders come back tomorrow to keep their product in the game?** If yes, the rest is easy to add. If no, no amount of badges will save it.

---

## Locked vs still open

**Locked (decided):**
- Free daily game, 10 sites, 5 slop and 5 built, no login to play.
- Login asked after playing, framed as "claim your seat and get your product into the game".
- The reward is exposure: a founder's product appears in the game reveal with their profile and link.
- Game slots are filled by a rotation (line/queue), not by leaderboard rank. Daily play keeps you in line.
- Four leaderboards: Today (daily reset), This week (weekly reset), All-time best (personal best or streak, never cumulative totals), Hall of Fame (permanent archive).
- Core rule: live boards never rank by total accumulated points.
- Anti-abuse and the players-per-founder health metric ship with it.

**Still open (to decide before building):**
- Does a founder earn or advance their place in line by **skill** (guess well) or by **participation** (just show up and play)? This sets the whole personality.
- What exactly moves a founder up the line faster, if anything.
- Which single metric the All-time best board uses (best score vs longest streak vs best accuracy).
- Whether the **main** board people see first is Today or This week.
- Whether the puzzle pool needs seeding first (idea #5 notes it wants ~300+ sites with good screenshots before daily puzzles feel non-repetitive).

---

## Design notes (house style)

- Everything stays inside the current brutalist look: mono fonts, hard borders, existing tier colors and emoji. Game elements feel like radar equipment, not casino confetti.
- All player-facing copy keeps the roast tone.
- No em dashes anywhere in site copy.
- Founder-facing copy about Mukund speaks in the first person.
