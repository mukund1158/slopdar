import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

// Re-generate at most hourly so new scans show up without rebuilding per request.
export const revalidate = 3600;

const base = env.APP_URL.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let checks: { slug: string; updatedAt: Date }[] = [];
  try {
    checks = await db.check.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000, // cap so the sitemap stays a sane size
    });
  } catch {
    /* DB unavailable — still return the static pages */
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/leaderboard`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const sitePages: MetadataRoute.Sitemap = checks.map((c) => ({
    url: `${base}/r/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...sitePages];
}
