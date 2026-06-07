"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser } from "@/lib/queries/profile";
import { todayInTz, addDays } from "@/lib/domain/dates";

export async function completeOnboarding(formData: FormData) {
  const user = await getClaimsUser();
  if (!user) redirect("/login");

  const cue = String(formData.get("cue") ?? "").trim();
  const startChoice = String(formData.get("start") ?? "today");
  const customDate = String(formData.get("customDate") ?? "");
  const timezone = String(formData.get("timezone") ?? "UTC") || "UTC";

  const today = todayInTz(timezone);
  let startDate = today;
  if (startChoice === "tomorrow") startDate = addDays(today, 1);
  else if (startChoice === "custom" && customDate) startDate = customDate;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      start_date: startDate,
      habit_cue: cue ? `After I ${cue}` : "After I brush my teeth",
      timezone,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  redirect("/home");
}
