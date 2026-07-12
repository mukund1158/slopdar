// Minimal sign-in page. Google is the only provider. After signing in the
// player lands back on the game.
import { signIn } from "@/lib/auth-config";
import { env } from "@/lib/env";

export const metadata = { title: "Sign in | Slopdar" };

export default function SignInPage() {
  const configured = Boolean(env.AUTH_SECRET && env.AUTH_GOOGLE_ID);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-mono text-2xl font-bold uppercase tracking-tight">Lock your rank</h1>
      <p className="text-sm text-neutral-600">
        Sign in to save your score on today&apos;s leaderboard and put your own site in the game when you win.
      </p>

      {configured ? (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/play" });
          }}
        >
          <button
            type="submit"
            className="border-2 border-black bg-black px-5 py-3 font-mono text-sm font-bold uppercase text-white transition hover:bg-white hover:text-black"
          >
            Sign in with Google
          </button>
        </form>
      ) : (
        <p className="border-2 border-dashed border-neutral-400 p-4 font-mono text-xs text-neutral-500">
          Sign-in is not configured yet.
        </p>
      )}
    </main>
  );
}
