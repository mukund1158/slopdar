// Founder profile helpers, shared by the profile API and the public page.

/** Streak needed to earn dofollow links without ever winning. */
export const DOFOLLOW_MIN_STREAK = 3;
export const MAX_PRODUCTS = 3;

/** Product categories offered in the editor. */
export const PRODUCT_CATEGORIES = [
  "SaaS",
  "Dev tool",
  "AI",
  "Marketing",
  "Design",
  "Productivity",
  "Fintech",
  "E-commerce",
  "Social",
  "Other",
] as const;

/** Links are nofollow until a founder earns them: win a day, or keep an active
 *  streak. This keeps spammers out and makes the game worth playing. */
export function hasEarnedDofollow(opts: { bestStreak: number; wins: number }): boolean {
  return opts.wins > 0 || opts.bestStreak >= DOFOLLOW_MIN_STREAK;
}

/** Add https:// when a founder pastes a bare domain, and trim. */
export function normalizeProductUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return v;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}
