"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { todayInTz } from "@/lib/domain/dates";
import type { N4Variant, ScamperPrompt } from "@/lib/types";

/** Trim a string and collapse ""/whitespace/null to null, so empty fields are
 *  stored as SQL NULL instead of empty strings. */
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

// ============================================================================
// Predictions (the night session's N3 step) — CRUD used by the night flow and
// the /predictions log. RLS scopes every row to the owner; we also filter on
// user_id defensively. brier_score is a generated column, so it is never
// written here — it recomputes from probability + outcome on every change.
// ============================================================================

/** File a new forecast in the OPEN state. Validates the claim is non-empty and
 *  the probability is an integer 1–99 (matching the DB CHECK constraint).
 *  Returns the new row's id/claim/probability so callers can show it instantly. */
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

  // logged_date is "today" in the user's timezone (not the server's).
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
      resolves_on: input.resolves_on || null, // optional "when you'll know"
      status: "open",
    })
    .select("id,claim,probability")
    .single();
  if (error) throw new Error(error.message);

  // Refresh every surface that reads predictions or Brier stats.
  revalidatePath("/home");
  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return data as { id: string; claim: string; probability: number };
}

/** Resolve a forecast as hit (true) or miss (false). This is the one-tap path
 *  used for open/due forecasts in the log and night flow; changing an
 *  ALREADY-resolved outcome goes through editPrediction instead. */
export async function resolvePrediction(id: string, outcome: boolean) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const supabase = await createClient();
  // Re-resolvable at the data layer: calling this on an already-resolved
  // prediction flips the outcome. brier_score recomputes automatically.
  const { error } = await supabase
    .from("predictions")
    .update({ status: "resolved", outcome, resolved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return { ok: true as const };
}

/** Deliberate edit of a prediction from the log: claim / probability / resolve
 *  date PLUS an explicit resolution state, in one atomic update. This is the
 *  only path that can change an already-resolved outcome (the row no longer
 *  flips it on a stray click). brier_score recomputes from the generated column.
 *  - resolution "open"  → un-resolve (clears outcome + resolved_at + Brier)
 *  - resolution "hit"/"miss" → resolve; resolved_at is set only on the first
 *    resolution so flipping hit↔miss keeps the original date. */
export async function editPrediction(input: {
  id: string;
  claim: string;
  probability: number;
  resolves_on: string | null;
  resolution: "open" | "hit" | "miss";
  wasResolved: boolean;
}) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const claim = clean(input.claim);
  if (!claim) throw new Error("Prediction text is required.");
  const prob = Math.round(input.probability);
  if (isNaN(prob) || prob < 1 || prob > 99)
    throw new Error("Probability must be 1–99%.");

  // Always update the editable fields…
  const patch: Record<string, unknown> = {
    claim,
    probability: prob,
    resolves_on: input.resolves_on || null,
  };
  // …then apply the requested resolution state.
  if (input.resolution === "open") {
    // un-resolve: clear outcome + date (brier_score follows via the DB)
    patch.status = "open";
    patch.outcome = null;
    patch.resolved_at = null;
  } else {
    patch.status = "resolved";
    patch.outcome = input.resolution === "hit";
    // stamp resolved_at only on the FIRST resolution; flipping hit↔miss keeps
    // the original date (wasResolved tells us which case we're in).
    if (!input.wasResolved) patch.resolved_at = new Date().toISOString();
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("predictions")
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return { ok: true as const };
}

/** Permanently remove a forecast from the log (e.g. a duplicate or mistake).
 *  The UI guards this behind a confirm; RLS + the user_id filter ensure a user
 *  can only delete their own row. */
export async function deletePrediction(id: string) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("predictions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/home");
  revalidatePath("/predictions");
  revalidatePath("/calibration");
  return { ok: true as const };
}
