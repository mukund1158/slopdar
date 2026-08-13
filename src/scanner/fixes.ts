// The fix registry — how to clear each receipt the scanner produces.
// One entry per signal id (signals/index.ts). Pure data + string builders so
// the client bundle can import this without dragging in cheerio.
//
// Copy rules (see docs + memory): plain words, no em dashes, no marketing
// buzzwords. The scanner flags those; its own advice must not trip it.

/** The slice of a matched signal the fix machinery needs (MatchedSignal and
 * the DB Signal rows both satisfy it after a trivial mapping). */
export interface FixInput {
  id: string;
  weight: number;
  evidence?: string;
}

export interface SignalFix {
  /**
   * False for informational tells the owner should NOT act on (e.g. "Hosted
   * on Vercel" is not slop by itself) and for platform artifacts that cannot
   * be removed without leaving the platform. These show a note in the UI but
   * add nothing to the fix prompt.
   */
  fixable: boolean;
  /** Plain-words "what to do", shown under the receipt on the result page. */
  summary: string;
  /** One instruction for the combined AI fix prompt. Omit when not fixable. */
  prompt?: (evidence?: string) => string;
}

const withEvidence = (evidence: string | undefined, prefix: string) =>
  evidence ? ` ${prefix} ${evidence}.` : "";

export const SIGNAL_FIXES: Record<string, SignalFix> = {
  // ── 🏷️ fingerprints ───────────────────────────────────────────────────────
  "fingerprint.v0": {
    fixable: true,
    summary: "Remove the v0 generator meta tag and v0.dev references, then customise the design so it stops looking like stock v0 output.",
    prompt: () =>
      "Remove every reference to v0.dev from the page source: the generator meta tag, script URLs and HTML comments. Then change the visual design (colors, spacing, typography) so it no longer matches stock v0 output.",
  },
  "fingerprint.lovable": {
    fixable: true,
    summary: "Strip Lovable build artifacts (data-lov-id attributes, gptengineer scripts) and serve the site from your own domain.",
    prompt: () =>
      "Remove Lovable build artifacts from the HTML: every data-lov-id attribute and any script tags referencing gptengineer, lovable.dev or lovable.app. If the site is served from a lovable.app subdomain, connect a custom domain instead.",
  },
  "fingerprint.bolt": {
    fixable: true,
    summary: "Remove bolt.new script and meta references from the page source.",
    prompt: () => "Remove every bolt.new reference from the page source: script URLs, meta tags and HTML comments.",
  },
  "fingerprint.framer": {
    fixable: false,
    summary: "Framer injects its generator tag and asset host automatically. You cannot remove it without leaving Framer, but custom typography, copy and layout will clear the other tells.",
  },
  "fingerprint.webflow": {
    fixable: false,
    summary: "Webflow adds its generator markup on every published site. Focus on the tells you control: copy, custom pages and metadata.",
  },
  "fingerprint.wix": {
    fixable: false,
    summary: "Wix generator markup and asset hosts are part of the platform. Focus on the tells you control: copy, custom pages and metadata.",
  },
  "fingerprint.made-with-badge": {
    fixable: true,
    summary: "Remove the leftover builder attribution badge from the footer.",
    prompt: (evidence) =>
      `Remove the builder attribution badge from the page.${withEvidence(evidence, "The scan found:")} Delete the badge element and any script that injects it.`,
  },
  "fingerprint.base44": {
    fixable: true,
    summary: "Serve the site from your own domain and remove Base44 script and meta references.",
    prompt: () =>
      "Remove Base44 references from the page source (script URLs and meta tags pointing at base44.app or base44.com). If the site runs on a base44.app subdomain, connect a custom domain.",
  },
  "fingerprint.replit": {
    fixable: true,
    summary: "Connect a custom domain instead of the Replit subdomain and remove Replit script references.",
    prompt: () =>
      "If the site is served from a replit.app, repl.co or replit.dev subdomain, connect a custom domain. Remove any leftover Replit script or meta references from the page source.",
  },
  "fingerprint.ai-builder-misc": {
    fixable: true,
    summary: "Serve the site from your own domain and remove the builder's script and meta references.",
    prompt: (evidence) =>
      `Remove AI website builder artifacts from the page source.${withEvidence(evidence, "The scan found:")} Connect a custom domain if the site still runs on the builder's subdomain.`,
  },

  // ── 🎨 default stack ──────────────────────────────────────────────────────
  "default.lucide": {
    fixable: true,
    summary: "lucide is fine on its own. It reads as a tell when everything else is also default. Consider a different icon set or a few custom icons.",
    prompt: () =>
      "The site uses the default lucide-react icon set. Either swap to a different icon library or replace the most visible icons (hero, nav, feature cards) with custom ones so the UI stops reading as stock output.",
  },
  "default.shadcn": {
    fixable: true,
    summary: "Theme shadcn/ui: change the token values (colors, radius, fonts) in your globals so components stop matching the stock signatures.",
    prompt: () =>
      "The site ships untouched shadcn/ui defaults. Edit the CSS custom properties in globals.css (background, foreground, primary, radius) and the font setup so the components stop matching stock shadcn signatures. Pick values that fit the brand, not the defaults.",
  },
  "default.tailwind-cdn": {
    fixable: true,
    summary: "Install Tailwind as a build dependency instead of loading it from the play CDN.",
    prompt: () =>
      "Replace the cdn.tailwindcss.com script tag with a proper Tailwind installation: install tailwindcss as a dev dependency, add a config and build step, and remove the CDN script. The CDN build is meant for prototypes only.",
  },
  "default.next-default": {
    fixable: false,
    summary: "This is just Next.js being Next.js. Nothing to fix; it only adds context next to stronger tells.",
  },
  "default.radix": {
    fixable: false,
    summary: "Radix is a solid foundation, not slop. Theming your components (see the shadcn tell) is what removes the stock look.",
  },
  "default.vite-build": {
    fixable: false,
    summary: "A normal Vite build signature. Nothing to fix; it only adds context next to stronger tells.",
  },

  // ── 📝 copy ───────────────────────────────────────────────────────────────
  "copy.emdash": {
    fixable: true,
    summary: "Rewrite the copy with fewer em dashes. Use periods, commas or a rephrase instead.",
    prompt: (evidence) =>
      `The page copy uses em dashes unusually often${evidence ? ` (${evidence})` : ""}, a classic LLM writing tic. Rewrite those sentences using periods, commas or parentheses. Keep the meaning, change the punctuation.`,
  },
  "copy.buzzwords": {
    fixable: true,
    summary: "Replace marketing buzzwords with concrete statements about what the product actually does.",
    prompt: (evidence) =>
      `Rewrite the marketing copy to remove filler buzzwords.${withEvidence(evidence, "The scan found:")} Replace each with a specific, concrete claim: what the product does, for whom, with what result. If a sentence says nothing after removing the buzzword, delete the sentence.`,
  },
  "copy.emoji-headers": {
    fixable: true,
    summary: "Remove the decorative emojis from headings.",
    prompt: (evidence) =>
      `Remove the decorative emoji prefixes from the page headings${evidence ? ` (${evidence})` : ""}. Headings should carry meaning through words, not decoration.`,
  },
  "copy.ai-vocabulary": {
    fixable: true,
    summary: "Swap LLM-favourite words (delve, leverage, robust) for plain ones.",
    prompt: (evidence) =>
      `The copy clusters words that LLMs overuse.${withEvidence(evidence, "The scan found:")} Replace each with a plainer word or a concrete detail: "use" instead of "leverage", a real capability instead of "robust".`,
  },
  "copy.filler-phrases": {
    fixable: true,
    summary: "Delete stock filler openers and get to the point.",
    prompt: (evidence) =>
      `Delete stock filler phrases from the copy.${withEvidence(evidence, "The scan found:")} Start sentences with the actual point instead.`,
  },
  "copy.negative-parallelism": {
    fixable: true,
    summary: 'Rewrite "it\'s not just X, it\'s Y" sentences as direct statements.',
    prompt: () =>
      'Find sentences using the "it\'s not just X, it\'s Y" or "not only X but also Y" pattern and rewrite each as a direct statement of what the thing is or does.',
  },
  "copy.formal-connectors": {
    fixable: true,
    summary: 'Cut the repeated "Additionally / Moreover / Furthermore" sentence openers.',
    prompt: (evidence) =>
      `The copy repeatedly opens sentences with formal connectors like "Additionally" or "Furthermore"${evidence ? ` (${evidence})` : ""}. Remove most of them; the sentences usually work without an opener.`,
  },

  // ── 🧱 layout ─────────────────────────────────────────────────────────────
  "layout.bento": {
    fixable: true,
    summary: "The bento grid is the default AI landing-page shape. Rework it into a layout that fits your actual content.",
    prompt: () =>
      "The page uses a bento-grid layout, the default AI landing-page pattern. Redesign that section around the actual content: if two cells matter more than the rest, make the hierarchy show it instead of an even grid.",
  },
  "layout.gradient-blob": {
    fixable: true,
    summary: "Replace the blurred gradient blob backgrounds with something specific to your brand.",
    prompt: () =>
      "Remove the large blurred gradient blob backgrounds (blur-3xl over bg-gradient) and replace them with a background that belongs to the brand: a flat color, a texture, a product image, or nothing.",
  },
  "layout.trusted-by": {
    fixable: true,
    summary: 'Only keep the "Trusted by" row if the logos are real. If they are not, remove it.',
    prompt: () =>
      'The page has a "Trusted by" style logo row. If those companies are not real customers, remove the section. If they are, keep it and make each logo link to a real case study or quote.',
  },
  "layout.ai-palette": {
    fixable: true,
    summary: "Move off the default indigo/violet gradient palette to colors picked for the brand.",
    prompt: () =>
      "The page uses the indigo/violet gradient palette AI builders default to. Choose one or two brand colors that are not Tailwind indigo, violet, purple or fuchsia and restyle the gradients and accents with them.",
  },
  "layout.three-card-grid": {
    fixable: true,
    summary: "The hero-plus-three-cards layout is the AI default. Vary it if your content allows.",
    prompt: () =>
      "The page uses the default three-feature-card grid. If the three points differ in importance, restructure the section: lead with the strongest one and support it with real detail (a screenshot, a number, a quote).",
  },
  "layout.dark-neon": {
    fixable: true,
    summary: "Dark background with neon accents is a common AI look. Tune the palette toward your brand.",
    prompt: () =>
      "The page pairs a near-black background with saturated neon accents, a common AI-generated look. Soften or replace the neon accent colors with a palette chosen for the brand.",
  },

  // ── 🔧 leftovers ──────────────────────────────────────────────────────────
  "leftover.lorem": {
    fixable: true,
    summary: "Replace the lorem ipsum with real copy.",
    prompt: () => "Find every occurrence of lorem ipsum placeholder text and replace it with real copy about the product or leave the section out until the copy exists.",
  },
  "leftover.your-company": {
    fixable: true,
    summary: "Replace placeholder brand names with your real name.",
    prompt: (evidence) =>
      `Replace placeholder brand names with the real one.${withEvidence(evidence, "The scan found:")} Check the header, footer, page title and meta tags too.`,
  },
  "leftover.create-next-app": {
    fixable: true,
    summary: "Set a real page title and description in your layout metadata.",
    prompt: () =>
      'The page still ships the default "Create Next App" title/description. Set a real title and meta description in the Next.js metadata export of the root layout.',
  },
  "leftover.placeholder-links": {
    fixable: true,
    summary: 'Point the dead "#" links at real pages, or remove them.',
    prompt: (evidence) =>
      `Many links still point at "#" or example.com${evidence ? ` (${evidence})` : ""}. Point each at a real destination, or remove the link if the page does not exist yet. Do not ship nav items that go nowhere.`,
  },
  "leftover.placeholder-images": {
    fixable: true,
    summary: "Replace the placeholder image service URLs with real images.",
    prompt: () =>
      "Replace images loaded from placeholder services (placehold.co, via.placeholder, placekitten) with real product images or screenshots, each with descriptive alt text.",
  },
  "leftover.ai-citation-tokens": {
    fixable: true,
    summary: "Delete the leftover AI citation tokens from the page source.",
    prompt: (evidence) =>
      `Delete leftover AI citation artifacts from the page.${withEvidence(evidence, "The scan found:")} Search the source for oaicite, contentReference, utm_source=chatgpt.com and turn0 tokens and remove every match, keeping the surrounding text readable.`,
  },
  "leftover.assistant-phrases": {
    fixable: true,
    summary: "A chatbot reply is sitting in the visible copy. Delete it and write the section yourself.",
    prompt: (evidence) =>
      `The visible copy contains chatbot reply phrasing.${withEvidence(evidence, "The scan found:")} Delete the assistant phrasing and rewrite the section as first-person site copy.`,
  },
  "leftover.template-placeholders": {
    fixable: true,
    summary: "Fill in the bracketed template placeholders that were never replaced.",
    prompt: (evidence) =>
      `Unfilled template placeholders remain on the page.${withEvidence(evidence, "The scan found:")} Search for bracketed placeholders and phrases like "tagline goes here" and replace each with real content.`,
  },
  "leftover.unrendered-markdown": {
    fixable: true,
    summary: "Markdown syntax is showing as literal text. Fix the rendering.",
    prompt: (evidence) =>
      `Raw markdown is visible on the page instead of being rendered${evidence ? ` (${evidence})` : ""}. Either render it as HTML or rewrite those strings as plain text.`,
  },

  // ── ☁️ stack (informational, do not "fix" hosting choices) ────────────────
  "stack.vercel": {
    fixable: false,
    summary: "Vercel hosting is not slop by itself. Nothing to fix; it only adds context next to stronger tells.",
  },
  "stack.netlify": {
    fixable: false,
    summary: "Netlify hosting is not slop by itself. Nothing to fix; it only adds context next to stronger tells.",
  },
  "stack.supabase": {
    fixable: false,
    summary: "Supabase is a normal backend choice. Nothing to fix; it only adds context next to stronger tells.",
  },
  "stack.vibe-combo": {
    fixable: false,
    summary: "Next + Vercel + Supabase is the default AI-build combo, but a stack is not slop. Clear the copy and design tells and this stops mattering.",
  },
  "stack.modern-backends": {
    fixable: false,
    summary: "These backend services are normal engineering choices. Nothing to fix; they only add context next to stronger tells.",
  },

  // ── 🧹 quality ────────────────────────────────────────────────────────────
  "quality.missing-meta": {
    fixable: true,
    summary: "Add a real meta description and Open Graph tags.",
    prompt: () =>
      "Add a meta description (one or two sentences saying what the site is) and Open Graph tags (og:title, og:description, og:image) so shared links look intentional.",
  },
  "quality.default-favicon": {
    fixable: true,
    summary: "Add a favicon.",
    prompt: () => "Add a favicon: create a simple icon for the brand and link it in the document head, including an apple-touch-icon.",
  },
  "quality.no-alt-text": {
    fixable: true,
    summary: "Add alt text to the images that are missing it.",
    prompt: (evidence) =>
      `Most images have no alt text${evidence ? ` (${evidence})` : ""}. Add a short, descriptive alt attribute to each meaningful image; use alt="" only for purely decorative ones.`,
  },
  "quality.missing-lang": {
    fixable: true,
    summary: 'Add a lang attribute to the <html> tag.',
    prompt: () => 'Add the correct lang attribute to the <html> element (for example lang="en").',
  },
  "quality.generic-title": {
    fixable: true,
    summary: "Write a real page title instead of the default.",
    prompt: (evidence) =>
      `The page title is a generic default${evidence ? ` ("${evidence}")` : ""}. Write a real title: brand name plus a few words on what the site does.`,
  },
};

// ── 🤍 Quick wins — human signals that did NOT match ────────────────────────
// Each maps a human.* signal to an "add this" suggestion. skipIfSignal avoids
// telling the owner the same thing twice when the matching quality tell fired.
export interface QuickWin {
  id: string; // the human.* signal id this win corresponds to
  label: string;
  summary: string;
  prompt: string;
  /** Skip when this signal already matched (the issue list covers it). */
  skipIfSignal?: string;
}

export const QUICK_WINS: QuickWin[] = [
  {
    id: "human.real-pages",
    label: "Add real pages",
    summary: "Real about / pricing / contact pages linked from the homepage are a strong human sign.",
    prompt: "Add at least two real supporting pages (about, pricing, contact, blog or docs) with genuine content, and link them from the homepage navigation or footer.",
  },
  {
    id: "human.github",
    label: "Link your GitHub",
    summary: "If the project is open source or you have a real profile, link it.",
    prompt: "If the project has a public repository or the maker has a GitHub profile worth showing, add a link to it in the footer or header. Skip this if there is nothing real to link.",
  },
  {
    id: "human.rich-meta",
    label: "Considered metadata",
    summary: "A real meta description plus Open Graph tags show care.",
    prompt: "Write a real meta description (30+ characters, specific to the site) and add Open Graph tags: og:title, og:description and an og:image that represents the brand.",
    skipIfSignal: "quality.missing-meta",
  },
  {
    id: "human.custom-fonts",
    label: "Custom typography",
    summary: "A deliberately chosen web font reads as a human decision.",
    prompt: "Choose a typeface that fits the brand and load it as a proper web font (self-hosted woff2 preferred) instead of relying on system defaults.",
  },
  {
    id: "human.custom-favicon",
    label: "Custom favicon",
    summary: "A non-default favicon is a small sign someone cared.",
    prompt: "Add a custom favicon designed for the brand (not a default favicon.ico) and link it in the document head.",
    skipIfSignal: "quality.default-favicon",
  },
];

export function fixForSignal(id: string): SignalFix | undefined {
  return SIGNAL_FIXES[id];
}

/** Quick wins the site has not earned yet, minus ones already covered as issues. */
export function quickWinsFor(signals: FixInput[]): QuickWin[] {
  const matched = new Set(signals.map((s) => s.id));
  return QUICK_WINS.filter((w) => !matched.has(w.id) && !(w.skipIfSignal && matched.has(w.skipIfSignal)));
}

/** The matched signals that have an actionable fix, biggest score impact first. */
export function fixableSignals<T extends FixInput>(signals: T[]): T[] {
  return signals
    .filter((s) => s.weight > 0 && SIGNAL_FIXES[s.id]?.fixable && SIGNAL_FIXES[s.id]?.prompt)
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Assemble the single copy-paste prompt for the owner's AI coding tool.
 * Returns null when there is nothing actionable (nothing fixable matched and
 * every quick win is already earned).
 */
export function composeFixPrompt(signals: FixInput[]): string | null {
  const fixables = fixableSignals(signals);
  const wins = quickWinsFor(signals);
  if (fixables.length === 0 && wins.length === 0) return null;

  const lines: string[] = [
    "You are helping me remove \"AI slop\" tells from my website. Slopdar (slopdar.com) scanned it and flagged the issues below, ordered by impact. Work through each one. Keep the site's content, purpose and structure intact unless an item says otherwise, and prefer specific, concrete copy over marketing filler.",
    "",
  ];

  if (fixables.length > 0) {
    lines.push("Issues found:");
    fixables.forEach((s, i) => {
      const fix = SIGNAL_FIXES[s.id];
      lines.push(`${i + 1}. ${fix.prompt!(s.evidence)}`);
    });
    lines.push("");
  }

  if (wins.length > 0) {
    lines.push("Quick wins that make the site read as human-made:");
    for (const w of wins) lines.push(`- ${w.prompt}`);
    lines.push("");
  }

  lines.push("When you are done, list every file you changed and what changed in each.");
  return lines.join("\n");
}
