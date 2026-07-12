// Auth.js (next-auth v5) configuration: Google provider, Prisma adapter,
// database sessions. Kept in its own module so the game's request path can stay
// free of a hard next-auth import and only load this when login is configured.
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

/** Give a new user a unique public handle from their name or email. */
async function assignHandle(userId: string, name?: string | null, email?: string | null): Promise<void> {
  const base =
    (name ?? email?.split("@")[0] ?? "player").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "player";
  let handle = base;
  for (let n = 1; await db.user.findUnique({ where: { handle }, select: { id: true } }); n++) {
    handle = `${base}${n}`.slice(0, 32);
  }
  await db.user.update({ where: { id: userId }, data: { handle } });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [Google],
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) await assignHandle(user.id, user.name, user.email);
    },
  },
});
