# Slopdar 🛰️

### Is it built or is it slop?

Paste any website link → get a **Slop Score (0–100)**, the proof behind it, and a
shareable card showing whether it looks **hand-coded** or **vibe-coded / AI-made**.

A fun, viral, curiosity-driven tool. Self-hosted. Built solo (indie-hacker style).

---

## 📚 Docs

All planning & reference lives in [`docs/`](./docs):

| Doc | What's in it |
|---|---|
| [00-overview](./docs/00-overview.md) | The idea, why it exists, direction |
| [01-product](./docs/01-product.md) | Full product vision (no MVP) |
| [02-features](./docs/02-features.md) | Complete feature list |
| [03-pages](./docs/03-pages.md) | All pages + page map |
| [04-tech-stack](./docs/04-tech-stack.md) | Locked tech stack (self-hosted) |
| [05-architecture](./docs/05-architecture.md) | Folder structure + scanner pipeline |
| [06-scanner-logic](./docs/06-scanner-logic.md) | Detection signals (the moat) |
| [07-costs](./docs/07-costs.md) | Costs (basically just the domain) |
| [08-branding](./docs/08-branding.md) | Name, tagline, domain, voice |
| [09-roadmap](./docs/09-roadmap.md) | Status + build order |

---

## 🛠️ Tech stack (short version)

Next.js · MySQL · Prisma/Drizzle · Auth.js · Tailwind + Framer Motion ·
Playwright · Cheerio · Redis · Caddy/Nginx · PM2 · Umami — all self-hosted on
the VPS. Only real cost: the domain.

## 📁 Structure

```
slopdar/
├── docs/        # all reference docs
├── src/
│   ├── app/        # Next.js pages + API
│   ├── components/  # UI components
│   ├── lib/         # shared helpers
│   ├── scanner/     # detection engine
│   ├── server/      # server-side logic
│   └── styles/
├── public/
└── prisma/
```

## 🚦 Status

Planning done. **Next: UI design → approval → build.**
Building has not started yet.

> *Yes, Slopdar runs on the slop stack. We know.* 🌊
