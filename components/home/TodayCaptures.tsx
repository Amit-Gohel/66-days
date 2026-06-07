"use client";

import { useState } from "react";
import { CaptureCard } from "./CaptureCard";
import { CaptureModal } from "@/components/capture/CaptureModal";
import { OutreachModal } from "@/components/capture/OutreachModal";
import { SaveCheck } from "@/components/ui/SaveCheck";
import { Toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";
import type { CaptureKey, CaptureStatus } from "@/lib/queries/dashboard";
import type { Tier } from "@/lib/static/citations";

const CARDS: { type: CaptureKey; label: string; tier: Tier; citeKey: string }[] = [
  { type: "D1", label: "Baseline + Anomaly", tier: "Confirmed", citeKey: "D1" },
  { type: "D2", label: "Three Noticings", tier: "Confirmed", citeKey: "D2" },
  { type: "D3", label: "Problem → Idea Seed", tier: "Inference", citeKey: "D3" },
  { type: "D4", label: "People Note", tier: "CONTESTED", citeKey: "D4" },
];

export function TodayCaptures({
  captures,
  prefill,
  outreachUnlocked,
}: {
  captures: Record<CaptureKey, CaptureStatus>;
  prefill: Record<CaptureKey, Record<string, string>>;
  outreachUnlocked: boolean;
}) {
  const [open, setOpen] = useState<CaptureKey | null>(null);
  const [outreach, setOutreach] = useState(false);
  const [toast, setToast] = useState("");
  const [saveCheck, setSaveCheck] = useState(false);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
    setSaveCheck(true);
    setTimeout(() => setSaveCheck(false), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <CaptureCard
            key={c.type}
            type={c.type}
            label={c.label}
            status={captures[c.type]}
            tier={c.tier}
            citeKey={c.citeKey}
            onOpen={captures[c.type] === "locked" ? undefined : () => setOpen(c.type)}
          />
        ))}
      </div>

      {outreachUnlocked && (
        <button
          onClick={() => setOutreach(true)}
          className="f-ui tap-target mt-3 inline-flex items-center gap-2"
          style={{
            fontSize: 12,
            padding: "8px 14px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            color: "var(--text-2)",
            background: "transparent",
          }}
        >
          <Icon name="plus" size={14} /> Log outreach
        </button>
      )}

      {open && (
        <CaptureModal
          type={open}
          seed={prefill[open] ?? {}}
          onClose={() => setOpen(null)}
          onSaved={() => flash("Capture saved. Keep going.")}
        />
      )}
      {outreach && (
        <OutreachModal onClose={() => setOutreach(false)} onSaved={() => flash("Outreach logged.")} />
      )}

      <Toast msg={toast} />
      <SaveCheck show={saveCheck} />
    </>
  );
}
