import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { buildHeatmap } from "@/lib/domain/streak";
import { freezesEarned } from "@/lib/domain/gamification";
import {
  calibrationBins,
  brierByWeek,
  missRateByWeek,
  meanBrier,
  confidenceNote,
  type CalibrationBin,
  type WeekPoint,
  type MissPoint,
} from "@/lib/domain/brier";
import type { Prediction, HeatCell } from "@/lib/types";

export interface CalibrationData {
  day: number;
  phase: number;
  resolvedCount: number;
  meanBrier: number | null;
  bins: CalibrationBin[];
  brierTrend: WeekPoint[];
  missTrend: MissPoint[];
  note: string;
  heatmap: HeatCell[];
}

export async function getCalibration(): Promise<CalibrationData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const tz = profile?.timezone ?? "UTC";
  const startDate = profile?.start_date ?? null;
  const today = todayInTz(tz);
  const day = dayNumber(startDate, today);
  const phase = phaseForDay(day);

  const [predRes, nightRes, entryRes, weeklyRes] = await Promise.all([
    supabase.from("predictions").select("*").eq("status", "resolved"),
    supabase.from("night_sessions").select("entry_date,n1_miss_rate,completed_at"),
    supabase.from("day_entries").select("entry_date"),
    supabase.from("weekly_reviews").select("id"),
  ]);
  const resolved = (predRes.data as Prediction[] | null) ?? [];
  const nights = (nightRes.data as { entry_date: string; n1_miss_rate: number | null; completed_at: string | null }[] | null) ?? [];
  const entries = (entryRes.data as { entry_date: string }[] | null) ?? [];
  const freezes = freezesEarned((weeklyRes.data as { id: string }[] | null)?.length ?? 0);

  const completed = new Set<number>();
  for (const e of entries) {
    const dn = startDate ? dayNumber(startDate, e.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }
  for (const n of nights) {
    if (!n.completed_at) continue;
    const dn = startDate ? dayNumber(startDate, n.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }

  const bins = calibrationBins(resolved);
  return {
    day,
    phase,
    resolvedCount: resolved.length,
    meanBrier: meanBrier(resolved),
    bins,
    brierTrend: brierByWeek(resolved, startDate),
    missTrend: missRateByWeek(nights, startDate),
    note: confidenceNote(bins),
    heatmap: buildHeatmap(day, completed, new Set(), freezes),
  };
}
