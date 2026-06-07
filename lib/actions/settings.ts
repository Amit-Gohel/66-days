"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser } from "@/lib/queries/profile";
import type { Theme } from "@/lib/types";

export async function updateSettings(input: { cueHabit?: string; theme?: Theme }) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const patch: Record<string, unknown> = {};
  if (input.cueHabit !== undefined) {
    const h = input.cueHabit.trim().replace(/^After I /i, "");
    patch.habit_cue = h ? `After I ${h}` : "After I brush my teeth";
  }
  if (input.theme) patch.theme = input.theme;
  if (Object.keys(patch).length === 0) return { ok: true as const };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/settings");
  return { ok: true as const };
}

/** Returns the user's full journal as a JSON string (RLS scopes to them). */
export async function exportData(): Promise<string> {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const supabase = await createClient();

  const [profile, days, nights, predictions, outreach, weekly] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    supabase.from("day_entries").select("*").order("entry_date"),
    supabase.from("night_sessions").select("*").order("entry_date"),
    supabase.from("predictions").select("*").order("created_at"),
    supabase.from("outreach").select("*").order("entry_date"),
    supabase.from("weekly_reviews").select("*").order("week_start"),
  ]);

  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      profile: profile.data,
      day_entries: days.data,
      night_sessions: nights.data,
      predictions: predictions.data,
      outreach: outreach.data,
      weekly_reviews: weekly.data,
    },
    null,
    2,
  );
}
