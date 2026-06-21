"use server";

// ============================================================================
// Idea-pipeline CRUD used by the /ideas page. The `ideas` table is the system
// of record (lane: seed|culled|developed · is_top3 · top3_rank · SCAMPER
// fields). RLS scopes every row to its owner; we also filter on user_id
// defensively. There is intentionally NO hard delete — removing an idea means
// culling it (reversible), which matches the system's "most seeds are culled"
// design and stops journal-sourced ideas from reappearing on the next import.
// ============================================================================

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import type { Idea, ScamperPrompt } from "@/lib/types";

function clean(v: string | undefined | null): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

const PROMPTS = ["S", "C", "A", "M", "P", "E", "R"];
function cleanPrompt(p: string | undefined | null): ScamperPrompt | null {
  return p && PROMPTS.includes(p) ? (p as ScamperPrompt) : null;
}

/** Surfaces that show idea counts/lanes (the page itself + the home dashboard's
 *  gamification reads). Kept in one place so every mutation refreshes the same set. */
function revalidate() {
  revalidatePath("/ideas");
  revalidatePath("/home");
}

async function requireUser() {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  return user;
}

/** Add a brand-new seed by hand (not tied to a D3 journal entry). Returns the
 *  full row so the client can prepend it without a refetch. */
export async function createIdea(input: { text: string }): Promise<Idea> {
  const user = await requireUser();
  const text = clean(input.text);
  if (!text) throw new Error("Write the idea first.");

  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");
  const day = dayNumber(profile?.start_date ?? null, today);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({ user_id: user.id, text, lane: "seed", day_number: day >= 1 ? day : null })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  revalidate();
  return data as Idea;
}

const LANES = ["seed", "developed", "culled"] as const;
type Lane = (typeof LANES)[number];
function cleanLane(l: string | undefined | null): Lane {
  return (LANES as readonly string[]).includes(l ?? "") ? (l as Lane) : "seed";
}

/** Edit an idea's text, its SCAMPER development, AND its stage (lane). The stage
 *  is now an explicit choice the user makes in the edit form — Seed / Developed /
 *  Culled — rather than being inferred. Moving an idea to 'culled' also drops it
 *  from the finalists (a culled idea can't be a Top pick). */
export async function editIdea(input: {
  id: string;
  text: string;
  scamper_prompt: string | null;
  scamper_result: string | null;
  lane: string;
}) {
  const user = await requireUser();
  const text = clean(input.text);
  if (!text) throw new Error("Idea text is required.");
  const result = clean(input.scamper_result);
  const prompt = result ? cleanPrompt(input.scamper_prompt) : null;
  const lane = cleanLane(input.lane);

  const patch: Record<string, unknown> = { text, scamper_prompt: prompt, scamper_result: result, lane };
  if (lane === "culled") {
    patch.is_top3 = false;
    patch.top3_rank = null;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  revalidate();
  return { ok: true as const };
}

/** Persist the finalists as an ORDERED list. Ranks are written as 1..N in list
 *  order, and any idea that was a finalist but isn't in the list is demoted.
 *
 *  This is the single entry point for every finalist change — star, un-star,
 *  and manual reorder all reduce to "here is the new ordered list of ids." That
 *  keeps ranks contiguous (no gaps like the old #2/#3/#4) and lets the client
 *  express insert-at-position / remove-and-close-gap by just reshuffling the
 *  array. There is no fixed cap — the user picks however many finalists they want. */
export async function setFinalists(orderedIds: string[]) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: cur } = await supabase
    .from("ideas")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_top3", true);
  const currentIds = ((cur as { id: string }[] | null) ?? []).map((r) => r.id);
  const demote = currentIds.filter((id) => !orderedIds.includes(id));

  const results = await Promise.all([
    ...orderedIds.map((id, i) =>
      supabase.from("ideas").update({ is_top3: true, top3_rank: i + 1 }).eq("id", id).eq("user_id", user.id),
    ),
    ...demote.map((id) =>
      supabase.from("ideas").update({ is_top3: false, top3_rank: null }).eq("id", id).eq("user_id", user.id),
    ),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  revalidate();
  return { ok: true as const };
}
