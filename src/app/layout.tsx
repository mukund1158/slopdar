import type { Metadata } from "next";
import { archivo, plexMono } from "@/lib/fonts";
import { env } from "@/lib/env";
import "@/styles/globals.css";

const title = "Slopdar: Is it built or is it slop?";
const description =
  "Paste any website link and get a Slop Score (0–100): hand-coded by a real dev, or vibe-coded / AI-generated? Receipts included.";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title,
  description,
  applicationName: "Slopdar",
  keywords: ["AI website detector", "vibe coded", "AI-generated website", "slop score", "is it built or is it slop"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Slopdar",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
