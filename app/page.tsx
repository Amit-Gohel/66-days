import { redirect } from "next/navigation";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";

// Entry router: send users to the right place based on auth + onboarding state.
export default async function Index() {
  const user = await getClaimsUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !profile.onboarding_completed) redirect("/onboarding");

  redirect("/home");
}
