import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz, dayNumber, addDays } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { buildHeatmap } from "@/lib/domain/streak";
import { freezesEarned } from "@/lib/domain/gamification";
import type { DayEntry, NightSession, HeatCell } from "@/lib/types";

export interface TimelineItem {
  id: string;
  day: number;
  type: string;
  excerpt: string;
}

export interface ArchiveData {
  day: number;
  phase: number;
  totalWords: number;
  timeline: TimelineItem[];
  heatmap: HeatCell[];
  recall7: string | null;
}

function words(...parts: (string | null)[]): number {
  return parts.reduce((a, s) => a + (s ? s.trim().split(/\s+/).filter(Boolean).length : 0), 0);
}

export async function getArchive(): Promise<ArchiveData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const tz = profile?.timezone ?? "UTC";
  const startDate = profile?.start_date ?? null;
  const today = todayInTz(tz);
  const day = dayNumber(startDate, today);

  const [entriesRes, nightsRes, weeklyRes] = await Promise.all([
    supabase.from("day_entries").select("*").order("entry_date", { ascending: false }),
    supabase.from("night_sessions").select("*").order("entry_date", { ascending: false }),
    supabase.from("weekly_reviews").select("id"),
  ]);
  const entries = (entriesRes.data as DayEntry[] | null) ?? [];
  const nights = (nightsRes.data as NightSession[] | null) ?? [];
  const freezes = freezesEarned((weeklyRes.data as { id: string }[] | null)?.length ?? 0);

  const dn = (d: string) => (startDate ? dayNumber(startDate, d) : 0);
  const completed = new Set<number>();
  let totalWords = 0;
  const timeline: TimelineItem[] = [];

  for (const e of entries) {
    const d = dn(e.entry_date);
    if (d >= 1) completed.add(d);
    totalWords += words(e.d1_place, e.d1_baseline, e.d1_anomaly, e.d1_so_what, e.d2_noticing_1, e.d2_noticing_2, e.d2_noticing_3, e.d3_problem, e.d3_solution, e.d4_person, e.d4_baseline, e.d4_shift_topic, e.d4_open_question);
    if (e.d1_anomaly || e.d1_place) timeline.push({ id: `${e.id}-D1`, day: d, type: "D1", excerpt: [e.d1_place, e.d1_anomaly].filter(Boolean).join(" · ") });
    if (e.d2_noticing_1) timeline.push({ id: `${e.id}-D2`, day: d, type: "D2", excerpt: [e.d2_noticing_1, e.d2_noticing_2].filter(Boolean).join(" · ") });
    if (e.d3_problem || e.d3_solution) timeline.push({ id: `${e.id}-D3`, day: d, type: "D3", excerpt: [e.d3_problem, e.d3_solution].filter(Boolean).join(" → ") });
    if (e.d4_person || e.d4_shift_topic) timeline.push({ id: `${e.id}-D4`, day: d, type: "D4", excerpt: [e.d4_person, e.d4_shift_topic].filter(Boolean).join(" · ") });
  }
  for (const n of nights) {
    if (n.completed_at) completed.add(dn(n.entry_date));
    totalWords += words(n.n1_recalled_text, n.n2_intended, n.n2_happened, n.n2_why_gap, n.n2_sustain, n.n2_improve, n.n4_belief, n.n4_against, n.n4_evidence, n.n5_result);
    const ex = n.n2_happened || n.n1_recalled_text || n.n4_belief;
    if (ex) timeline.push({ id: `${n.id}-N`, day: dn(n.entry_date), type: "Night", excerpt: ex });
  }

  timeline.sort((a, b) => b.day - a.day);

  const recall7Date = addDays(today, -7);
  const recall7Entry = entries.find((e) => e.entry_date === recall7Date);

  return {
    day,
    phase: phaseForDay(day),
    totalWords,
    timeline,
    heatmap: buildHeatmap(day, completed, new Set(), freezes),
    recall7: recall7Entry?.d1_anomaly ?? null,
  };
}
