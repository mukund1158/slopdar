// POST /api/upload/logo → accept an image file, store it under public/logos,
// return its public path. Requires login. Images only, small size cap.
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSessionUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1_500_000; // 1.5 MB
const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "bad upload" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "use a PNG, JPG, WEBP or GIF" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "image is over 1.5 MB" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  const dir = join(process.cwd(), "public", "logos");
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), buffer);
  } catch (err) {
    console.error("[/api/upload/logo] write failed:", err);
    return NextResponse.json({ error: "could not save the image" }, { status: 500 });
  }
  return NextResponse.json({ url: `/logos/${name}` });
}
