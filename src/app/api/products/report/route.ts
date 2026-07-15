// POST /api/products/report → flag a product for review. Anyone can report;
// it just marks it (manual review), it does not auto-hide.
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    await db.product.update({ where: { id: body.productId }, data: { reported: true } });
  } catch {
    // unknown id is fine; never leak whether it existed
  }
  return NextResponse.json({ ok: true });
}
