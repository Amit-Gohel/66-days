-- 0003_social.sql — Tier 2 (opt-in social): leaderboard + cooperative buddy streaks
-- Everything here is OPT-IN and default-off. No table ever exposes journal content —
-- only a chosen display name, derived Craft Points, and streak numbers.

-- ============================================================
-- profiles: social preferences (opt-in)
-- ============================================================
alter table public.profiles
  add column display_name text,
  add column show_on_leaderboard boolean not null default false;

-- ============================================================
-- leaderboard_entries — public projection of opted-in users only.
-- Presence in this table == opted in (opting out deletes the row). Points/streak are
-- computed in TypeScript (single source of truth: lib/domain/gamification.ts) and
-- upserted by lib/actions/social.ts. No journal content is ever stored here.
-- ============================================================
create table public.leaderboard_entries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  points integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create index leaderboard_points_idx on public.leaderboard_entries (points desc);

create trigger trg_leaderboard_updated before update on public.leaderboard_entries
  for each row execute function public.set_updated_at();

alter table public.leaderboard_entries enable row level security;

-- Any signed-in user may read the board (rows exist only for opted-in users).
create policy leaderboard_select_authed on public.leaderboard_entries
  for select using (auth.uid() is not null);
-- You may only write/remove your OWN row.
create policy leaderboard_insert_own on public.leaderboard_entries
  for insert with check (auth.uid() = user_id);
create policy leaderboard_update_own on public.leaderboard_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy leaderboard_delete_own on public.leaderboard_entries
  for delete using (auth.uid() = user_id);

-- ============================================================
-- buddy_connections — opt-in cooperative pairs (invite → accept).
-- ============================================================
create table public.buddy_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'ended')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index buddy_requester_idx on public.buddy_connections (requester_id);
create index buddy_addressee_idx on public.buddy_connections (addressee_id);

alter table public.buddy_connections enable row level security;

-- Either party may read; only the requester creates; either party may update/remove.
create policy buddy_select_party on public.buddy_connections
  for select using (auth.uid() in (requester_id, addressee_id));
create policy buddy_insert_requester on public.buddy_connections
  for insert with check (auth.uid() = requester_id);
create policy buddy_update_party on public.buddy_connections
  for update using (auth.uid() in (requester_id, addressee_id))
  with check (auth.uid() in (requester_id, addressee_id));
create policy buddy_delete_party on public.buddy_connections
  for delete using (auth.uid() in (requester_id, addressee_id));

-- ============================================================
-- buddy_summary() — the caller's pending/accepted connections with the OTHER party's
-- display name resolved (SECURITY DEFINER reads profiles.display_name only).
-- ============================================================
create or replace function public.buddy_summary()
returns table (
  connection_id uuid,
  buddy_id uuid,
  display_name text,
  status text,
  is_incoming boolean
)
language sql security definer set search_path = public as $$
  select
    c.id,
    case when c.requester_id = auth.uid() then c.addressee_id else c.requester_id end,
    coalesce(p.display_name, 'Operator'),
    c.status,
    (c.addressee_id = auth.uid())
  from public.buddy_connections c
  join public.profiles p
    on p.id = case when c.requester_id = auth.uid() then c.addressee_id else c.requester_id end
  where auth.uid() in (c.requester_id, c.addressee_id)
    and c.status in ('pending', 'accepted');
$$;

-- ============================================================
-- buddy_completion_dates(p_buddy) — the DATES a buddy completed (never the content),
-- only when an accepted connection exists between the caller and that buddy. Used to
-- compute a cooperative shared streak in TypeScript.
-- ============================================================
create or replace function public.buddy_completion_dates(p_buddy uuid)
returns table (entry_date date)
language sql security definer set search_path = public as $$
  with allowed as (
    select 1 from public.buddy_connections c
    where c.status = 'accepted'
      and ((c.requester_id = auth.uid() and c.addressee_id = p_buddy)
        or (c.addressee_id = auth.uid() and c.requester_id = p_buddy))
  )
  select e.entry_date from public.day_entries e
    where e.user_id = p_buddy and exists (select 1 from allowed)
  union
  select n.entry_date from public.night_sessions n
    where n.user_id = p_buddy and n.completed_at is not null and exists (select 1 from allowed);
$$;

grant execute on function public.buddy_summary() to authenticated;
grant execute on function public.buddy_completion_dates(uuid) to authenticated;
