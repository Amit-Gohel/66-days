import { phaseForDay } from "./phases";
import { TOTAL_DAYS } from "./dates";
import type { HeatCell, HeatState } from "@/lib/types";

/**
 * "Never miss twice" streak.
 * - A completed day extends the streak.
 * - A single missed (past) day keeps the streak alive but flags grace.
 * - Two consecutive missed past days reset the streak to 0.
 * - Today, if not yet completed, is neutral (the day isn't over).
 */
export function computeStreak(
  currentDay: number,
  completed: Set<number>,
): { streak: number; graceActive: boolean } {
  let streak = 0;
  let prevMiss = false;
  let graceActive = false;

  for (let d = 1; d <= currentDay; d++) {
    const done = completed.has(d);
    if (done) {
      streak++;
      prevMiss = false;
      graceActive = false;
    } else if (d === currentDay) {
      // today, not done yet — neutral; grace reflects yesterday's state
      break;
    } else if (prevMiss) {
      streak = 0;
      prevMiss = false;
      graceActive = false;
    } else {
      prevMiss = true;
      graceActive = streak > 0;
    }
  }

  return { streak, graceActive };
}

/** 66-cell heatmap for the diary view. `partial` days are minimum-mode completions. */
export function buildHeatmap(
  currentDay: number,
  completed: Set<number>,
  partial: Set<number> = new Set(),
): HeatCell[] {
  const cells: HeatCell[] = [];
  let prevMiss = false;

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const phase = phaseForDay(d);
    let state: HeatState;

    if (d > currentDay || (d === currentDay && !completed.has(d) && !partial.has(d))) {
      state = "future"; // upcoming, or today still pending
    } else if (completed.has(d)) {
      state = "completed";
      prevMiss = false;
    } else if (partial.has(d)) {
      state = "partial";
      prevMiss = false;
    } else {
      state = prevMiss ? "missed-twice" : "missed-once";
      prevMiss = true;
    }

    cells.push({ id: `h${d}`, day: d, phase, state });
  }

  return cells;
}
