import { getPredictions } from "@/lib/queries/predictions";
import { PredictionsList } from "@/components/predictions/PredictionsList";

export default async function PredictionsPage() {
  const { due, open, resolved, meanBrier } = await getPredictions();
  return (
    <div className="anim-fade" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Prediction log</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
        Falsifiable claims with probabilities you can score. Lower Brier is sharper.
      </p>
      <PredictionsList due={due} open={open} resolved={resolved} meanBrier={meanBrier} />
    </div>
  );
}
