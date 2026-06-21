"use client";

// A compact pipeline funnel. Each stage's bar width is relative to the FIRST
// stage, and the drop-off vs the previous stage is shown to the right.
//
// It is guarded so the bars never misbehave: a stage that isn't strictly
// smaller than the one above it renders no (and never a negative) drop label —
// which is what produced the old "−−429%" when the stages weren't monotonic.
export function IdeaFunnel({ stages = [] }: { stages?: { label: string; val: number }[] }) {
  const top = Math.max(1, stages[0]?.val ?? 1);
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s, i) => {
        const val = Math.max(0, s.val);
        const w = 8 + (Math.min(val, top) / top) * 92; // floor so an empty stage is still visible
        const prev = i > 0 ? Math.max(0, stages[i - 1].val) : null;
        const drop = prev != null && prev > val ? Math.round((1 - val / prev) * 100) : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)", width: 86 }}>{s.label}</span>
            <div className="flex flex-1 items-center gap-2.5">
              <div
                style={{
                  width: `${w}%`,
                  height: 24,
                  background: "var(--accent)",
                  opacity: 0.3 + 0.6 * (i / Math.max(1, stages.length - 1)),
                  borderRadius: 3,
                  transition: "width 220ms ease",
                }}
              />
              <span className="f-mono" style={{ fontSize: 13, color: "var(--text)", minWidth: 24 }}>{val}</span>
              {drop != null && drop > 0 && (
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>−{drop}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
