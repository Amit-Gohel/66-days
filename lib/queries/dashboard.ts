import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "./profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay, FEATURE_UNLOCK_DAY, type Feature } from "@/lib/domain/phases";
import { computeStreak, buildHeatmap } from "@/lib/domain/streak";
import { drillForDay, type Drill } from "@/lib/static/program";
import type { AppState, DayEntry, HeatCell } from "@/lib/types";

export type CaptureKey = "D1" | "D2" | "D3" | "D4";
export type CaptureStatus = "done" | "empty" | "locked";

export interface Dashboard {
  app: AppState;
  heatmap: HeatCell[];
  captures: Record<CaptureKey, CaptureStatus>;
  pagesFilled: { totalWords: number; perDay: number };
  drill: Drill;
  todayEntry: DayEntry | null;
}

function wordCount(s: string | null): number {
  if (!s) return 0;
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function sectionFilled(e: DayEntry | null, key: CaptureKey): boolean {
  if (!e) return false;
  if (key === "D1") return !!(e.d1_place || e.d1_baseline || e.d1_anomaly || e.d1_so_what);
  if (key === "D2") return !!(e.d2_noticing_1 || e.d2_noticing_2 || e.d2_noticing_3);
  if (key === "D3") return !!(e.d3_problem || e.d3_solution);
  return !!(e.d4_person || e.d4_baseline || e.d4_shift_topic || e.d4_open_question);
}

export async function getDashboard(): Promise<Dashboard> {
  const supabase = await createClient();
  const [user, profile] = await Promise.all([getClaimsUser(), getProfile()]);

  const tz = profile?.timezone ?? "UTC";
  const startDate = profile?.start_date ?? null;
  const todayISO = todayInTz(tz);
  const day = dayNumber(startDate, todayISO);
  const phase = phaseForDay(day);

  const [entriesRes, nightsRes] = await Promise.all([
    supabase.from("day_entries").select("*").order("entry_date", { ascending: true }),
    supabase.from("night_sessions").select("entry_date").not("completed_at", "is", null),
  ]);
  const entries = (entriesRes.data as DayEntry[] | null) ?? [];
  const nights = (nightsRes.data as { entry_date: string }[] | null) ?? [];

  // A day counts toward the streak if the user showed up — captured OR ran the
  // night session that day.
  const completed = new Set<number>();
  for (const e of entries) {
    const dn = startDate ? dayNumber(startDate, e.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }
  for (const n of nights) {
    const dn = startDate ? dayNumber(startDate, n.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }

  const todayEntry = entries.find((e) => e.entry_date === todayISO) ?? null;

  const captures = {} as Record<CaptureKey, CaptureStatus>;
  for (const k of ["D1", "D2", "D3", "D4"] as CaptureKey[]) {
    const unlock = FEATURE_UNLOCK_DAY[k as Feature];
    captures[k] = day < unlock ? "locked" : sectionFilled(todayEntry, k) ? "done" : "empty";
  }

  let totalWords = 0;
  for (const e of entries) {
    totalWords += [
      e.d1_place, e.d1_baseline, e.d1_anomaly, e.d1_so_what,
      e.d2_noticing_1, e.d2_noticing_2, e.d2_noticing_3,
      e.d3_problem, e.d3_solution,
      e.d4_person, e.d4_baseline, e.d4_shift_topic, e.d4_open_question,
    ].reduce((a, s) => a + wordCount(s), 0);
  }
  const perDay = entries.length ? Math.round(totalWords / entries.length) : 0;

  const { streak, graceActive } = computeStreak(day, completed);

  const app: AppState = {
    day,
    phase,
    streak,
    graceActive,
    cue: profile?.habit_cue ?? "After I brush my teeth",
    email: user?.email ?? "",
    theme: profile?.theme ?? "dark",
    todayISO,
  };

  return {
    app,
    heatmap: buildHeatmap(day, completed),
    captures,
    pagesFilled: { totalWords, perDay },
    drill: drillForDay(day),
    todayEntry,
  };
}
