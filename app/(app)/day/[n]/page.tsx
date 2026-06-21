import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/profile";
import { addDays } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { entryToValues, type CaptureKey } from "@/lib/static/capture-spec";
import { PHASES } from "@/lib/static/program";
import { TodayClient } from "@/components/today/TodayClient";
import type { DayEntry, NightSession } from "@/lib/types";

export default async function DayPage({ params }: { params: Promise<{ n: string }> }) {
  const { n: nStr } = await params;
  const n = parseInt(nStr, 10);
  if (isNaN(n) || n < 1 || n > 66) redirect("/archive");

  const profile = await getProfile();
  const startDate = profile?.start_date ?? null;
  const dateISO = startDate ? addDays(startDate, n - 1) : null;

  let entry: DayEntry | null = null;
  let session: NightSession | null = null;
  if (dateISO) {
    const supabase = await createClient();
    const [entryRes, sessionRes] = await Promise.all([
      supabase.from("day_entries").select("*").eq("entry_date", dateISO).maybeSingle(),
      supabase.from("night_sessions").select("*").eq("entry_date", dateISO).maybeSingle(),
    ]);
    entry = (entryRes.data as DayEntry | null) ?? null;
    session = (sessionRes.data as NightSession | null) ?? null;
  }

  const prefill = Object.fromEntries(
    (["D1", "D2", "D3", "D4"] as CaptureKey[]).map((k) => [k, entryToValues(entry, k)]),
  ) as Record<CaptureKey, Record<string, string>>;

  const phase = phaseForDay(n);
  const phaseName = PHASES.find((p) => p.n === phase)?.name ?? "";

  return (
    <TodayClient
      mode="past"
      dayNum={n}
      phase={phase}
      phaseLabel={`PHASE ${phase} · ${phaseName.toUpperCase()}`}
      values={prefill}
      night={{ recall: session?.n1_recalled_text ?? "", replay: session?.n2_happened ?? "", done: !!session?.completed_at }}
      game={null}
      stats={{ streak: 0, words: 0, week: "" }}
    />
  );
}
