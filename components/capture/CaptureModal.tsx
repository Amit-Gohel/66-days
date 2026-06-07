"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { RuledTextarea } from "./RuledTextarea";
import { CAPTURE_SPECS, type CaptureKey } from "@/lib/static/capture-spec";
import { upsertDayCapture } from "@/lib/actions/captures";

export function CaptureModal({
  type,
  seed,
  onClose,
  onSaved,
}: {
  type: CaptureKey;
  seed: Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const spec = CAPTURE_SPECS[type];
  const valsRef = useRef<Record<string, string>>({ ...seed });
  const [vals, setVals] = useState<Record<string, string>>({ ...seed });
  const [saveCheck, setSaveCheck] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const set = (k: string) => (val: string) => {
    const next = { ...valsRef.current, [k]: val };
    valsRef.current = next;
    setVals(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await upsertDayCapture(type, valsRef.current);
        setSaveCheck(true);
        setTimeout(() => setSaveCheck(false), 2000);
      } catch {
        /* surfaced on explicit save */
      }
    }, 1200);
  };

  const save = async () => {
    if (timer.current) clearTimeout(timer.current);
    setSaving(true);
    try {
      await upsertDayCapture(type, valsRef.current);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy="cap-h" maxWidth={560}>
      <div style={{ padding: "clamp(20px,4vw,28px)" }}>
        <div className="mb-1 flex items-start justify-between">
          <div>
            <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{type}</span>
            <h2 id="cap-h" className="f-hand" style={{ fontSize: 25, color: "var(--text)", lineHeight: 1.1 }}>
              {spec.title}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="tap-target flex items-center justify-center" style={{ color: "var(--text-2)" }}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="mb-5 flex items-center gap-2">
          <EvidenceChip tier={spec.tier} citeKey={spec.citeKey} />
        </div>
        {spec.hint && (
          <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 16, lineHeight: 1.5 }}>
            {spec.hint}
          </p>
        )}
        <div className="space-y-4">
          {spec.fields.map((f) => (
            <div key={f.k}>
              <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                {f.label}
              </label>
              <RuledTextarea ariaLabel={f.label} rows={f.rows} value={vals[f.k] || ""} onChange={set(f.k)} placeholder={f.ph} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          {saveCheck && (
            <span className="f-mono anim-ink inline-flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--accent)" }}>
              <Icon name="check" size={14} /> saved
            </span>
          )}
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save capture"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
