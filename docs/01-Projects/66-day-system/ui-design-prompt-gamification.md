# 66-Day System — prompt #2: add the healthy gamification layer (paste into the SAME Claude chat)

> This is the **follow-up** to `ui-design-prompt-simplified.md`. Paste it into the same Claude
> conversation right after Claude has built the simplified diary prototype — it *extends* that
> prototype with the project's research-backed "Quiet Competence" progress layer (Craft Points,
> ranks, forgiving streak + earned freezes, methodology badges, a calm celebration, and the
> opt-in Cohort leaderboard + cooperative buddy streak). Faithful to `specs/gamification.md`.

---

## PASTE FROM HERE ↓

Now **extend the prototype you just built** by adding the app's progress / engagement layer. Keep everything you already made; this is an additive layer, not a redo.

### Important — reconcile with the earlier rule
Earlier I told you “no gamification (confetti, XP, mascots, ‘Great job!’).” **That still holds for arcade gamification.** What follows is the *opposite* of that: a calm, evidence-based **progress layer** the real product is built on (“Quiet Competence”). It is required and intentional. Add it — but keep it **quiet, journal-native, and demoted below the writing.** It must never look like a game HUD.

### The one design rule (obey it everywhere)
**Show progress, never threaten it. Affirm competence, never coerce.** Every mechanic below mirrors work the user actually did and celebrates it — and is forbidden from creating pressure. This comes from the verified research (SDT competence/autonomy/relatedness; forgiving streaks are evidence-backed, punitive resets are not).

**Hard anti-dark-pattern rules (do not violate any):**
- NO countdown timers, “you’ll lose your streak tonight,” or any loss-threat copy.
- NO pay-to-restore / “repair your streak,” no purchasable anything — freezes are *earned and derived*.
- NO variable/random rewards — every point and badge is deterministic.
- NO leaderboard leagues, demotion/relegation, or ranking notifications.
- NO guilt, debt, or “you let your buddy down” framing; NO mutual-loss social streaks.
- NO confetti, coins, sound, mascots, or hype copy. Celebration is a single quiet, dismissible note.
- Points are a *mirror*, never a *currency*: nothing is ever “spent,” and nothing in the app is locked behind points.

### Visual treatment (stay inside the diary)
All of this uses the existing palette and type — **mono numerals in the amber accent, serif for the one-line framing, the same single-stroke icons (feather, moon, flag, shield, target, calendar, lightbulb, award, check, lock, snowflake).** No bright colors, no candy progress bars, no badge “shine.” A locked badge is just dimmed (~45% opacity) with a lock icon and its name still visible (so it reads as an attainable goal, not a mystery). It should feel like a quiet ledger in the back of the journal.

---

### 1. Craft Points + Rank — a “quiet ledger” panel
A small panel in the demoted progress area on **Today** (the right rail / below the writing — never above it). Header `CRAFT POINTS` (mono). A large mono number + `CP`, with the current **rank** name in handwriting/serif to its right. A thin 3px amber progress bar toward the next rank, and a serif line: *“{N} CP to next rank. Reflects the work you’ve put in.”* (top rank: *“Top rank — you’ve put in the work.”*)
- Framing is fixed: **CP reflects effort, it is not a currency.** No “spend”/“buy”/“redeem” affordance anywhere.
- CP is the deterministic sum of work done (use these exact weights): each filled daytime section (D1–D4) = **2**, a completed night session = **6**, a prediction logged = **3**, a prediction resolved = **4**, a weekly review = **15**, an idea developed = **5**, an idea picked top-3 = **10**. (A resolved prediction scores the same whether right or wrong — we reward the rep, not luck.)
- **Rank ladder** (CP threshold → name): 0 Observer · 100 Noticer · 300 Analyst · 700 Forecaster · 1400 Operator · 2500 Tradecraft Master.

### 2. Forgiving streak + earned freeze
The day-streak is already “never miss twice” (one missed day is forgiven; two-in-a-row would reset). **Add an earned, non-purchasable “streak freeze.”** Completing a weekly review banks **1 freeze (cap 2)**; a freeze silently absorbs a single missed day. Render it as a calm chip with a **snowflake** icon: *“{n} streak {freeze/freezes} banked — earned, never bought.”* (Hide the chip when 0.) **Never** show a countdown or a “use it or lose it” message. On the 66-day calendar, a day saved by a freeze just reads as kept — no scary marker.

### 3. Badges — milestones tied to the real methodology
A `BADGES` shelf (grid of ~44px tiles) in the progress area / a “Your craft” section. Unlocked = amber icon on a lifted tile + name; locked = dimmed lock + name (never hidden, **never removed once earned**). Each has a name, a one-line description (tooltip/aria), and the phase it belongs to. Use these 14 verbatim:
- **First Light** — Logged your first daytime capture. *(feather, P1)*
- **Night Owl** — Completed your first night session. *(moon, P1)*
- **Seven Days In** — Reached a 7-day streak. *(flag, P1)*
- **Comeback** — Missed a day and came back without breaking the chain. *(shield, P1)*
- **Precision** — Reached Phase 2 — recall & forecasting. *(target, P2)*
- **Reviewer** — Completed your first weekly review. *(calendar, P2)*
- **Rigor** — Reached Phase 3 — structured idea work. *(target, P3)*
- **Idea Machine** — Developed an idea past the seed stage. *(lightbulb, P3)*
- **Calibrated** — Resolved 10 predictions. *(target, P3)*
- **Transfer** — Reached Phase 4 — taking the skills in vivo. *(target, P4)*
- **Forecaster’s Edge** — Mean Brier under 0.15 across 10+ resolved predictions. *(award, P4)*
- **Month of Sundays** — Completed four weekly reviews. *(calendar, P4)*
- **Automaticity Check** — Reached Phase 5 — the taper. *(target, P5)*
- **Day 66** — Completed the full 66-day program. *(check, P5)*

### 4. Calm completion celebration
When the day’s captures are done or a badge unlocks, show **one** brief, dismissible note in serif (e.g. *“Day 12 logged. The chain holds.”* / *“Badge earned — Seven Days In.”*). A soft fade only; **respect `prefers-reduced-motion` (no animation then)**, no sound, no confetti. It auto-dismisses and never blocks writing.

### 5. The 66-day calendar = honest progress, not a countdown
The calendar you built already shows the streak/heatmap — keep it, and present Day 66 as the program’s **average** finish (research: 66 is the median, range 18–254), never “habit unlocked!”. Setup/Day-1 reads as momentum already started (“you’ve begun”), not a finish line to chase.

### 6. Opt-in Cohort leaderboard — folded away, default OFF
Lives in the folded **“Look back”** area (reached from Settings or the calendar), **never** shown to a first-timer and **off by default**. Render the **opt-in empty state** by default: one line — *“See how the cohort is doing? Share only your name and points. Off by default; turn it off anytime.”* + a toggle. When on, show one simple global list ranked by CP: rank #, display name, CP, streak — **nothing else** (no email, no entry content). **No leagues, no relegation, no notifications.** Constructive, not competitive theatre. (Include a small demo toggle so a reviewer can preview the populated list, but default it OFF.)

### 7. Opt-in cooperative buddy streak — folded away, default OFF
Also in “Look back,” **off by default**, invite-by-buddy-ID → accept. The shared streak = consecutive days **both** people showed up, framed cooperatively: *“You both showed up on {n} days.”* A buddy can see only the *dates* the other completed — **never** their journal content. **No mutual-loss:** one person’s gap never resets the other’s streak or the shared count; either party can end the connection anytime. No guilt/debt language at all.

### Seed data (extend your existing Day-12 seed — stay consistent)
- Craft Points ≈ **96 CP**, rank **Observer**, ~96% toward **Noticer (100)**, so the bar is nearly full and the next-rank line reads “4 CP to next rank.”
- Badges unlocked at Day 12 / Phase 1: **First Light, Night Owl, Seven Days In, Comeback** (4 of 14); the rest dimmed-locked.
- Freezes banked: **0** (the first is earned at the first weekly review, ~Day 15) — so hide the snowflake chip, but keep its code path; OR show a one-line explainer of how freezes are earned. Do not fake a banked freeze on Day 12.
- Cohort + buddy: render their **opt-in OFF** states by default; behind the demo toggle, show a sample cohort (5–6 rows, plausible names + CP) and one accepted buddy with a shared streak of, say, 8 days.

### (Also restore — part of “the research”) the evidence chips
The app marks every technique with its **epistemic-confidence label** so the methodology is transparent. Add small mono pills next to each capture/night technique: `[Confirmed]` (peer-reviewed), `[Practitioner]` (field-proven), `[Inference]`, `[Speculative]`, `[CONTESTED]` (weak/disputed). Keep them subtle (border + text carry the colour, transparent fill; never colour-only — the bracketed word is always there). Tapping a chip opens a small popover with the real source, e.g. D1 → *“Van Horne & Riley, Left of Bang (2014); Endsley (1995)”* `[Confirmed]`; D4 People Note → *“Navarro (2008); caveat: lie-detection ≈54% accuracy — Bond & DePaulo (2006)”* `[CONTESTED]`; N3 Prediction → *“Tetlock, Superforecasting (2015); Brier (1950)”* `[Confirmed]`. These stay quiet and out of the way of a first-timer (small, one per technique).

### Keep it all
Preserve the diary feel, the simplified 3-place IA, inline write→read→edit, the on-page night review, and the click-to-open 66-day calendar. The progress layer is **demoted and quiet** — a first-time visitor still sees a calm writing page first; the ledger, badges, and (folded) social features are there for those who look. Accessibility unchanged (labels, ≥4.5:1 contrast, focus rings, reduced-motion). Then rebuild the single runnable artifact.

## ↑ PASTE TO HERE
