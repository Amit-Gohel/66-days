import Link from "next/link";
import { getDashboard } from "@/lib/queries/dashboard";
import { DayPhaseHeader } from "@/components/shell/DayPhaseHeader";
import { TodayCaptures } from "@/components/home/TodayCaptures";
import { StreakHeatmap } from "@/components/charts/StreakHeatmap";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { Icon } from "@/components/ui/Icon";
import { entryToValues, type CaptureKey } from "@/lib/static/capture-spec";
import { FEATURE_UNLOCK_DAY } from "@/lib/domain/phases";
import { Day66Close } from "@/components/home/Day66Close";

export default async function HomePage() {
  const { app, captures, pagesFilled, drill, heatmap, todayEntry } = await getDashboard();
  const sessionMin = app.phase === 1 ? "~5 min" : "~28–34 min";

  const prefill = Object.fromEntries(
    (["D1", "D2", "D3", "D4"] as CaptureKey[]).map((k) => [k, entryToValues(todayEntry, k)]),
  ) as Record<CaptureKey, Record<string, string>>;

  return (
    <div
      className="anim-fade"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}
    >
      {app.day >= 66 && <Day66Close />}
      <DayPhaseHeader app={app} />
      <p className="f-serif mt-3" style={{ fontSize: 14, color: "var(--text-2)", fontStyle: "italic" }}>
        {app.cue} → tonight&apos;s session.
      </p>

      {app.phase === 5 && (
        <div className="hairline mt-5" style={{ borderRadius: 6, padding: "14px 16px", background: "var(--surface-2)" }}>
          <p className="f-serif m-0" style={{ fontSize: 14, color: "var(--text)" }}>
            <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)" }}>TAPER WEEK · </span>
            Required: D1 + N2 + resolve due predictions. Everything else optional.
          </p>
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT: captures + night */}
        <div>
          <h2 className="f-hand mb-3" style={{ fontSize: 22, color: "var(--text)" }}>
            Today&apos;s captures
          </h2>
          <TodayCaptures
            captures={captures}
            prefill={prefill}
            outreachUnlocked={app.day >= FEATURE_UNLOCK_DAY.outreach}
          />

          {/* Night session CTA */}
          <Link
            href="/night"
            className="mt-4 block w-full text-left"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--accent)",
              borderRadius: 8,
              padding: "18px 20px",
              boxShadow: "var(--shadow-card)",
              textDecoration: "none",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="moon" size={22} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <h3 className="f-hand" style={{ fontSize: 21, color: "var(--text)", lineHeight: 1.1 }}>
                  Begin night session
                </h3>
                <p className="f-serif" style={{ fontSize: 13, color: "var(--text-2)", margin: "2px 0 0" }}>
                  {app.cue} · {sessionMin}
                </p>
              </div>
              <Icon name="chevronRight" size={20} style={{ color: "var(--accent)" }} />
            </div>
          </Link>

          {/* Drill of the day (Phase 3+) */}
          {app.phase >= 3 && (
            <div className="hairline mt-4" style={{ borderRadius: 6, padding: "14px 16px", background: "var(--surface)" }}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  DRILL OF THE DAY · 2–5 MIN
                </span>
                <EvidenceChip tier={drill.chip} />
              </div>
              <h3 className="f-hand" style={{ fontSize: 19, color: "var(--text)", lineHeight: 1.15 }}>
                {drill.name}
              </h3>
              <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", margin: "4px 0 0", lineHeight: 1.5 }}>
                {drill.instr}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: stats + heatmap */}
        <div className="space-y-4">
          <div className="hairline" style={{ borderRadius: 6, padding: "16px 18px", background: "var(--surface)" }}>
            <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>PAGES FILLED</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="f-mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--text)", lineHeight: 1.1 }}>
                {pagesFilled.totalWords.toLocaleString()}
              </span>
              <span className="f-mono" style={{ fontSize: 13, color: "var(--text-2)" }}>words</span>
            </div>
            <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", margin: "4px 0 0" }}>
              ~{pagesFilled.perDay} words/day across {app.day} days.
            </p>
          </div>
          <div className="hairline" style={{ borderRadius: 6, padding: "16px 18px", background: "var(--surface)" }}>
            <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>THE 66-DAY DIARY</span>
            <div className="mt-3" style={{ overflowX: "auto" }}>
              <StreakHeatmap cells={heatmap} cell={22} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
