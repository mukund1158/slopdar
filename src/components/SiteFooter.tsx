// Shared site footer used on every page so the footer is identical everywhere.
import Link from "next/link";
import { MONO } from "@/components/slopdar/ui";

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "2px solid var(--ink)", marginTop: 48, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontFamily: MONO, fontSize: 12, color: "var(--mut)" }}>
      <span>Slopdar runs on the slop stack. We know.</span>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <Link href="/guide" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>Field guides</Link>
        <Link href="/privacy" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>Privacy &amp; Terms</Link>
        <a href="https://github.com/Slopdar/slopdar" target="_blank" rel="noopener" className="h-brandtext" style={{ color: "inherit", textDecoration: "none" }}>Open source ★</a>
        <a href="https://x.com/mukparekh" target="_blank" rel="noopener" className="h-brandtext" style={{ color: "inherit", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
          <img src="/mukund.jpg" alt="Mukund" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--ink)" }} />
          @mukparekh
        </a>
        <span>© 2026</span>
      </div>
    </footer>
  );
}
