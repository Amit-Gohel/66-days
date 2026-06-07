---
type: index
role: map-of-content
app: 66-day-system
tags: [moc, source-of-truth]
created: 2026-06-07
---

# 66-Day Perception & Judgment System — Project Map

**Read this first.** This project's ground truth is a daily journaling/training system for sharper perception, judgment, people-reading, and calibrated forecasting. It was produced by auditing and merging **three independent research drafts** (the *source of truth*) into **one verified final system** (the *goal*).

## 🎯 The Goal — what to achieve / build

- **[66-Day Perception & Judgment System](./66-day-system.md)** — `status: canonical`
  The merged, claim-by-claim-audited final system. **This is the authoritative spec.** When in doubt, this file wins over any single draft. Its **Appendix A** is the audit ledger (every claim → primary source → verdict); its **Appendix B** holds the copy-paste daily & weekly journal templates.

## 📚 Source of Truth — the three foundational drafts

These are the *inputs* the goal was built from. Keep them for provenance and for understanding *why* the final system made each choice. Where a draft conflicts with the final system, **the final system is correct** (the conflicts were resolved on the evidence — see the goal doc's "key conflicts" section).

- **[Draft 1 — 50-Day, evidence-first](./source-of-truth/draft-1-50-day-evidence-based.md)**
  Strongest on research grounding. Got the 66-day figure slightly wrong ("median" → audit corrected to "mean"). Exact deliberate-practice variance stats.
- **[Draft 2 — Cognitive Skills, intelligence-tradecraft](./source-of-truth/draft-2-cognitive-skills-tradecraft.md)**
  Most ambitious (Micro-ACH as the engine, Scharff elicitation). The audit **corrected** it: the 6th Combat Hunter domain is *Iconography* (not "Heuristics"); ACH "dismantles bias" was overstated; the daily deliberate-deception drill was dropped on ethics/sustainability. Its accurate contribution: the current doctrinal source (MCTP 3-01A, 2020).
- **[Draft 3 — Operator's Journal](./source-of-truth/draft-3-operators-journal.md)**
  The most accurate of the three. Used "mean" correctly, precise spacing/retrieval figures, and the honest "expect domain-specific gains, not far transfer" posture the final system adopted.

## 🔗 How they relate

```
Draft 1 ─┐
Draft 2 ─┼──▶ audited claim-by-claim (→ ledger in 66-day-system.md Appendix A) ──▶ 66-day-system.md  (canonical goal)
Draft 3 ─┘
```

## 🛠️ When building from this

The 66-Day system is the methodology to implement (this is a Next.js + Supabase project). Until a software spec exists, treat `66-day-system.md` as the product source of truth — its **Appendix B templates** (daily captures, night session, weekly review, prediction log with Brier scoring) define the core data the app must support. Add a `prd.md` and `db-schema.md` here (from `../../Templates/`) when ready to scope the app.

## 📝 File rename map (from the original root files)

| Original file | Now |
|---|---|
| `66-Day-Perception-and-Judgment-System.md` | `66-day-system.md` |
| `50-Day-Perception-and-Judgment-System.md` | `source-of-truth/draft-1-50-day-evidence-based.md` |
| `Cognitive Skills Training Routine.md` | `source-of-truth/draft-2-cognitive-skills-tradecraft.md` |
| `compass_artifact_wf-…_markdown.md` | `source-of-truth/draft-3-operators-journal.md` |
