# CLAUDE.md

> Specs live in `docs/` (an Obsidian vault). See **AGENTS.md** for full repo context.

## Active project
**66-Day Perception & Judgment System** → start at `docs/01-Projects/66-day-system/index.md`.
- Canonical ground truth: `docs/01-Projects/66-day-system/66-day-system.md` (`status: canonical`).
- It was merged & audited from three research drafts kept in `.../66-day-system/source-of-truth/` — those are provenance; where a draft conflicts with the canonical doc, the canonical doc wins.

## The one rule
Build apps from the markdown specs in `docs/01-Projects/<app-name>/`. The specs are
ground truth — implement what they say, ask before inventing requirements they omit.

## Before building any feature
1. Read the app's `index.md`, then its `prd.md`, then the relevant `specs/<feature>.md`.
2. Only act on specs with frontmatter `status: approved` (skip `draft`).
3. Treat `db-schema.md` (Mermaid `erDiagram` + RLS) as the exact Supabase schema to create.
4. Treat each spec's Given/When/Then **Acceptance Criteria** as the tests to satisfy —
   cover happy path, errors, and edge cases.

## Stack defaults
- Next.js App Router + TypeScript; Server Components by default.
- Supabase for Postgres/Auth/Storage; RLS on every table; `@supabase/ssr` for the App Router.
- Secrets in `.env.local` only.

## Links
- Cross-references in the vault are relative Markdown links — follow them on disk.
