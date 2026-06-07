import { createClient } from "@/lib/supabase/server";
import type { FunnelCounts } from "@/components/charts/IdeaFunnel";

export interface IdeaSeed {
  id: string;
  day: number | null;
  text: string;
}
export interface DevelopedIdea {
  id: string;
  prompt: string | null;
  idea: string;
  result: string;
}

export interface IdeasData {
  funnel: FunnelCounts;
  seeds: IdeaSeed[];
  developed: DevelopedIdea[];
}

export async function getIdeas(): Promise<IdeasData> {
  const supabase = await createClient();

  const [d3Res, n5Res, cullRes] = await Promise.all([
    supabase
      .from("day_entries")
      .select("id,day_number,d3_problem,d3_solution")
      .or("d3_problem.not.is.null,d3_solution.not.is.null")
      .order("entry_date", { ascending: false }),
    supabase
      .from("night_sessions")
      .select("id,n5_idea,n5_prompt,n5_result")
      .not("n5_result", "is", null)
      .order("entry_date", { ascending: false }),
    supabase.from("weekly_reviews").select("best_idea").not("best_idea", "is", null),
  ]);

  const seeds: IdeaSeed[] = ((d3Res.data as { id: string; day_number: number | null; d3_problem: string | null; d3_solution: string | null }[] | null) ?? []).map(
    (r) => ({ id: r.id, day: r.day_number, text: r.d3_solution || r.d3_problem || "" }),
  );
  const developed: DevelopedIdea[] = ((n5Res.data as { id: string; n5_idea: string | null; n5_prompt: string | null; n5_result: string | null }[] | null) ?? []).map(
    (r) => ({ id: r.id, prompt: r.n5_prompt, idea: r.n5_idea || "", result: r.n5_result || "" }),
  );
  const culls = ((cullRes.data as unknown[] | null) ?? []).length;

  return {
    seeds,
    developed,
    funnel: {
      seeds: seeds.length,
      culls,
      developed: developed.length,
      top: Math.min(3, developed.length),
    },
  };
}
