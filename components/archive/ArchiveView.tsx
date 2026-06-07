"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { RuledTextarea } from "@/components/capture/RuledTextarea";
import { StreakHeatmap } from "@/components/charts/StreakHeatmap";
import type { ArchiveData } from "@/lib/queries/archive";

const TABS = [
  { id: "timeline", label: "Timeline" },
  { id: "calendar", label: "Calendar" },
  { id: "sweeps", label: "Recall Sweeps" },
];

export function ArchiveView({ data }: { data: ArchiveData }) {
  const [tab, setTab] = useState("timeline");
  const [recall, setRecall] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="anim-fade" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)" }}>Journal archive</h1>
        <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{data.totalWords.toLocaleString()} words · {data.day} days</span>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-6">
        {tab === "timeline" && (
          data.timeline.length === 0 ? (
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>No entries yet. Your captures and night sessions will appear here.</p>
          ) : (
            <div className="space-y-2">
              {data.timeline.map((t) => (
                <div key={t.id} className="hairline flex items-start gap-3" style={{ borderRadius: 4, padding: "12px 14px", background: "var(--surface)" }}>
                  <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)", border: "1px solid var(--border)", borderRadius: 2, padding: "2px 6px", flexShrink: 0 }}>{t.type}</span>
                  <div className="min-w-0 flex-1">
                    <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>Day {t.day}</span>
                    <p className="ink m-0" style={{ fontSize: 16, lineHeight: "24px" }}>{t.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "calendar" && (
          <div style={{ overflowX: "auto" }}>
            <StreakHeatmap cells={data.heatmap} cell={24} />
          </div>
        )}

        {tab === "sweeps" && (
          data.phase >= 4 ? (
            <div>
              <h3 className="f-hand" style={{ fontSize: 20, color: "var(--text)", marginBottom: 8 }}>What was 7 days ago?</h3>
              <RuledTextarea ariaLabel="Recall 7 days ago" rows={3} value={recall} onChange={setRecall} placeholder="The cleared desks, the silent thread, the one-pager idea…" />
              {!revealed ? (
                <div className="mt-4">
                  <Btn variant="outline" onClick={() => setRevealed(true)}>
                    <span className="inline-flex items-center gap-2"><Icon name="eye" size={16} /> Reveal</span>
                  </Btn>
                </div>
              ) : (
                <div className="anim-up hairline mt-4" style={{ borderRadius: 4, padding: "12px 14px", background: "var(--surface)" }}>
                  <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>7 days ago · D1</span>
                  <p className="ink m-0" style={{ fontSize: 17, lineHeight: "26px" }}>{data.recall7 ?? "No entry recorded 7 days ago."}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Recall sweeps unlock in Phase 4 (Day 45).</p>
          )
        )}
      </div>
    </div>
  );
}
