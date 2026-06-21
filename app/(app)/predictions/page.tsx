import { getPredictions } from "@/lib/queries/predictions";
import { PredictionsList } from "@/components/predictions/PredictionsList";

// /predictions — the full forecast log. Server Component: it fetches the data
// and hands it to the client PredictionsList, which owns filtering and editing.
export default async function PredictionsPage() {
  const { all, meanBrier, today } = await getPredictions();
  return (
    <div className="anim-fade" style={{ maxWidth: 920, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Prediction log</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, maxWidth: "62ch" }}>
        Falsifiable claims with probabilities you can score. Filter by outcome, resolve when you know,
        and edit anything — lower Brier is sharper.
      </p>
      <PredictionsList all={all} meanBrier={meanBrier} today={today} />
    </div>
  );
}
