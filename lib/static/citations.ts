// Evidence chips — the system's claim-by-claim sourcing (from the audit ledger).

export type Tier =
  | "Confirmed"
  | "Practitioner"
  | "Inference"
  | "Speculative"
  | "CONTESTED";

export const CHIP_COLORS: Record<Tier, string> = {
  Confirmed: "var(--chip-confirmed)",
  Practitioner: "var(--chip-practitioner)",
  Inference: "var(--chip-inference)",
  Speculative: "var(--chip-speculative)",
  CONTESTED: "var(--chip-contested)",
};

export interface Citation {
  tier: Tier;
  src: string;
}

export const CITATIONS: Record<string, Citation> = {
  D1: {
    tier: "Confirmed",
    src: "Van Horne & Riley, Left of Bang (2014); Endsley, situation awareness (1995)",
  },
  D2: { tier: "Confirmed", src: "Endsley, situation awareness (1995)" },
  D3: {
    tier: "Inference",
    src: "Diehl & Stroebe, productivity loss in brainstorming (1987)",
  },
  D4: {
    tier: "CONTESTED",
    src: "Navarro, What Every BODY Is Saying (2008); caveat: Bond & DePaulo (2006) — lie-detection accuracy ≈54%, barely above chance",
  },
  N1: { tier: "Confirmed", src: "Roediger & Karpicke, testing effect (2006)" },
  N2: {
    tier: "Practitioner",
    src: "US Army TC 25-20, A Leader's Guide to AAR (1993)",
  },
  N3: {
    tier: "Confirmed",
    src: "Tetlock & Gardner, Superforecasting (2015); Brier (1950)",
  },
  N4: {
    tier: "Confirmed",
    src: "Lord, Lepper & Preston, considering the opposite (1984)",
  },
  N5: {
    tier: "Inference",
    src: "Eberle, SCAMPER (1971); Osborn, Applied Imagination (1953)",
  },
  Habit: {
    tier: "Confirmed",
    src: "Lally et al., habit formation (2010); Gollwitzer & Sheeran, implementation intentions (2006)",
  },
};
