# 🛰️ Slopdar — Start Here (New Session Briefing)

> **Paste this file (or point Claude to it) at the start of a new session.**
> It gives full context so you don't have to re-explain anything.

---

## Who I am

I'm Mukund — a solo software engineer on the indie-hacker path (levelsio / marklo
style), shipping multiple products solo. Slopdar is a new "for fun" project.

## What Slopdar is

A website where anyone pastes a link and gets told whether that site looks
**hand-coded by a real dev** or **vibe-coded / AI-generated** — with a fun
**Slop Score (0–100)**, the proof behind it, and a shareable result card.

**Tagline:** *Is it built or is it slop?*
**Domain:** slopdar.com (locked)
**Direction:** Website URLs · playful/meme-y tone · viral + curiosity wedge.

**Core loop:** Paste a URL → Slop Score → see the proof ("receipts") → share it.

**Honest framing:** we detect *signals*, not proof. Say "we found N tells", never
"this is X% AI". Footer joke: *"Yes, Slopdar runs on the slop stack. We know. 🌊"*

## Tech stack (locked, all self-hosted on my VPS — only cost is the domain)

Next.js (App Router) · MySQL 8 (utf8mb4) · Prisma or Drizzle · Auth.js (Google) ·
Tailwind + Framer Motion · Playwright (screenshots) · Cheerio (scanner) · Redis ·
Satori/@vercel/og (share cards) · Caddy or Nginx · PM2 · Umami.

**Already installed on VPS:** Node v24.16, npm 11.13, MySQL 8.0, git, nginx.
**Not yet installed:** Redis, Caddy, PM2, pnpm.

## Pages

Home · Result (`/r/[slug]`) · Leaderboard (Wall of Shame / Hall of Fame / Recent) ·
Compare · Badge · How it works · About · Profile (login).

## Folder structure

```
slopdar/
├── docs/         # all reference docs (READ THESE for detail)
├── src/
│   ├── app/        # Next.js pages + API routes
│   ├── components/  # UI components
│   ├── lib/         # shared helpers
│   ├── scanner/     # detection engine (the moat)
│   ├── server/      # server-side logic (screenshot, services)
│   └── styles/
├── public/
└── prisma/
```

## 📚 Read the docs for full detail

Everything is documented in `docs/`:
`00-overview`, `01-product`, `02-features`, `03-pages`, `04-tech-stack`,
`05-architecture`, `06-scanner-logic`, `07-costs`, `08-branding`, `09-roadmap`.

---

## ⚠️ CURRENT STATUS — read this

- ✅ Planning done: idea, product, features, pages, name, domain, tech stack, docs,
  folder scaffold all complete.
- ⏭️ **NEXT STEP: UI design** — I'm creating the design via Claude design first.
- ⛔ **DO NOT start building / writing app code yet.** Build only begins **after I
  approve the UI design.**

## What I likely want next session

One of:
1. Help turning an approved design into the real Next.js app (build phase).
2. Finalizing the scanner signal list / scoring (`docs/06-scanner-logic.md`).
3. Design feedback / iteration.

Ask me which, then proceed. Don't assume building has been approved.

---

## My design taste (for reference)

Brutalist base + cinematic motion accents; print/craft over tech-cosplay.
A previous HUD/sci-fi "mission-control" direction was rejected — avoid that.
