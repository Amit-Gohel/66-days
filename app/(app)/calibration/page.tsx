import { getCalibration } from "@/lib/queries/calibration";
import { ChartCard } from "@/components/charts/ChartCard";
import { CalibrationCurve } from "@/components/charts/CalibrationCurve";
import { BrierTrend } from "@/components/charts/BrierTrend";
import { MissRateTrend } from "@/components/charts/MissRateTrend";
import { StreakHeatmap } from "@/components/charts/StreakHeatmap";
import { Icon } from "@/components/ui/Icon";

export default async function CalibrationPage() {
  const { resolvedCount, meanBrier, bins, brierTrend, missTrend, note, heatmap } = await getCalibration();

  return (
    <div className="anim-fade" style={{ maxWidth: 920, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Calibration</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
        {note || "You're improving on the measures that matter."}
      </p>

      {resolvedCount === 0 ? (
        <div className="hairline" style={{ borderRadius: 8, padding: "40px 24px", background: "var(--surface)", textAlign: "center" }}>
          <Icon name="target" size={28} style={{ color: "var(--text-3)", margin: "0 auto 12px" }} />
          <p className="f-serif" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, maxWidth: "46ch", margin: "0 auto" }}>
            Calibration becomes meaningful after ~20 resolved forecasts (typically Week 6+). Log predictions in the night session and resolve them on their date.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <ChartCard title="Calibration curve" subtitle="Predicted vs. actual hit rate, by bin.">
            <CalibrationCurve bins={bins} />
          </ChartCard>
          <ChartCard title="Brier trend" big={meanBrier != null ? meanBrier.toFixed(2) : undefined} subtitle="Lower is sharper. Benchmark 0.166.">
            <BrierTrend data={brierTrend} />
          </ChartCard>
          <ChartCard title="Anomaly miss-rate" subtitle="From N1 recall, by week.">
            <MissRateTrend data={missTrend} />
          </ChartCard>
          <ChartCard title="66-day streak" subtitle="The visual diary. Hover or tap a cell.">
            <div style={{ overflowX: "auto" }}>
              <StreakHeatmap cells={heatmap} cell={24} />
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
