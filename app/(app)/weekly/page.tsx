import { getWeeklyData } from "@/lib/queries/weekly";
import { WeeklyReview } from "@/components/weekly/WeeklyReview";
import { FEATURE_UNLOCK_DAY } from "@/lib/domain/phases";
import { ComingSoon } from "@/components/shell/ComingSoon";

export default async function WeeklyPage() {
  const data = await getWeeklyData();
  if (data.day < FEATURE_UNLOCK_DAY.weekly) {
    return (
      <ComingSoon
        title="Weekly review"
        note="Unlocks in Phase 2 (Day 15). Your first Sunday synthesis lands around Day 21."
      />
    );
  }
  return <WeeklyReview data={data} />;
}
