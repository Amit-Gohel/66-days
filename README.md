# 66-Day Perception & Judgment System

A daily field-diary for sharpening **perception, judgment, people-reading, and calibrated
forecasting** over 66 days — built as a **Next.js + Supabase** web app, styled like an
operator's journal.

It replaces tracking the program in Google Docs/Sheets: log in, do your daytime captures,
run the nightly synthesis, and watch your streak, phase, and Brier calibration build over time.

The methodology (the source of truth this app implements) lives in [`docs/`](docs/) — start at
[`docs/01-Projects/66-day-system/index.md`](docs/01-Projects/66-day-system/index.md). The
canonical spec is [`66-day-system.md`](docs/01-Projects/66-day-system/66-day-system.md); the
data model is [`db-schema.md`](docs/01-Projects/66-day-system/db-schema.md).

## Features

- **Email + password auth** (`@supabase/ssr`) with an onboarding flow that sets your start date and nightly habit cue.
- **Daily captures** — D1 Baseline + Anomaly, D2 Three Noticings, D3 Problem → Idea, D4 People Note, + conditional outreach. Debounced autosave.
- **Night session** — a full-screen, phase-aware ritual: N1 retrieval recall, N2 after-action review, N3 calibrated prediction, N4 consider-the-opposite / two-hypothesis, N5 SCAMPER.
- **Predictions + calibration** — log forecasts with probabilities, resolve them, and see a Brier score, calibration curve, Brier trend, and miss-rate (hand-rolled SVG charts).
- **Weekly review, idea pipeline, journal archive, reading list, 5-phase roadmap, settings** (cue, theme, JSON export, sign-out), and a Day-66 close.
- **Two themes** — "Aged Diary" (light) and "Operator Night" (dark); the night session is always dark.
- **Phase gating** — features unlock as the program progresses (Phase 1 → 5 across 66 days).

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack) + **React 19**
- **Tailwind CSS v4** (CSS-first), `next/font` (Patrick Hand, Kalam, Newsreader, JetBrains Mono, Inter)
- **Supabase** — Postgres, Auth, RLS on every table (`@supabase/ssr`)
- **Vercel** (hosting target)

## Getting started

**Prerequisites:** Node 20+, [Supabase CLI](https://supabase.com/docs/guides/cli), and Docker (for the local Supabase stack).

```bash
# 1. Install dependencies
npm install

# 2. Start the local Supabase stack (Postgres, Auth, Studio) via Docker
supabase start

# 3. Apply the database schema (tables, RLS, triggers)
supabase db reset

# 4. Run the app
npm run dev
```

Then open **http://localhost:3000**, create an account, and you're on Day 1.

`.env.local` is preconfigured for the local stack (`supabase start` prints matching keys).
For production, set the same variables to your hosted project's values:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next 16 flat config) |
| `npm run typecheck` | `tsc --noEmit` |

## Project structure

```
app/                 # App Router: (auth) login/signup, onboarding, (app) authed shell + screens
components/          # ui/ primitives, charts/, shell/, capture/, night/, weekly/, etc.
lib/
  supabase/          # browser + server clients, proxy-session helper
  domain/            # pure logic: dates, phases, streak, brier
  queries/           # server-side reads
  actions/           # Server Actions (mutations)
  static/            # reference content (citations, program, reading, capture specs)
proxy.ts             # Next 16 request proxy — refreshes session + auth/onboarding gating
supabase/migrations/ # 0001_init.sql — the full schema (mirrors docs/.../db-schema.md)
docs/                # the methodology spec vault (Obsidian) — source of truth
```

## Deploying

Host on Vercel with a hosted Supabase project. Before production, enable email confirmations
in Supabase Auth and add a confirm route; locally, confirmations are off so signup logs in instantly.

## License

[MIT](LICENSE)
