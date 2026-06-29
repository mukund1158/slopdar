// Roast/reaction copy, keyed by tier. The backend reports the score + signals;
// the personality (the roast line, the reaction word, the celebration particle)
// lives here. Ported from the approved design.
export interface RoastSet {
  reaction: string; // big italic word on the result page
  particle: string; // emoji that rains down on reveal
  nice: string; // the "be nice" line
  roasts: string[]; // cycled by "roast harder"
}

const SETS: Record<string, RoastSet> = {
  "Pure Slop": {
    reaction: "OOF.",
    particle: "💀",
    nice: "Honestly? A very competent template. It does template things beautifully.",
    roasts: [
      "This wasn't built. It was prompted, deployed, and prayed over.",
      "I've seen v0 exports with more original ideas. Three of them. This week.",
      "Your gradient blob called. It wants its 2023 back.",
      "100% organic, free-range, grass-fed slop.",
      "If “seamless” were a personality, this would be it.",
      "Somewhere a lucide icon is being used exactly as the tutorial intended.",
    ],
  },
  "Vibe-Coded": {
    reaction: "HMM.",
    particle: "🤖",
    nice: "A capable build with real human judgment poking through the defaults.",
    roasts: [
      "Half artisan, half autocomplete. We can see the seams from here.",
      "Someone with taste was clearly steering, and clearly also tired.",
      "The bento grid is doing a lot of heavy lifting today.",
      "Not slop. Not not slop. Schrödinger’s landing page.",
      "You vibe-coded this and we respect the hustle. Mostly.",
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
      "Templated bones, custom skin. We’re narrowing our eyes at you.",
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
    ],
  },
};

export function roastSetFor(tierLabel: string): RoastSet {
  return SETS[tierLabel] ?? SETS["Pure Slop"];
}
