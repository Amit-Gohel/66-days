import type { Tier } from "./citations";
import type { DayEntry } from "@/lib/types";

// Field definitions for the D1–D4 capture forms + the map from form-field keys
// to database columns. Shared by the client modal and the server action.

export type CaptureKey = "D1" | "D2" | "D3" | "D4";

export interface CaptureField {
  k: string;
  label: string;
  ph: string;
  rows: number;
}

export interface CaptureSpec {
  title: string;
  tier: Tier;
  citeKey: string;
  hint?: string;
  fields: CaptureField[];
}

export const CAPTURE_SPECS: Record<CaptureKey, CaptureSpec> = {
  D1: {
    title: "Baseline + Anomaly",
    tier: "Confirmed",
    citeKey: "D1",
    fields: [
      { k: "place", label: "PLACE", ph: "Office, 9:30am.", rows: 1 },
      { k: "baseline", label: "BASELINE — what's normal here?", ph: "Standup wrapping, calendar quiet.", rows: 2 },
      { k: "anomaly", label: "ANOMALY — what broke it?", ph: "Client thread went silent for 3 days.", rows: 2 },
      { k: "sowhat", label: "SO WHAT? — one-line projection", ph: "Budget cut or decision-maker away — test it.", rows: 1 },
    ],
  },
  D2: {
    title: "Three Noticings",
    tier: "Confirmed",
    citeKey: "D2",
    hint: "Concrete detail only — no judgment.",
    fields: [
      { k: "a", label: "1", ph: "Two desks cleared overnight.", rows: 1 },
      { k: "b", label: "2", ph: "Coffee machine descaled — new sticker.", rows: 1 },
      { k: "c", label: "3", ph: "Parking lot half empty.", rows: 1 },
    ],
  },
  D3: {
    title: "One Problem → Idea Seed",
    tier: "Inference",
    citeKey: "D3",
    hint: "Anchor it to something you observed today.",
    fields: [
      { k: "problem", label: "PROBLEM — state it first", ph: "Async asks get ignored when sent cold.", rows: 2 },
      { k: "solution", label: "CANDIDATE SOLUTION", ph: "A one-pager template with a single dated decision request.", rows: 2 },
    ],
  },
  D4: {
    title: "One People Note",
    tier: "CONTESTED",
    citeKey: "D4",
    hint: "Observations, not conclusions. No verdicts.",
    fields: [
      { k: "person", label: "PERSON", ph: "Client lead.", rows: 1 },
      { k: "baseline", label: "THEIR BASELINE", ph: "Replies within hours, warm.", rows: 1 },
      { k: "shift", label: "THE SHIFT (+ topic)", ph: "No reply for days, last message terse — on budget.", rows: 2 },
      { k: "question", label: "OPEN QUESTION TO ASK NEXT", ph: '"When does the team reconvene on this?"', rows: 1 },
    ],
  },
};

/** form-field key → day_entries column, per section. */
export const COLUMN_MAP: Record<CaptureKey, Record<string, keyof DayEntry>> = {
  D1: { place: "d1_place", baseline: "d1_baseline", anomaly: "d1_anomaly", sowhat: "d1_so_what" },
  D2: { a: "d2_noticing_1", b: "d2_noticing_2", c: "d2_noticing_3" },
  D3: { problem: "d3_problem", solution: "d3_solution" },
  D4: { person: "d4_person", baseline: "d4_baseline", shift: "d4_shift_topic", question: "d4_open_question" },
};

/** Pull a section's current values out of a day_entries row for form prefill. */
export function entryToValues(
  entry: DayEntry | null,
  section: CaptureKey,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!entry) return out;
  for (const [fieldKey, col] of Object.entries(COLUMN_MAP[section])) {
    const v = entry[col];
    out[fieldKey] = typeof v === "string" ? v : "";
  }
  return out;
}
