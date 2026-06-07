"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser } from "@/lib/queries/profile";

function clean(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export interface WeeklyPayload {
  week_start: string;
  spaced_reread_done?: boolean;
  recall_7day?: string;
  recall_30day?: string;
  brier_resolved_count?: number | null;
  brier_total_count?: number | null;
  confidence_assessment?: string;
  best_idea?: string;
  pattern_3plus?: string;
  elicitation_noticed?: string;
  system_aar_sustain?: string;
  system_aar_improve?: string;
  outreach_count?: number | null;
}

export async function saveWeeklyReview(p: WeeklyPayload) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const supabase = await createClient();
  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      user_id: user.id,
      week_start: p.week_start,
      spaced_reread_done: p.spaced_reread_done ?? false,
      recall_7day: clean(p.recall_7day),
      recall_30day: clean(p.recall_30day),
      brier_resolved_count: p.brier_resolved_count ?? null,
      brier_total_count: p.brier_total_count ?? null,
      confidence_assessment: clean(p.confidence_assessment),
      best_idea: clean(p.best_idea),
      pattern_3plus: clean(p.pattern_3plus),
      elicitation_noticed: clean(p.elicitation_noticed),
      system_aar_sustain: clean(p.system_aar_sustain),
      system_aar_improve: clean(p.system_aar_improve),
      outreach_count: p.outreach_count ?? null,
    },
    { onConflict: "user_id,week_start" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/weekly");
  revalidatePath("/ideas");
  return { ok: true as const };
}
