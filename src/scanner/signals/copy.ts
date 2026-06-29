// 📝 Copy / text tells — writing patterns common to AI-generated marketing copy.
// Weak individually (humans write this way too); useful in aggregate.
import type { SignalRule } from "../types";
import { count, snippet, visibleText } from "./util";

const BUZZWORDS = [
  "elevate",
  "seamless",
  "seamlessly",
  "effortless",
  "effortlessly",
  "unlock",
  "supercharge",
  "empower",
  "revolutionize",
  "revolutionise",
  "unleash",
  "harness the power",
  "take it to the next level",
  "game-changer",
  "cutting-edge",
];

export const copySignals: SignalRule[] = [
  {
    id: "copy.emdash",
    category: "copy",
    weight: 10,
    label: "High em-dash density",
    description: "Em-dashes (—) appear unusually often — a known LLM writing tic.",
    test: (ctx) => {
      const text = visibleText(ctx);
      if (text.length < 400) return null; // too little copy to judge
      const dashes = count(text, "—");
      const perK = (dashes / text.length) * 1000;
      // ~>1.2 em-dashes per 1000 chars is notably high for marketing copy.
      return dashes >= 4 && perK >= 1.2 ? { evidence: `${dashes} em-dashes` } : null;
    },
  },
  {
    id: "copy.buzzwords",
    category: "copy",
    weight: 12,
    label: "AI marketing buzzwords",
    description: 'Clusters of "elevate / seamless / supercharge"-style filler.',
    test: (ctx) => {
      const text = visibleText(ctx).toLowerCase();
      const found = BUZZWORDS.filter((w) => text.includes(w));
      return found.length >= 3 ? { evidence: snippet(found.join(", ")) } : null;
    },
  },
  {
    id: "copy.emoji-headers",
    category: "copy",
    weight: 8,
    label: "Emoji-prefixed headings",
    description: "Multiple headings begin with a decorative emoji.",
    test: (ctx) => {
      const $ = ctx.$;
      const emojiStart = /^\s*\p{Extended_Pictographic}/u;
      let n = 0;
      $("h1, h2, h3").each((_, el) => {
        if (emojiStart.test($(el).text())) n++;
      });
      return n >= 2 ? { evidence: `${n} emoji headings` } : null;
    },
  },
];
