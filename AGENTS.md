# AGENTS.md

Durable context for any AI coding agent working in this repo.

## What this repo is
A workspace where **specs are authored as markdown in `docs/`** (an Obsidian vault)
and then built into apps. Specs are the source of truth — build from them, don't
invent requirements.

## Tech stack (target for apps built here)
- **Frontend / fullstack:** Next.js (App Router, TypeScript)
- **Backend / DB:** Supabase — Postgres, Auth, Storage
- **Hosting:** Vercel

## Where the specs live
- `docs/01-Projects/<app-name>/` — one folder per app:
  - `index.md` — Map of Content (links to every doc for that app)
  - `prd.md` — product requirements
  - `db-schema.md` — **the Supabase data model** (Mermaid `erDiagram` + RLS + indexes)
  - `specs/<feature>.md` — individual feature specs
- `docs/Templates/` — the canonical skeletons. Don't edit generated specs to match
  code; edit the spec, then rebuild.

## How to read a spec before building
1. Only build specs whose frontmatter says `status: approved`. `draft` = ignore.
2. The `db-schema.md` Mermaid `erDiagram` + RLS/index prose defines exactly which
   Supabase tables, columns, foreign keys, and policies to create. Generate
   migrations to match it.
3. Each feature spec's **Acceptance Criteria** (Given/When/Then) is the test spec —
   implement until every criterion passes, including the error/edge branches.
4. Cross-doc links are **relative Markdown links** (`./db-schema.md`) — follow them.

## Supabase conventions
- Use Supabase Auth — do not hand-roll auth.
- Enable RLS on every table; implement the policies named in `db-schema.md`.
- Keep secrets in `.env.local` (gitignored); never commit keys.
- Use `@supabase/ssr` for server/client separation in the App Router.

## Next.js conventions
- App Router. Server Components for data fetching by default; Client Components
  only for interactivity (`"use client"`).
- Keep the Supabase server client out of Client Components.

## The app (built)
The **66-Day System** app is scaffolded at the repo root (Next.js 16 App Router + Supabase).
See [`README.md`](README.md) for the full run guide and structure. Source of truth for the
data model is [`docs/01-Projects/66-day-system/db-schema.md`](docs/01-Projects/66-day-system/db-schema.md),
implemented by `supabase/migrations/0001_init.sql`.

## Build / test commands
- Install: `npm install`
- Local Supabase (Docker): `supabase start`, then `supabase db reset` to apply migrations
- Dev: `npm run dev` (http://localhost:3000)
- Build: `npm run build` · Serve: `npm run start`
- Lint: `npm run lint` · Typecheck: `npm run typecheck` (`tsc --noEmit`)
- No unit-test runner is configured yet; verify by running the app + `npm run build`.

### Conventions to keep
- Next.js 16 renamed `middleware.ts` → **`proxy.ts`** (root). Auth/session refresh lives there.
- Use `supabase.auth.getClaims()` (never `getSession()`) in server/proxy code.
- ESLint uses Next 16's **native flat configs** (`eslint-config-next/core-web-vitals` + `/typescript`);
  do NOT switch to `FlatCompat` (it hits a circular-config crash under ESLint 9/10).
- Pure domain logic (day/phase/streak/Brier) lives in `lib/domain/` and is fed DB rows by `lib/queries/`.

## gstack (skills & web browsing)
This repo's agents use [gstack](https://github.com/garrytan/gstack). Install it with:
`git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:

- `/office-hours`
- `/plan-ceo-review`
- `/plan-eng-review`
- `/plan-design-review`
- `/design-consultation`
- `/design-shotgun`
- `/design-html`
- `/review`
- `/ship`
- `/land-and-deploy`
- `/canary`
- `/benchmark`
- `/browse`
- `/connect-chrome`
- `/qa`
- `/qa-only`
- `/design-review`
- `/setup-browser-cookies`
- `/setup-deploy`
- `/setup-gbrain`
- `/retro`
- `/investigate`
- `/document-release`
- `/document-generate`
- `/codex`
- `/cso`
- `/autoplan`
- `/plan-devex-review`
- `/devex-review`
- `/careful`
- `/freeze`
- `/guard`
- `/unfreeze`
- `/gstack-upgrade`
- `/learn`

## Do not touch
- `docs/.obsidian/` — Obsidian's own config.
