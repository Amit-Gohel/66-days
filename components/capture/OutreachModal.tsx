"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Btn } from "@/components/ui/Btn";
import { RuledTextarea } from "./RuledTextarea";
import { logOutreach } from "@/lib/actions/captures";

export function OutreachModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [v, setV] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: string) => (val: string) => setV((p) => ({ ...p, [k]: val }));

  const save = async () => {
    setSaving(true);
    try {
      await logOutreach(v);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy="out-h" maxWidth={520}>
      <div style={{ padding: "clamp(20px,4vw,28px)" }}>
        <h2 id="out-h" className="f-hand" style={{ fontSize: 24, color: "var(--text)", marginBottom: 6 }}>
          Conditional outreach
        </h2>
        <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 18 }}>
          Only when there&apos;s a genuine, value-first reason. Target 2–3 per week. This is not a streak item.
        </p>
        <div className="space-y-4">
          <div>
            <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>WHO</label>
            <RuledTextarea ariaLabel="Who" rows={1} value={v.who || ""} onChange={set("who")} placeholder="Gym operations manager." />
          </div>
          <div>
            <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>WHY NOW</label>
            <RuledTextarea ariaLabel="Why now" rows={2} value={v.why || ""} onChange={set("why")} placeholder="Logged the 6pm locker jam three Thursdays running." />
          </div>
          <div>
            <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>VALUE OFFERED FIRST</label>
            <RuledTextarea ariaLabel="Value offered first" rows={2} value={v.value || ""} onChange={set("value")} placeholder="A one-page count of the jams with timestamps — free." />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn variant="primary" onClick={save} disabled={saving}>
            {saving ? "Logging…" : "Log outreach"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
