"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { resolvePrediction } from "@/lib/actions/night";
import type { Prediction } from "@/lib/types";

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="hairline flex items-center gap-3" style={{ borderRadius: 4, padding: "10px 12px", background: "var(--surface)" }}>
      {children}
    </div>
  );
}

export function PredictionsList({
  due,
  open,
  resolved,
  meanBrier,
}: {
  due: Prediction[];
  open: Prediction[];
  resolved: Prediction[];
  meanBrier: number | null;
}) {
  const [dueState, setDueState] = useState(due.map((p) => ({ ...p, hit: null as boolean | null })));

  const resolve = async (id: string, hit: boolean) => {
    setDueState((d) => d.map((p) => (p.id === id ? { ...p, hit } : p)));
    try {
      await resolvePrediction(id, hit);
    } catch {
      setDueState((d) => d.map((p) => (p.id === id ? { ...p, hit: null } : p)));
    }
  };

  return (
    <div className="space-y-8">
      <div className="hairline" style={{ borderRadius: 6, padding: "14px 16px", background: "var(--surface-2)" }}>
        <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
          Rolling Brier:{" "}
          <span style={{ color: "var(--accent)" }}>{meanBrier != null ? meanBrier.toFixed(3) : "—"}</span>{" "}
          over {resolved.length} resolved · benchmark 0.166
        </span>
      </div>

      <section>
        <h2 className="f-mono mb-3" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: 0.3 }}>DUE TO RESOLVE ({dueState.length})</h2>
        {dueState.length === 0 ? (
          <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Nothing due. Resolve predictions on their date or in the night session.</p>
        ) : (
          <div className="space-y-2">
            {dueState.map((p) => (
              <Row key={p.id}>
                <span className="ink flex-1" style={{ fontSize: 17, lineHeight: 1.3 }}>{p.claim}</span>
                <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{p.probability}%</span>
                {p.hit === null ? (
                  <div className="flex gap-1.5">
                    <button aria-label="Resolve hit" onClick={() => resolve(p.id, true)} className="tap-target flex items-center justify-center" style={{ width: 34, height: 34, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)" }}><Icon name="check" size={16} /></button>
                    <button aria-label="Resolve miss" onClick={() => resolve(p.id, false)} className="tap-target flex items-center justify-center" style={{ width: 34, height: 34, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)" }}><Icon name="x" size={16} /></button>
                  </div>
                ) : (
                  <span className="anim-pulse f-mono inline-flex items-center gap-1" style={{ fontSize: 12, color: p.hit ? "var(--chip-confirmed)" : "var(--warn)" }}>
                    <Icon name={p.hit ? "check" : "x"} size={15} /> {p.hit ? "hit" : "miss"}
                  </span>
                )}
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="f-mono mb-3" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: 0.3 }}>OPEN ({open.length})</h2>
        {open.length === 0 ? (
          <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>No open forecasts. File one in tonight&apos;s session.</p>
        ) : (
          <div className="space-y-2">
            {open.map((p) => (
              <Row key={p.id}>
                <span className="ink flex-1" style={{ fontSize: 17, lineHeight: 1.3 }}>{p.claim}</span>
                <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{p.probability}%</span>
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", width: 92, textAlign: "right" }}>{p.resolves_on ?? "no date"}</span>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="f-mono mb-3" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: 0.3 }}>RESOLVED ({resolved.length})</h2>
        {resolved.length === 0 ? (
          <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Resolved forecasts and their Brier scores will show here.</p>
        ) : (
          <div className="space-y-2">
            {resolved.map((p) => (
              <Row key={p.id}>
                <span className="ink flex-1" style={{ fontSize: 17, lineHeight: 1.3 }}>{p.claim}</span>
                <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{p.probability}%</span>
                <span className="f-mono inline-flex items-center gap-1" style={{ fontSize: 12, color: p.outcome ? "var(--chip-confirmed)" : "var(--warn)" }}>
                  <Icon name={p.outcome ? "check" : "x"} size={13} />
                </span>
                <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)", width: 54, textAlign: "right" }}>{p.brier_score != null ? p.brier_score.toFixed(3) : "—"}</span>
              </Row>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
