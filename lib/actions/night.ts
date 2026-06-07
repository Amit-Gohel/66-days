"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { todayInTz } from "@/lib/domain/dates";
import type { N4Variant, ScamperPrompt } from "@/lib/types";

function clean(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export interface NightPayload {
  n1_recalled_text?: string;
  n1_missed_items?: string;
  n1_recalled_count?: number | null;
  n1_total_count?: number | null;
  n2_intended?: string;
  n2_happened?: string;
  n2_why_gap?: string;
  n2_sustain?: string;
  n2_improve?: string;
  n4_variant?: N4Variant;
  n4_belief?: string;
  n4_against?: string;
  n4_evidence?: string;
  n4_hyp_a?: string;
  n4_hyp_b?: string;
  n4_diagnostic_test?: string;
  n5_idea?: string;
  n5_prompt?: ScamperPrompt;
  n5_result?: string;
}

export async function completeNight(p: NightPayload) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  const row = {
    user_id: user.id,
    entry_date: today,
    n1_recalled_text: clean(p.n1_recalled_text),
    n1_missed_items: clean(p.n1_missed_items),
    n1_recalled_count: p.n1_recalled_count ?? null,
    n1_total_count: p.n1_total_count ?? null,
    n2_intended: clean(p.n2_intended),
    n2_happened: clean(p.n2_happened),
    n2_why_gap: clean(p.n2_why_gap),
    n2_sustain: clean(p.n2_sustain),
    n2_improve: clean(p.n2_improve),
    n4_variant: p.n4_variant ?? null,
    n4_belief: clean(p.n4_belief),
    n4_against: clean(p.n4_against),
    n4_evidence: clean(p.n4_evidence),
    n4_hyp_a: clean(p.n4_hyp_a),
    n4_hyp_b: clean(p.n4_hyp_b),
    n4_diagnostic_test: clean(p.n4_diagnostic_test),
    n5_idea: clean(p.n5_idea),
    n5_prompt: p.n5_prompt ?? null,
    n5_result: clean(p.n5_result),
    completed_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("night_sessions")
    .upsert(row, { onConflict: "user_id,entry_date" });
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/calibration");
  return { ok: true as const };
}

export async function createPrediction(input: {
  claim: string;
  probability: number;
  resolves_on: string | null;
}) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const claim = clean(input.claim);
  if (!claim) throw new Error("Prediction text is required.");
  const prob = Math.round(input.probability);
  if (isNaN(prob) || prob < 1 || prob > 99)
    throw new Error("Probability must be 1–99%.");

  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("predictions")
    .insert({
      user_id: user.id,
      claim,
      probability: prob,
      logged_date: today,
      resolves_on: input.resolves_on || null,
      status: "open",
    })
    .select("id,claim,probability")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return data as { id: string; claim: string; probability: number };
}

export async function resolvePrediction(id: string, outcome: boolean) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("predictions")
    .update({ status: "resolved", outcome, resolved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return { ok: true as const };
}
