# Contributing to Slopdar

Thanks for wanting to make the slop detector better. A few ground rules so
your PR lands quickly.

## How it works here

I'm the only maintainer. Every change comes in as a pull request, I review it,
and I merge it. There are no direct pushes for anyone but me. That keeps the
project coherent, but it also means your best move is a **small, focused PR**:
one signal, one fix, one improvement at a time. Big mixed PRs sit longer.

## Workflow

1. Fork the repo and create a branch from `main`.
2. Make your change. Match the style of the surrounding code.
3. Run the checks locally:
   ```bash
   npm run lint
   npm test
   ```
4. Open a PR against `main` with a short description of what and why.

## Commit messages

Single line, under 60 characters, with a type prefix:

```
Feat: detect placeholder pricing tables
Fix: score card overflow on long hostnames
Docs: clarify Redis setup on macOS
```

Types: `Feat`, `Fix`, `Refac`, `Chore`, `Docs`, `Style`, `Test`, `Perf`.
No emoji in commit messages, no AI co-author trailers.

## The fun part: detection signals

The scanner lives in [`src/scanner/`](./src/scanner), and new signals go in
`src/scanner/signals/`. A good signal PR has:

- The rule itself, with a weight that matches how strong the tell is
- Evidence text, because every point on the score must show its receipt
- Tests (`*.test.ts` next to the code, run with `npm test`)
- A false-positive check: would this flag a normal hand-made site? If yes,
  lower the weight or tighten the pattern.

One more style rule that is very much enforced: no em dashes in any
user-facing copy. The scanner literally flags them.

## What I will say no to

- Anything that weakens the SSRF guard, rate limiting or input validation
- Secrets, `.env` files, API keys or dumps of scan data in the repo
- Features that roast people instead of websites. Keep it fun.
- Adding paid APIs or LLM calls to the default scan path. The free,
  self-hostable scanner is the whole point.

## Questions

Open a GitHub issue. Roast responsibly.
