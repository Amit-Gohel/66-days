import type { ScamperPrompt } from "@/lib/types";

// The seven SCAMPER lenses (Eberle, 1971, building on Osborn). SCAMPER develops
// an existing idea by forcing it through structured recombination prompts — the
// technique behind the night session's N5 step. Shared by the /ideas guide, the
// develop dropdown, and the per-idea label so the wording stays in one place.
export interface ScamperLens {
  id: ScamperPrompt;
  verb: string; // the short name shown in the dropdown ("Adapt")
  gloss: string; // plain-language meaning
  question: string; // the prompt that actually generates the new idea
}

export const SCAMPER_LENSES: ScamperLens[] = [
  { id: "S", verb: "Substitute", gloss: "Swap out a part, material, step, or rule for something else.", question: "What could I replace?" },
  { id: "C", verb: "Combine", gloss: "Merge two ideas, features, or steps into one.", question: "What could I bring together?" },
  { id: "A", verb: "Adapt", gloss: "Adjust it to a new context, or borrow what already works elsewhere.", question: "What else is like this that I could copy?" },
  { id: "M", verb: "Modify", gloss: "Change its scale, shape, or emphasis — magnify, shrink, or tweak a detail.", question: "What could I exaggerate or tone down?" },
  { id: "P", verb: "Put to other use", gloss: "Use it for a different job, or a different audience, than intended.", question: "Who else could use this, and for what?" },
  { id: "E", verb: "Eliminate", gloss: "Remove parts, cut steps, strip it back to the core.", question: "What could I take away?" },
  { id: "R", verb: "Reverse", gloss: "Flip the order, invert the roles, or do the opposite.", question: "What if I did it backwards?" },
];

export const SCAMPER_BY_ID: Record<string, ScamperLens> = Object.fromEntries(
  SCAMPER_LENSES.map((l) => [l.id, l]),
);
