import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import type { DayEntry, NightSession } from "@/lib/types";

export interface NightRevealItem {
  id: string;
  tag: string;
  text: string;
}
export interface DuePrediction {
  id: string;
  claim: string;
  probability: number;
}

export interface NightData {
  day: number;
  phase: number;
  cue: string;
  todayISO: string;
  reveal: NightRevealItem[];
  n1Total: number;
  due: DuePrediction[];
  seedText: string | null;
  session: NightSession | null;
}

function buildReveal(e: DayEntry | null): NightRevealItem[] {
  if (!e) return [];
  const items: NightRevealItem[] = [];
  if (e.d1_anomaly) items.push({ id: "d1", tag: "D1 · Anomaly", text: e.d1_anomaly });
  [e.d2_noticing_1, e.d2_noticing_2, e.d2_noticing_3].forEach((n, i) => {
    if (n) items.push({ id: `d2-${i}`, tag: "D2 · Noticing", text: n });
  });
  if (e.d3_solution || e.d3_problem)
    items.push({ id: "d3", tag: "D3 · Idea seed", text: e.d3_solution || e.d3_problem || "" });
  if (e.d4_shift_topic) items.push({ id: "d4", tag: "D4 · People note", text: e.d4_shift_topic });
  return items;
}

export async function getNightData(): Promise<NightData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const tz = profile?.timezone ?? "UTC";
  const todayISO = todayInTz(tz);
  const day = dayNumber(profile?.start_date ?? null, todayISO);
  const phase = phaseForDay(day);

  const [todayEntryRes, sessionRes, dueRes, seedRes] = await Promise.all([
    supabase.from("day_entries").select("*").eq("entry_date", todayISO).maybeSingle(),
    supabase.from("night_sessions").select("*").eq("entry_date", todayISO).maybeSingle(),
    supabase
      .from("predictions")
      .select("id,claim,probability")
      .eq("status", "open")
      .lte("resolves_on", todayISO)
      .order("resolves_on", { ascending: true }),
    supabase
      .from("day_entries")
      .select("d3_problem,d3_solution")
      .or("d3_problem.not.is.null,d3_solution.not.is.null")
      .order("entry_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const reveal = buildReveal((todayEntryRes.data as DayEntry | null) ?? null);
  const seedRow = seedRes.data as { d3_problem: string | null; d3_solution: string | null } | null;

  return {
    day,
    phase,
    cue: profile?.habit_cue ?? "After I brush my teeth",
    todayISO,
    reveal,
    n1Total: reveal.length,
    due: (dueRes.data as DuePrediction[] | null) ?? [],
    seedText: seedRow ? seedRow.d3_solution || seedRow.d3_problem : null,
    session: (sessionRes.data as NightSession | null) ?? null,
  };
}
