import type { Tier } from "./citations";
import { CITATIONS } from "./citations";
import type { CaptureKey } from "./capture-spec";

// Plain-language card definitions for the redesigned Today page. Field keys MATCH
// COLUMN_MAP in capture-spec.ts, so values flow straight into upsertDayCapture() and
// out of entryToValues() with no extra mapping. Each field carries a persistent label,
// a one-line plain hint, and a concrete "e.g." example (never placeholder-as-label).

export interface TodayField {
  k: string; // matches COLUMN_MAP[section] key
  label: string;
  hint: string;
  eg: string;
  rows: number;
}

export interface TodayCard {
  key: CaptureKey;
  kicker: string; // the doctrine term, shown as a small kicker
  title: string; // plain-language headline
  what: string; // one-line "what this is"
  fields: TodayField[];
  emptyText: string;
  openText: string;
  tier: Tier;
  src: string;
}

export const TODAY_CARDS: TodayCard[] = [
  {
    key: "D1",
    kicker: "Baseline + Anomaly",
    title: "What’s normal — and what broke it",
    what: "A place, its usual rhythm, and the thing that didn’t fit.",
    fields: [
      { k: "place", label: "Place", hint: "Where & when.", eg: "e.g. Coffee shop, 8am.", rows: 1 },
      { k: "baseline", label: "What’s normal here?", hint: "The usual rhythm or mood.", eg: "e.g. Regulars, laptops, quiet.", rows: 1 },
      { k: "anomaly", label: "What stood out?", hint: "Anything that broke the pattern.", eg: "e.g. A man in a winter coat watching the door — didn’t order.", rows: 2 },
      { k: "sowhat", label: "So what?", hint: "Your one-line read on it.", eg: "e.g. Probably waiting/anxious — low threat, noted the exit.", rows: 2 },
    ],
    emptyText: "No baseline yet — pick a place you were and note what felt usual, then the one thing that didn’t.",
    openText: "Add a place",
    tier: CITATIONS.D1.tier,
    src: CITATIONS.D1.src,
  },
  {
    key: "D2",
    kicker: "Three Noticings",
    title: "Three things you noticed",
    what: "Three small, specific things you saw or heard.",
    fields: [
      { k: "a", label: "One", hint: "A specific thing you saw or heard.", eg: "e.g. Barista re-stacks cups left-handed.", rows: 1 },
      { k: "b", label: "Two", hint: "Another concrete detail.", eg: "e.g. Three people in the same trainers.", rows: 1 },
      { k: "c", label: "Three", hint: "One more.", eg: "e.g. Street noise drops at 9:10.", rows: 1 },
    ],
    emptyText: "Nothing jotted yet — name three concrete things, not impressions.",
    openText: "Add three",
    tier: CITATIONS.D2.tier,
    src: CITATIONS.D2.src,
  },
  {
    key: "D3",
    kicker: "Problem → Idea Seed",
    title: "A problem → an idea",
    what: "Something that’s annoying or broken, and one possible fix.",
    fields: [
      { k: "problem", label: "Problem", hint: "What’s annoying or broken? Anchor it to something you saw.", eg: "e.g. Gym lockers jam at 6pm.", rows: 2 },
      { k: "solution", label: "An idea", hint: "One possible fix — stay practical.", eg: "e.g. Door-sensors + an app showing free lockers.", rows: 2 },
    ],
    emptyText: "No idea seed yet — catch one friction from today and sketch a fix.",
    openText: "Add an idea",
    tier: CITATIONS.D3.tier,
    src: CITATIONS.D3.src,
  },
  {
    key: "D4",
    kicker: "People Note",
    title: "A note on one person",
    what: "How someone usually is, and what shifted today.",
    fields: [
      { k: "person", label: "Person", hint: "Who.", eg: "e.g. Client lead.", rows: 1 },
      { k: "baseline", label: "Their normal", hint: "How they usually are.", eg: "e.g. Replies within hours, warm.", rows: 1 },
      { k: "shift", label: "What shifted", hint: "The change + the topic (observation, not a verdict).", eg: "e.g. No reply for days, terse — on budget.", rows: 2 },
      { k: "question", label: "Question to ask", hint: "An open question, not an accusation.", eg: "e.g. “When does the team reconvene on this?”", rows: 2 },
    ],
    emptyText: "No people note yet — pick one person and note a change, not a judgment.",
    openText: "Add a note",
    tier: CITATIONS.D4.tier,
    src: CITATIONS.D4.src,
  },
];

/** Read-view label for each field key, per card (mirrors the field labels). */
export function readLabel(card: TodayCard, fieldKey: string): string {
  return card.fields.find((f) => f.k === fieldKey)?.label ?? "";
}
