"use client";

// Report a product for review. Marks it (manual review); never auto-hides.
import { useState } from "react";
import { MONO } from "@/components/slopdar/ui";

export default function ReportButton({ productId }: { productId: string }) {
  const [done, setDone] = useState(false);
  const report = async () => {
    setDone(true);
    await fetch("/api/products/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId }),
    }).catch(() => {});
  };
  return (
    <button
      onClick={report}
      disabled={done}
      style={{ background: "none", border: 0, padding: 0, cursor: done ? "default" : "pointer", fontFamily: MONO, fontSize: 10.5, color: "var(--mut)" }}
      title="Report this product"
    >
      {done ? "reported" : "report"}
    </button>
  );
}
