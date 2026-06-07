import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface PhaseGateProps {
  unlockDay?: number;
  phase?: number;
  label?: string;
  children: ReactNode;
}

/** Dims and locks gated content with an "Unlocks Day X (Phase Y)" badge. */
export function PhaseGate({ unlockDay, phase, label, children }: PhaseGateProps) {
  return (
    <div
      className="relative"
      style={{ opacity: "var(--gate-disabled-opacity)", pointerEvents: "none" }}
      aria-disabled="true"
    >
      {children}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="f-mono flex items-center gap-2"
          style={{
            fontSize: 12,
            color: "var(--text-2)",
            background: "var(--surface)",
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid var(--border)",
          }}
        >
          <Icon name="lock" size={14} />
          <span>{label || `Unlocks Day ${unlockDay} (Phase ${phase})`}</span>
        </div>
      </div>
    </div>
  );
}
