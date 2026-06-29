"use client";

// FAQ accordion for the How-it-works page. The same items are also emitted as
// FAQPage JSON-LD by the server page for GEO.
import { useState } from "react";
import { MONO } from "@/components/slopdar/ui";

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((f, i) => (
        <div key={f.q} onClick={() => setOpen(open === i ? -1 : i)} style={{ background: "var(--card)", border: "2px solid var(--ink)", borderRadius: 14, padding: "18px 22px", cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
            <span style={{ fontWeight: 800, fontSize: 15.5, color: "var(--ink)" }}>{f.q}</span>
            <span style={{ fontFamily: MONO, fontSize: 20, color: "var(--brand)", lineHeight: 1, flexShrink: 0 }}>{open === i ? "–" : "+"}</span>
          </div>
          {open === i && <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink2)", margin: "11px 0 0" }}>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
