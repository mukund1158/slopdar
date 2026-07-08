// Roast/reaction copy, keyed by tier. The backend reports the score + signals;
// the personality (the roast line, the reaction word, the celebration particle)
// lives here.
//
// Two pools feed each roast:
//   1. SIGNAL_ROASTS - lines tied to a specific tell (e.g. lorem ipsum found).
//      When that signal fired, its lines jump to the front of the queue, so the
//      roast reads like we actually looked at the site. We did.
//   2. The tier's general pool in SETS - the fallback flavor.
//
// pickRoast() chooses deterministically from a seed (the check's slug), so a
// given site always opens on the same roast across the result page, the share
// card, and the OG image, but different sites get different lines. "Roast
// harder" walks the rest of the pool via the step parameter.
export interface RoastSet {
  reaction: string; // big italic word on the result page
  particle: string; // emoji that rains down on reveal
  nice: string; // the "be nice" line
  roasts: string[]; // the tier's general pool, cycled by "roast harder"
}

const SETS: Record<string, RoastSet> = {
  "Pure Slop": {
    reaction: "OOF.",
    particle: "💀",
    nice: "Honestly? A very competent template. It does template things beautifully.",
    roasts: [
      "This wasn't built. It was prompted, deployed, and prayed over.",
      "100% organic, free-range, grass-fed slop.",
      "Deployed straight from the chat window. We can smell the context limit.",
      "This site has the personality of a loading spinner.",
      "Powered by AI. Unsupervised by humans.",
      "The hero says unleash. The footer says empower. The middle says nothing.",
      "We ran out of red flags and had to order more.",
      "A landing-page-shaped object.",
      "Built in 45 seconds, and it shows every one of them.",
      "The only handmade thing here is the domain purchase.",
      "Accept all suggestions. Ship. Repeat.",
      "Every pixel radiates 'looks good, ship it' energy.",
      "Our radar didn't ping. It filed a complaint.",
      "Congratulations on your website. And to the other thousand people with the same one.",
      "The template industry thanks you for your service.",
      "Somewhere, a prompt is very proud of itself.",
    ],
  },
  "Vibe-Coded": {
    reaction: "HMM.",
    particle: "🤖",
    nice: "A capable build with real human judgment poking through the defaults.",
    roasts: [
      "Half artisan, half autocomplete. We can see the seams from here.",
      "Someone with taste was clearly steering, and clearly also tired.",
      "Not slop. Not not slop. Schrödinger's landing page.",
      "You vibe-coded this and we respect the hustle. Mostly.",
      "There's a human in there somewhere. Blink twice if you need help.",
      "You reviewed the diff. Some of the diff.",
      "The AI did the typing. You did the believing.",
      "Tastefully prompted. Occasionally proofread.",
      "This is what 'I'll clean it up later' looks like at scale.",
      "Co-authored by a robot that really likes rounded corners.",
      "You customized the template. The template noticed.",
      "80% shipped, 20% supervised.",
      "A firm handshake between a human and an autocomplete.",
      "The design system is 'whatever came back first'.",
      "Real effort detected. Also, real defaults detected.",
      "Human at the wheel, robot working the pedals.",
    ],
  },
  "Suspiciously Clean": {
    reaction: "NEAT.",
    particle: "🧐",
    nice: "Mostly tidy. A couple of defaults slipped through, but real care shows.",
    roasts: [
      "Suspiciously clean. Either a careful human, or a very careful prompt.",
      "Almost got away with it. Almost.",
      "A few tells, but you clearly did the cleanup pass most people skip.",
      "Templated bones, custom skin. We're narrowing our eyes at you.",
      "Clean enough to make us suspicious. It's literally the tier name.",
      "Our radar pinged twice, then apologized.",
      "You sanded off the fingerprints. Most of them.",
      "If a robot helped, you made it sign an NDA.",
      "The tells are whispering, not shouting.",
      "We squinted. We zoomed. We found a little something.",
      "This has 'read the output before pasting' energy. Rare.",
      "Somebody here knows what a design decision is.",
      "Polished. But we caught the one corner you forgot to dust.",
      "You passed the vibe check. The deep scan raised an eyebrow.",
      "So close to clean it hurts. One or two crumbs left.",
      "Nice try. Genuinely, a nice try. It mostly worked.",
    ],
  },
  "Hand-Crafted": {
    reaction: "RESPECT.",
    particle: "🎉",
    nice: "Genuinely hand-crafted. Someone sweated the details and it shows.",
    roasts: [
      "Ugh, fine. A human made this. With their hands. On purpose.",
      "No lucide icons. No lorem ipsum. Who hurt the template industry?",
      "Annoyingly original. We tried so hard to roast it.",
      "This is what websites looked like before the great slop flood.",
      "Certified hand-crafted. Suspiciously so. Are you okay?",
      "You wrote your own CSS. In this economy?",
      "Our radar came back with nothing but respect and mild jealousy.",
      "A real website by a real person. We're framing this one.",
      "Handmade, load-bearing, and rude to our business model.",
      "We scanned for slop and found craftsmanship. Disgusting. Wonderful.",
      "The templates could never.",
      "Somewhere an AI site builder just felt a disturbance.",
    ],
  },
};

// Roasts tied to specific tells. Keys are scanner signal ids (Signal.signalId).
// When a site fired one of these, its lines lead the roast queue, so the roast
// name-drops what we actually caught. Keep each line self-contained: it must
// land without the reader seeing the receipts list.
const SIGNAL_ROASTS: Record<string, string[]> = {
  // copy tells
  "copy.emdash": [
    "The em dashes gave it away. They always do.",
    "Nobody types that many em dashes on purpose. Nobody.",
  ],
  "copy.ai-vocabulary": [
    "If 'seamless' were a personality, this would be it.",
    "Seamless. Effortless. Robust. The AI vocabulary starter pack, fully collected.",
  ],
  "copy.buzzwords": ["Buzzword density: enterprise grade."],
  "copy.emoji-headers": ["🚀 Every ✨ header 💡 has 🔥 an emoji. We noticed. 🧐"],
  "copy.filler-phrases": ["In today's fast-paced world, this copy writes itself. Literally."],
  "copy.formal-connectors": ["Moreover, furthermore, additionally: this copy is a term paper defending itself."],
  "copy.negative-parallelism": ["It's not just a website. It's a pattern we detect automatically."],

  // default-stack tells
  "default.lucide": ["Somewhere a lucide icon is being used exactly as the tutorial intended."],
  "default.shadcn": ["shadcn/ui detected: the official look of 'I asked for a dashboard'."],
  "default.radix": ["Radix primitives, factory settings. The scaffolding is showing."],
  "default.next-default": ["Still shipping the create-next-app furniture. Vercel says hi."],
  "default.tailwind-cdn": ["Tailwind via CDN. The 'we'll set up a build step later' special."],
  "default.vite-build": ["A fresh Vite build with the factory plastic still on."],

  // builder fingerprints
  "fingerprint.v0": [
    "I've seen v0 exports with more original ideas. Three of them. This week.",
    "Generated by v0, deployed by hope.",
  ],
  "fingerprint.lovable": ["Lovable made this. The name is doing a lot of emotional labor."],
  "fingerprint.bolt": ["Bolt built this in a flash. And it reads like it."],
  "fingerprint.replit": ["Straight out of the Replit oven. Still warm, still default."],
  "fingerprint.base44": ["Base44 fingerprints all over the glass."],
  "fingerprint.framer": ["A Framer template in the wild. Majestic. Identical to the others."],
  "fingerprint.webflow": ["Webflow class names peeking out like a price tag left on."],
  "fingerprint.wix": ["Wix under the hood. The hood was not hard to open."],
  "fingerprint.made-with-badge": ["The 'made with' badge confessed before we even scanned."],
  "fingerprint.ai-builder-misc": ["An AI site builder left its business card in the source code."],

  // layout tells
  "layout.gradient-blob": [
    "Your gradient blob called. It wants its 2023 back.",
    "Gradient blob detected: the official mascot of prompted design.",
  ],
  "layout.bento": [
    "The bento grid is doing a lot of heavy lifting today.",
    "Bento grid detected. Everything in little boxes, nothing in them.",
  ],
  "layout.three-card-grid": ["Three cards, three icons, three four-word headings. The holy trinity of templates."],
  "layout.dark-neon": ["Dark mode, neon glow. The official uniform of 'trust us, we're an AI startup'."],
  "layout.trusted-by": ["'Trusted by' logos detected. Trusted to fill that section of the template, mostly."],
  "layout.ai-palette": ["Purple-to-cyan gradient. The AI flag, flown proudly."],

  // leftovers
  "leftover.lorem": ["There is actual lorem ipsum on this page. In production. Dolor sit amet indeed."],
  "leftover.your-company": ["'Your Company' is still in the copy. We assume that's the legal name."],
  "leftover.placeholder-links": ["Half the links go to #. The journey is the destination, apparently."],
  "leftover.placeholder-images": ["Placeholder images, shipped to production. Bold. Confident. Unfinished."],
  "leftover.create-next-app": ["create-next-app leftovers found. You deployed the welcome mat."],
  "leftover.assistant-phrases": ["The page still says 'Certainly! Here's'. The chatbot never left."],
  "leftover.ai-citation-tokens": ["AI citation tokens left in the copy. The receipt was still stapled on."],
  "leftover.template-placeholders": ["We found {{placeholders}} nobody replaced. Mad Libs, but production."],
  "leftover.unrendered-markdown": ["Raw **markdown** in the rendered page. Paste responsibly."],

  // quality tells
  "quality.no-alt-text": ["Zero alt text. The robots wrote it and still forgot the other robots."],
  "quality.generic-title": ["The browser tab still says the default title. First impressions, sealed."],
  "quality.default-favicon": ["Default favicon spotted. The website equivalent of an unset profile picture."],
  "quality.missing-meta": ["No meta description. Even the AI didn't know what this site is about."],

  // stack tells
  "stack.vibe-combo": ["Next, Tailwind, shadcn, Vercel. The vibe-code combo meal, no substitutions."],
};

export function roastSetFor(tierLabel: string): RoastSet {
  return SETS[tierLabel] ?? SETS["Pure Slop"];
}

// FNV-1a: tiny, dependency-free, and identical in the browser, Node, and the
// OG-image runtime, which is what keeps all three surfaces on the same line.
function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Pick the roast for a result. Deterministic in (tierLabel, seed, signalIds):
 * the same site always opens on the same line everywhere.
 *
 * - seed: any stable per-site string; callers pass the check's slug.
 * - signalIds: the fired tells (weight > 0). Their tagged lines lead the queue,
 *   and the opening pick lands among them when any exist.
 * - step: 0 for the opening roast; "roast harder" passes 1, 2, 3… to walk the
 *   rest of the pool.
 *
 * Hand-Crafted skips signal lines: its tells are stray crumbs and the tier's
 * begrudging-compliment tone would clash with a called-out tell.
 */
export function pickRoast(tierLabel: string, seed: string, signalIds: string[] = [], step = 0): string {
  const set = roastSetFor(tierLabel);
  const matched: string[] = [];
  if (tierLabel !== "Hand-Crafted") {
    // Sorted so the pool order (and thus the pick) is identical no matter what
    // order the caller's signals arrive in.
    for (const id of [...signalIds].sort()) {
      for (const line of SIGNAL_ROASTS[id] ?? []) {
        if (!matched.includes(line)) matched.push(line);
      }
    }
  }
  const pool = [...matched, ...set.roasts];
  const span = matched.length > 0 ? matched.length : pool.length;
  const start = hashSeed(seed) % span;
  return pool[(start + step) % pool.length];
}
