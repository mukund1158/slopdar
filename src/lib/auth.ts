// The game's view of "who is the current player". Reads the real Auth.js
// session, but only once login is configured (AUTH_* env set), so the game
// stays fully playable as a guest before Google keys are added.
import { env } from "@/lib/env";

export async function getSessionUserId(): Promise<string | null> {
  // Dev-only: act as a fixed user to test the logged-in flow without Google.
  if (env.NODE_ENV !== "production" && process.env.PLAY_DEV_USER_ID) {
    return process.env.PLAY_DEV_USER_ID;
  }
  // Login not configured yet: everyone is a guest so the game still works.
  if (!env.AUTH_SECRET || !env.AUTH_GOOGLE_ID) return null;
  try {
    const { auth } = await import("@/lib/auth-config");
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
