import SlopdarApp from "@/components/SlopdarApp";
import { env } from "@/lib/env";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Slopdar",
      url: env.APP_URL,
      description: "Is it built or is it slop? Scan any website for a Slop Score (0–100): hand-coded or vibe-coded / AI-generated.",
    },
    {
      "@type": "WebApplication",
      name: "Slopdar",
      url: env.APP_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      description: "Paste a URL and get a Slop Score with the receipts. Slopdar reports signals, not proof.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SlopdarApp />
    </>
  );
}
