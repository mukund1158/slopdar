// GET  /api/profile  → the signed-in founder's profile + products (for editing)
// POST /api/profile  → save founder fields + products (max 3, one primary)
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { MAX_PRODUCTS, normalizeProductUrl } from "@/lib/founder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const blank = (max: number) => z.string().max(max).optional().transform((v) => (v ?? "").trim());

const ProductIn = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(120),
  url: z.string().min(1).max(512),
  pitch: z.string().max(160).optional().transform((v) => (v ?? "").trim()),
  logoUrl: z.string().max(512).optional().transform((v) => (v ?? "").trim()),
  category: z.string().max(48).optional().transform((v) => (v ?? "").trim()),
  isPrimary: z.boolean().optional(),
});
const Body = z.object({
  bio: blank(200),
  role: blank(48),
  twitter: blank(100),
  linkedin: blank(200),
  products: z.array(ProductIn).max(MAX_PRODUCTS),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { handle: true, bio: true, role: true, twitter: true, linkedin: true },
  });
  const products = await db.product.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, url: true, pitch: true, logoUrl: true, category: true, isPrimary: true },
  });
  return NextResponse.json({ ...user, products });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const items = body.products.slice(0, MAX_PRODUCTS);
  const existing = await db.product.findMany({ where: { userId }, select: { id: true } });
  const keepIds = new Set(items.filter((p) => p.id).map((p) => p.id));
  const toDelete = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id);

  let primaryTaken = false;
  let primaryUrl: string | null = null;

  await db.$transaction(async (tx) => {
    if (toDelete.length) await tx.product.deleteMany({ where: { id: { in: toDelete }, userId } });

    for (const [i, p] of items.entries()) {
      const isPrimary = Boolean(p.isPrimary) && !primaryTaken;
      if (isPrimary) primaryTaken = true;
      const url = normalizeProductUrl(p.url);
      if (isPrimary) primaryUrl = url;
      const data = {
        name: p.name.trim(),
        url,
        pitch: p.pitch || null,
        logoUrl: p.logoUrl || null, // already an uploaded /logos path; do not normalize
        category: p.category || null,
        isPrimary,
        sortOrder: i,
      };
      if (p.id && existing.some((e) => e.id === p.id)) {
        await tx.product.update({ where: { id: p.id }, data });
      } else {
        await tx.product.create({ data: { ...data, userId } });
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        bio: body.bio || null,
        role: body.role || null,
        twitter: body.twitter || null,
        linkedin: body.linkedin || null,
        websiteUrl: primaryUrl, // the primary product is the game entry
      },
    });
  });

  return NextResponse.json({ ok: true });
}
