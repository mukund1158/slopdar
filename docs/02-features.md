# Slopdar — Features (Full List)

## Detection features (the brain)

- URL checker (the main engine)
- Slop Score calculation (0–100)
- Tier / label system (Hand-Crafted → Pure Slop)
- Evidence / proof list ("the receipts")
- Website screenshot capture
- Tech stack detection (Next.js, Vercel, Supabase, Tailwind, etc.)
- AI-tool fingerprint detection (v0, lovable, bolt, cursor, etc.)
- Copy / text analysis (AI writing patterns, em-dash density, buzzwords)
- Design / layout pattern detection (bento grids, gradient blobs, fake logos)
- Leftover-junk detection (lorem ipsum, "Your Company", placeholder links,
  default favicons)

## Fun & social features

- Auto-generated share image card (the viral surface)
- Roast mode (Nice 😇 vs Brutal 😈 toggle)
- Leaderboard — Wall of Shame 🤖 + Hall of Fame 🛠️
- Compare two sites side by side
- Embeddable badges ("Certified Hand-Coded" / "Proudly Vibe-Coded")
- Live "sites checked" counter
- Recently checked feed

## Growth features

- Share buttons (X, LinkedIn, WhatsApp, copy link)
- Per-result shareable links (e.g. `slopdar.com/r/stripe.com`)
- SEO pages for each checked site (free Google traffic)
- "Check your competitor" prompts

## Account features (optional)

- Login (Google via Auth.js)
- Check history
- Saved sites

## Money features (later, not at launch)

- Free: basic check
- Pro: bulk checks, detailed report, API access, no ads
- API for developers / businesses
- Sponsored / ad slots

## Detection signal categories (summary)

| Category | Example tells |
|---|---|
| 🏷️ Tool fingerprints | v0/lovable/bolt meta tags, build IDs, asset URLs |
| 🎨 Default-stack tells | Untouched shadcn, default Tailwind colors, lucide icons |
| 📝 Copy tells | Em-dashes, "Elevate/Seamless/Effortless", emoji headers |
| 🧱 Layout tells | Bento grids, gradient blobs, fake "trusted by" logos |
| 🔧 Leftovers | Lorem ipsum, "Your Company", placeholder links, default favicon |
| ☁️ Stack | Vercel + Next + Supabase combo |

(Full detail in `06-scanner-logic.md`.)
