"use client";

export interface FunnelCounts {
  seeds: number;
  culls: number;
  developed: number;
  top: number;
}

export function IdeaFunnel({ counts }: { counts: FunnelCounts }) {
  const stages = [
    { label: "Seeds", val: counts.seeds },
    { label: "Culls", val: counts.culls },
    { label: "Developed", val: counts.developed },
    { label: "Top 3", val: counts.top },
  ];
  const max = Math.max(1, counts.seeds);
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s, i) => {
        const w = 18 + (s.val / max) * 82;
        const prev = i > 0 ? stages[i - 1].val : null;
        const attr = prev && prev > 0 ? Math.round((1 - s.val / prev) * 100) : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)", width: 78 }}>{s.label}</span>
            <div className="flex flex-1 items-center gap-2">
              <div style={{ width: `${w}%`, height: 26, background: "var(--accent)", opacity: 0.35 + 0.55 * (i / 3), borderRadius: 3, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                <span className="f-mono" style={{ fontSize: 12, color: i > 1 ? "#fff" : "var(--text)", fontWeight: 500 }}>{s.val}</span>
              </div>
              {attr !== null && <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>−{attr}%</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
