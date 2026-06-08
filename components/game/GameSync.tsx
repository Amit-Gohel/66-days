"use client";

import { useEffect, useRef, useState } from "react";
import { syncAchievements, type UnlockedBadge } from "@/lib/actions/gamification";
import { refreshLeaderboardEntry } from "@/lib/actions/social";
import { Icon } from "@/components/ui/Icon";

/**
 * Runs once on home-page mount: persists any newly-earned badges and celebrates the
 * ones unlocked on this visit (Fogg's "celebration" — competence-affirming, E12/E4).
 * Calm and dismissible; no sound, and the entry animation is disabled under
 * prefers-reduced-motion (the .anim-up class is gated in globals.css).
 */
export function GameSync({ leaderboardOptIn = false }: { leaderboardOptIn?: boolean }) {
  const ran = useRef(false);
  const [unlocked, setUnlocked] = useState<UnlockedBadge[]>([]);

  useEffect(() => {
    if (ran.current) return; // guard: only fire once per mount, never loop on revalidate
    ran.current = true;
    syncAchievements()
      .then((r) => {
        if (r.unlocked.length) setUnlocked(r.unlocked);
      })
      .catch(() => {
        /* non-fatal: a failed sync just means no celebration this time */
      });
    // keep the user's public leaderboard row fresh (no-op unless they opted in)
    if (leaderboardOptIn) refreshLeaderboardEntry().catch(() => {});
  }, [leaderboardOptIn]);

  useEffect(() => {
    if (!unlocked.length) return;
    const t = setTimeout(() => setUnlocked([]), 6000);
    return () => clearTimeout(t);
  }, [unlocked]);

  if (!unlocked.length) return null;

  const names = unlocked.map((b) => b.name).join(", ");
  const label = unlocked.length === 1 ? "Badge unlocked" : `${unlocked.length} badges unlocked`;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => setUnlocked([])}
      className="anim-up f-ui fixed left-1/2 z-[75] flex items-center gap-3"
      style={{
        bottom: 88,
        transform: "translateX(-50%)",
        background: "var(--surface)",
        border: "1px solid var(--accent)",
        boxShadow: "var(--shadow-float)",
        borderRadius: 8,
        padding: "12px 18px",
        cursor: "pointer",
        maxWidth: "min(420px, 90vw)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 8, background: "var(--surface-2)", flexShrink: 0 }}
      >
        <Icon name={unlocked[0].icon} size={20} style={{ color: "var(--accent)" }} />
      </div>
      <div>
        <p className="f-hand m-0" style={{ fontSize: 17, color: "var(--text)", lineHeight: 1.1 }}>
          {label}
        </p>
        <p className="f-serif m-0" style={{ fontSize: 13, color: "var(--text-2)" }}>
          {names}
        </p>
      </div>
    </div>
  );
}
