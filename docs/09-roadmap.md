# Slopdar — Roadmap & Status

## Current status

- ✅ Idea defined (overview)
- ✅ Product + features + pages defined
- ✅ Name + domain locked (slopdar.com)
- ✅ Tech stack locked (self-hosted on VPS)
- ✅ Docs + folder structure created
- ⏭️ **NEXT: UI design** (via Claude design) → **approval** → then build
- ⛔ Building has NOT started (by Mukund's instruction — design first)

## Build order (planned, after design approval)

1. **Project setup** — Next.js + Tailwind + MySQL + Prisma/Drizzle
2. **Scanner engine** — fetch + signals + scoring (the brain)
3. **Screenshot service** — Playwright on VPS
4. **Result page + share card** — the viral surface
5. **Home page** — input + examples + counter
6. **Leaderboard** — Wall of Shame / Hall of Fame / Recent
7. **Compare page**
8. **Badge generator**
9. **Auth + profile/history** (optional)
10. **How it works / About**
11. **Polish, SEO, analytics, rate limiting**
12. **Launch** 🚀

## Open decisions for later

- Prisma vs Drizzle
- Caddy vs Nginx
- Regex-only vs optional LLM copy analysis (cost)
- Score thresholds & signal weights (tune against real sites)

## Reminder

Design must be approved before any app code is written.
