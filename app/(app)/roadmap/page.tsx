import { getProfile } from "@/lib/queries/profile";
import { todayInTz, dayNumber } from "@/lib/domain/dates";
import { phaseForDay } from "@/lib/domain/phases";
import { RoadmapView } from "@/components/roadmap/RoadmapView";

export default async function RoadmapPage() {
  const profile = await getProfile();
  const day = dayNumber(profile?.start_date ?? null, todayInTz(profile?.timezone ?? "UTC"));
  return <RoadmapView currentPhase={phaseForDay(day)} />;
}
