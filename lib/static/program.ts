import type { Tier } from "./citations";

// Navigation, the 5-phase roadmap, drills, and technique list — all the same
// for every user, so they live in code rather than the database.

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const NAV: NavItem[] = [
  { id: "home", label: "Home", icon: "home", href: "/home" },
  { id: "night", label: "Night", icon: "moon", href: "/night" },
  { id: "weekly", label: "Weekly", icon: "calendar", href: "/weekly" },
  { id: "predictions", label: "Predictions", icon: "list", href: "/predictions" },
  { id: "calibration", label: "Calibration", icon: "target", href: "/calibration" },
  { id: "ideas", label: "Ideas", icon: "lightbulb", href: "/ideas" },
  { id: "archive", label: "Archive", icon: "archive", href: "/archive" },
  { id: "reading", label: "Reading", icon: "book", href: "/reading" },
  { id: "roadmap", label: "Roadmap", icon: "map", href: "/roadmap" },
  { id: "settings", label: "Settings", icon: "settings", href: "/settings" },
];

export const MOBILE_NAV = ["home", "night", "calibration", "archive", "settings"];

export interface Phase {
  n: number;
  name: string;
  range: string;
  why: string;
  features: string[];
}

export const PHASES: Phase[] = [
  {
    n: 1,
    name: "Install the anchor",
    range: "Days 1–14",
    why: "Build the nightly habit first — nothing else matters until the cue holds.",
    features: ["D1 Baseline + Anomaly", "D2 Three Noticings", "N2 minimal AAR (2-line)"],
  },
  {
    n: 2,
    name: "Add precision",
    range: "Days 15–28",
    why: "Once the anchor holds, add recall and calibrated forecasting.",
    features: [
      "N1 Retrieval recall",
      "N3 Calibrated prediction",
      "D4 People note",
      "Full 4-question AAR",
      "First weekly review (~Day 21)",
    ],
  },
  {
    n: 3,
    name: "Add rigor",
    range: "Days 29–44",
    why: "Introduce structured idea work and disconfirmation.",
    features: [
      "D3 Idea seed",
      "N4 Consider-the-opposite",
      "N5 SCAMPER",
      "Brier scoring",
      "1 in-vivo rep/week",
      "Drill of the day",
      "Mid-system self-critique (~Day 35)",
    ],
  },
  {
    n: 4,
    name: "Transfer & calibration",
    range: "Days 45–60",
    why: "Push the skills into the world; sharpen calibration with data.",
    features: [
      "Spaced retrieval sweeps (7/30-day)",
      "Conditional outreach 2–3/week",
      "Occasional 2-hypothesis check",
      "Calibration analytics",
    ],
  },
  {
    n: 5,
    name: "Automaticity check",
    range: "Days 61–66",
    why: "Taper the load and design what survives past Day 66.",
    features: [
      "Taper (fewer required items)",
      "Calibration curve + miss-rate review",
      "Pick top 3 ideas",
      "Meta-AAR",
      "Maintenance builder",
    ],
  },
];

export interface Drill {
  id: string;
  name: string;
  chip: Tier;
  instr: string;
}

export const DRILLS: Drill[] = [
  { id: "d0", name: "Outside View", chip: "Confirmed", instr: "Before predicting, find the base rate for cases like this." },
  { id: "d1", name: "Standalone calibration rep", chip: "Confirmed", instr: "Make one 1–99% prediction now with a resolution date." },
  { id: "d2", name: "Recall-the-room", chip: "Confirmed", instr: "Look away; list 5 details of where you are. Then check." },
  { id: "d3", name: "Consider-the-opposite on a headline", chip: "Confirmed", instr: "Pick a headline you believe; argue the strongest opposite." },
  { id: "d4", name: "Negative-space scan", chip: "Practitioner", instr: "Note what's missing or absent here, not just what's present." },
  { id: "d5", name: "Alternate uses", chip: "Inference", instr: "Name 6 uses for an object in front of you in 60 seconds." },
  { id: "d6", name: "Calibrated question in vivo", chip: "Practitioner", instr: "Ask one open, non-leading question and just listen." },
  { id: "d7", name: "Key-assumptions check", chip: "Practitioner", instr: "List the 3 assumptions your current plan depends on most." },
];

export function drillForDay(day: number): Drill {
  return DRILLS[day % 8];
}

export interface Technique {
  id: string;
  name: string;
  key: string;
}

export const TECHNIQUES: Technique[] = [
  { id: "t-d1", name: "Baseline + Anomaly", key: "D1" },
  { id: "t-d2", name: "Three Noticings", key: "D2" },
  { id: "t-d3", name: "Problem → Idea Seed", key: "D3" },
  { id: "t-d4", name: "People Note", key: "D4" },
  { id: "t-n1", name: "Retrieval-First Recall", key: "N1" },
  { id: "t-n2", name: "After-Action Review", key: "N2" },
  { id: "t-n3", name: "Calibrated Prediction", key: "N3" },
  { id: "t-n4", name: "Consider-the-Opposite", key: "N4" },
  { id: "t-n5", name: "SCAMPER", key: "N5" },
  { id: "t-h", name: "Habit cue / 66 days", key: "Habit" },
];
