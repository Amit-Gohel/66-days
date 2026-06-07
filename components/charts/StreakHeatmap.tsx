"use client";

import { useState } from "react";
import type { HeatCell, HeatState } from "@/lib/types";

const COLOR: Record<HeatState, string> = {
  completed: "var(--heat-completed)",
  partial: "var(--heat-partial)",
  "missed-once": "var(--heat-missed-once)",
  "missed-twice": "var(--heat-missed-twice)",
  future: "var(--heat-future)",
};

const LEGEND: [HeatState, string][] = [
  ["completed", "Completed"],
  ["partial", "Partial / min day"],
  ["missed-once", "Missed once"],
  ["missed-twice", "Reset (×2)"],
  ["future", "Upcoming"],
];

export function StreakHeatmap({
  cells,
  cell = 26,
}: {
  cells: HeatCell[];
  cell?: number;
}) {
  const [tip, setTip] = useState<HeatCell | null>(null);
  return (
    <figure className="m-0">
      <div className="relative">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(10, ${cell}px)`,
            gap: 3,
            justifyContent: "start",
          }}
          role="img"
          aria-label="66-day streak heatmap."
        >
          {cells.map((c) => (
            <div
              key={c.id}
              className="tap-target relative"
              style={{
                width: cell,
                height: cell,
                minWidth: 0,
                minHeight: 0,
                borderRadius: 3,
                background: COLOR[c.state],
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onMouseEnter={() => setTip(c)}
              onMouseLeave={() => setTip(null)}
              onClick={() => setTip((t) => (t && t.id === c.id ? null : c))}
              title={`Day ${c.day} · Phase ${c.phase} · ${c.state}`}
            >
              {c.state === "missed-twice" && (
                <svg viewBox="0 0 20 20" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                  <path d="M0 12 L8 4 M4 16 L16 4 M12 16 L20 8" stroke="var(--warn)" strokeWidth="1.4" opacity="0.7" />
                </svg>
              )}
            </div>
          ))}
        </div>
        {tip && (
          <div
            className="f-mono anim-fade absolute"
            style={{
              top: -30,
              left: 0,
              background: "var(--text)",
              color: "var(--bg)",
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            Day {tip.day} · Phase {tip.phase} · {tip.state}
          </div>
        )}
      </div>
      <div
        className="f-mono mt-4 flex flex-wrap gap-x-4 gap-y-1.5"
        style={{ fontSize: 11, color: "var(--text-2)" }}
      >
        {LEGEND.map(([s, l]) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: COLOR[s],
                border: "1px solid var(--border)",
                display: "inline-block",
              }}
            />
            {l}
          </span>
        ))}
      </div>
    </figure>
  );
}
