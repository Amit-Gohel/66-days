import { phaseForDay } from "./phases";
import { TOTAL_DAYS } from "./dates";
import type { HeatCell, HeatState } from "@/lib/types";

/**
 * "Never miss twice" streak, with optional earned freezes (healthy-by-default).
 * - A completed day extends the streak.
 * - A single missed (past) day keeps the streak alive but flags grace.
 * - A second consecutive missed past day would reset the streak — UNLESS a freeze
 *   is available, in which case the freeze is spent to keep the streak alive
 *   (the missed day is "frozen"). Isolated single misses never spend a freeze.
 * - Two consecutive misses with no freeze left reset the streak to 0.
 * - Today, if not yet completed, is neutral (the day isn't over).
 *
 * `freezes` is the number of available freezes (derived, never purchasable — see
 * lib/domain/gamification.ts). Defaults to 0, so existing 2-arg callers are unchanged.
 */
export function computeStreak(
  currentDay: number,
  completed: Set<number>,
  freezes = 0,
): { streak: number; graceActive: boolean; freezesUsed: number; freezesLeft: number } {
  let streak = 0;
  let prevMiss = false;
  let graceActive = false;
  let freezesLeft = freezes;
  let freezesUsed = 0;

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
      // second consecutive miss — spend a freeze to survive if we have one.
      if (freezesLeft > 0) {
        freezesLeft--;
        freezesUsed++;
        prevMiss = false; // freeze covers this day; the chain continues
        graceActive = streak > 0; // still in a fragile state
      } else {
        streak = 0;
        prevMiss = false;
        graceActive = false;
      }
    } else {
      prevMiss = true;
      graceActive = streak > 0;
    }
  }

  return { streak, graceActive, freezesUsed, freezesLeft };
}

/**
 * 66-cell heatmap for the diary view. `partial` days are minimum-mode completions.
 * `freezes` mirrors computeStreak: a second consecutive miss is shown as `frozen`
 * (protected) rather than `missed-twice` when a freeze is available.
 */
export function buildHeatmap(
  currentDay: number,
  completed: Set<number>,
  partial: Set<number> = new Set(),
  freezes = 0,
): HeatCell[] {
  const cells: HeatCell[] = [];
  let prevMiss = false;
  let freezesLeft = freezes;

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
    } else if (prevMiss && freezesLeft > 0) {
      // second consecutive miss, covered by a freeze — protected, chain continues
      state = "frozen";
      freezesLeft--;
      prevMiss = false;
    } else {
      state = prevMiss ? "missed-twice" : "missed-once";
      prevMiss = true;
    }

    cells.push({ id: `h${d}`, day: d, phase, state });
  }

  return cells;
}
