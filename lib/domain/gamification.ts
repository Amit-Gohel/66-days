// Pure gamification rules — "Quiet Competence" (see docs/.../specs/gamification.md).
//
// Design rule (from the verified evidence, gamification-research.md):
//   show progress, never threaten it; affirm competence, never coerce.
// Therefore:
//   - Craft Points are a DERIVED competence mirror (reflect work done), never a
//     spendable currency and never gated in front of content. This sidesteps the
//     overjustification trap (Deci/Koestner/Ryan 1999): points read as "you did the
//     work", not as a payoff you chase.
//   - Rewards are DETERMINISTIC — no variable-ratio / random payoffs (Skinner risk, F8).
//   - Streak freezes are EARNED (one per weekly review, capped) and DERIVED, so they
//     can never become a paid "streak repair" (the strongest answer to complaint F5).
//
// Everything here is a pure function of already-stored data — no DB access, no Date.now,
// no side effects — so it is trivially testable and can never be gamed.

import { addDays } from "./dates";

/** The denormalised stats the point/badge rules read. Built in lib/queries/gamification.ts. */
export interface GameStats {
  day: number; // current 1-based program day
  phase: number; // current phase 1–5
  streak: number; // freeze-aware "never miss twice" streak
  filledSectionCount: number; // total D1–D4 sections filled across all day_entries
  dayEntryCount: number; // distinct days with any day_entry
  nightCount: number; // completed night sessions
  predictionsLogged: number;
  predictionsResolved: number;
  meanBrier: number | null; // mean Brier over resolved predictions (lower = sharper)
  ideasDeveloped: number; // ideas in the 'developed' lane
  ideasTop3: number; // ideas flagged top-3
  weeklyReviewCount: number;
  programComplete: boolean; // reached day 66
  recoveredFromMiss: boolean; // missed a past day yet currently holds a live streak
}

// ── Craft Points ────────────────────────────────────────────────────────────
// Weights reflect EFFORT, not outcome (a resolved prediction scores the same whether
// it was right or wrong — we reward the calibration rep, not luck). Tunable; see spec.
export const CP = {
  perFilledSection: 2, // each 5-min daytime capture section (D1–D4)
  perNightSession: 6, // the 30–45-min deep-work session
  perPredictionLogged: 3,
  perPredictionResolved: 4,
  perWeeklyReview: 15,
  perIdeaDeveloped: 5,
  perIdeaTop3: 10,
} as const;

/** Total Craft Points — a deterministic reflection of the work the user has done. */
export function craftPoints(s: GameStats): number {
  return (
    s.filledSectionCount * CP.perFilledSection +
    s.nightCount * CP.perNightSession +
    s.predictionsLogged * CP.perPredictionLogged +
    s.predictionsResolved * CP.perPredictionResolved +
    s.weeklyReviewCount * CP.perWeeklyReview +
    s.ideasDeveloped * CP.perIdeaDeveloped +
    s.ideasTop3 * CP.perIdeaTop3
  );
}

// ── Ranks ─────────────────────────────────────────────────────────────────--
// Competence feedback (E1/E4), themed to the Operator's Journal. Thresholds tunable.
export interface Rank {
  name: string;
  min: number; // CP at which this rank starts
  next: number | null; // CP for the next rank, or null at the top
}

const RANK_TIERS: { name: string; min: number }[] = [
  { name: "Observer", min: 0 },
  { name: "Noticer", min: 100 },
  { name: "Analyst", min: 300 },
  { name: "Forecaster", min: 700 },
  { name: "Operator", min: 1400 },
  { name: "Tradecraft Master", min: 2500 },
];

/** The rank for a given Craft-Points total, with the next threshold for a progress bar. */
export function rankForPoints(points: number): Rank {
  let current = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (points >= t.min) current = t;
    else break;
  }
  const idx = RANK_TIERS.indexOf(current);
  const next = idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1].min : null;
  return { name: current.name, min: current.min, next };
}

/** 0–1 progress through the current rank toward the next (1 at the top rank). */
export function rankProgress(points: number): number {
  const r = rankForPoints(points);
  if (r.next == null) return 1;
  return Math.min(1, Math.max(0, (points - r.min) / (r.next - r.min)));
}

// ── Streak freezes (earned, derived, never purchasable) ───────────────────────
export const FREEZE_CAP = 2;

/** Freezes earned so far = one per completed weekly review, capped. Derived, never stored. */
export function freezesEarned(weeklyReviewCount: number): number {
  return Math.min(FREEZE_CAP, Math.max(0, weeklyReviewCount));
}

// ── Achievements / badges ─────────────────────────────────────────────────--
// Milestones tied to the REAL methodology (not vanity) so progress means depth, not a
// number to game (designs around F2). Each badge is a pure predicate over GameStats.
// `key` is the stable identifier persisted in the achievements table; never rename one.
export interface BadgeDef {
  key: string;
  name: string;
  desc: string;
  icon: string; // an Icon name (components/ui/Icon.tsx)
  phase: number; // phase it belongs to, for grouping/ordering in the shelf
  test: (s: GameStats) => boolean;
}

export const ACHIEVEMENTS: BadgeDef[] = [
  { key: "first_light", name: "First Light", desc: "Logged your first daytime capture.", icon: "feather", phase: 1, test: (s) => s.dayEntryCount >= 1 },
  { key: "night_owl", name: "Night Owl", desc: "Completed your first night session.", icon: "moon", phase: 1, test: (s) => s.nightCount >= 1 },
  { key: "seven_days", name: "Seven Days In", desc: "Reached a 7-day streak.", icon: "flag", phase: 1, test: (s) => s.streak >= 7 },
  { key: "comeback", name: "Comeback", desc: "Missed a day and came back without breaking the chain.", icon: "shield", phase: 1, test: (s) => s.recoveredFromMiss },
  { key: "phase_2", name: "Precision", desc: "Reached Phase 2 — recall & forecasting.", icon: "target", phase: 2, test: (s) => s.phase >= 2 },
  { key: "reviewer", name: "Reviewer", desc: "Completed your first weekly review.", icon: "calendar", phase: 2, test: (s) => s.weeklyReviewCount >= 1 },
  { key: "phase_3", name: "Rigor", desc: "Reached Phase 3 — structured idea work.", icon: "target", phase: 3, test: (s) => s.phase >= 3 },
  { key: "idea_machine", name: "Idea Machine", desc: "Developed an idea past the seed stage.", icon: "lightbulb", phase: 3, test: (s) => s.ideasDeveloped >= 1 || s.ideasTop3 >= 1 },
  { key: "calibrated", name: "Calibrated", desc: "Resolved 10 predictions.", icon: "target", phase: 3, test: (s) => s.predictionsResolved >= 10 },
  { key: "phase_4", name: "Transfer", desc: "Reached Phase 4 — taking the skills in vivo.", icon: "target", phase: 4, test: (s) => s.phase >= 4 },
  { key: "forecasters_edge", name: "Forecaster's Edge", desc: "Mean Brier under 0.15 across 10+ resolved predictions.", icon: "award", phase: 4, test: (s) => s.predictionsResolved >= 10 && s.meanBrier != null && s.meanBrier < 0.15 },
  { key: "month_of_sundays", name: "Month of Sundays", desc: "Completed four weekly reviews.", icon: "calendar", phase: 4, test: (s) => s.weeklyReviewCount >= 4 },
  { key: "phase_5", name: "Automaticity Check", desc: "Reached Phase 5 — the taper.", icon: "target", phase: 5, test: (s) => s.phase >= 5 },
  { key: "day_66", name: "Day 66", desc: "Completed the full 66-day program.", icon: "check", phase: 5, test: (s) => s.programComplete },
];

/** The keys of every badge the user currently qualifies for. */
export function evaluateAchievements(s: GameStats): string[] {
  return ACHIEVEMENTS.filter((b) => b.test(s)).map((b) => b.key);
}

/** Look up a badge definition by key (for celebration toasts). */
export function badgeByKey(key: string): BadgeDef | undefined {
  return ACHIEVEMENTS.find((b) => b.key === key);
}

// ── Cooperative buddy streak (Tier 2) ─────────────────────────────────────--
/**
 * The "team streak" for a buddy pair: the run of consecutive calendar days, ending
 * today (or yesterday if today isn't done yet — today is never penalised), on which
 * BOTH people showed up. Cooperative and low-stakes by design — it celebrates shared
 * days, it never frames a gap as letting your buddy down (designs around guilt, F3).
 *
 * @param mine   set of YYYY-MM-DD dates the user completed
 * @param theirs set of YYYY-MM-DD dates the buddy completed
 */
export function sharedStreak(
  mine: Set<string>,
  theirs: Set<string>,
  todayISO: string,
): number {
  const both = (d: string) => mine.has(d) && theirs.has(d);
  let cursor = todayISO;
  if (!both(cursor)) cursor = addDays(cursor, -1); // today still in progress — start at yesterday
  let streak = 0;
  while (both(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
