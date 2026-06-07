"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { PHASES } from "@/lib/static/program";

const CORE = ["D1 Baseline + Anomaly", "N2 After-Action Review", "Resolve due predictions"];
const OPTIONAL = ["D2 Three Noticings", "D3 Idea seed", "D4 People note", "N1 Recall", "N4 Consider-the-opposite", "N5 SCAMPER", "Drill of the day", "Weekly review"];

function MaintenanceBuilder() {
  const [keep, setKeep] = useState<string[]>(["D2 Three Noticings", "N1 Recall"]);
  return (
    <div>
      <h3 className="f-hand" style={{ fontSize: 19, color: "var(--text)", marginBottom: 8 }}>Design your lean maintenance version</h3>
      <p className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>NON-NEGOTIABLE CORE</p>
      <div className="mb-4 space-y-1.5">
        {CORE.map((c) => (
          <div key={c} className="f-serif flex items-center gap-2.5" style={{ fontSize: 14, color: "var(--text)" }}>
            <Icon name="check" size={15} style={{ color: "var(--accent)" }} />
            {c}
          </div>
        ))}
      </div>
      <p className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>OPTIONAL ADD-ONS</p>
      <div className="grid grid-cols-2 gap-1.5">
        {OPTIONAL.map((o) => (
          <label key={o} className="f-serif flex items-center gap-2" style={{ fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
            <input type="checkbox" checked={keep.includes(o)} onChange={(e) => setKeep((k) => (e.target.checked ? [...k, o] : k.filter((x) => x !== o)))} style={{ accentColor: "var(--accent)" }} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

export function RoadmapView({ currentPhase }: { currentPhase: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const ph = PHASES.find((p) => p.n === open);

  return (
    <div className="anim-fade" style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Phase roadmap</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
        Five phases across 66 days. Capability is added only once the anchor holds.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        {PHASES.map((p) => {
          const isCurrent = p.n === currentPhase;
          const isPast = p.n < currentPhase;
          return (
            <button
              key={p.n}
              onClick={() => setOpen(p.n)}
              className="text-left"
              style={{
                borderRadius: 8,
                padding: 16,
                background: "var(--surface)",
                border: `1px solid ${isCurrent ? "var(--accent)" : "var(--border)"}`,
                opacity: isPast ? 0.7 : p.n > currentPhase ? "var(--gate-disabled-opacity)" : 1,
                boxShadow: isCurrent ? "var(--shadow-card)" : "none",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="f-mono" style={{ fontSize: 11, color: isCurrent ? "var(--accent)" : "var(--text-3)" }}>PHASE {p.n}</span>
                {isCurrent && <span className="f-mono" style={{ fontSize: 10, color: "var(--accent)" }}>● now</span>}
                {p.n > currentPhase && <Icon name="lock" size={13} style={{ color: "var(--text-3)" }} />}
              </div>
              <h3 className="f-hand" style={{ fontSize: 18, color: "var(--text)", lineHeight: 1.1, marginBottom: 4 }}>{p.name}</h3>
              <p className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{p.range}</p>
              <p className="f-serif" style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>{p.why}</p>
            </button>
          );
        })}
      </div>

      {ph && (
        <Modal open onClose={() => setOpen(null)} labelledBy="ph-h" maxWidth={520}>
          <div style={{ padding: 24 }}>
            <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)" }}>PHASE {ph.n} · {ph.range}</span>
            <h2 id="ph-h" className="f-hand" style={{ fontSize: 24, color: "var(--text)", margin: "4px 0 12px" }}>{ph.name}</h2>
            <ul className="m-0 mb-4 list-none space-y-1.5 p-0">
              {ph.features.map((f, i) => (
                <li key={i} className="f-serif flex items-center gap-2.5" style={{ fontSize: 14, color: "var(--text-2)" }}>
                  <Icon name="chevronRight" size={14} style={{ color: "var(--accent)" }} />
                  {f}
                </li>
              ))}
            </ul>
            {ph.n === 5 && (
              <div className="hairline" style={{ borderRadius: 6, padding: 16, background: "var(--surface-2)", marginTop: 8 }}>
                <MaintenanceBuilder />
              </div>
            )}
            <div className="mt-5 flex justify-end">
              <Btn variant="ghost" onClick={() => setOpen(null)}>Close</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
