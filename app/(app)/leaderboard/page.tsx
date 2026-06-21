import { redirect } from "next/navigation";

// The cohort + buddy features now live in the folded "Look back" area.
export default function LeaderboardPage() {
  redirect("/look-back");
}
