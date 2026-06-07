import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([getClaimsUser(), getProfile()]);
  const cueHabit = (profile?.habit_cue ?? "After I brush my teeth").replace(/^After I /i, "");
  return <SettingsView email={user?.email ?? ""} cueHabit={cueHabit} />;
}
