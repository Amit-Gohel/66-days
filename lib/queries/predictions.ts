// Read model for the /predictions log and the home/today dashboards. One query
// fetches every prediction; the log page derives its filtered views on the
// client, while home/today consume the pre-split due/open/resolved buckets.

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz } from "@/lib/domain/dates";
import { meanBrier } from "@/lib/domain/brier";
import type { Prediction } from "@/lib/types";

export interface PredictionsData {
  all: Prediction[]; // every prediction, newest-created first (the log renders from this)
  due: Prediction[]; // open + resolve date reached
  open: Prediction[]; // open + not yet due
  resolved: Prediction[]; // scored
  meanBrier: number | null; // rolling mean Brier over resolved (null if none)
  today: string; // user-local date, used for the due boundary
}

export async function getPredictions(): Promise<PredictionsData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  // RLS limits this to the signed-in user's rows; no explicit user_id filter needed.
  const { data } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false });
  const all = (data as Prediction[] | null) ?? [];

  // "due" = open and its resolve date has arrived (compared in the user's tz).
  const isDue = (p: Prediction) =>
    p.status === "open" && p.resolves_on != null && p.resolves_on <= today;

  return {
    all,
    due: all.filter(isDue),
    open: all.filter((p) => p.status === "open" && !isDue(p)),
    resolved: all.filter((p) => p.status === "resolved"),
    meanBrier: meanBrier(all.filter((p) => p.status === "resolved")),
    today,
  };
}
