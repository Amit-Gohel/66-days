"use client";

import { useChartTheme } from "./useChartTheme";
import type { WeekPoint } from "@/lib/domain/brier";

export function BrierTrend({ data }: { data: WeekPoint[] }) {
  const W = 320, H = 200, pad = 36;
  const T = useChartTheme();
  const bench = 0.166;
  const x = (i: number) => pad + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - pad - 12));
  const y = (v: number) => pad + (v / 0.5) * (H - pad - 24);
  const pts = data.map((d, i) => `${x(i)},${y(d.val)}`).join(" ");

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Brier score trend toward the 0.166 benchmark." style={{ maxWidth: 360 }}>
        {[0, 0.166, 0.25, 0.5].map((g) => (
          <line key={g} x1={pad} y1={y(g)} x2={W - 12} y2={y(g)} stroke={T.border} strokeWidth="0.5" opacity="0.5" />
        ))}
        {data.length > 1 && <polyline points={pts} fill="none" stroke={T.accent} strokeWidth="2" />}
        {data.map((d, i) => (
          <circle key={d.id} cx={x(i)} cy={y(d.val)} r="3" fill={T.accent} />
        ))}
        <line x1={pad} y1={y(bench)} x2={W - 12} y2={y(bench)} stroke={T.text3} strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - 12} y={y(bench) - 4} fontSize="9" fill={T.text3} fontFamily="monospace" textAnchor="end">Superforecaster avg 0.166</text>
        {data.map((d, i) => (
          <text key={`l${d.id}`} x={x(i)} y={H - 6} fontSize="9" fill={T.text3} fontFamily="monospace" textAnchor="middle">w{d.week}</text>
        ))}
      </svg>
    </figure>
  );
}
