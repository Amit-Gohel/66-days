import type { Tier } from "./citations";

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  skill: string;
  chip: Tier;
  note: string;
}

export const READING_GROUPS = ["Perception", "Judgment", "People-reading", "Forecasting", "Creativity"];

export const READING: Book[] = [
  { id: "r1", title: "Thinking in Bets", author: "Annie Duke", year: 2018, skill: "Forecasting", chip: "Practitioner", note: "Decide as bets; separate decision quality from outcome." },
  { id: "r2", title: "Superforecasting", author: "Tetlock & Gardner", year: 2015, skill: "Forecasting", chip: "Confirmed", note: "Calibration, Brier scoring, the outside view." },
  { id: "r3", title: "The Gift of Fear", author: "Gavin de Becker", year: 1997, skill: "People-reading", chip: "Practitioner", note: "Pre-incident indicators; trust intuition built on signal." },
  { id: "r4", title: "Sources of Power", author: "Gary Klein", year: 1998, skill: "Judgment", chip: "Practitioner", note: "Recognition-primed decisions under pressure." },
  { id: "r5", title: "What Every BODY Is Saying", author: "Joe Navarro", year: 2008, skill: "People-reading", chip: "CONTESTED", note: "Useful vocabulary; lie-detection claims are weak (~54%)." },
  { id: "r6", title: "A Technique for Producing Ideas", author: "James Webb Young", year: 1965, skill: "Creativity", chip: "Inference", note: "Combinatorial idea-making in five steps." },
  { id: "r7", title: "Left of Bang", author: "Van Horne & Riley", year: 2014, skill: "Perception", chip: "Practitioner", note: "Baselines and anomalies; the source of D1." },
];
