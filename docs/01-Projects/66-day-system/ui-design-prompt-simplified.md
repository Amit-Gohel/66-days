# 66-Day System — “Simple Diary” redesign prompt (paste into Claude)

> Hand this whole block to Claude (claude.ai → it will build an Artifact). It asks for ONE
> self-contained, runnable prototype of the *simplified* app. Provenance: builds on
> `ui-design-prompt.md` (the locked “Aged Operator’s Field-Diary” look) but encodes the
> first-time-simplicity redesign (one writing page, inline view+edit, night merged in,
> a clickable 66-day calendar, plain helper text under every field).

---

## PASTE FROM HERE ↓

You are a senior product designer **and** a front-end engineer with exceptional visual taste. Build a **single, self-contained, runnable interactive prototype** (one React component, Tailwind + inline styles, no backend, no network, no external libraries — CSS-only animation) as a **claude.ai Artifact** that runs immediately with the seeded data below.

### The north star (read this twice)
This is **“The 66-Day System”** — a calm daily journal that trains sharper observation and judgment. Two non-negotiable goals, in order:

1. **A first-time visitor must instantly understand it.** Someone who has never seen this opens it and, within seconds, knows what the app is, what to do today, and what every field wants from them — *without a tutorial*. Plain words. Examples in every box. One obvious thing to do.
2. **It must feel like writing by hand in a real, well-kept book.** Opening it should feel like opening a worn personal journal: warm aged paper, your own words in ink on faintly ruled lines, pages that turn. Not a SaaS dashboard. Not a form. A book you keep.

If a choice ever trades away “instantly understandable” or “feels like a real diary,” make the other choice.

### Creative direction (the mood — commit fully)
**“An aged operator’s field-journal.”** A worn, well-kept paper diary: warm cream/sepia stock, faintly grainy, faded ruled lines with a soft red left-margin rule, written in by hand in dark sepia ink. Around the handwriting, everything structural is precise and instrument-like — austere monospace for labels/data/dates, calm editorial serif for headings and reading, one disciplined burnt-amber accent. The whole identity is that contrast: **handwritten prose living inside a quiet, rigorous instrument.** The set the bar is **Day One’s typographic restraint and polish** and **Penzu / Moleskine’s notebook warmth** — but achieve it with *type, paper texture, ruled lines, ink, and motion*, never with cheesy skeuomorphic props.

Reinforce the **book** metaphor throughout: the login is the journal’s cover; moving between days/sections feels like turning or flipping to a page; “today” has a ribbon-bookmark feel; the 66-day calendar reads like the book’s index or page-edges.

### Anti-slop rules (these are hard constraints — you tend to converge on generic defaults; don’t)
- **NO** generic fonts: never Inter, Roboto, Arial, Open Sans, Lato, or default system fonts for anything with character. (Plain humanist sans is allowed *only* for tiny nav/tab chrome.)
- **NO** purple/indigo/blue gradients, no animated gradient backgrounds, no glassmorphism/backdrop-blur, no neon or high-chroma accents.
- **NO** pure black (`#000`) or pure white (`#fff`). **NO** generic SaaS dashboard layout, no “card soup,” no big bold sans hero.
- **NO** emoji anywhere in the UI. **NO** gamification (confetti, badges, XP, mascots, “Great job!”). **NO** Lorem ipsum — every field shows realistic seeded ink.
- **NO** cheap skeuomorphic kitsch: no clip-art coffee rings, torn paper, tape, pushpins, fake leather bevels, Comic Sans. The “aged book” feeling comes only from **color + grain + a faint edge vignette + ruled lines + the handwriting font + page-turn motion.** Restraint, not props.
- Before you write any code, **state the exact fonts and the palette you’ll use** in one short paragraph, then build.

### Design system — guide each dimension deliberately

**Typography (high contrast = interesting; use extremes):**
- *The user’s own written entries (the diary’s soul):* a neat upright **handwriting font** — `Patrick Hand` (alt `Kalam`). 18–19px, **line-height locked to 30px so ink sits on the ruled line**, color = ink. Used on EVERY field the user writes in. This is non-negotiable.
- *Headings / chapter & section titles (the “book” voice):* a distinctive editorial **serif** — `Fraunces` or `Newsreader` (NOT a sans). 22–34px, with real size jumps (3×+ between body and title), weights at the extremes (light vs. 600+).
- *Reading / instructional prose (helper text, intros):* `Newsreader` serif, 15–16px, line-height 1.7, max-width ~64ch.
- *Labels, dates, numbers, the day counter, data:* `JetBrains Mono` (never handwrite data; never set data in serif). The “Day 12 / 66” counter renders mono, ~28–32px, calm — not a giant sans hero.
- Fallbacks: `'Patrick Hand','Kalam',cursive`; `Fraunces,Newsreader,Georgia,serif`; `'JetBrains Mono',ui-monospace,monospace`. Load via Google Fonts `<link>`.

**Color — two committed themes via CSS variables (paper is the default; night is for the evening review).** Use these exact tokens (dominant warm paper/ink + a single sharp amber accent — never a timid even palette):
```
/* Default = Aged Paper (:root) */
--bg:#e7dcc4; --bg-deep:#dccfb2; --surface:#f0e7d2; --surface-2:#e2d7bd;
--border:#cbbd9c; --text:#2e2620; --text-2:#685d4d; --text-3:#8a7e66;
--accent:#9a6b34; --accent-hover:#855a29; --warn:#8a4a3c;
--rule:rgba(120,90,55,.22); --margin-rule:rgba(150,70,55,.28);
/* Operator Night (the “Tonight” review + optional dark mode) [data-theme="night"] */
--bg:#1c1813; --bg-deep:#141009; --surface:#262019; --surface-2:#2e271e;
--border:#3c352a; --text:#ece4d4; --text-2:#a59c8a; --text-3:#6f6757;
--accent:#d4a574; --accent-hover:#c49860; --warn:#704339;
--rule:rgba(212,165,116,.16); --margin-rule:rgba(150,70,55,.30);
```
Accent stays sparse (~10% max): the active/today cell, the one primary action, the calendar “logged” fill, focus rings. Verify all text ≥ 4.5:1 contrast in both themes.

**Texture, ruled lines, motion (the diary atmosphere — must be felt, not seen):**
- **Paper grain:** a fixed full-viewport SVG `feTurbulence` noise overlay at `opacity:.06; mix-blend:multiply` on paper (`.03; overlay` at night). Plus a barely-there sepia edge vignette. No spots, no dirt.
- **Ruled writing surface:** behind every writing field draw faint horizontal rules + a faint red left-margin rule, baseline-locked to 30px so the caret/ink sits on the lines and the rules scroll with the text:
```css
.ruled{line-height:30px;padding:6px 0 0 18px;
  background-image:repeating-linear-gradient(transparent 0 29px,var(--rule) 29px 30px),
    linear-gradient(to right,transparent 13px,var(--margin-rule) 13px 14px,transparent 14px);
  background-attachment:local,scroll;}
```
- **Motion (calm, ≤300ms, honor `prefers-reduced-motion`):** ONE orchestrated page-load with **staggered reveals** (`animation-delay`) — entries settle onto the page like ink. Turning to a day / advancing the night review uses a **page-turn** (a brief horizontal slide+fade). Autosave is a silent ink-settle checkmark (no spinner, no “Saving…”). Don’t scatter micro-interactions everywhere.

### Information architecture — radically simpler than a normal app
Only **three** places, like sections of one book. Desktop: a slim left margin/tab rail; mobile: a small bottom bar. Everything advanced is folded away until it’s relevant.
1. **Today** — the writing page (the hub; 90% of use).
2. **The 66 Days** — the calendar/index of the whole book.
3. **Settings** — quiet.
(Predictions, calibration, ideas, weekly review, etc. from the old app are **not** top-level — fold them into a single calm **“Look back”** area reached from Settings or the calendar, and don’t show any of it to a first-timer.)

### SCREEN 1 — “Today” (build first, to the highest fidelity)
A warm paper page. Top: a calm mono day-stamp **“DAY 12 / 66”** + a one-line plain subtitle in serif: *“A 66-day practice for noticing more and thinking more clearly. Each day: jot a few things you noticed, then a short review tonight. That’s the whole loop.”*

- **A dismissible “New here? The whole system in 20 seconds” strip** (collapsed by default once dismissed). Open, it explains in plain words, with three little panels: *During the day → jot what you notice (~5 min). · At night → a short review, right on this page. · Over time → each day fills a square on your 66-day calendar.* This is the only “teaching,” and it’s pull-not-push — no forced tour.

- **“What you noticed today”** — four capture cards (D1–D4). Each card:
  - Shows a **plain-language title** (the doctrine term is a tiny mono kicker above it, not the headline), and a one-line “what this is.”
  - **Expands inline to write — never a modal/popup.** Inside, each field has a **persistent visible label + a one-line plain hint + a faded grey “e.g. …” example** (the example never replaces the label and the label never disappears on focus).
  - **After saving, the card shows your words back in ink, right there,** with a small **“✎ Edit”** that re-opens the same inline editor seeded with what you wrote. Nothing you write ever disappears or sends you to another screen.
  - Use these exact plain titles + hints + examples:
    - **D1 · “What’s normal — and what broke it”** (*Baseline + Anomaly*). Place — *“Where & when. e.g. Coffee shop, 8am.”* · What’s normal here? — *“The usual rhythm or mood. e.g. Regulars, laptops, quiet.”* · What stood out? — *“Anything that broke the pattern. e.g. A man in a winter coat watching the door — didn’t order.”* · So what? — *“Your one-line read on it. e.g. Probably waiting/anxious — low threat, noted the exit.”*
    - **D2 · “Three things you noticed”** (*Three Noticings*). Three lines, each — *“A specific thing you saw or heard. e.g. Barista re-stacks cups left-handed.”*
    - **D3 · “A problem → an idea”** (*Problem → Idea Seed*). Problem — *“What’s annoying or broken? e.g. Gym lockers jam at 6pm.”* · An idea — *“One possible fix. e.g. Door-sensors + an app showing free lockers.”*
    - **D4 · “A note on one person”** (*People Note*). Person — *“Who. e.g. Client lead.”* · Their normal — *“How they usually are. e.g. Replies within hours, warm.”* · What shifted — *“The change + the topic (observation, not a verdict). e.g. No reply for days, terse — on budget.”* · Question to ask — *“An open question, not an accusation. e.g. ‘When does the team reconvene on this?’”*

- **“Tonight’s review”** — the night session **lives on this same page** (no separate page). A gentle “lamplit” section (switches to the night theme) with the steps as an inline one-at-a-time sequence (page-turn between them), each with a plain title + hint + example:
  - **Recall first** — *“Before checking your notes, write what you remember from today.”* e.g. *“Recalled 2 of 3 + the locker idea. Forgot the budget reaction.”*
  - **Replay one moment** — *“What you intended, what happened, one fix as an ‘if… then…’.”* e.g. *“If it’s a school morning, then I lay the bag by the door the night before.”*
  - **A prediction** *(note it unlocks later in the program)* — *“One thing you think will happen + how sure (%) + when you’ll know.”* e.g. *“Client signs by Fri — 65%, resolves Jun 12.”*

- **A quiet, demoted progress strip** (small, low-contrast — never competes with the writing): days in a row, words written, “5 / 7 this week → open the calendar.”

### SCREEN 2 — “The 66 Days” (the book’s index)
A single **fixed grid of all 66 day-cells** (≈ 11 × 6 on desktop, fewer columns on mobile; ~44px touch targets) — the whole journey on one screen, so you see how far you’ve come and how far’s left. Each cell shows the day number + one state:
- **Logged** = filled amber with a small check. **Empty/missed past day** = muted outline. **Today** = a distinct amber ring + soft glow + a tiny “today” ribbon. **Future** = dimmed, non-clickable.
- A small legend (Logged · Missed · Today · To come).
- **Click any past/today cell → it turns to that day’s page** (page-turn transition) showing that day’s full entry in ink — D1–D4 + the night review — read-only with an “✎ Edit” affordance. Clicking Day 1 opens Day 1’s logs; today opens today’s. Future days don’t open.
- Each cell is a real button with a rich accessible label (`“Day 12, logged — 3 notes”`); support keyboard arrow navigation across the grid (single tab-stop).

### First-time-clarity rules (apply everywhere)
One clearly-dominant action per screen (run the squint test). Recognition over recall — keep labels, examples, and prior context visible; never make the user remember what a box wants. No jargon without a plain-word gloss (the doctrine terms stay as tiny kickers only). Empty states teach + offer the first action (“No notes yet today — add the first thing you noticed”). Persistent label + hint + example on every field; never placeholder-as-label. Hide all advanced analytics from a newcomer.

### Seeded mock data (use verbatim — realistic ink, no empty fields where a day is logged)
- Set “today” = **Day 12 of 66** (Phase 1). The calendar: Days 1–11 mostly logged, Days 4 & 9 missed, Day 12 = today, 13–66 future.
- **Day 1** (open it from the calendar): D1 — *Coffee shop, 8am. / Regulars, laptops, quiet. / A man in a winter coat watching the door — didn’t order. / Probably waiting, anxious — low threat, noted the exit.* D2 — *Barista re-stacks cups left-handed. / Three people in the same trainers. / Street noise drops at 9:10.* Night — *Recalled 2 of 3; replayed the rushed morning → if school morning, bag by the door the night before.*
- **Day 7**: D1 — *Office, 9:30am. / Standup wrapping, calendar quiet. / Client thread silent 3 days. / Budget cut or decision-maker away — test it.* D3 — *Async asks get ignored when cold → a one-pager with a single dated decision request.*
- **Today (Day 12)**: D1 saved (the coffee-shop entry, shown in read+edit state); D2/D3/D4 empty with their teaching states; “Tonight’s review” not yet done.

### Output & build order
- One self-contained React component artifact, all state in `useState`, **runs immediately**, fully responsive, accessible (real `<label>`s, ≥4.5:1 contrast, focus rings, `prefers-reduced-motion`). CSS-only animation.
- Build in this order at full fidelity; if you near an output limit, **reduce seed volume, never fidelity:** (1) paper theme + tokens + fonts + grain + ruled recipe + the 3-item nav; (2) **Today** with inline write→read→edit captures + the on-page “Tonight’s review”; (3) **The 66 Days** grid + click-to-open day page; (4) the dismissible intro; (5) Settings (theme toggle + a quiet “Look back” link).
- First, in 2–3 sentences, **state the fonts and palette you’ve chosen and the one “book” detail you’ll use to make it feel bound** (e.g. the page-turn, the ribbon bookmark). Then build the whole thing.

## ↑ PASTE TO HERE
