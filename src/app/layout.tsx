import type { Metadata } from "next";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { archivo, plexMono } from "@/lib/fonts";
import { env } from "@/lib/env";
import "@/styles/globals.css";

const GA_ID = "G-3CS2J4ZTD7";

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
      <body>
        <SessionProvider>{children}</SessionProvider>
        {/* Google Analytics (GA4) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
        {/* TrustViews (feeds the launch badge's live stats) */}
        <Script src="https://trustviews.io/script.js" data-token="527ab580-2ff2-46b3-8329-96af9ed0f735" strategy="afterInteractive" />
      </body>
    </html>
  );
}
