// Phase ranges and feature-unlock schedule (from the canonical spec's phase table).

/** Phase 1: d1–14, 2: 15–28, 3: 29–44, 4: 45–60, 5: 61–66. */
export function phaseForDay(day: number): number {
  if (day <= 14) return 1;
  if (day <= 28) return 2;
  if (day <= 44) return 3;
  if (day <= 60) return 4;
  return 5;
}

export type Feature =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "N1"
  | "N2"
  | "N3"
  | "N4"
  | "N5"
  | "weekly"
  | "drill"
  | "outreach"
  | "calibration";

/** Day on which each feature unlocks. */
export const FEATURE_UNLOCK_DAY: Record<Feature, number> = {
  D1: 1,
  D2: 1,
  N2: 1,
  D4: 15,
  N1: 15,
  N3: 15,
  weekly: 15,
  D3: 29,
  N4: 29,
  N5: 29,
  drill: 29,
  outreach: 45,
  calibration: 45,
};

export function isUnlocked(feature: Feature, day: number): boolean {
  return day >= FEATURE_UNLOCK_DAY[feature];
}

export function unlockPhase(feature: Feature): number {
  return phaseForDay(FEATURE_UNLOCK_DAY[feature]);
}
