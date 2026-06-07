"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { RuledTextarea } from "@/components/capture/RuledTextarea";
import { saveWeeklyReview } from "@/lib/actions/weekly";
import type { WeeklyData } from "@/lib/queries/weekly";

const TABS = [
  { id: "reread", label: "Re-read" },
  { id: "brier", label: "Brier" },
  { id: "cull", label: "Best idea" },
  { id: "pattern", label: "Rule of Three" },
  { id: "elicit", label: "Elicitation" },
  { id: "system", label: "System AAR" },
];

type Form = Record<string, string>;

export function WeeklyReview({ data }: { data: WeeklyData }) {
  const e = data.existing;
  const [tab, setTab] = useState("reread");
  const [reread, setReread] = useState(e?.spaced_reread_done ?? false);
  const [form, setForm] = useState<Form>({
    recall_7day: e?.recall_7day ?? "",
    recall_30day: e?.recall_30day ?? "",
    confidence_assessment: e?.confidence_assessment ?? "",
    best_idea: e?.best_idea ?? "",
    pattern_3plus: e?.pattern_3plus ?? "",
    elicitation_noticed: e?.elicitation_noticed ?? "",
    system_aar_sustain: e?.system_aar_sustain ?? "",
    system_aar_improve: e?.system_aar_improve ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const logWeek = async () => {
    setSaving(true);
    try {
      await saveWeeklyReview({
        week_start: data.weekStart,
        spaced_reread_done: reread,
        recall_7day: form.recall_7day,
        recall_30day: form.recall_30day,
        brier_resolved_count: data.resolvedThisWeek.length,
        brier_total_count: data.resolvedThisWeek.length,
        confidence_assessment: form.confidence_assessment,
        best_idea: form.best_idea,
        pattern_3plus: form.pattern_3plus,
        elicitation_noticed: form.elicitation_noticed,
        system_aar_sustain: form.system_aar_sustain,
        system_aar_improve: form.system_aar_improve,
        outreach_count: data.outreachCount,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Weekly review</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20 }}>
        Sunday synthesis · ~25–30 min · Week {data.weekNumber}{saved ? " · saved ✓" : ""}
      </p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === "reread" && (
          <div className="anim-fade">
            <label className="hairline flex cursor-pointer items-center gap-3" style={{ borderRadius: 6, padding: "12px 14px", background: "var(--surface)" }}>
              <input type="checkbox" checked={reread} onChange={(ev) => setReread(ev.target.checked)} style={{ accentColor: "var(--accent)" }} />
              <span className="f-serif" style={{ fontSize: 15, color: "var(--text)" }}>Re-read this week&apos;s captures</span>
            </label>
            {data.phase >= 4 && (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>RECALL — 7 DAYS AGO (before peeking)</label>
                  <RuledTextarea ariaLabel="Recall 7 days ago" rows={3} value={form.recall_7day} onChange={set("recall_7day")} />
                </div>
                <div>
                  <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>RECALL — 30 DAYS AGO</label>
                  <RuledTextarea ariaLabel="Recall 30 days ago" rows={3} value={form.recall_30day} onChange={set("recall_30day")} />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "brier" && (
          <div className="anim-fade">
            <h3 className="f-hand mb-3" style={{ fontSize: 20, color: "var(--text)" }}>Forecasts resolved this week ({data.resolvedThisWeek.length})</h3>
            <div className="mb-5 space-y-2">
              {data.resolvedThisWeek.length === 0 ? (
                <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>None resolved this week.</p>
              ) : (
                data.resolvedThisWeek.map((p) => (
                  <div key={p.id} className="hairline flex items-center gap-3" style={{ borderRadius: 4, padding: "10px 12px", background: "var(--surface)" }}>
                    <span className="ink flex-1" style={{ fontSize: 16 }}>{p.claim}</span>
                    <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{p.probability}%</span>
                    <Icon name={p.outcome ? "check" : "x"} size={13} style={{ color: p.outcome ? "var(--chip-confirmed)" : "var(--warn)" }} />
                    <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)", width: 50, textAlign: "right" }}>{p.brier_score != null ? p.brier_score.toFixed(3) : "—"}</span>
                  </div>
                ))
              )}
            </div>
            {data.note && (
              <div className="hairline mb-4" style={{ borderRadius: 6, padding: "12px 14px", background: "var(--surface-2)" }}>
                <p className="f-serif m-0" style={{ fontSize: 14, color: "var(--text)" }}>{data.note} Rolling Brier {data.meanBrier?.toFixed(3) ?? "—"}.</p>
              </div>
            )}
            <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>OVER- OR UNDER-CONFIDENT?</label>
            <RuledTextarea ariaLabel="Confidence assessment" rows={2} value={form.confidence_assessment} onChange={set("confidence_assessment")} />
          </div>
        )}

        {tab === "cull" && (
          <div className="anim-fade">
            <h3 className="f-hand mb-3" style={{ fontSize: 20, color: "var(--text)" }}>Cull to one best idea</h3>
            {data.seeds.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {data.seeds.map((s) => (
                  <button key={s.id} onClick={() => set("best_idea")(s.text)} className="f-ui" style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", color: "var(--text-2)", background: "transparent", textAlign: "left", maxWidth: 280 }}>
                    {s.text.slice(0, 60)}
                  </button>
                ))}
              </div>
            )}
            <RuledTextarea ariaLabel="Best idea" rows={2} value={form.best_idea} onChange={set("best_idea")} placeholder="The single idea worth carrying forward." />
          </div>
        )}

        {tab === "pattern" && (
          <div className="anim-fade">
            <h3 className="f-hand mb-1" style={{ fontSize: 20, color: "var(--text)" }}>Rule of Three</h3>
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.6 }}>What showed up 3+ times this week? Below three isn&apos;t a pattern yet.</p>
            <RuledTextarea ariaLabel="Pattern" rows={3} value={form.pattern_3plus} onChange={set("pattern_3plus")} />
          </div>
        )}

        {tab === "elicit" && (
          <div className="anim-fade">
            <h3 className="f-hand mb-1" style={{ fontSize: 20, color: "var(--text)" }}>Elicitation in the wild</h3>
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.6 }}>A calibrated question you asked, and what it surfaced.</p>
            <RuledTextarea ariaLabel="Elicitation note" rows={4} value={form.elicitation_noticed} onChange={set("elicitation_noticed")} />
          </div>
        )}

        {tab === "system" && (
          <div className="anim-fade">
            <h3 className="f-hand mb-1" style={{ fontSize: 20, color: "var(--text)" }}>System AAR</h3>
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 12, lineHeight: 1.6 }}>An after-action review on the habit itself.</p>
            <div className="hairline mb-4" style={{ borderRadius: 6, padding: "12px 14px", background: "var(--surface-2)" }}>
              <span className="f-mono" style={{ fontSize: 12, color: "var(--text-2)" }}>Outreach this week: <span style={{ color: "var(--accent)" }}>{data.outreachCount}</span> / 2–3 · tracked separately from the streak.</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>SUSTAIN</label>
                <RuledTextarea ariaLabel="System sustain" rows={2} value={form.system_aar_sustain} onChange={set("system_aar_sustain")} />
              </div>
              <div>
                <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>IMPROVE</label>
                <RuledTextarea ariaLabel="System improve" rows={2} value={form.system_aar_improve} onChange={set("system_aar_improve")} />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              {saved && <span className="f-mono" style={{ fontSize: 12, color: "var(--accent)" }}>Week logged ✓</span>}
              <Btn variant="primary" onClick={logWeek} disabled={saving}>{saving ? "Saving…" : "Log week"}</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
