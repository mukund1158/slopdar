// Dynamic share-card image for each result: /r/<slug>/opengraph-image
// Rendered with Next's ImageResponse (Satori / @vercel/og). Next automatically
// wires the og:image + twitter:image tags to this file.
//
// Satori rule: every <div> with more than one child MUST set display:flex. To
// stay safe we give every div an explicit display:flex and keep each leaf to a
// single string child.
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { tierOf } from "@/lib/tiers";
import { roastSetFor } from "@/lib/roasts";

export const runtime = "nodejs";
export const alt = "Slopdar Slop Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#191512";
const BRAND = "#FF4D24";
const MUT = "#938D7E";
const INK2 = "#5b554c";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const check = await db.check
    .findUnique({
      where: { slug },
      select: { host: true, score: true, signals: { where: { weight: { gt: 0 } }, select: { id: true } } },
    })
    .catch(() => null);

  const host = check?.host ?? slug;
  const score = check?.score ?? 0;
  const tellCount = check?.signals.length ?? 0;
  const tier = tierOf(score);
  const roast = roastSetFor(tier.label).roasts[0];

  const row = { display: "flex", alignItems: "center" } as const;
  const col = { display: "flex", flexDirection: "column" } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: tier.tint,
          border: `14px solid ${INK}`,
          padding: "54px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ ...row, justifyContent: "space-between" }}>
          <div style={row}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: BRAND, marginRight: 18 }}>
              <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-2px", color: "#fff" }}>S</span>
            </div>
            <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: "-2px" }}>
              <span style={{ color: INK }}>Slop</span>
              <span style={{ color: BRAND }}>dar</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: INK2 }}>{host}</div>
        </div>

        <div style={row}>
          <div style={{ ...col, marginRight: 56 }}>
            <div style={{ display: "flex", fontSize: 300, fontWeight: 800, lineHeight: 1, letterSpacing: "-12px", color: tier.color }}>{String(score)}</div>
            <div style={{ display: "flex", fontSize: 26, letterSpacing: "3px", color: MUT, marginTop: 8 }}>SLOP SCORE / 100</div>
          </div>
          <div style={{ ...col, flex: 1 }}>
            <div
              style={{
                display: "flex",
                background: tier.color,
                color: "#fff",
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                border: `4px solid ${INK}`,
                borderRadius: 12,
                padding: "8px 22px",
              }}
            >
              {tier.label}
            </div>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, fontStyle: "italic", color: INK, lineHeight: 1.25, marginTop: 26 }}>
              {`“${roast}”`}
            </div>
          </div>
        </div>

        <div style={{ ...row, justifyContent: "space-between", borderTop: `4px solid ${INK}`, paddingTop: 22, fontSize: 28, color: INK2 }}>
          <div style={{ display: "flex" }}>{`${tellCount} tells · roasted by Slopdar`}</div>
          <div style={{ display: "flex", color: BRAND, fontWeight: 700 }}>slopdar.com</div>
        </div>
      </div>
    ),
    { ...size, headers: { "cache-control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=86400" } },
  );
}
