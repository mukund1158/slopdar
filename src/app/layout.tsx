import type { Metadata } from "next";
import { archivo, plexMono } from "@/lib/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Slopdar: Is it built or is it slop?",
  description:
    "Paste any website link and get a Slop Score (0–100): hand-coded by a real dev, or vibe-coded / AI-generated? Receipts included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
