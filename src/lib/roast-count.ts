// Copy helpers for a site's roast count (Check.checkCount), shared by the
// client result screen and the server-rendered /r/[slug] page.

/** Flavor title a site earns once it gets roasted enough. */
export function roastFlavor(count: number): string | null {
  if (count >= 100) return "public execution";
  if (count >= 10) return "crowd favorite";
  return null;
}

/** "roasted once" | "roasted 37 times" (+ flavor when earned). */
export function roastCountLine(count: number): string {
  const base = count === 1 ? "roasted once" : `roasted ${count.toLocaleString("en-US")} times`;
  const flavor = roastFlavor(count);
  return flavor ? `${base} · ${flavor}` : base;
}
