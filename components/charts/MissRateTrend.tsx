"use client";

import { useChartTheme } from "./useChartTheme";
import type { MissPoint } from "@/lib/domain/brier";

export function MissRateTrend({ data }: { data: MissPoint[] }) {
  const W = 320, H = 200, pad = 36;
  const T = useChartTheme();
  const target = 0.15;
  const x = (i: number) => pad + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - pad - 12));
  const y = (v: number) => pad + (v / 0.5) * (H - pad - 24);
  const pts = data.map((d, i) => `${x(i)},${y(d.rate)}`).join(" ");

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Anomaly miss-rate trend toward a 15 percent goal." style={{ maxWidth: 360 }}>
        {[0, 0.15, 0.25, 0.5].map((g) => (
          <line key={g} x1={pad} y1={y(g)} x2={W - 12} y2={y(g)} stroke={T.border} strokeWidth="0.5" opacity="0.5" />
        ))}
        {data.length > 1 && <polyline points={pts} fill="none" stroke={T.accent} strokeWidth="2" />}
        {data.map((d, i) => (
          <circle key={d.id} cx={x(i)} cy={y(d.rate)} r="3" fill={T.accent} />
        ))}
        <line x1={pad} y1={y(target)} x2={W - 12} y2={y(target)} stroke={T.text3} strokeWidth="1" strokeDasharray="4 3" />
        <text x={W - 12} y={y(target) - 4} fontSize="9" fill={T.text3} fontFamily="monospace" textAnchor="end">Goal &lt;15%</text>
        {data.map((d, i) => (
          <text key={`l${d.id}`} x={x(i)} y={H - 6} fontSize="9" fill={T.text3} fontFamily="monospace" textAnchor="middle">w{d.week}</text>
        ))}
      </svg>
    </figure>
  );
}
