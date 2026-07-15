"use client";

// Counts down to the next board reset (UTC midnight, matching the server's day
// rollover). Purely cosmetic urgency for the leaderboard header.
import { useEffect, useState } from "react";

export default function ResetCountdown() {
  const [left, setLeft] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const mid = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
      const ms = mid - now.getTime();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setLeft(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return <>{left ? `resets in ${left}` : "resets at midnight"}</>;
}
