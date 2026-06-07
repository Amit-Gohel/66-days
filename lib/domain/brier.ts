import type { Prediction } from "@/lib/types";
import { daysBetween } from "./dates";

// Brier scoring + calibration. probability is stored 1–99 (integer percent).

export function brierFor(probability: number, outcome: boolean): number {
  const p = probability / 100;
  return (p - (outcome ? 1 : 0)) ** 2;
}

export function meanBrier(resolved: Prediction[]): number | null {
  const vals = resolved
    .map((p) => p.brier_score)
    .filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export interface CalibrationBin {
  label: string;
  predicted: number; // 0–1
  actual: number; // 0–1
  n: number;
}

const BANDS = [
  { lo: 25, hi: 35, label: "30%", center: 0.3 },
  { lo: 35, hi: 45, label: "40%", center: 0.4 },
  { lo: 45, hi: 55, label: "50%", center: 0.5 },
  { lo: 55, hi: 65, label: "60%", center: 0.6 },
  { lo: 65, hi: 75, label: "70%", center: 0.7 },
  { lo: 75, hi: 90, label: "80%", center: 0.8 },
];

export function calibrationBins(resolved: Prediction[]): CalibrationBin[] {
  return BANDS.map((b) => {
    const inBin = resolved.filter((p) => p.probability >= b.lo && p.probability < b.hi);
    if (inBin.length === 0) return null;
    const hits = inBin.filter((p) => p.outcome === true).length;
    return { label: b.label, predicted: b.center, actual: hits / inBin.length, n: inBin.length };
  }).filter((x): x is CalibrationBin => x !== null);
}

export interface WeekPoint {
  id: string;
  week: number;
  val: number;
}

/** Group resolved predictions into program weeks by resolved_at, mean Brier per week. */
export function brierByWeek(resolved: Prediction[], startDate: string | null): WeekPoint[] {
  if (!startDate) return [];
  const byWeek = new Map<number, number[]>();
  for (const p of resolved) {
    if (p.brier_score == null || !p.resolved_at) continue;
    const day = daysBetween(startDate, p.resolved_at.slice(0, 10)) + 1;
    const week = Math.max(1, Math.ceil(day / 7));
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)!.push(p.brier_score);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, vals]) => ({
      id: `w${week}`,
      week,
      val: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
}

export interface MissPoint {
  id: string;
  week: number;
  rate: number;
}

/** Weekly mean N1 miss-rate from night sessions. */
export function missRateByWeek(
  rows: { entry_date: string; n1_miss_rate: number | null }[],
  startDate: string | null,
): MissPoint[] {
  if (!startDate) return [];
  const byWeek = new Map<number, number[]>();
  for (const r of rows) {
    if (r.n1_miss_rate == null) continue;
    const day = daysBetween(startDate, r.entry_date) + 1;
    const week = Math.max(1, Math.ceil(day / 7));
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)!.push(r.n1_miss_rate);
  }
  return [...byWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([week, vals]) => ({
      id: `w${week}`,
      week,
      rate: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));
}

/** Over/under-confidence sentence from the 70% bin, if present. */
export function confidenceNote(bins: CalibrationBin[]): string {
  const seventy = bins.find((b) => b.label === "70%");
  if (!seventy) return "";
  return `Your 70%s happened ${Math.round(seventy.actual * 100)}% of the time — ${
    seventy.actual < 0.7 ? "mildly overconfident" : "well calibrated"
  }.`;
}
