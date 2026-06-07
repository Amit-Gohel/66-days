import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export interface ClaimsUser {
  id: string;
  email: string;
}

/** The authenticated user from validated JWT claims (safe in server code). */
export async function getClaimsUser(): Promise<ClaimsUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub as string, email: (claims.email as string) ?? "" };
}

/** The current user's profile row (RLS scopes it to them). Null if none. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").maybeSingle();
  return (data as Profile | null) ?? null;
}
