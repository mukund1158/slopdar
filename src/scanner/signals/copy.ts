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
    description: "Em-dashes show up unusually often. A classic LLM writing tic.",
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

  // ── Tier C: expanded writing tells (noisy on their own; low weights) ──────
  {
    id: "copy.ai-vocabulary",
    category: "copy",
    weight: 10,
    label: "AI vocabulary cluster",
    description: "A cluster of words LLMs overuse (delve, leverage, robust, etc.) appears in the copy.",
    test: (ctx) => {
      const text = visibleText(ctx).toLowerCase();
      const words = [
        "delve", "underscore", "tapestry", "testament to", "leverage", "harness", "illuminate",
        "facilitate", "bolster", "holistic", "synergy", "paradigm", "groundbreaking",
        "transformative", "meticulous", "pivotal", "in the realm", "navigate the", "foster a", "robust",
      ];
      const found = words.filter((w) => text.includes(w));
      return found.length >= 3 ? { evidence: snippet(found.slice(0, 5).join(", ")) } : null;
    },
  },
  {
    id: "copy.filler-phrases",
    category: "copy",
    weight: 8,
    label: "AI filler phrases",
    description: 'Stock LLM filler such as "in today\'s fast-paced world" was found.',
    test: (ctx) => {
      const text = visibleText(ctx).toLowerCase();
      const phrases = [
        "in today's fast-paced world", "in today's digital age", "in the ever-evolving",
        "unlock the power of", "look no further", "whether you're a beginner", "it's important to note",
      ];
      const hit = phrases.find((p) => text.includes(p)) ?? (/take your .{1,30} to the next level/.test(text) ? "to the next level" : undefined);
      return hit ? { evidence: snippet(hit) } : null;
    },
  },
  {
    id: "copy.negative-parallelism",
    category: "copy",
    weight: 6,
    label: "Negative-parallelism phrasing",
    description: 'LLM-favoured "it\'s not just X, it\'s Y" / "not only ... but also" phrasing.',
    test: (ctx) => {
      const text = visibleText(ctx).toLowerCase();
      const ok = /\b(it'?s|we'?re|they'?re|this is) not just\b/.test(text) || /\bnot only\b[^.]{1,80}\bbut also\b/.test(text);
      return ok ? { evidence: "negative parallelism" } : null;
    },
  },
  {
    id: "copy.formal-connectors",
    category: "copy",
    weight: 5,
    label: "Formal AI connectors",
    description: 'Sentence-starting "Additionally / Moreover / Furthermore" used repeatedly.',
    test: (ctx) => {
      const m = visibleText(ctx).match(/\b(Additionally|Moreover|Furthermore)\b/g);
      return m && m.length >= 2 ? { evidence: `${m.length} formal connectors` } : null;
    },
  },
];
