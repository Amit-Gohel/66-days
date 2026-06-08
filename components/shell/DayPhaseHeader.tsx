import { Icon } from "@/components/ui/Icon";
import type { AppState } from "@/lib/types";

export function DayPhaseHeader({
  app,
  compact = false,
}: {
  app: AppState;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.round((app.day / 66) * 100));
  return (
    <div className="anim-fade">
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="f-mono"
          style={{
            fontSize: compact ? 24 : 30,
            lineHeight: 1.1,
            fontWeight: 500,
            color: "var(--accent)",
            whiteSpace: "nowrap",
          }}
        >
          Day {app.day}
        </span>
        <span
          className="f-mono"
          style={{ fontSize: 14, color: "var(--text-2)", whiteSpace: "nowrap" }}
        >
          / 66 · Phase {app.phase}
        </span>
        {app.graceActive && (
          <span
            className="f-mono inline-flex items-center gap-1"
            style={{ fontSize: 12, color: "var(--text-2)" }}
          >
            <Icon name="shield" size={14} /> grace
          </span>
        )}
        {app.freezesAvailable > 0 && (
          <span
            className="f-mono inline-flex items-center gap-1"
            style={{ fontSize: 12, color: "var(--text-2)" }}
            title="Earned streak freezes — each covers a missed day so a long streak survives. Earned by weekly reviews, never purchasable."
          >
            <Icon name="snowflake" size={14} />
            {app.freezesAvailable} {app.freezesAvailable === 1 ? "freeze" : "freezes"}
          </span>
        )}
        <span
          className="f-mono ml-auto"
          style={{ fontSize: 13, color: "var(--text-3)", whiteSpace: "nowrap" }}
        >
          {app.streak}-day streak
        </span>
      </div>
      <div
        style={{
          height: 3,
          background: "var(--surface-2)",
          borderRadius: 2,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--accent)",
            transition: "width 300ms ease",
          }}
        />
      </div>
    </div>
  );
}
