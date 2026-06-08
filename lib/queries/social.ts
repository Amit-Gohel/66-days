import { createClient } from "@/lib/supabase/server";
import { getClaimsUser, getProfile } from "./profile";
import { todayInTz } from "@/lib/domain/dates";
import { sharedStreak } from "@/lib/domain/gamification";

export interface LeaderboardRow {
  rank: number;
  userId: string;
  displayName: string;
  points: number;
  streak: number;
  isMe: boolean;
}

export interface LeaderboardData {
  rows: LeaderboardRow[];
  optedIn: boolean;
  displayName: string | null;
  myUserId: string;
}

/** The opt-in leaderboard: opted-in users only, ranked by Craft Points. No content, no PII. */
export async function getLeaderboard(): Promise<LeaderboardData> {
  const supabase = await createClient();
  const [user, profile] = await Promise.all([getClaimsUser(), getProfile()]);
  const myUserId = user?.id ?? "";

  const { data } = await supabase
    .from("leaderboard_entries")
    .select("user_id, display_name, points, streak")
    .order("points", { ascending: false })
    .order("streak", { ascending: false });

  const entries = (data as { user_id: string; display_name: string; points: number; streak: number }[] | null) ?? [];
  const rows: LeaderboardRow[] = entries.map((e, i) => ({
    rank: i + 1,
    userId: e.user_id,
    displayName: e.display_name,
    points: e.points,
    streak: e.streak,
    isMe: e.user_id === myUserId,
  }));

  return {
    rows,
    optedIn: profile?.show_on_leaderboard ?? false,
    displayName: profile?.display_name ?? null,
    myUserId,
  };
}

export interface BuddyView {
  connectionId: string;
  buddyId: string;
  displayName: string;
  sharedStreak: number;
}

export interface BuddyRequestView {
  connectionId: string;
  buddyId: string;
  displayName: string;
}

export interface BuddyData {
  myUserId: string;
  accepted: BuddyView[];
  incoming: BuddyRequestView[];
  outgoing: BuddyRequestView[];
}

interface SummaryRow {
  connection_id: string;
  buddy_id: string;
  display_name: string;
  status: string;
  is_incoming: boolean;
}

/** The caller's buddy connections, with cooperative shared streaks for accepted pairs. */
export async function getBuddies(): Promise<BuddyData> {
  const supabase = await createClient();
  const [user, profile] = await Promise.all([getClaimsUser(), getProfile()]);
  const myUserId = user?.id ?? "";
  const todayISO = todayInTz(profile?.timezone ?? "UTC");

  const { data } = await supabase.rpc("buddy_summary");
  const summary = (data as SummaryRow[] | null) ?? [];

  const incoming: BuddyRequestView[] = [];
  const outgoing: BuddyRequestView[] = [];
  const acceptedRows: SummaryRow[] = [];
  for (const r of summary) {
    if (r.status === "accepted") acceptedRows.push(r);
    else if (r.is_incoming) incoming.push({ connectionId: r.connection_id, buddyId: r.buddy_id, displayName: r.display_name });
    else outgoing.push({ connectionId: r.connection_id, buddyId: r.buddy_id, displayName: r.display_name });
  }

  // My completion dates (a day counts if captured OR a night session was completed).
  let mine = new Set<string>();
  if (acceptedRows.length > 0) {
    const [entriesRes, nightsRes] = await Promise.all([
      supabase.from("day_entries").select("entry_date"),
      supabase.from("night_sessions").select("entry_date").not("completed_at", "is", null),
    ]);
    mine = new Set([
      ...((entriesRes.data as { entry_date: string }[] | null) ?? []).map((r) => r.entry_date),
      ...((nightsRes.data as { entry_date: string }[] | null) ?? []).map((r) => r.entry_date),
    ]);
  }

  const accepted: BuddyView[] = await Promise.all(
    acceptedRows.map(async (r) => {
      const { data: theirDates } = await supabase.rpc("buddy_completion_dates", { p_buddy: r.buddy_id });
      const theirs = new Set(((theirDates as { entry_date: string }[] | null) ?? []).map((d) => d.entry_date));
      return {
        connectionId: r.connection_id,
        buddyId: r.buddy_id,
        displayName: r.display_name,
        sharedStreak: sharedStreak(mine, theirs, todayISO),
      };
    }),
  );

  return { myUserId, accepted, incoming, outgoing };
}
