import { redirect } from "next/navigation";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { AppShell } from "@/components/shell/AppShell";
import { ThemeProvider } from "@/components/shell/ThemeProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getClaimsUser();
  if (!user) redirect("/login");

  const profile = await getProfile();
  if (!profile || !profile.onboarding_completed) redirect("/onboarding");

  return (
    <ThemeProvider initial={profile.theme}>
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
