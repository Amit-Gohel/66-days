import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { todayInTz } from "@/lib/domain/dates";
import { meanBrier } from "@/lib/domain/brier";
import type { Prediction } from "@/lib/types";

export interface PredictionsData {
  due: Prediction[];
  open: Prediction[];
  resolved: Prediction[];
  meanBrier: number | null;
}

export async function getPredictions(): Promise<PredictionsData> {
  const supabase = await createClient();
  const profile = await getProfile();
  const today = todayInTz(profile?.timezone ?? "UTC");

  const { data } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false });
  const all = (data as Prediction[] | null) ?? [];

  const isDue = (p: Prediction) =>
    p.status === "open" && p.resolves_on != null && p.resolves_on <= today;

  return {
    due: all.filter(isDue),
    open: all.filter((p) => p.status === "open" && !isDue(p)),
    resolved: all.filter((p) => p.status === "resolved"),
    meanBrier: meanBrier(all.filter((p) => p.status === "resolved")),
  };
}
