import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz, dayNumber, startOfWeek, addDays } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { meanBrier, confidenceNote, calibrationBins } from "@/lib/domain/brier";
import type { Prediction, WeeklyReview } from "@/lib/types";

export interface WeeklyData {
  day: number;
  phase: number;
  weekStart: string;
  weekNumber: number;
  existing: WeeklyReview | null;
  resolvedThisWeek: Prediction[];
  seeds: { id: string; day: number | null; text: string }[];
  outreachCount: number;
  meanBrier: number | null;
  note: string;
}

export async function getWeeklyData(): Promise<WeeklyData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const tz = profile?.timezone ?? "UTC";
  const startDate = profile?.start_date ?? null;
  const today = todayInTz(tz);
  const day = dayNumber(startDate, today);
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 7);
  const weekNumber = startDate ? Math.max(1, Math.ceil(dayNumber(startDate, weekStart) / 7)) : 1;

  const [reviewRes, resolvedRes, seedRes, outreachRes] = await Promise.all([
    supabase.from("weekly_reviews").select("*").eq("week_start", weekStart).maybeSingle(),
    supabase.from("predictions").select("*").eq("status", "resolved").gte("resolved_at", weekStart).lt("resolved_at", `${weekEnd}T00:00:00Z`),
    supabase.from("day_entries").select("id,day_number,d3_problem,d3_solution").or("d3_problem.not.is.null,d3_solution.not.is.null").order("entry_date", { ascending: false }).limit(6),
    supabase.from("outreach").select("id").gte("entry_date", weekStart).lt("entry_date", weekEnd),
  ]);

  const resolved = (resolvedRes.data as Prediction[] | null) ?? [];
  const allResolvedBins = calibrationBins(resolved);

  return {
    day,
    phase: phaseForDay(day),
    weekStart,
    weekNumber,
    existing: (reviewRes.data as WeeklyReview | null) ?? null,
    resolvedThisWeek: resolved,
    seeds: ((seedRes.data as { id: string; day_number: number | null; d3_problem: string | null; d3_solution: string | null }[] | null) ?? []).map((r) => ({
      id: r.id,
      day: r.day_number,
      text: r.d3_solution || r.d3_problem || "",
    })),
    outreachCount: ((outreachRes.data as unknown[] | null) ?? []).length,
    meanBrier: meanBrier(resolved),
    note: confidenceNote(allResolvedBins),
  };
}
