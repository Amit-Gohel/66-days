# 01-Projects

One folder per app you're building. Each app folder follows this shape so the
coding agent can read it as one coherent context:

```
01-Projects/<app-name>/
├─ index.md         <- Map of Content: relative Markdown links to every doc below
├─ prd.md           <- product requirements (from Templates/prd.md)
├─ db-schema.md     <- Supabase data model (from Templates/db-schema.md)
└─ specs/
   └─ <feature>.md  <- one feature spec (from Templates/feature-spec.md)
```

**Workflow:** draft specs here → set `status: approved` in the frontmatter when a
spec is genuinely ground truth → point Claude Code at this folder to build it.

Only `status: approved` docs should be treated as buildable. `draft` = still thinking.
