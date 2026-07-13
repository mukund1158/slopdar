// Add the user id and public handle to the session type.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; handle?: string | null } & DefaultSession["user"];
  }
}
