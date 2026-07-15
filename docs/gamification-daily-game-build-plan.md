# Slopdar Daily Game: Plan

A simple daily guessing game built on Slopdar. One kind of user. Uses the websites we already have. Plain version below.

---

## The idea in one line

Show people two websites side by side and ask which one is slop (or which is built, and so on). Log in to save your score, climb the leaderboard, and if you finish in the top 3, your own website gets shown to everyone tomorrow.

---

## How the game works

- Each game has **5 questions**.
- Each question shows **2 websites** side by side (their screenshots).
- The user reads the question and taps the website they think is the answer.
- So one game uses **10 websites** in total.

Example of one question:

> Which one is slop?
> [screenshot A]   [screenshot B]

The user taps A or B. Right answer turns green, wrong turns red, and the real scores are shown.

Playing needs no login. Login is for saving your place on the leaderboard and for the top-3 reward.

---

## The 5 questions

We keep a small list of question types. Each game picks 5 of them, and for each one it picks 2 websites that make the answer clear.

1. **Which one is slop?** One high-score site vs one low-score site. Answer: the high one.
2. **Which one is built?** Same kind of pair. Answer: the low one.
3. **Which one is worse?** Two slop sites with a clear gap (like 60 vs 90). Answer: the higher one.
4. **Which one is cleaner?** Two built sites with a gap (like 10 vs 40). Answer: the lower one.
5. **Which one scores around 20 to 30?** One site in that range, one far away. Answer: the in-range one.

Rule: the two sites are always picked so there is one clear right answer. Never two sites that are too close to tell apart.

---

## Fair play (no cheating)

- **Every game is a fresh random pick** of questions and websites. So opening a private tab or refreshing gives you a different game, and anything you saw before is useless.
- **You get one scored game per day, and it only counts when you are logged in.**
  - A guest can play as much as they like, but it never touches the leaderboard. It is just for fun.
  - When you log in, you get your one real game, fresh, so nothing you saw as a guest helps.
  - After that game, that is your score for the day. Replaying just shows "you already played today."
- The scored game is tied to your account, not your device, so a private tab cannot get around it.
- The real answers stay on our server until you tap, so nobody can read them from the browser.

---

## Scoring (out of 100)

Your score has three parts: correct answers, speed, and streak. Split is **85 / 10 / 5**.

**1. Correct answers = 85 points.**
Each of the 5 questions you get right is worth 17 points (5 × 17 = 85).

**2. Speed = 10 points, measured per question.**
- Each question has a **10-second timer**. If it runs out, that question counts as wrong.
- The 10 points are split across the 5 questions, so 2 points per question.
- For each question you get right: `speed points = 2 × (time left ÷ 10)`.
  - Answer in 3 seconds → 2 × (7 ÷ 10) = 1.4 points.
- You only earn speed on questions you get **right**, so rushing wrong answers earns nothing.

**3. Streak = 5 points.**
Your longest run of correct answers in a row. 5 in a row = 5 points, 3 in a row = 3 points.

**Why this split.** With only 5 questions, a big speed part would let a fast player beat a more-correct player. At 85, that cannot happen: a 5-correct score is always 85 to 100, and a 4-correct score is always 68 to 83. They never overlap, so **more correct always wins**, and speed and streak only order the people who tied on correct answers.

**Example:** all 5 right, each in 3 seconds, streak of 5 → 85 + (5 × 1.4) + 5 = **97**.

---

## The reward: your website in front of the crowd

This is the hook that brings people back and makes them log in.

- If you finish in **today's top 3**, your own website is used in tomorrow's games (as one of the two sites in a question).
- When your site shows up and the answer is revealed, everyone sees it is yours, with a link.
- So winning today means real eyeballs on your website tomorrow.

To claim it, a user adds their own website to their profile (a simple field). No website means the reward just cannot be given, which nudges people to add it.

We push this on the end screen, the leaderboard, and the login prompt.

---

## The leaderboard

- **Today's board:** who scored best today. It resets every night, so anyone who plays today can top it, even someone who joined this morning. This is the main reason to come back.
- We can add a weekly board and an all-time board later. Same data, easy to add.

---

## Login

- Google login.
- Needed to save your rank and claim the top-3 reward. The game is fully playable without it.
- We show a public name (a handle) on the board, never your email.

---

## What we build (short technical list)

- One new page: `/play`.
- Server endpoints: one to start a game (gives 5 questions and their site pairs, answers hidden), one to check a tap and reveal, one to finish and save the score.
- A small list of question types, each with a rule for picking its 2 sites from the existing `Check` table.
- Fresh random game every time. One scored game per day per logged-in user, enforced on the server.
- Google login (Auth.js), which the site does not have yet.
- A public handle and a website field on the user.
- One small table for each player's daily score.
- A tiny once-a-day job that locks in yesterday's top-3 winners so their sites are used in tomorrow's games.
- When a site belongs to a user, the reveal shows their handle and a link (the eyeballs payoff).
- Same brutalist style as the rest of the site. Roast tone, no em dashes.

---

## Still to decide

1. **Content safety.** Some scanned sites may be offensive. Sites shown in the game (especially winners' sites) need a safety check. How strict?
2. **What timezone** defines "today" for the daily reset.
3. The prod count of usable sites, and Google login credentials, before coding.

## Decided so far

- Game: 5 questions, 2 websites each, tap the answer. Question type varies (which is slop, built, worse, cleaner, in a score range).
- Fresh random game every time. One scored game per day, only when logged in. Guest play is practice only.
- Scoring out of 100: correct 85, speed 10 (per question, 10-second timer), streak 5. More correct always wins.
- Reward: today's top 3 get their website shown to everyone tomorrow.
- Leaderboard: today's board, resets nightly.
- Login: Google, only to save rank and claim the reward. Public handle only, no email shown.
