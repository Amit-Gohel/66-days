"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { COLUMN_MAP, type CaptureKey } from "@/lib/static/capture-spec";

function clean(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

/** Upsert one D-section of today's day_entries row (other sections untouched). */
export async function upsertDayCapture(
  section: CaptureKey,
  values: Record<string, string>,
) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const profile = await getProfile();

  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);
  const day = dayNumber(profile?.start_date ?? null, today);
  const phase = phaseForDay(day);

  const row: Record<string, unknown> = {
    user_id: user.id,
    entry_date: today,
    day_number: day,
    phase,
  };
  for (const [fieldKey, col] of Object.entries(COLUMN_MAP[section])) {
    row[col as string] = clean(values[fieldKey]);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("day_entries")
    .upsert(row, { onConflict: "user_id,entry_date" });
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  return { ok: true as const };
}

/** Log a conditional, value-first outreach (not a streak item). */
export async function logOutreach(values: Record<string, string>) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  const supabase = await createClient();
  const { error } = await supabase.from("outreach").insert({
    user_id: user.id,
    entry_date: today,
    who: clean(values.who),
    why_now: clean(values.why),
    value_offered: clean(values.value),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  return { ok: true as const };
}
