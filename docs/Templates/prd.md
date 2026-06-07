---
type: prd
status: draft         # draft | approved | building | shipped
app: <app-name>
area: [product]
priority: medium
related: []
created: <% tp.date.now("YYYY-MM-DD") %>
---

# <% tp.file.title %> — PRD

## 1. Summary
<!-- One paragraph: what we're building and for whom. -->

## 2. Goals & Non-Goals
**Goals**
- 

**Non-Goals (explicitly out of scope)**
- 

## 3. Target User
<!-- Who is this for? Primary persona and their job-to-be-done. -->

## 4. Success Metrics
<!-- How do we know it worked? Concrete, measurable. -->

## 5. Core Features
<!-- High level. Each feature links to a detailed spec in ./specs/ -->
- **Feature A** — [spec](./specs/feature-a.md)
- **Feature B** — [spec](./specs/feature-b.md)

## 6. Tech Stack
- **Frontend:** Next.js (App Router)
- **Backend / DB:** Supabase (Postgres, Auth, Storage)
- **Hosting:** Vercel
- **Data model:** [db-schema.md](./db-schema.md)

## 7. Open Questions
- 
