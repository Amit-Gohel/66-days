"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "@/lib/queries/profile";
import { loadGameStats } from "@/lib/queries/gamification";
import { craftPoints } from "@/lib/domain/gamification";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanName = (s: string) => s.trim().replace(/\s+/g, " ").slice(0, 40);

/** Current Craft Points + streak for the signed-in user (single source of truth). */
async function myScore() {
  const { stats } = await loadGameStats();
  return { points: craftPoints(stats), streak: stats.streak };
}

/**
 * Opt in/out of the leaderboard. Opt-in requires a display name and publishes the
 * user's current Craft Points + streak; opt-out removes their row entirely (presence
 * in leaderboard_entries == opted in). Nothing here exposes journal content.
 */
export async function setLeaderboardOptIn(optIn: boolean, displayName?: string) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const supabase = await createClient();

  if (optIn) {
    const name = cleanName(displayName ?? "");
    if (!name) return { ok: false as const, error: "Choose a display name first." };

    await supabase.from("profiles").update({ show_on_leaderboard: true, display_name: name }).eq("id", user.id);
    const { points, streak } = await myScore();
    const { error } = await supabase.from("leaderboard_entries").upsert(
      { user_id: user.id, display_name: name, points, streak, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
  } else {
    await supabase.from("profiles").update({ show_on_leaderboard: false }).eq("id", user.id);
    await supabase.from("leaderboard_entries").delete().eq("user_id", user.id);
  }

  revalidatePath("/leaderboard");
  revalidatePath("/home");
  return { ok: true as const };
}

/** Refresh the user's leaderboard row with fresh points/streak (called on home mount). No-op if opted out. */
export async function refreshLeaderboardEntry() {
  const user = await getClaimsUser();
  if (!user) return { ok: false as const };
  const profile = await getProfile();
  if (!profile?.show_on_leaderboard) return { ok: false as const };

  const supabase = await createClient();
  const { points, streak } = await myScore();
  await supabase.from("leaderboard_entries").upsert(
    {
      user_id: user.id,
      display_name: profile.display_name ?? "Operator",
      points,
      streak,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  return { ok: true as const };
}

/** Send a buddy request to another user by their buddy ID. Cooperative, opt-in. */
export async function sendBuddyRequest(buddyId: string) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const id = buddyId.trim();
  if (!UUID_RE.test(id)) return { ok: false as const, error: "That doesn't look like a valid buddy ID." };
  if (id === user.id) return { ok: false as const, error: "You can't add yourself as a buddy." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("buddy_connections")
    .insert({ requester_id: user.id, addressee_id: id });
  if (error) {
    // unique violation (already invited) or FK violation (no such user)
    if (error.code === "23505") return { ok: false as const, error: "You've already sent this person a request." };
    if (error.code === "23503") return { ok: false as const, error: "No user found with that buddy ID." };
    return { ok: false as const, error: "Couldn't send the request." };
  }

  revalidatePath("/leaderboard");
  return { ok: true as const };
}

/** Accept or decline an incoming buddy request. */
export async function respondBuddyRequest(connectionId: string, accept: boolean) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const supabase = await createClient();

  const { error } = await supabase
    .from("buddy_connections")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("addressee_id", user.id) // only the invitee may respond
    .eq("status", "pending");
  if (error) throw new Error(error.message);

  revalidatePath("/leaderboard");
  return { ok: true as const };
}

/** End an accepted (or pending) buddy connection — either party, no penalty. */
export async function endBuddy(connectionId: string) {
  const user = await getClaimsUser();
  if (!user) throw new Error("Not authenticated.");
  const supabase = await createClient();

  const { error } = await supabase
    .from("buddy_connections")
    .update({ status: "ended", responded_at: new Date().toISOString() })
    .eq("id", connectionId);
  if (error) throw new Error(error.message);

  revalidatePath("/leaderboard");
  return { ok: true as const };
}
