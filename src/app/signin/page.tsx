// The login page. Reachable from the header "Log in". Signed-in users are
// bounced to their profile.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { env } from "@/lib/env";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LoginButton from "@/components/LoginButton";
import { SANS, MONO, card } from "@/components/slopdar/ui";

export const metadata: Metadata = { title: "Log in | Slopdar" };
export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/profile");
  const configured = Boolean(env.AUTH_SECRET && env.AUTH_GOOGLE_ID);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: SANS, color: "var(--ink)", background: "var(--bg)" }}>
      <SiteHeader />
      <main style={{ flex: "1 0 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 18px" }}>
        <div style={{ ...card, borderRadius: 18, padding: "36px 30px", textAlign: "center", maxWidth: 440, width: "100%", boxShadow: "0 7px 0 rgba(0,0,0,.1)" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--brand)", fontWeight: 600 }}>Slopdar account</div>
          <h1 style={{ fontWeight: 900, fontSize: "clamp(26px,5vw,36px)", letterSpacing: "-.03em", margin: "8px 0 0" }}>Log in</h1>
          <p style={{ maxWidth: 340, margin: "12px auto 22px", fontSize: 15, lineHeight: 1.5, color: "var(--ink2)" }}>
            Save your rank on the daily board, build your founder profile, and get your product in front of everyone when you win.
          </p>
          {configured ? (
            <LoginButton callbackUrl="/play" />
          ) : (
            <p style={{ border: "2px dashed var(--line2)", borderRadius: 12, padding: 14, fontFamily: MONO, fontSize: 12.5, color: "var(--mut)" }}>
              Sign-in is not configured yet.
            </p>
          )}
          <p style={{ fontFamily: MONO, fontSize: 11, color: "var(--mut)", marginTop: 20 }}>
            No password. Google only. We show a public handle, never your email.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
