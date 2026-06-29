# Slopdar — Tech Stack (Locked)

All self-hosted on Mukund's own VPS. No Vercel, no Supabase. Everything below is
free and open-source — only real cost is the domain (~$10/year).

## Final stack

| Part | Pick | Notes |
|---|---|---|
| **Framework** | **Next.js** (App Router, standalone) | Frontend + API + scanner + share images in one app |
| **Database** | **MySQL 8** | Charset **utf8mb4** (so 🌊 🤖 emojis save correctly) |
| **ORM** | **Prisma** or **Drizzle** | Both support MySQL well |
| **Auth** | **Auth.js (NextAuth)** | Google login, self-hosted |
| **Styling** | **Tailwind CSS** + **Framer Motion** | Fast build + motion accents |
| **Screenshots** | **Playwright** (on the VPS) | Free — own headless Chrome |
| **Scanner** | **Node + Cheerio** | Fetch + parse HTML, run checks |
| **Cache / rate limit** | **Redis** | Cache results, stop abuse |
| **Share cards** | **Satori / @vercel/og** | Works off-Vercel, generates images locally |
| **Web server** | **Caddy** (auto HTTPS) or **Nginx** | Reverse proxy + SSL |
| **Process manager** | **PM2** | Keep app running, auto-restart |
| **Analytics** | **Umami** (self-hosted) | Privacy-friendly |

## Why Next.js (not Astro)

This is a *dynamic* app (user input, scanner, DB, auth, dynamic share images).
Next.js does frontend + API + per-site SEO pages + image generation in one tool.
Astro is better for static/content sites (e.g. the personal site), not this.

## Architecture on the VPS

```
        Internet
           │
        Caddy / Nginx   ← HTTPS + reverse proxy
           │
   ┌───────┴────────┐
   │   Next.js app  │  ← frontend + API + scanner
   └───┬────────┬───┘
       │        │
     MySQL    Redis      ← data + cache
       │
   Playwright (Chrome)   ← takes screenshots
```

## Self-hosting notes

- Run Next.js, MySQL, Redis, and Playwright natively on the VPS (no containers).
- Playwright needs system fonts/libs → install them with
  `npx playwright install --with-deps chromium`.
- **Caddy** over Nginx if you want zero-effort auto-renewing HTTPS for slopdar.com.
- Nightly `mysqldump` backup so the leaderboard is never lost.

## Current environment status (checked 2026-06-28)

**Installed:** Node v24.16, npm 11.13, MySQL 8.0, git, nginx
**Not yet installed:** Redis, Caddy, PM2, pnpm (recommended package manager)
**npm project deps:** none yet — installed during the build phase.
