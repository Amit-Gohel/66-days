"use client";

import { useEffect, useRef, useState } from "react";
import { CHIP_COLORS, CITATIONS, type Tier } from "@/lib/static/citations";

export interface EvidenceChipProps {
  tier: Tier;
  citeKey?: string;
}

/** `[Tier]` chip; if it maps to a citation, tapping reveals the source. */
export function EvidenceChip({ tier, citeKey }: EvidenceChipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const color = CHIP_COLORS[tier] || "var(--text-2)";
  const src = citeKey && CITATIONS[citeKey] ? CITATIONS[citeKey].src : null;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => src && setOpen((o) => !o)}
        className="f-mono inline-flex items-center"
        style={{
          fontSize: 12,
          lineHeight: 1.2,
          borderRadius: 2,
          border: `1px solid ${color}`,
          color,
          padding: "2px 8px",
          background: "transparent",
          cursor: src ? "pointer" : "default",
        }}
        aria-label={`Evidence: ${tier}${src ? ". Tap for source." : ""}`}
      >
        [{tier}]
      </button>
      {open && src && (
        <span
          className="anim-fade absolute z-50"
          style={{ top: "calc(100% + 6px)", left: 0, width: "min(280px,80vw)" }}
        >
          <span
            className="f-mono surface hairline block"
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              padding: "10px 12px",
              borderRadius: 4,
              boxShadow: "var(--shadow-float)",
              color: "var(--text-2)",
            }}
          >
            <span style={{ color, fontWeight: 500 }}>[{tier}]</span>
            <br />
            {src}
          </span>
        </span>
      )}
    </span>
  );
}
