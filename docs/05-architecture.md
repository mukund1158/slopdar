# Slopdar — App Architecture & Folder Structure

## Folder structure

```
slopdar/
├── docs/                 # all reference docs (this folder)
├── src/
│   ├── app/              # Next.js App Router — pages + API routes
│   ├── components/       # reusable UI components
│   ├── lib/              # shared helpers (db client, utils, config)
│   ├── scanner/          # the detection engine (signals, scoring)
│   ├── server/           # server-side logic (services, screenshot, queue)
│   └── styles/           # global styles / Tailwind setup
├── public/               # static assets (logo, favicon, og defaults)
├── prisma/               # DB schema + migrations (if using Prisma)
└── README.md
```

## Planned `src/app` routes (App Router)

```
src/app/
├── page.tsx                  # Home
├── r/[slug]/page.tsx         # Result page (e.g. /r/stripe.com) — SEO
├── leaderboard/page.tsx      # Wall of Shame / Hall of Fame / Recent
├── compare/page.tsx          # Compare two sites
├── badge/page.tsx            # Badge generator + embed code
├── how-it-works/page.tsx
├── about/page.tsx
├── profile/page.tsx          # logged-in history
└── api/
    ├── check/route.ts        # POST a URL → run scan → return result
    ├── og/route.ts           # dynamic share-card image
    ├── badge/[slug]/route.ts # dynamic badge image
    └── leaderboard/route.ts  # leaderboard data
```

## Scanner pipeline (`src/scanner`)

```
1. fetch(url)        → HTML + headers     (lib: undici/fetch + cheerio)
2. detect signals    → run each rule      (returns matched tells + points)
3. detect tech stack → Wappalyzer-style patterns
4. screenshot(url)   → Playwright         (src/server/screenshot)
5. score()           → sum weighted points → Slop Score + tier
6. persist()         → save to MySQL, update leaderboard
```

Each signal rule is a small, self-contained module:
`{ id, category, weight, description, test(html, headers, $) → boolean }`

## Data model (high level — see prisma schema later)

- **Check** — url, slug, score, tier, screenshot, createdAt
- **Signal** — checkId, category, label, points (the receipts)
- **TechStack** — checkId, name
- **User** — (optional) id, email, name (Google)
- **SavedSite** — userId, checkId

## Caching & rate limiting

- Redis caches a check result for a URL (e.g. 24h) → repeat checks are instant.
- Redis rate-limits by IP to stop abuse.
