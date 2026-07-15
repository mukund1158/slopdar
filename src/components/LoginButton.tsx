"use client";

// Google sign-in button for the login page.
import { signIn } from "next-auth/react";
import { SANS } from "@/components/slopdar/ui";

export default function LoginButton({ callbackUrl = "/play" }: { callbackUrl?: string }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className="h-brand"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "var(--brand)",
        color: "#fff",
        border: "2px solid var(--ink)",
        borderRadius: 12,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 16,
        padding: "14px 26px",
        cursor: "pointer",
        boxShadow: "0 5px 0 rgba(0,0,0,.16)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#fff" d="M12 11v3.3h4.6c-.2 1.2-1.5 3.5-4.6 3.5-2.8 0-5-2.3-5-5.1s2.2-5.1 5-5.1c1.6 0 2.6.7 3.2 1.2l2.2-2.1C17.9 4.3 15.2 3 12 3 6.9 3 2.8 7.1 2.8 12S6.9 21 12 21c5.2 0 8.6-3.6 8.6-8.8 0-.6-.1-1-.2-1.2H12z" />
      </svg>
      Sign in with Google
    </button>
  );
}
