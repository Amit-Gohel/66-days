import { describe, it, expect } from "vitest";
import { computeStreak, buildHeatmap } from "./streak";

const set = (...days: number[]) => new Set(days);

describe("computeStreak — back-compatible (no freezes)", () => {
  it("counts a clean run; today pending is neutral", () => {
    const r = computeStreak(6, set(1, 2, 3, 4, 5));
    expect(r.streak).toBe(5);
    expect(r.graceActive).toBe(false);
    expect(r.freezesUsed).toBe(0);
  });

  it("keeps the streak alive on a single trailing miss and flags grace", () => {
    // days 1–4 done, day 5 missed, day 6 = today (pending)
    const r = computeStreak(6, set(1, 2, 3, 4));
    expect(r.streak).toBe(4);
    expect(r.graceActive).toBe(true);
  });

  it("resets to 0 on two consecutive misses with no freeze", () => {
    // days 1–3 done, days 4 & 5 missed, day 6 pending
    const r = computeStreak(6, set(1, 2, 3));
    expect(r.streak).toBe(0);
    expect(r.graceActive).toBe(false);
  });
});

describe("computeStreak — earned freezes", () => {
  it("spends a freeze to survive a second consecutive miss", () => {
    const r = computeStreak(6, set(1, 2, 3), 1);
    expect(r.streak).toBe(3); // survived the gap
    expect(r.freezesUsed).toBe(1);
    expect(r.freezesLeft).toBe(0);
    expect(r.graceActive).toBe(true);
  });

  it("never wastes a freeze on an isolated single miss (grace covers it for free)", () => {
    // days 1–4 done, day 5 missed (single), day 6 pending — grace handles it
    const r = computeStreak(6, set(1, 2, 3, 4), 1);
    expect(r.streak).toBe(4);
    expect(r.freezesUsed).toBe(0);
    expect(r.freezesLeft).toBe(1);
  });

  it("resets once freezes run out", () => {
    // days 1–2 done, then days 3,4,5 all missed; one freeze covers the first reset,
    // the next consecutive miss with no freeze left resets.
    const r = computeStreak(7, set(1, 2), 1);
    expect(r.freezesUsed).toBe(1);
    expect(r.streak).toBe(0);
  });
});

describe("buildHeatmap", () => {
  it("returns a 66-cell grid", () => {
    expect(buildHeatmap(1, set(1)).length).toBe(66);
  });

  it("marks a freeze-protected day as `frozen` instead of `missed-twice`", () => {
    // days 1–3 done, days 4 & 5 missed, day 6 today; with 1 freeze the 2nd miss is frozen
    const cells = buildHeatmap(6, set(1, 2, 3), new Set(), 1);
    expect(cells[3].state).toBe("missed-once"); // day 4
    expect(cells[4].state).toBe("frozen"); // day 5, protected
    expect(cells[5].state).toBe("future"); // day 6, today pending
  });

  it("without a freeze the same second miss is a reset", () => {
    const cells = buildHeatmap(6, set(1, 2, 3), new Set(), 0);
    expect(cells[3].state).toBe("missed-once");
    expect(cells[4].state).toBe("missed-twice");
  });

  it("renders days beyond today as future", () => {
    const cells = buildHeatmap(3, set(1, 2));
    expect(cells[2].state).toBe("future"); // day 3 = today, pending
    expect(cells[10].state).toBe("future"); // day 11, upcoming
  });
});
