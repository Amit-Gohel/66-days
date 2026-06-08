import { getLeaderboard, getBuddies } from "@/lib/queries/social";
import { CohortView } from "@/components/social/CohortView";

export default async function LeaderboardPage() {
  const [leaderboard, buddies] = await Promise.all([getLeaderboard(), getBuddies()]);
  return <CohortView leaderboard={leaderboard} buddies={buddies} />;
}
