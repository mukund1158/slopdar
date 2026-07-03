// /indexnow.txt — the IndexNow ownership-verification key file. Search
// engines fetch this to confirm pings for our host really come from us
// (we point them here via `keyLocation` in src/lib/indexnow.ts).
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!env.INDEXNOW_KEY) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(env.INDEXNOW_KEY, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" },
  });
}
