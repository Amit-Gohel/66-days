-- 0002_gamification.sql — Tier 1 (solo) gamification
-- Adds the achievements ledger. Craft Points, ranks, streak freezes, and badge
-- eligibility are all DERIVED in lib/domain/gamification.ts (nothing else stored),
-- consistent with the rest of the app (day-number, phase, streak, heatmap are derived).
-- `key` is owned by the app's ACHIEVEMENTS definitions; rows are inserted idempotently
-- by lib/actions/gamification.ts the first time a milestone is reached.

-- ============================================================
-- achievements — one row per (user, badge) once unlocked
-- ============================================================
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null,
  unlocked_on date not null,
  seen boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, key)
);

create index achievements_user_idx on public.achievements (user_id);

-- ============================================================
-- Row-Level Security — owner-only, same pattern as the core tables
-- ============================================================
alter table public.achievements enable row level security;

create policy achievements_select_own on public.achievements
  for select using (auth.uid() = user_id);
create policy achievements_insert_own on public.achievements
  for insert with check (auth.uid() = user_id);
create policy achievements_update_own on public.achievements
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy achievements_delete_own on public.achievements
  for delete using (auth.uid() = user_id);
