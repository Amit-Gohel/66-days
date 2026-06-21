import { getLeaderboard, getBuddies } from "@/lib/queries/social";
import { LookBackView } from "@/components/social/LookBackView";

export default async function LookBackPage() {
  const [leaderboard, buddies] = await Promise.all([getLeaderboard(), getBuddies()]);
  return <LookBackView leaderboard={leaderboard} buddies={buddies} />;
}
