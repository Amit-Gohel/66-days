import { describe, it, expect } from "vitest";
import {
  CP,
  craftPoints,
  rankForPoints,
  rankProgress,
  freezesEarned,
  FREEZE_CAP,
  evaluateAchievements,
  badgeByKey,
  sharedStreak,
  ACHIEVEMENTS,
  type GameStats,
} from "./gamification";

/** A zeroed GameStats with overrides — keeps the cases readable. */
function stats(over: Partial<GameStats> = {}): GameStats {
  return {
    day: 1,
    phase: 1,
    streak: 0,
    filledSectionCount: 0,
    dayEntryCount: 0,
    nightCount: 0,
    predictionsLogged: 0,
    predictionsResolved: 0,
    meanBrier: null,
    ideasDeveloped: 0,
    ideasTop3: 0,
    weeklyReviewCount: 0,
    programComplete: false,
    recoveredFromMiss: false,
    ...over,
  };
}

describe("craftPoints", () => {
  it("is zero for a brand-new user", () => {
    expect(craftPoints(stats())).toBe(0);
  });

  it("sums the weighted work deterministically", () => {
    const s = stats({
      filledSectionCount: 10,
      nightCount: 3,
      predictionsLogged: 5,
      predictionsResolved: 2,
      weeklyReviewCount: 1,
      ideasDeveloped: 2,
      ideasTop3: 1,
    });
    const expected =
      10 * CP.perFilledSection +
      3 * CP.perNightSession +
      5 * CP.perPredictionLogged +
      2 * CP.perPredictionResolved +
      1 * CP.perWeeklyReview +
      2 * CP.perIdeaDeveloped +
      1 * CP.perIdeaTop3;
    expect(craftPoints(s)).toBe(expected);
    // same input → same output (a competence mirror, not a random reward)
    expect(craftPoints(s)).toBe(craftPoints(s));
  });

  it("rewards a resolved prediction the same regardless of outcome (effort, not luck)", () => {
    // craftPoints never reads outcome — only the counts — so two users who each
    // resolved the same number of predictions score identically.
    expect(craftPoints(stats({ predictionsResolved: 4 }))).toBe(
      craftPoints(stats({ predictionsResolved: 4 })),
    );
  });
});

describe("rankForPoints", () => {
  it("places points in the right tier at boundaries", () => {
    expect(rankForPoints(0).name).toBe("Observer");
    expect(rankForPoints(99).name).toBe("Observer");
    expect(rankForPoints(100).name).toBe("Noticer");
    expect(rankForPoints(300).name).toBe("Analyst");
  });

  it("returns null `next` only at the top rank", () => {
    const top = rankForPoints(99999);
    expect(top.name).toBe("Tradecraft Master");
    expect(top.next).toBeNull();
    expect(rankForPoints(0).next).toBe(100);
  });
});

describe("rankProgress", () => {
  it("is 0 at a rank floor and ~0.5 halfway", () => {
    expect(rankProgress(0)).toBe(0);
    expect(rankProgress(50)).toBeCloseTo(0.5, 5);
  });

  it("is 1 at the top rank", () => {
    expect(rankProgress(99999)).toBe(1);
  });
});

describe("freezesEarned (derived, capped, never negative)", () => {
  it("grants one per weekly review up to the cap", () => {
    expect(freezesEarned(0)).toBe(0);
    expect(freezesEarned(1)).toBe(1);
    expect(freezesEarned(2)).toBe(FREEZE_CAP);
    expect(freezesEarned(9)).toBe(FREEZE_CAP);
  });

  it("never goes negative", () => {
    expect(freezesEarned(-3)).toBe(0);
  });
});

describe("evaluateAchievements", () => {
  it("awards nothing to a brand-new user", () => {
    expect(evaluateAchievements(stats())).toEqual([]);
  });

  it("awards First Light after the first capture", () => {
    expect(evaluateAchievements(stats({ dayEntryCount: 1 }))).toContain("first_light");
  });

  it("does not award Forecaster's Edge without both volume and a sharp Brier", () => {
    expect(evaluateAchievements(stats({ predictionsResolved: 10, meanBrier: 0.4 }))).not.toContain(
      "forecasters_edge",
    );
    expect(evaluateAchievements(stats({ predictionsResolved: 10, meanBrier: 0.1 }))).toContain(
      "forecasters_edge",
    );
  });

  it("awards every badge to a completed-program veteran", () => {
    const veteran = stats({
      day: 66,
      phase: 5,
      streak: 20,
      filledSectionCount: 200,
      dayEntryCount: 60,
      nightCount: 55,
      predictionsLogged: 40,
      predictionsResolved: 15,
      meanBrier: 0.12,
      ideasDeveloped: 4,
      ideasTop3: 3,
      weeklyReviewCount: 8,
      programComplete: true,
      recoveredFromMiss: true,
    });
    expect(evaluateAchievements(veteran).sort()).toEqual(ACHIEVEMENTS.map((b) => b.key).sort());
  });
});

describe("badge catalogue integrity", () => {
  it("has unique, stable keys", () => {
    const keys = ACHIEVEMENTS.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("badgeByKey round-trips", () => {
    expect(badgeByKey("seven_days")?.name).toBe("Seven Days In");
    expect(badgeByKey("nope")).toBeUndefined();
  });
});

describe("sharedStreak (cooperative buddy streak)", () => {
  const days = (...d: string[]) => new Set(d);

  it("counts consecutive days both completed, ending today", () => {
    const mine = days("2026-06-06", "2026-06-07", "2026-06-08");
    const theirs = days("2026-06-06", "2026-06-07", "2026-06-08");
    expect(sharedStreak(mine, theirs, "2026-06-08")).toBe(3);
  });

  it("does not penalise today still being in progress (counts back from yesterday)", () => {
    const mine = days("2026-06-06", "2026-06-07");
    const theirs = days("2026-06-06", "2026-06-07");
    // neither has 06-08 yet → streak counts the shared run ending yesterday
    expect(sharedStreak(mine, theirs, "2026-06-08")).toBe(2);
  });

  it("breaks on the first day only one of them showed up", () => {
    const mine = days("2026-06-06", "2026-06-07", "2026-06-08");
    const theirs = days("2026-06-08"); // buddy missed 06-06 and 06-07
    expect(sharedStreak(mine, theirs, "2026-06-08")).toBe(1);
  });

  it("is 0 when there is no shared recent day", () => {
    expect(sharedStreak(days("2026-06-01"), days("2026-06-08"), "2026-06-08")).toBe(0);
  });
});
