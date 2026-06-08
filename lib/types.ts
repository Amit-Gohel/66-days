// Database row types (mirror supabase/migrations/0001_init.sql) + derived app types.

export type Theme = "light" | "dark";
export type Domain =
  | "kinesics"
  | "biometrics"
  | "proxemics"
  | "geographics"
  | "iconography"
  | "atmospherics";
export type ScamperPrompt = "S" | "C" | "A" | "M" | "P" | "E" | "R";
export type PredictionStatus = "open" | "resolved";
export type IdeaLane = "seed" | "culled" | "developed";
export type N4Variant = "opposite" | "two_hypothesis";

export interface Profile {
  id: string;
  start_date: string | null;
  habit_cue: string | null;
  theme: Theme;
  timezone: string;
  minimum_mode: boolean;
  onboarding_completed: boolean;
  display_name: string | null;
  show_on_leaderboard: boolean;
  created_at: string;
  updated_at: string;
}

export interface DayEntry {
  id: string;
  user_id: string;
  entry_date: string;
  day_number: number | null;
  phase: number | null;
  d1_place: string | null;
  d1_baseline: string | null;
  d1_anomaly: string | null;
  d1_so_what: string | null;
  d1_domain: Domain | null;
  d2_noticing_1: string | null;
  d2_noticing_2: string | null;
  d2_noticing_3: string | null;
  d3_problem: string | null;
  d3_solution: string | null;
  d4_person: string | null;
  d4_baseline: string | null;
  d4_shift_topic: string | null;
  d4_open_question: string | null;
  created_at: string;
  updated_at: string;
}

export interface NightSession {
  id: string;
  user_id: string;
  entry_date: string;
  n1_recalled_text: string | null;
  n1_missed_items: string | null;
  n1_recalled_count: number | null;
  n1_total_count: number | null;
  n1_miss_rate: number | null;
  n2_intended: string | null;
  n2_happened: string | null;
  n2_why_gap: string | null;
  n2_sustain: string | null;
  n2_improve: string | null;
  n4_variant: N4Variant | null;
  n4_belief: string | null;
  n4_against: string | null;
  n4_evidence: string | null;
  n4_hyp_a: string | null;
  n4_hyp_b: string | null;
  n4_diagnostic_test: string | null;
  n5_idea: string | null;
  n5_prompt: ScamperPrompt | null;
  n5_result: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  claim: string;
  probability: number;
  logged_date: string;
  resolves_on: string | null;
  status: PredictionStatus;
  outcome: boolean | null;
  resolved_at: string | null;
  brier_score: number | null;
  created_at: string;
}

export interface Outreach {
  id: string;
  user_id: string;
  entry_date: string;
  who: string | null;
  why_now: string | null;
  value_offered: string | null;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  spaced_reread_done: boolean;
  recall_7day: string | null;
  recall_30day: string | null;
  brier_resolved_count: number | null;
  brier_total_count: number | null;
  confidence_assessment: string | null;
  best_idea: string | null;
  pattern_3plus: string | null;
  elicitation_noticed: string | null;
  system_aar_sustain: string | null;
  system_aar_improve: string | null;
  outreach_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  text: string;
  source_day_entry_id: string | null;
  day_number: number | null;
  lane: IdeaLane;
  scamper_prompt: ScamperPrompt | null;
  scamper_result: string | null;
  is_top3: boolean;
  top3_rank: number | null;
  created_at: string;
  updated_at: string;
}

/** A row in the achievements ledger (gamification Tier 1). */
export interface Achievement {
  id: string;
  user_id: string;
  key: string;
  unlocked_on: string;
  seen: boolean;
  created_at: string;
}

/** Derived header/dashboard view-model passed into UI components. */
export interface AppState {
  day: number;
  phase: number;
  streak: number;
  graceActive: boolean;
  freezesAvailable: number;
  cue: string;
  email: string;
  theme: Theme;
  todayISO: string;
}

export type HeatState =
  | "completed"
  | "partial"
  | "frozen"
  | "missed-once"
  | "missed-twice"
  | "future";

export interface HeatCell {
  id: string;
  day: number;
  phase: number;
  state: HeatState;
}
