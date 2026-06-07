"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { Modal } from "@/components/ui/Modal";
import { RuledTextarea, WriteField } from "@/components/capture/RuledTextarea";
import type { Tier } from "@/lib/static/citations";
import type { ScamperPrompt } from "@/lib/types";
import {
  completeNight,
  createPrediction,
  resolvePrediction,
  type NightPayload,
} from "@/lib/actions/night";
import type { NightData, DuePrediction } from "@/lib/queries/night";

const SCAMPER: { letter: ScamperPrompt; name: string }[] = [
  { letter: "S", name: "Substitute" },
  { letter: "C", name: "Combine" },
  { letter: "A", name: "Adapt" },
  { letter: "M", name: "Modify" },
  { letter: "P", name: "Put to other use" },
  { letter: "E", name: "Eliminate" },
  { letter: "R", name: "Reverse" },
];

const STEP_META: Record<string, { title: string; cite: string; tier: Tier }> = {
  N1: { title: "Retrieval-First Recall", cite: "N1", tier: "Confirmed" },
  N2: { title: "After-Action Review", cite: "N2", tier: "Practitioner" },
  N3: { title: "Calibrated Prediction", cite: "N3", tier: "Confirmed" },
  N4: { title: "Consider-the-Opposite", cite: "N4", tier: "Confirmed" },
  N5: { title: "SCAMPER Idea Development", cite: "N5", tier: "Inference" },
};

type Form = Record<string, string>;

function NightHeader({ step, total, title, cite, tier }: { step: number; total: number; title: string; cite: string; tier: Tier }) {
  const minLeft = Math.max(4, (total - step + 1) * 6);
  return (
    <div className="mb-6">
      <div className="f-mono flex items-center justify-between" style={{ fontSize: 12, color: "var(--text-3)" }}>
        <span>Step {step} / {total}</span>
        <span>~{minLeft} min left</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="f-hand m-0" style={{ fontSize: 25, color: "var(--text)", lineHeight: 1.2 }}>{title}</h2>
        <EvidenceChip tier={tier} citeKey={cite} />
      </div>
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? "var(--accent)" : "var(--surface-2)", transition: "background 200ms" }} />
        ))}
      </div>
    </div>
  );
}

export function NightSessionFlow({ data }: { data: NightData }) {
  const router = useRouter();
  const { phase, day, cue, reveal, n1Total, seedText } = data;

  const steps: string[] = phase === 1 ? ["N2"] : ["N1", "N2", "N3", "N4", ...(phase >= 3 && day % 2 === 0 ? ["N5"] : [])];
  const total = steps.length;
  const n4variant = phase >= 4 && day % 7 === 1 ? "two_hypothesis" : "opposite";

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [done, setDone] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Form>(() => {
    const s = data.session;
    return {
      n1_recalled_text: s?.n1_recalled_text ?? "",
      n1_missed_items: s?.n1_missed_items ?? "",
      n1_recalled_count: s?.n1_recalled_count != null ? String(s.n1_recalled_count) : "",
      n2_intended: s?.n2_intended ?? "",
      n2_happened: s?.n2_happened ?? "",
      n2_why_gap: s?.n2_why_gap ?? "",
      n2_sustain: s?.n2_sustain ?? "",
      n2_improve: s?.n2_improve ?? "",
      n4_belief: s?.n4_belief ?? "",
      n4_against: s?.n4_against ?? "",
      n4_evidence: s?.n4_evidence ?? "",
      n4_hyp_a: s?.n4_hyp_a ?? "",
      n4_hyp_b: s?.n4_hyp_b ?? "",
      n4_diagnostic_test: s?.n4_diagnostic_test ?? "",
      n5_result: s?.n5_result ?? "",
    };
  });
  const set = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  // N1 reveal
  const [revealed, setRevealed] = useState(false);
  // N3
  const [pText, setPText] = useState("");
  const [pProb, setPProb] = useState("");
  const [pDate, setPDate] = useState("");
  const [pErr, setPErr] = useState("");
  const [pAdded, setPAdded] = useState(0);
  const [due, setDue] = useState<(DuePrediction & { resolved: boolean | null })[]>(
    data.due.map((d) => ({ ...d, resolved: null })),
  );
  // N5
  const [active, setActive] = useState<ScamperPrompt>("C");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmLeave(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const leave = () => router.push("/home");

  const addPrediction = async () => {
    const n = parseInt(pProb, 10);
    if (!pText.trim()) return setPErr("Write the prediction first.");
    if (isNaN(n) || n < 1 || n > 99) return setPErr("Probability must be 1–99%.");
    setPErr("");
    try {
      await createPrediction({ claim: pText, probability: n, resolves_on: pDate || null });
      setPText("");
      setPProb("");
      setPDate("");
      setPAdded((c) => c + 1);
    } catch (e) {
      setPErr(e instanceof Error ? e.message : "Could not save.");
    }
  };

  const resolve = async (id: string, hit: boolean) => {
    setDue((d) => d.map((p) => (p.id === id ? { ...p, resolved: hit } : p)));
    try {
      await resolvePrediction(id, hit);
    } catch {
      setDue((d) => d.map((p) => (p.id === id ? { ...p, resolved: null } : p)));
    }
  };

  const finish = async () => {
    setSaving(true);
    const payload: NightPayload = {
      n1_recalled_text: form.n1_recalled_text,
      n1_missed_items: form.n1_missed_items,
      n1_recalled_count: form.n1_recalled_count ? parseInt(form.n1_recalled_count, 10) : null,
      n1_total_count: n1Total,
      n2_intended: form.n2_intended,
      n2_happened: form.n2_happened,
      n2_why_gap: form.n2_why_gap,
      n2_sustain: form.n2_sustain,
      n2_improve: form.n2_improve,
      n4_variant: n4variant,
      n4_belief: form.n4_belief,
      n4_against: form.n4_against,
      n4_evidence: form.n4_evidence,
      n4_hyp_a: form.n4_hyp_a,
      n4_hyp_b: form.n4_hyp_b,
      n4_diagnostic_test: form.n4_diagnostic_test,
      n5_idea: seedText ?? undefined,
      n5_prompt: active,
      n5_result: form.n5_result,
    };
    try {
      await completeNight(payload);
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (idx < total - 1) {
      setDir("fwd");
      setIdx((i) => i + 1);
    } else {
      finish();
    }
  };
  const back = () => {
    if (idx > 0) {
      setDir("back");
      setIdx((i) => i - 1);
    } else {
      setConfirmLeave(true);
    }
  };

  const key = steps[idx];
  const meta = STEP_META[key];
  const title = key === "N4" && n4variant === "two_hypothesis" ? "Two-Hypothesis Check" : meta.title;

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "10px 12px",
    fontSize: 14,
    color: "var(--text)",
  } as const;

  return (
    <div
      data-theme="night"
      className="grain fixed inset-0 z-[90]"
      style={{ background: "var(--bg-deep)", color: "var(--text)", overflowY: "auto" }}
      role="dialog"
      aria-modal="true"
      aria-label="Night session"
    >
      <div className="flex min-h-full flex-col items-center" style={{ padding: "clamp(20px,5vw,48px) 20px 48px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          {!done && (
            <p className="f-serif mb-6 text-center" style={{ fontSize: 14, color: "var(--text-3)", fontStyle: "italic" }}>
              {cue} → tonight&apos;s session.
            </p>
          )}

          {done ? (
            <div className="anim-up text-center" style={{ maxWidth: 440, margin: "0 auto" }}>
              <Icon name="feather" size={32} style={{ color: "var(--accent)", margin: "0 auto 16px" }} />
              <h2 className="f-hand" style={{ fontSize: 28, color: "var(--text)", marginBottom: 12 }}>Session logged.</h2>
              <p className="f-serif" style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 24 }}>
                Tonight&apos;s synthesis is saved. The streak holds.
              </p>
              <Btn variant="primary" onClick={leave}>Return to the diary</Btn>
            </div>
          ) : (
            <>
              <div key={idx} className={dir === "fwd" ? "anim-page" : "anim-page-back"}>
                <NightHeader step={idx + 1} total={total} title={title} cite={meta.cite} tier={meta.tier} />

                {key === "N1" && (
                  <div>
                    <p className="f-serif mb-4" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, maxWidth: "60ch" }}>
                      Write what you remember from today. Don&apos;t peek at your captures yet.
                    </p>
                    <RuledTextarea ariaLabel="What you remember from today" rows={4} value={form.n1_recalled_text} onChange={set("n1_recalled_text")} placeholder="The silence on the client thread. Cleared desks. The one-pager idea…" />
                    {!revealed ? (
                      <div className="mt-6 flex justify-center">
                        <Btn variant="outline" onClick={() => setRevealed(true)}>
                          <span className="inline-flex items-center gap-2"><Icon name="eye" size={16} /> Reveal captures</span>
                        </Btn>
                      </div>
                    ) : (
                      <div className="anim-up mt-4">
                        {reveal.length === 0 ? (
                          <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>No captures logged today — recall from memory is enough.</p>
                        ) : (
                          <div className="space-y-3">
                            {reveal.map((it, i) => (
                              <div key={it.id} className="anim-up" style={{ animationDelay: `${i * 60}ms`, border: "1px solid var(--border)", borderRadius: 4, padding: "12px 14px" }}>
                                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{it.tag}</span>
                                <p className="ink m-0" style={{ fontSize: 18, lineHeight: "27px" }}>{it.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>RECALLED (of {n1Total})</label>
                            <input type="number" min={0} max={n1Total} value={form.n1_recalled_count} onChange={(e) => set("n1_recalled_count")(e.target.value)} className="f-mono w-full" style={inputStyle} />
                          </div>
                        </div>
                        <div className="mt-3">
                          <WriteField label="WHAT I MISSED / KEEP FORGETTING" rows={2} value={form.n1_missed_items} onChange={set("n1_missed_items")} placeholder="The colleague's budget reaction — I under-encode work-social cues." />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {key === "N2" && (
                  phase === 1 ? (
                    <div>
                      <WriteField label="WHAT HAPPENED?" value={form.n2_happened} onChange={set("n2_happened")} placeholder="Rushed the school run, forgot the permission slip." rows={2} />
                      <WriteField label="IMPROVE — AS AN IF-THEN" hint="An implementation intention sticks better than a resolution." value={form.n2_improve} onChange={set("n2_improve")} placeholder="If it's a school morning, then I lay the bag by the door the night before." rows={2} />
                    </div>
                  ) : (
                    <div>
                      <WriteField label="INTENDED" value={form.n2_intended} onChange={set("n2_intended")} placeholder="To get a dated decision from the client lead." rows={2} />
                      <WriteField label="HAPPENED" value={form.n2_happened} onChange={set("n2_happened")} placeholder="Thread stayed silent; sent the async one-pager instead." rows={2} />
                      <WriteField label="WHY THE GAP" value={form.n2_why_gap} onChange={set("n2_why_gap")} placeholder="Decision-maker likely on leave — no one to approve." rows={2} />
                      <WriteField label="SUSTAIN" value={form.n2_sustain} onChange={set("n2_sustain")} placeholder="The one-pager was ready and value-first." rows={2} />
                      <WriteField label="IMPROVE — IF-THEN" value={form.n2_improve} onChange={set("n2_improve")} placeholder="If a thread is silent 2 days, then I ask for the return date." rows={2} />
                    </div>
                  )
                )}

                {key === "N3" && (
                  <div>
                    <WriteField label="NEW PREDICTION" value={pText} onChange={setPText} placeholder="The client renews the contract this month." rows={2} />
                    <div className="mb-2 grid grid-cols-2 gap-3">
                      <div>
                        <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>PROBABILITY %</label>
                        <input type="number" min={1} max={99} value={pProb} onChange={(e) => setPProb(e.target.value)} placeholder="70" className="f-mono w-full" style={inputStyle} />
                      </div>
                      <div>
                        <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>RESOLVES ON</label>
                        <input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} className="f-mono w-full" style={inputStyle} />
                      </div>
                    </div>
                    {pErr && <p className="f-mono" style={{ fontSize: 12, color: "var(--warn)", marginBottom: 8 }}>{pErr}</p>}
                    <Btn variant="outline" onClick={addPrediction}>
                      <span className="inline-flex items-center gap-2"><Icon name="plus" size={15} /> Log prediction</span>
                    </Btn>
                    {pAdded > 0 && <span className="f-mono ml-3" style={{ fontSize: 12, color: "var(--accent)" }}>{pAdded} filed tonight</span>}

                    <h3 className="f-mono mb-3 mt-6" style={{ fontSize: 12, color: "var(--text-2)", letterSpacing: 0.3 }}>RESOLVE DUE PREDICTIONS</h3>
                    {due.length === 0 ? (
                      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Nothing due to resolve tonight.</p>
                    ) : (
                      <div className="space-y-2" aria-live="polite">
                        {due.map((p) => (
                          <div key={p.id} className="hairline flex items-center gap-3" style={{ borderRadius: 4, padding: "10px 12px", background: "var(--surface)" }}>
                            <span className="ink flex-1" style={{ fontSize: 17, lineHeight: 1.3 }}>{p.claim}</span>
                            <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>{p.probability}%</span>
                            {p.resolved === null ? (
                              <div className="flex gap-1.5">
                                <button aria-label="Resolve hit" onClick={() => resolve(p.id, true)} className="tap-target flex items-center justify-center" style={{ width: 34, height: 34, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)" }}><Icon name="check" size={16} /></button>
                                <button aria-label="Resolve miss" onClick={() => resolve(p.id, false)} className="tap-target flex items-center justify-center" style={{ width: 34, height: 34, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)" }}><Icon name="x" size={16} /></button>
                              </div>
                            ) : (
                              <span className="anim-pulse f-mono inline-flex items-center gap-1" style={{ fontSize: 12, color: p.resolved ? "var(--chip-confirmed)" : "var(--warn)" }}>
                                <Icon name={p.resolved ? "check" : "x"} size={15} /> {p.resolved ? "hit" : "miss"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {key === "N4" && (
                  n4variant === "two_hypothesis" ? (
                    <div>
                      <p className="f-serif mb-4" style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.6 }}>Hold two live explanations and find the one test that splits them.</p>
                      <WriteField label="HYPOTHESIS A" value={form.n4_hyp_a} onChange={set("n4_hyp_a")} rows={2} placeholder="The client went quiet because budget is being cut." />
                      <WriteField label="HYPOTHESIS B" value={form.n4_hyp_b} onChange={set("n4_hyp_b")} rows={2} placeholder="The decision-maker is on leave until month-end." />
                      <WriteField label="SINGLE MOST DIAGNOSTIC TEST" hint="One observation that should differ between A and B." value={form.n4_diagnostic_test} onChange={set("n4_diagnostic_test")} rows={2} />
                    </div>
                  ) : (
                    <div>
                      <WriteField label="BELIEF" value={form.n4_belief} onChange={set("n4_belief")} placeholder="The locker app is worth building." rows={2} />
                      <WriteField label="STRONGEST CASE AGAINST IT" value={form.n4_against} onChange={set("n4_against")} placeholder="People won't install an app for a 20-second annoyance." rows={2} />
                      <WriteField label="EVIDENCE THAT WOULD CHANGE MY MIND" value={form.n4_evidence} onChange={set("n4_evidence")} placeholder="If 5+ gym-goers said they'd pay or pre-register." rows={2} />
                    </div>
                  )
                )}

                {key === "N5" && (
                  <div>
                    <div className="hairline mb-5" style={{ borderRadius: 4, padding: "10px 14px", background: "var(--surface)" }}>
                      <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>ACTIVE SEED</span>
                      <p className="ink m-0" style={{ fontSize: 17, lineHeight: 1.3 }}>{seedText ?? "No idea seed yet — capture a D3 first, or develop a fresh idea."}</p>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
                      {SCAMPER.map((c) => (
                        <button key={c.letter} onClick={() => setActive(c.letter)} className="tap-target flex flex-col items-center justify-center" style={{ padding: "8px 4px", borderRadius: 4, border: `1px solid ${active === c.letter ? "var(--accent)" : "var(--border)"}`, background: active === c.letter ? "var(--surface-2)" : "transparent" }}>
                          <span className="f-mono" style={{ fontSize: 18, fontWeight: 500, color: active === c.letter ? "var(--accent)" : "var(--text-3)" }}>{c.letter}</span>
                          <span className="f-ui" style={{ fontSize: 9, color: "var(--text-3)", marginTop: 2 }}>{c.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <WriteField label={`${active} · ${SCAMPER.find((c) => c.letter === active)!.name.toUpperCase()}`} value={form.n5_result} onChange={set("n5_result")} placeholder="Develop this letter…" rows={3} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <Btn variant="ghost" onClick={back}>
                  <span className="inline-flex items-center gap-2"><Icon name="arrowLeft" size={16} /> Back</span>
                </Btn>
                <Btn variant="primary" onClick={next} disabled={saving}>
                  <span className="inline-flex items-center gap-2">
                    {idx === total - 1 ? (saving ? "Saving…" : "Finish session") : "Next"} <Icon name="arrowRight" size={16} />
                  </span>
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>

      {confirmLeave && (
        <Modal open onClose={() => setConfirmLeave(false)} dark labelledBy="leave-h" maxWidth={360}>
          <div style={{ padding: 24 }}>
            <h3 id="leave-h" className="f-hand" style={{ fontSize: 22, marginBottom: 8, color: "var(--text)" }}>Leave session?</h3>
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 20 }}>
              Predictions you logged are saved. Finish the session to save tonight&apos;s synthesis.
            </p>
            <div className="flex justify-end gap-3">
              <Btn variant="ghost" onClick={() => setConfirmLeave(false)}>Stay</Btn>
              <Btn variant="outline" onClick={leave}>Leave</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
