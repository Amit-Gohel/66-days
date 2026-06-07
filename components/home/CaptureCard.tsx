"use client";

import { Icon } from "@/components/ui/Icon";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import type { Tier } from "@/lib/static/citations";

export interface CaptureCardProps {
  type: string;
  label: string;
  status: "done" | "empty" | "locked";
  onOpen?: () => void;
  citeKey?: string;
  tier?: Tier;
}

export function CaptureCard({ type, label, status, onOpen, citeKey, tier }: CaptureCardProps) {
  const isLocked = status === "locked";
  const interactive = !isLocked && !!onOpen;
  const activate = () => {
    if (interactive) onOpen?.();
  };
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={isLocked || undefined}
      onClick={activate}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          activate();
        }
      }}
      className="w-full text-left"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: 16,
        boxShadow: "var(--shadow-card)",
        opacity: isLocked ? "var(--gate-disabled-opacity)" : 1,
        cursor: isLocked ? "not-allowed" : interactive ? "pointer" : "default",
        minHeight: 118,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
          {type}
        </span>
        {status === "done" && <Icon name="check" size={16} style={{ color: "var(--accent)" }} />}
        {isLocked && <Icon name="lock" size={14} style={{ color: "var(--text-3)" }} />}
      </div>
      <h3 className="f-hand" style={{ fontSize: 20, color: "var(--text)", lineHeight: 1.15, marginBottom: 8 }}>
        {label}
      </h3>
      <div className="mt-auto flex items-center gap-2">
        {tier && <EvidenceChip tier={tier} citeKey={citeKey} />}
        <span
          className="f-mono ml-auto"
          style={{ fontSize: 11, color: status === "done" ? "var(--accent)" : "var(--text-3)" }}
        >
          {status === "done" ? "logged" : isLocked ? "locked" : "not started"}
        </span>
      </div>
    </div>
  );
}
