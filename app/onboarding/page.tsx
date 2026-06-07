"use client";

import { useEffect, useState } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { EvidenceChip } from "@/components/ui/EvidenceChip";

const GOALS = [
  "Sharper perception — baselines and anomalies, what breaks the pattern.",
  "Calibrated forecasting — predictions with probabilities you can score.",
  "People-reading — observation over conclusion, questions over verdicts.",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [cue, setCue] = useState("brush my teeth");
  const [start, setStart] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [tz, setTz] = useState("UTC");

  useEffect(() => {
    try {
      // The browser timezone is only available after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      /* keep UTC */
    }
  }, []);

  return (
    <form action={completeOnboarding} className="flex min-h-screen items-center justify-center p-5">
      <input type="hidden" name="cue" value={cue} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="customDate" value={customDate} />
      <input type="hidden" name="timezone" value={tz} />

      <div className="anim-fade w-full" style={{ maxWidth: 520 }}>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  width: 28,
                  height: 3,
                  borderRadius: 2,
                  background: n <= step ? "var(--accent)" : "var(--surface-2)",
                }}
              />
            ))}
          </div>
          <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>
            {step} / 3
          </span>
        </div>

        <div className="surface hairline" style={{ borderRadius: 8, padding: "clamp(24px,5vw,36px)" }}>
          {step === 1 && (
            <div className="anim-page">
              <h2 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 16 }}>
                Train your judgment over 66 days.
              </h2>
              <ul className="m-0 list-none space-y-3 p-0">
                {GOALS.map((t, i) => (
                  <li key={i} className="f-serif flex gap-3" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>
                    <Icon name="check" size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }} />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 16, fontStyle: "italic" }}>
                Domain-specific gains, not an IQ boost.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="anim-page">
              <h2 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 8 }}>
                Set your nightly ritual.
              </h2>
              <div className="mb-4 flex items-center gap-2">
                <EvidenceChip tier="Confirmed" citeKey="Habit" />
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  implementation intention
                </span>
              </div>
              <div
                className="ink ruled"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                  padding: "6px 14px 8px 18px",
                  display: "flex",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  lineHeight: "30px",
                }}
              >
                <span>After I&nbsp;</span>
                <input
                  value={cue}
                  onChange={(e) => setCue(e.target.value)}
                  aria-label="Your existing habit"
                  className="ink"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--accent)",
                    minWidth: 120,
                    color: "var(--text)",
                    lineHeight: "30px",
                    outline: "none",
                  }}
                />
                <span>, I will open the journal.</span>
              </div>
              <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginTop: 14 }}>
                Pair it with an existing habit. This is the single biggest lever for sticking with it.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="anim-page">
              <h2 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 16 }}>
                Pick a start date.
              </h2>
              <div className="mb-5 flex flex-wrap gap-2">
                {([["today", "Today"], ["tomorrow", "Tomorrow"], ["custom", "Custom"]] as const).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setStart(k)}
                    className="f-ui tap-target"
                    style={{
                      fontSize: 13,
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: `1px solid ${start === k ? "var(--accent)" : "var(--border)"}`,
                      color: start === k ? "var(--accent)" : "var(--text-2)",
                      background: start === k ? "var(--surface-2)" : "transparent",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {start === "custom" && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="f-mono"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 12px", color: "var(--text)", marginBottom: 16 }}
                />
              )}
              <div className="hairline" style={{ borderRadius: 6, padding: "12px 14px", background: "var(--surface-2)" }}>
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  PHASE 1 · DAYS 1–14
                </span>
                <p className="f-serif m-0" style={{ fontSize: 14, color: "var(--text)", marginTop: 2 }}>
                  Install the anchor — D1, D2, and a 2-line night review. Miss one day and nothing resets; miss two and the streak resets.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          {step > 1 ? (
            <Btn variant="ghost" onClick={() => setStep(step - 1)}>
              <span className="inline-flex items-center gap-2">
                <Icon name="arrowLeft" size={16} /> Back
              </span>
            </Btn>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Btn variant="primary" onClick={() => setStep(step + 1)}>
              Continue
            </Btn>
          ) : (
            <Btn type="submit" variant="primary">
              Day 1 awaits
            </Btn>
          )}
        </div>
      </div>
    </form>
  );
}
