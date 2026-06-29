// GET /badge/<domain>.svg → an embeddable SVG badge for a scanned site.
// Looks up the latest score for the host and renders a two-segment pill.
import { db } from "@/lib/db";
import { tierOf } from "@/lib/tiers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

export async function GET(_req: Request, { params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const host = domain.replace(/\.svg$/i, "").toLowerCase();

  const check = await db.check.findFirst({
    where: { host },
    orderBy: { updatedAt: "desc" },
    select: { score: true },
  });

  const known = check != null;
  const score = check?.score ?? 0;
  const tier = tierOf(score);
  const right = known ? `${score} · ${tier.label.toLowerCase()}` : "not yet scored";
  const color = known ? tier.color : "#938d7e";

  // Approximate text widths (monospace ~6.6px/char at 12px).
  const leftW = 62;
  const rightW = Math.max(70, Math.round(right.length * 6.8) + 18);
  const w = leftW + rightW;
  const h = 28;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="Slopdar: ${escapeXml(right)}">
  <rect width="${w}" height="${h}" rx="6" fill="#191512"/>
  <rect x="${leftW}" width="${rightW}" height="${h}" rx="6" fill="${color}"/>
  <rect x="${leftW}" width="10" height="${h}" fill="${color}"/>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="12" font-weight="600">
    <text x="${leftW / 2}" y="18" fill="#fff" text-anchor="middle">slopdar</text>
    <text x="${leftW + rightW / 2}" y="18" fill="${known && score <= 50 && score > 25 ? "#191512" : "#fff"}" text-anchor="middle" font-weight="700">${escapeXml(right)}</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
