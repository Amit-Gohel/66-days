import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { computeStreak } from "@/lib/domain/streak";
import {
  ACHIEVEMENTS,
  craftPoints,
  evaluateAchievements,
  freezesEarned,
  rankForPoints,
  rankProgress,
  type GameStats,
  type Rank,
} from "@/lib/domain/gamification";
import type { DayEntry } from "@/lib/types";

/** True if any field of the given D-section on this entry is filled. */
function sectionFilledCount(e: DayEntry): number {
  let n = 0;
  if (e.d1_place || e.d1_baseline || e.d1_anomaly || e.d1_so_what) n++;
  if (e.d2_noticing_1 || e.d2_noticing_2 || e.d2_noticing_3) n++;
  if (e.d3_problem || e.d3_solution) n++;
  if (e.d4_person || e.d4_baseline || e.d4_shift_topic || e.d4_open_question) n++;
  return n;
}

/**
 * The shared stats build — one round of reads, then pure derivation. Used by both
 * getGameState() (read view-model) and syncAchievements() (the persist action), so the
 * point/badge/freeze rules see exactly the same numbers.
 */
export async function loadGameStats(): Promise<{
  stats: GameStats;
  freezesAvailable: number;
  todayISO: string;
  leaderboardOptIn: boolean;
  displayName: string | null;
}> {
  const supabase = await createClient();
  const profile = await getProfile();
  const tz = profile?.timezone ?? "UTC";
  const startDate = profile?.start_date ?? null;
  const todayISO = todayInTz(tz);
  const day = dayNumber(startDate, todayISO);
  const phase = phaseForDay(day);

  const [entriesRes, nightsRes, predsRes, ideasRes, weeklyRes] = await Promise.all([
    supabase.from("day_entries").select("*").order("entry_date", { ascending: true }),
    supabase.from("night_sessions").select("entry_date").not("completed_at", "is", null),
    supabase.from("predictions").select("status, brier_score"),
    supabase.from("ideas").select("lane, is_top3"),
    supabase.from("weekly_reviews").select("id"),
  ]);

  const entries = (entriesRes.data as DayEntry[] | null) ?? [];
  const nights = (nightsRes.data as { entry_date: string }[] | null) ?? [];
  const preds = (predsRes.data as { status: string; brier_score: number | null }[] | null) ?? [];
  const ideas = (ideasRes.data as { lane: string; is_top3: boolean }[] | null) ?? [];
  const weeklyReviewCount = (weeklyRes.data as { id: string }[] | null)?.length ?? 0;

  // Completion set (a day counts if captured OR a night session ran) — mirrors getDashboard.
  const completed = new Set<number>();
  let filledSectionCount = 0;
  for (const e of entries) {
    filledSectionCount += sectionFilledCount(e);
    const dn = startDate ? dayNumber(startDate, e.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }
  for (const n of nights) {
    const dn = startDate ? dayNumber(startDate, n.entry_date) : 0;
    if (dn >= 1) completed.add(dn);
  }

  const freezes = freezesEarned(weeklyReviewCount);
  const { streak, freezesLeft } = computeStreak(day, completed, freezes);

  // recovered = currently on a live streak yet missed at least one past day.
  let missedPastDay = false;
  for (let d = 1; d < day; d++) {
    if (!completed.has(d)) {
      missedPastDay = true;
      break;
    }
  }

  const resolved = preds.filter((p) => p.status === "resolved");
  const brierVals = resolved
    .map((p) => p.brier_score)
    .filter((v): v is number => v != null);
  const meanBrier = brierVals.length
    ? brierVals.reduce((a, b) => a + b, 0) / brierVals.length
    : null;

  const stats: GameStats = {
    day,
    phase,
    streak,
    filledSectionCount,
    dayEntryCount: entries.length,
    nightCount: nights.length,
    predictionsLogged: preds.length,
    predictionsResolved: resolved.length,
    meanBrier,
    ideasDeveloped: ideas.filter((i) => i.lane === "developed").length,
    ideasTop3: ideas.filter((i) => i.is_top3).length,
    weeklyReviewCount,
    programComplete: day >= 66,
    recoveredFromMiss: streak >= 1 && missedPastDay,
  };

  return {
    stats,
    freezesAvailable: freezesLeft,
    todayISO,
    leaderboardOptIn: profile?.show_on_leaderboard ?? false,
    displayName: profile?.display_name ?? null,
  };
}

export interface BadgeView {
  key: string;
  name: string;
  desc: string;
  icon: string;
  phase: number;
  unlocked: boolean;
  unlockedOn: string | null;
}

export interface GameState {
  craftPoints: number;
  rank: Rank;
  rankProgress: number; // 0–1 toward the next rank
  streak: number;
  freezesAvailable: number;
  badges: BadgeView[];
  unlockedCount: number;
  totalBadges: number;
  leaderboardOptIn: boolean;
}

/** The full gamification view-model for the home page (read-only). */
export async function getGameState(): Promise<GameState> {
  const supabase = await createClient();
  const [{ stats, freezesAvailable, leaderboardOptIn }, achRes] = await Promise.all([
    loadGameStats(),
    supabase.from("achievements").select("key, unlocked_on"),
  ]);

  const persisted = new Map(
    (achRes.data as { key: string; unlocked_on: string }[] | null ?? []).map((a) => [
      a.key,
      a.unlocked_on,
    ]),
  );
  const earned = new Set(evaluateAchievements(stats));
  const points = craftPoints(stats);

  const badges: BadgeView[] = ACHIEVEMENTS.map((b) => ({
    key: b.key,
    name: b.name,
    desc: b.desc,
    icon: b.icon,
    phase: b.phase,
    unlocked: earned.has(b.key),
    unlockedOn: persisted.get(b.key) ?? null,
  }));

  return {
    craftPoints: points,
    rank: rankForPoints(points),
    rankProgress: rankProgress(points),
    streak: stats.streak,
    freezesAvailable,
    badges,
    unlockedCount: badges.filter((b) => b.unlocked).length,
    totalBadges: badges.length,
    leaderboardOptIn,
  };
}
