-- 0001_init.sql — 66-Day Perception & Judgment System
-- Full schema, RLS, generated columns, and profile auto-creation.
-- Models the entire system up front (some features' UI ships in later milestones).

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  start_date date,
  habit_cue text,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  timezone text not null default 'UTC',
  minimum_mode boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- day_entries — daytime captures D1–D4 (one per user per date)
-- ============================================================
create table public.day_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  day_number smallint,
  phase smallint,
  -- D1 Baseline + Anomaly
  d1_place text,
  d1_baseline text,
  d1_anomaly text,
  d1_so_what text,
  d1_domain text check (
    d1_domain in (
      'kinesics', 'biometrics', 'proxemics',
      'geographics', 'iconography', 'atmospherics'
    )
  ),
  -- D2 Three Noticings
  d2_noticing_1 text,
  d2_noticing_2 text,
  d2_noticing_3 text,
  -- D3 Problem → Idea seed
  d3_problem text,
  d3_solution text,
  -- D4 People Note
  d4_person text,
  d4_baseline text,
  d4_shift_topic text,
  d4_open_question text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- ============================================================
-- night_sessions — N1, N2, N4, N5 (one per user per date). N3 → predictions.
-- ============================================================
create table public.night_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  -- N1 Retrieval-first recall
  n1_recalled_text text,
  n1_missed_items text,
  n1_recalled_count smallint,
  n1_total_count smallint,
  n1_miss_rate numeric generated always as (
    case
      when n1_total_count is null or n1_total_count = 0 then null
      else (n1_total_count - coalesce(n1_recalled_count, 0))::numeric / n1_total_count
    end
  ) stored,
  -- N2 After-Action Review
  n2_intended text,
  n2_happened text,
  n2_why_gap text,
  n2_sustain text,
  n2_improve text,
  -- N4 Consider-the-opposite / two-hypothesis (both variants)
  n4_variant text check (n4_variant in ('opposite', 'two_hypothesis')),
  n4_belief text,
  n4_against text,
  n4_evidence text,
  n4_hyp_a text,
  n4_hyp_b text,
  n4_diagnostic_test text,
  -- N5 SCAMPER
  n5_idea text,
  n5_prompt text check (n5_prompt in ('S', 'C', 'A', 'M', 'P', 'E', 'R')),
  n5_result text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

-- ============================================================
-- predictions — N3 calibrated forecasts + Brier scoring
-- ============================================================
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  claim text not null,
  probability smallint not null check (probability between 1 and 99),
  logged_date date not null,
  resolves_on date,
  status text not null default 'open' check (status in ('open', 'resolved')),
  outcome boolean,
  resolved_at timestamptz,
  brier_score numeric generated always as (
    case
      when outcome is null then null
      else power(probability::numeric / 100 - (case when outcome then 1 else 0 end), 2)
    end
  ) stored,
  created_at timestamptz not null default now()
);

-- ============================================================
-- outreach — conditional, value-first (target 2–3/week)
-- ============================================================
create table public.outreach (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  who text,
  why_now text,
  value_offered text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- weekly_reviews — Sunday synthesis (one per user per ISO week)
-- ============================================================
create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  spaced_reread_done boolean not null default false,
  recall_7day text,
  recall_30day text,
  brier_resolved_count smallint,
  brier_total_count smallint,
  confidence_assessment text,
  best_idea text,
  pattern_3plus text,
  elicitation_noticed text,
  system_aar_sustain text,
  system_aar_improve text,
  outreach_count smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- ============================================================
-- ideas — seeds (D3) → culled → developed (N5 SCAMPER) → top-3
-- ============================================================
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  source_day_entry_id uuid references public.day_entries (id) on delete set null,
  day_number smallint,
  lane text not null default 'seed' check (lane in ('seed', 'culled', 'developed')),
  scamper_prompt text check (scamper_prompt in ('S', 'C', 'A', 'M', 'P', 'E', 'R')),
  scamper_result text,
  is_top3 boolean not null default false,
  top3_rank smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- drills — optional rotating micro-drills
-- ============================================================
create table public.drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  drill_type text,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- indexes
-- ============================================================
create index day_entries_user_date_idx on public.day_entries (user_id, entry_date desc);
create index night_sessions_user_date_idx on public.night_sessions (user_id, entry_date desc);
create index predictions_user_status_idx on public.predictions (user_id, status, resolves_on);
create index outreach_user_date_idx on public.outreach (user_id, entry_date desc);
create index ideas_user_lane_idx on public.ideas (user_id, lane);
create index weekly_user_week_idx on public.weekly_reviews (user_id, week_start desc);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_day_entries_updated before update on public.day_entries
  for each row execute function public.set_updated_at();
create trigger trg_night_sessions_updated before update on public.night_sessions
  for each row execute function public.set_updated_at();
create trigger trg_weekly_updated before update on public.weekly_reviews
  for each row execute function public.set_updated_at();
create trigger trg_ideas_updated before update on public.ideas
  for each row execute function public.set_updated_at();

-- ============================================================
-- profile auto-create on signup (SECURITY DEFINER bypasses RLS)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.day_entries enable row level security;
alter table public.night_sessions enable row level security;
alter table public.predictions enable row level security;
alter table public.outreach enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.ideas enable row level security;
alter table public.drills enable row level security;

-- profiles keyed on id (= auth.uid())
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- every other table: full CRUD restricted to the owner (user_id = auth.uid())
do $$
declare
  t text;
begin
  foreach t in array array[
    'day_entries', 'night_sessions', 'predictions',
    'outreach', 'weekly_reviews', 'ideas', 'drills'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id);',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id);',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id);',
      t || '_delete_own', t);
  end loop;
end;
$$;
