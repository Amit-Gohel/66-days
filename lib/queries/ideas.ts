import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { todayInTz } from "@/lib/domain/dates";
import type { Idea } from "@/lib/types";

export interface IdeasData {
  ideas: Idea[];
  today: string;
}

/** Load the user's idea pipeline.
 *
 *  The `ideas` table is the system of record for the pipeline (lanes + Top-3),
 *  but the raw material is captured during the daily rituals: D3 seeds land on
 *  `day_entries`, and N5 SCAMPER developments on `night_sessions`. So before we
 *  read, we run a cheap, idempotent IMPORT — inserting an `ideas` row for any
 *  seed/development that doesn't have one yet. We never UPDATE existing rows
 *  here, so a user's decisions (cull / develop / Top-3 / edits) are never
 *  clobbered and a culled idea never silently reappears.
 */
export async function getIdeas(): Promise<IdeasData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  const user = await getClaimsUser();
  if (!user) return { ideas: [], today };

  await importMissingIdeas(supabase, user.id);

  const { data } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { ideas: (data as Idea[] | null) ?? [], today };
}

/** Insert-if-missing. Seeds are deduped by their `source_day_entry_id`;
 *  developments by their SCAMPER result text (night_sessions has no stable id
 *  we store on the idea). Best-effort: never throws into the render path. */
async function importMissingIdeas(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const [seedSrc, devSrc, existingRes] = await Promise.all([
    supabase
      .from("day_entries")
      .select("id,day_number,d3_problem,d3_solution")
      .or("d3_problem.not.is.null,d3_solution.not.is.null"),
    supabase
      .from("night_sessions")
      .select("n5_idea,n5_prompt,n5_result")
      .not("n5_result", "is", null),
    supabase.from("ideas").select("source_day_entry_id,scamper_result,lane"),
  ]);

  const existing =
    (existingRes.data as { source_day_entry_id: string | null; scamper_result: string | null; lane: string }[] | null) ?? [];
  const haveSeed = new Set(existing.map((r) => r.source_day_entry_id).filter(Boolean) as string[]);
  const haveDev = new Set(
    existing.filter((r) => r.lane === "developed").map((r) => r.scamper_result).filter(Boolean) as string[],
  );

  const rows: Record<string, unknown>[] = [];

  for (const s of (seedSrc.data as { id: string; day_number: number | null; d3_problem: string | null; d3_solution: string | null }[] | null) ?? []) {
    if (haveSeed.has(s.id)) continue;
    const text = (s.d3_solution || s.d3_problem || "").trim();
    if (!text) continue;
    rows.push({ user_id: userId, text, source_day_entry_id: s.id, day_number: s.day_number, lane: "seed" });
  }
  for (const d of (devSrc.data as { n5_idea: string | null; n5_prompt: string | null; n5_result: string | null }[] | null) ?? []) {
    const result = (d.n5_result || "").trim();
    if (!result || haveDev.has(result)) continue;
    rows.push({
      user_id: userId,
      text: (d.n5_idea || result).trim(),
      scamper_prompt: d.n5_prompt,
      scamper_result: result,
      lane: "developed",
    });
  }

  if (rows.length) await supabase.from("ideas").insert(rows);
}
