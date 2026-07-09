---
name: verify
description: How to run and visually verify Slopdar (Next.js 15) locally on this VPS
---

# Verifying Slopdar changes

Slopdar runs natively on this VPS (no Docker). `.env` at the repo root has the
real `DATABASE_URL` (MySQL, read from by dev mode too — queries are fine,
never mutate).

## Launch

```bash
PORT=3100 npm run dev   # run in background; port 3000 may be taken, 80/8080 are other apps
# ready when: curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/leaderboard  → 200
```

## Drive

- Pages: `/` (scanner), `/leaderboard`, `/r/<slug>` (result), `/api/leaderboard?tab=shame|fame&page=N&q=`.
- Screenshots: Playwright chromium is installed. Import from
  `/var/www/slopdar/node_modules/playwright`, viewports 1280x900 and 390x844.
  Run scripts with `node --import tsx <file>` (wrap in `async function main()`,
  no top-level await — tsx transpiles to CJS here).
- DB ground-truth checks: small tsx script importing
  `/var/www/slopdar/src/lib/db` (absolute path), run with
  `node --env-file=.env --import tsx <file>` from the repo root.

## Gotchas

- Site screenshots live in `public/screenshots/`; DB rows can point at files
  that no longer exist, so a broken `<img>` may be data rot, not your change.
- Kill the dev server when done; this box also serves production apps.
