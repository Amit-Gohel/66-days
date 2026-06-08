"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser } from "@/lib/queries/profile";
import { loadGameStats } from "@/lib/queries/gamification";
import { evaluateAchievements, badgeByKey } from "@/lib/domain/gamification";

export interface UnlockedBadge {
  key: string;
  name: string;
  desc: string;
  icon: string;
}

/**
 * Idempotently record any newly-earned achievements and return the ones unlocked on
 * THIS call (for a celebration toast). Safe to call on every home-page mount: it only
 * inserts rows that don't exist yet, so re-runs return [] and never re-celebrate.
 * Badges are never removed (removing earned rewards harms via loss aversion — E5).
 */
export async function syncAchievements(): Promise<{ unlocked: UnlockedBadge[] }> {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const { stats, todayISO } = await loadGameStats();
  const earned = evaluateAchievements(stats);
  if (earned.length === 0) return { unlocked: [] };

  const supabase = await createClient();
  const { data: existing } = await supabase.from("achievements").select("key");
  const have = new Set((existing as { key: string }[] | null ?? []).map((r) => r.key));

  const fresh = earned.filter((k) => !have.has(k));
  if (fresh.length === 0) return { unlocked: [] };

  const { error } = await supabase.from("achievements").insert(
    fresh.map((key) => ({
      user_id: user.id,
      key,
      unlocked_on: todayISO,
      seen: false,
    })),
  );
  if (error) throw new Error(error.message);

  revalidatePath("/home");

  const unlocked: UnlockedBadge[] = fresh
    .map((key) => badgeByKey(key))
    .filter((b): b is NonNullable<typeof b> => b != null)
    .map((b) => ({ key: b.key, name: b.name, desc: b.desc, icon: b.icon }));

  return { unlocked };
}
