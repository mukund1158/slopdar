# Slopdar — Development Setup

Foundation (design-independent) build. **No UI/visual design yet** — that comes
after the design is approved (see `START-HERE.md` / `docs/09-roadmap.md`).

## What's in the foundation

| Area | Location |
|---|---|
| Next.js app shell (App Router, standalone) | `src/app/` |
| Detection engine (signals, scoring, tech) | `src/scanner/` |
| SSRF guard + URL/normalisation | `src/lib/ssrf.ts`, `src/lib/url.ts` |
| Safe HTML fetch (undici + SSRF lookup) | `src/scanner/fetch.ts` |
| Screenshot service (Playwright) | `src/server/screenshot.ts` |
| Check orchestration + cache + persist | `src/server/check-service.ts` |
| Rate limiting (Redis) | `src/server/rate-limit.ts` |
| Public API | `POST /api/check` |
| DB schema | `prisma/schema.prisma` |

## Prerequisites (run natively on the VPS — no Docker)

- **MySQL 8** (already installed). Create the database and user once:
  ```sql
  CREATE DATABASE slopdar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'slopdar'@'localhost' IDENTIFIED BY 'change-me';
  GRANT ALL PRIVILEGES ON slopdar.* TO 'slopdar'@'localhost';
  FLUSH PRIVILEGES;
  ```
- **Redis** (not yet installed): `sudo apt install redis-server && sudo systemctl enable --now redis-server`

## First-time setup

```bash
# 1. Install deps (also runs `prisma generate`)
npm install

# 2. Install the headless browser for screenshots
npm run playwright:install

# 3. Configure env (point DATABASE_URL / REDIS_URL at the local services above)
cp .env.example .env        # then edit secrets

# 4. Create the database schema
npm run prisma:migrate -- --name init

# 5. Run the app
npm run dev                 # http://localhost:3000
```

## Try the scanner

```bash
# CLI (no DB / no screenshot):
npm run scan -- https://vercel.com

# API (full pipeline):
curl -s localhost:3000/api/check \
  -H 'content-type: application/json' \
  -d '{"url":"https://vercel.com"}' | jq
```

## Security notes (built in, don't remove)

- **SSRF**: `src/lib/ssrf.ts` blocks private/loopback/link-local/metadata IPs and
  re-validates on every connection (incl. redirects) via undici's `connect.lookup`.
  In production, also restrict the scanner's egress at the network layer.
- **Rate limiting**: per-IP fixed window via Redis (`RATE_LIMIT_*` env vars).
- `ALLOW_PRIVATE_HOSTS=1` disables SSRF host checks — **local dev only**.

## Tuning the detector

Signal weights and tier thresholds are placeholders (see the TODOs in
`docs/06-scanner-logic.md`). Add rules under `src/scanner/signals/` and register
them in `src/scanner/signals/index.ts`.
