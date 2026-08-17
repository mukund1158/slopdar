# Slopdar 🛰️

### Is it built or is it slop?

Paste any website link and get a **Slop Score (0-100)**, the receipts behind
it, and a shareable card showing whether it looks **hand-coded** or
**vibe-coded / AI-made**.

Live at **[slopdar.com](https://slopdar.com)**, with 1,600+ sites roasted so far.

I'm Mukund. I built Slopdar solo as a fun side project, and now the whole app
is open source. The code is all here; the roast wall, the scan database and
the domain stay with me. Run your own copy, poke at the detection rules, or
send a PR.

---

## How it works

No AI, no API bills. The scanner is pure pattern rules:

1. Fetches the page HTML safely (SSRF guard, size and redirect limits).
2. Runs it through the signal rules in [`src/scanner/`](./src/scanner):
   AI copy tells, template fingerprints, generic layout smells, leftover
   boilerplate, tech stack detection.
3. Adds the weighted signals up into a 0-100 Slop Score, with evidence
   attached to every point.
4. Takes a screenshot (Playwright) and renders a shareable roast card.

Every check is cached in MySQL and rate limited per IP through Redis.

## What's inside

- **The scanner** and crawlable report pages with full receipts
- **Fix-your-slop kit**: quick wins plus a copy-paste AI prompt, and a
  re-scan delta to prove the score dropped
- **Slop or Not**, a daily game: guess built or slop, keep a streak, climb
  the leaderboard
- **Founder profiles** with dofollow links you earn by winning
- Share cards, launch badges and SEO field guides

## Self-host in five minutes

You need **Node 20+**, **MySQL 8** and **Redis**.

```bash
git clone https://github.com/Slopdar/slopdar.git
cd slopdar
npm install                  # also runs prisma generate
npm run playwright:install   # headless Chromium for screenshots
cp .env.example .env         # then fill DATABASE_URL and REDIS_URL
npm run prisma:migrate       # create the tables
npm run dev
```

Open http://localhost:3000 and scan something.

Google login (used by the daily game) is optional: set `AUTH_SECRET`,
`AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env` and sign-in switches on by
itself. Everything else works without it. Your install starts with an empty
database; the 1,600+ roasts on slopdar.com are not included.

## Tech stack

Next.js 15 (App Router) · React 19 · MySQL 8 + Prisma · Redis · Auth.js ·
Cheerio · Playwright. In production I run it natively with PM2 behind Nginx.
No Docker, no external APIs, so hosting costs basically nothing beyond the
domain.

## Docs

The planning and reference docs I built Slopdar from live in [`docs/`](./docs):

| Doc | What's in it |
|---|---|
| [00-overview](./docs/00-overview.md) | The idea, why it exists, direction |
| [01-product](./docs/01-product.md) | Full product vision |
| [02-features](./docs/02-features.md) | Complete feature list |
| [03-pages](./docs/03-pages.md) | All pages + page map |
| [04-tech-stack](./docs/04-tech-stack.md) | The stack and why it's all free |
| [05-architecture](./docs/05-architecture.md) | Folder structure + scanner pipeline |
| [06-scanner-logic](./docs/06-scanner-logic.md) | Every detection signal, explained |
| [07-costs](./docs/07-costs.md) | Costs (basically just the domain) |
| [08-branding](./docs/08-branding.md) | Name, tagline, voice |
| [09-roadmap](./docs/09-roadmap.md) | Status + build order |

## Structure

```
slopdar/
├── docs/            # planning and reference docs
├── prisma/          # schema + migrations (MySQL)
├── scripts/         # cron jobs and maintenance scripts
├── src/
│   ├── app/         # Next.js pages + API routes
│   ├── components/  # UI components
│   ├── lib/         # shared helpers (env, auth, ssrf, game logic)
│   ├── scanner/     # the detection engine (signals, scoring, fixes)
│   ├── server/      # check orchestration, rate limit, screenshots
│   └── styles/
└── public/
```

## Contributing

Fork the repo, make a branch, open a PR against `main`. I review and merge
everything myself, so small, focused PRs land fastest. New detection signals
are the most fun thing to contribute, and every signal needs tests. Details in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) for the code. The Slopdar name, the slopdar.com domain and
the scan data on the live site are mine and not part of the license.

> *Yes, Slopdar runs on the slop stack. We know.* 🌊
