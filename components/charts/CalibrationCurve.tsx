"use client";

import { useState } from "react";
import { useChartTheme } from "./useChartTheme";
import type { CalibrationBin } from "@/lib/domain/brier";

export function CalibrationCurve({ bins }: { bins: CalibrationBin[] }) {
  const W = 320, H = 320, pad = 42;
  const T = useChartTheme();
  const [tip, setTip] = useState<CalibrationBin | null>(null);
  const x = (v: number) => pad + v * (W - pad - 12);
  const y = (v: number) => H - pad - v * (H - pad - 12);
  const maxN = Math.max(1, ...bins.map((b) => b.n));
  const r = (n: number) => 3 + Math.sqrt(n / maxN) * 9;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Calibration curve: predicted vs actual hit rate." style={{ maxWidth: 360 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={x(g)} y1={y(0)} x2={x(g)} y2={y(1)} stroke={T.border} strokeWidth="0.5" opacity="0.5" />
            <line x1={x(0)} y1={y(g)} x2={x(1)} y2={y(g)} stroke={T.border} strokeWidth="0.5" opacity="0.5" />
          </g>
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke={T.text3} strokeWidth="1" strokeDasharray="4 4" />
        {bins.map((b) => (
          <circle
            key={b.label}
            cx={x(b.predicted)}
            cy={y(b.actual)}
            r={r(b.n)}
            fill={T.accent}
            opacity="0.85"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setTip(b)}
            onMouseLeave={() => setTip(null)}
          />
        ))}
        <text x={x(0)} y={H - 14} fontSize="10" fill={T.text3} fontFamily="monospace">0%</text>
        <text x={x(1) - 22} y={H - 14} fontSize="10" fill={T.text3} fontFamily="monospace">100%</text>
        <text x={W / 2 - 34} y={H - 2} fontSize="10" fill={T.text2} fontFamily="monospace">Predicted %</text>
        <text x={6} y={pad - 6} fontSize="10" fill={T.text2} fontFamily="monospace">Actual %</text>
        {tip && (
          <g>
            <rect x={Math.min(x(tip.predicted) + 8, W - 120)} y={y(tip.actual) - 30} width="118" height="22" rx="3" fill={T.text} opacity="0.92" />
            <text x={Math.min(x(tip.predicted) + 14, W - 114)} y={y(tip.actual) - 15} fontSize="10" fill="var(--bg)" fontFamily="monospace">
              Bin {tip.label} · {Math.round(tip.actual * 100)}% · n={tip.n}
            </text>
          </g>
        )}
      </svg>
      <figcaption className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>
        Above the line = overconfident; below = underconfident.
      </figcaption>
    </figure>
  );
}
