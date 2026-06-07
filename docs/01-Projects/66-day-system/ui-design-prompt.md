# THE 66-DAY PERCEPTION & JUDGMENT SYSTEM — claude.ai Artifact Build Prompt

# ROLE & MISSION

You are a senior product designer and front-end engineer. Build a **single, self-contained, high-fidelity React + Tailwind interactive prototype** for **"The 66-Day Perception & Judgment System"** — an open-source web app that guides one user through a 66-day daily training program to sharpen **perception, judgment, people-reading, and calibrated forecasting**. It is a **journaling + habit-tracking + analytics** app, evidence-based, serious but personal.

Output it as a **claude.ai Artifact** (React component) that runs immediately with seeded mock data and in-prototype navigation across all 13 screens. No backend, no network calls.

## The one creative direction that governs everything
**"Aged Operator's Field-Diary."** A worn, well-kept paper diary — **aged cream/sepia stock, faintly foxed, faded ruled lines, written in by hand in dark sepia ink** — belonging to someone with an operator's discipline. The user's own words are set in a **handwritten font** (neat, upright hand-printing, matching the reference: `Patrick Hand` / `Kalam`); everything structural around the handwriting stays precise and instrument-like — **austere monospace** for labels/data/numbers, **one disciplined burnt-amber ink accent**, evidence chips, calm charts. That contrast — **handwritten prose inside a rigorous instrument** — is the entire identity. **Aged warm paper is the default theme everywhere; the night session goes "lamplit"** (a deep, warm near-dark) for a calm, immersive, sequential ritual — a sanctuary, not a form. Faint ruled lines + a classic red left-margin rule sit under every writing zone; quiet ritual motion throughout (soft fades, ink-settle save check, a page-turn reveal). Commit fully to this aesthetic. Reject generic SaaS **and** cheap skeuomorphic kitsch equally.

Tone of all copy: serious, calm, evidence-grounded, lightly tradecraft/operator, honest, never gamified-cutesy, never patronizing. Periods, not exclamation marks. No emoji anywhere in the UI. **Handwritten where the user writes; precise mono everywhere data lives.**

---

# BUILD PRIORITY / SCOPE ORDER (read first — do not stub anything)

This spec is large. Build in this exact order so nothing important gets dropped or stubbed. **Every screen must be built to the same fidelity as Home — no placeholder, "coming soon", or generic-list screens are acceptable.** If you approach an output-budget limit, **reduce seed-data volume (fewer rows, same shapes), never screen completeness or fidelity.**

1. **AppShell** + design tokens (CSS vars) + Google Fonts + grain filter + ruled-line recipe + responsive nav (desktop sidebar / mobile bottom tabs) + DevTools jumper.
2. **Home / Today** (the diary hub).
3. **Night session** (all of N1–N5, the recall-then-reveal, the summary card).
4. **Daytime capture** D1–D4.
5. **Calibration / Analytics dashboard** (all charts computed from seed arrays).
6. **Prediction log.**
7. **Weekly Review.**
8. **Login / Sign-up.**
9. **Onboarding.**
10. **Ideas pipeline / library.**
11. **Journal archive.**
12. **Reading list.**
13. **Phase roadmap.**
14. **Settings.**
15. **DevTools panel** (wire it through everything).

---

# DESIGN SYSTEM (exact tokens — use these, do not improvise)

## Color — two first-class themes (Aged Diary is the DEFAULT)
**Default = "Aged Diary" (aged paper)** — set on `:root`, applied on load:
```
--bg            #e7dcc4   /* aged cream paper — the default canvas (NEVER pure #fff) */
--bg-deep       #dccfb2   /* deeper aged stock — insets, sidebars */
--surface       #f0e7d2   /* lifted page / card */
--surface-2     #e2d7bd   /* pressed / interactive page layer */
--border        #cbbd9c   /* faint sepia hairline (use ~50–70% opacity) */
--text          #2e2620   /* dark sepia-brown ink (NEVER pure #000) */
--text-2        #685d4d   /* faded ink / secondary */
--text-3        #8a7e66   /* pencil-grey / tertiary, placeholders */
--accent        #9a6b34   /* burnt-amber ink — the single accent */
--accent-hover  #855a29
--warn          #8a4a3c   /* oxblood — contested/caution ONLY, sparing */
```
**"Operator Night" (dark / lamplit)** — used by the **night session ALWAYS**, and by the Settings theme toggle. Set on `[data-theme="night"]`:
```
--bg            #1c1813   /* warm near-black, lamplit — NEVER pure #000 */
--bg-deep       #141009   /* deepest immersive backdrop (night-session full screen) */
--surface       #262019
--surface-2     #2e271e
--border        #3c352a   /* hairline, used ~30–50% opacity */
--text          #ece4d4   /* warm candle-lit off-white (NEVER pure #fff) */
--text-2        #a59c8a
--text-3        #6f6757
--accent        #d4a574   /* warm amber-gold ink */
--accent-hover  #c49860
--warn          #704339   /* oxblood */
```
Accent stays sparse (~8–12% of UI max): active day/phase, primary CTA, completed heatmap cells, the calibration curve, focus rings, evidence-[Practitioner] chips. Overusing it flattens hierarchy.

### Named state tokens (define PER THEME; pin alphas so heatmap, reveal, and gates never guess)
**Aged Diary (`:root`):**
```
--rule              rgba(120,90,55,0.22)   /* faded horizontal ruled line */
--margin-rule       rgba(150,70,55,0.28)   /* faint red left-margin rule (classic diary) */
--heat-completed    #9a6b34                /* solid ink — full completed day */
--heat-partial      rgba(154,107,52,0.50)  /* min/partial day */
--heat-missed-once  rgba(154,107,52,0.28)  /* forgivable single miss */
--heat-missed-twice rgba(138,74,60,0.42)   /* oxblood — the one reset day */
--heat-future       rgba(120,90,55,0.10)   /* not-yet days */
--reveal-missed-bg  rgba(154,107,52,0.08)  /* N1 missed-item row background */
```
**Operator Night (`[data-theme="night"]`):**
```
--rule              rgba(212,165,116,0.16)
--margin-rule       rgba(150,70,55,0.30)
--heat-completed    #d4a574
--heat-partial      rgba(212,165,116,0.50)
--heat-missed-once  rgba(212,165,116,0.30)
--heat-missed-twice rgba(112,67,57,0.40)
--heat-future       #2a241b
--reveal-missed-bg  rgba(212,165,116,0.05)
```
**Shared:**
```
--gate-disabled-opacity  0.5                /* PhaseGate locked features */
--focus-ring        var(--accent)            /* theme accent: #9a6b34 paper / #d4a574 night */
```
**Contrast guarantee (BOTH themes, required):** verify all body text, secondary/tertiary text, evidence-chip text, and chart labels at **≥4.5:1** against their theme background. Aged-paper ink `#2e2620` on `#e7dcc4` ≈ 9:1 (good); confirm faded-ink `--text-2`/`--text-3` and every chip pass (see per-theme chip colors below) — darken any that don't. Operator-Night `#ece4d4` on `#1c1813` ≈ 12:1. The **focus ring uses the theme accent**, 2px solid, 2px offset, in BOTH themes.

## Evidence-label chips (semantic by epistemic confidence, NOT emotion)
Small monospace pills, 12px, ~2px radius, 1px border, padding 2px 8px. Background is transparent; border + text carry the color. **Clicking a chip opens a small popover with the real source citation** (see the per-chip citation map below — never invent or leave blank). Use at most 2 per section. Never rely on color alone — the bracketed text label is always present. Colors differ per theme so chip text always clears ≥4.5:1 on its background:
```
                 Aged Diary (paper)        Operator Night (dark)        meaning
[Confirmed]      #2f7d5b (deep green)      #6ee7b7 (sage-green)         peer-reviewed / meta-analytic
[Practitioner]   #9a6b34 (burnt amber)     #d4a574 (amber)              field-proven by professionals
[Inference]      #685d4d (faded ink)       #a59c8a (warm grey)          sound theory, untested
[Speculative]    #847a64 (lighter ink)     #c9c0ad (light grey)         plausible hypothesis
[CONTESTED]      #a8503a (rust)            #c97a55 (rust)               empirically weak / disputed
```

### Per-chip citation map (single source of truth — popovers MUST use these exact strings)
Store one `CITATIONS` object and have every chip read from it; the Settings → Techniques list reads from the **same** object (do not duplicate or diverge):
```
D1 Baseline + Anomaly      → "Van Horne & Riley, Left of Bang (2014); Endsley, situation awareness (1995)"   [Confirmed]
D2 Three Noticings         → "Endsley, situation awareness (1995)"                                            [Confirmed]
D3 Problem → Idea Seed      → "Diehl & Stroebe, productivity loss in brainstorming (1987)"                    [Inference]
D4 People Note             → "Navarro, What Every BODY Is Saying (2008); caveat: Bond & DePaulo (2006) — lie-detection accuracy ≈54%, barely above chance"   [CONTESTED]
N1 Retrieval-First Recall  → "Roediger & Karpicke, testing effect (2006)"                                     [Confirmed]
N2 After-Action Review     → "US Army TC 25-20, A Leader's Guide to AAR (1993)"                               [Practitioner]
N3 Calibrated Prediction   → "Tetlock & Gardner, Superforecasting (2015); Brier (1950)"                       [Confirmed]
N4 Consider-the-Opposite   → "Lord, Lepper & Preston, considering the opposite (1984)"                        [Confirmed]
N5 SCAMPER                  → "Eberle, SCAMPER (1971); Osborn, Applied Imagination (1953)"                    [Inference]
Habit / cue / 66 days      → "Lally et al., habit formation (2010); Gollwitzer & Sheeran, implementation intentions (2006)" [Confirmed]
```

## Typography (Google Fonts — load via `<link>` or @import; never system-font the body)
- **Written entries (the user's own words) — the diary's soul:** a **handwritten font**, primary `Patrick Hand`, alternate `Kalam` (matches the reference image's neat, upright hand-printing). **19px / line-height locked to 30px (seats on the ruled line) / max-width 60ch**, color `--text` (sepia ink). Used on EVERY capture field and ALL N1–N5 writing surfaces. For emphasis, increase size or use `Kalam` 700 — never swap to a different face. This handwritten ink is the "real diary" feeling — **non-negotiable**.
- **Long reading & instructional prose** (onboarding copy, methodology notes, reading-list descriptions, multi-sentence helper text): `Newsreader` (serif), 400/500, **16px / line-height 1.7 / max-width 68ch**. Handwriting is for *writing*; serif is for *comfortable reading* of longer passages. Do not set paragraphs of instructions in the handwriting font.
- **Structural labels, data, numbers, timestamps, day counter, Brier scores, chip text, table cells:** `JetBrains Mono`. Weights 400/500. **13–14px / line-height 1.5.** Never handwrite data.
- **Mono DISPLAY size:** the hero day counter ("Day 43 of 66") and big chart figures (Brier `0.21`, miss-rate `18%`) render in **JetBrains Mono 28–32px / line-height 1.1 / weight 500**, accent or `--text`. Prominent but calm — never a giant bold sans hero. The smaller "/ Phase 4" qualifier stays at 13–14px beside it.
- **Screen + section titles:** the **handwritten font** (`Patrick Hand`, 22–26px) for diary character (a chapter-heading feel). **Small nav labels, tabs, and dense UI chrome:** `Inter` 400/500 for scannability. Never use Inter inside a writing zone; never use the handwriting font for data, numbers, tables, or long reading.
- Fallbacks: `'Patrick Hand', 'Kalam', 'Bradley Hand', cursive`; `Newsreader, Georgia, serif`; `'JetBrains Mono', ui-monospace, monospace`; `Inter, system-ui, sans-serif`.

## Spacing, radius, elevation (both themes need air)
- 4px base grid; use 8 / 12 / 16 / 24 / 32. Night-session zones: **24px** internal padding, **32px** between zones. Dense data rows: 8px vertical.
- Radius: **0–2px** on writing textareas (paper edge), 4px zone containers, 6px buttons, 8px large panels/tables. Never ≥12px.
- **Elevation, Aged Diary (paper):** a soft warm shadow — cards `box-shadow: 0 1px 2px rgba(80,60,35,0.12)` over the lifted `--surface`; modals/popovers `0 8px 24px rgba(60,45,25,0.18)` over a `rgba(40,30,15,0.30)` scrim. Pages can look like sheets lifted slightly off the desk — subtle, never a hard drop-shadow card.
- **Elevation, Operator Night (dark):** shadows are invisible — express elevation via layered color (`--surface` over `--bg`, `--surface-2` over that). Floating elements get a subtle amber ambient glow: `box-shadow: 0 0 8px rgba(212,165,116,0.10)` over a `rgba(0,0,0,0.6)` scrim.

## Paper-grain texture (essential, must be felt not seen) — failure-proof recipe
Apply an SVG `feTurbulence` noise overlay to background and entry-zone surfaces only — never to buttons/inputs/chips. Use this exact data-URI as a fixed full-viewport overlay pseudo-element so content sits above it. **The blend + opacity differ per theme** so it reads as aged paper-tooth on the diary and as faint film grain at night:
```css
/* Aged Diary (default): warmer, slightly stronger — reads as paper tooth + faint foxing */
.grain::after{
  content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
  opacity:0.06; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
/* Operator Night: fainter, overlay so it lifts rather than darkens */
[data-theme="night"] .grain::after{ opacity:0.03; mix-blend-mode:overlay; }
```
**Aged-paper vignette (diary only):** add a second, very faint sepia edge-darkening so the page looks worn at the margins — a fixed overlay `background: radial-gradient(120% 120% at 50% 40%, transparent 60%, rgba(120,90,55,0.06) 100%)`. Keep it barely perceptible. Do NOT add fake foxing *spots*, coffee-ring PNGs, or torn edges — the age comes from grain + vignette + ink + ruled lines only.
It must disappear at normal viewing distance. **Verify it renders in BOTH themes** (paper = faint tooth/age, not dirt; night = faint grain, not noise).

## Ruled-line writing treatment (the single strongest diary signal) — failure-proof recipe
Behind every writing textarea (Zone 1 capture fields and all N1–N5 surfaces), draw faint horizontal rules seated to the text baseline, plus a **classic faint red left-margin rule**. Use this exact recipe so the caret sits on the lines, the rules scroll WITH the text, and both colors resolve from the active theme's tokens:
```css
.ruled{
  line-height:30px;             /* lock to 30px so handwriting sits on the rules */
  padding-top:6px;              /* seats the first line on the first rule */
  padding-left:18px;            /* clears the margin rule */
  background-image:
    repeating-linear-gradient(transparent 0 29px, var(--rule) 29px 30px),   /* horizontal rules */
    linear-gradient(to right, transparent 13px, var(--margin-rule) 13px 14px, transparent 14px); /* red margin */
  background-attachment:local, scroll;  /* horizontal rules scroll with text; margin rule stays put */
}
```
The writing font here is the **handwriting font** (`Patrick Hand`, 19px) but the **line-box is locked to 30px** regardless of font metrics so the baseline always meets the rule. `--rule` and `--margin-rule` are defined per theme (faded sepia on paper, faint amber at night; red margin in both). Lines must never interfere with the caret or placeholder. **Verify in BOTH themes.**

## Iconography
Single-stroke minimal (Lucide-style). Inline SVG only, 1.5–2px stroke. Sizes: 16px in labels, 20px in night session, 24px in nav. Neutral `var(--text-2)`; active/important `var(--accent)`. No emoji-as-icons.

## Motion (restrained, calm, deliberate)
- Entrances: fade-in 200ms ease-out. Page/screen transitions: cross-fade 200ms ease-in-out. Hover: 80–150ms.
- **Ink-settle autosave:** after typing stops ~2s, a small accent checkmark fades in bottom-right (200ms), auto-fades after 2s. No "Saving…" spinner, ever.
- **N1 recall-then-reveal (signature moment):** captures slide up + fade in, `translateY(12px)→0`, `opacity 0→1`, **300ms cubic-bezier(0.25,0.46,0.45,0.94)** — a page-turn feel.
- **Night-step page-turn (recommended):** advancing N1→N2→…→N5 uses the SAME signature page-turn motion (a brief horizontal slide+fade, `translateX(16px)→0`, opacity, ≤300ms) rather than a flat cross-fade, so every night step reinforces the "turning a page in the journal" metaphor. Back reverses it. This is the ritual's between-page motion — do not leave it a generic fade.
- **Resolved prediction:** checkmark pulse 200ms (scale 0.95→1).
- Cap every animation at **300ms**, no bounce/spring. Honor `prefers-reduced-motion: reduce` (disable transforms, keep instant state changes).

---

# ANTI-SLOP RULES (explicitly forbidden — do not produce any of these)
- NO purple/magenta/indigo gradients, NO animated gradient backgrounds, NO glassmorphism/backdrop-blur.
- NO pure black `#000` background; NO pure white `#fff` text.
- NO bright/high-chroma accents (neon, signal-red as primary, pastels). Only the amber accent + semantic evidence colors + sparing oxblood.
- NO gamification: no confetti, badges, XP bars, coins, levels, leaderboards, mascots, "Achievement Unlocked!" popups, "Great job!"/"You're on fire!" encouragement.
- NO rounded "card soup" — radius ≤8px; writing surfaces ≤2px. NO chunky borders to separate zones (use color + space + texture).
- NO emoji. NO generic CTAs ("Click here", "Submit", "Enter text"). NO Lorem ipsum — **every field carries realistic seeded content; no empty textareas anywhere a seeded day exists.**
- NO system fonts, serif, or sans-serif for the user's written entries — journal text is ALWAYS the handwriting font (`Patrick Hand`/`Kalam`). NO handwriting font for data, numbers, tables, or long instructional prose.
- NO cheap skeuomorphic kitsch: no Comic Sans, no clip-art coffee-rings / torn-paper / tape / pushpin PNGs, no fake leather bevels, no hard drop-shadowed "paper cutout" cards. The aged feel comes ONLY from color, grain, the edge vignette, ruled lines, and the handwriting font — restraint, not props.
- NO floating action buttons or persistent quick-capture buttons inside the night session — the ritual must not be interrupted.
- NO harsh streak "reset" visuals, red X's, or guilt language. NO spinning "thinking" loaders — use skeletons or nothing.
- NO microinteraction overload — animate reveals, transitions, and save only.
- **DUPLICATE-KEY GUARD:** every `.map()` MUST use a stable unique `key` (a real `id` on each seed row — see data model). Never `key={index}` for list rows that can reorder/filter, and never two siblings with the same key. Give every seeded array row an explicit unique `id`.

---

# DIARY-IMMERSION PRINCIPLES (how writing must look & behave)
- **Content-first writing mode.** When a textarea has focus, chrome recedes: secondary toolbars/nav fade after ~2s idle and return on tap/scroll-up. Generous side margins (≥24px). Ruled lines + 3% grain visible on the writing surface. **On mobile, the persistent bottom tab bar ALSO hides in focus mode** (fades out with the rest of the chrome, returns on tap/scroll-up) — it must not break writing immersion. Inside the night session it is gone entirely regardless.
- **Invisible autosave.** Save silently every ~5s and on blur; confirm only with the dim bottom-right ink-settle checkmark. Never block the writer.
- **Sequential nightly ritual.** The night session **always renders in the Operator Night (dark) theme regardless of the app's current theme** — full-screen on `--bg-deep` (warm lamplit near-black), no top nav, no close button — only **Back** and **Next**. Entering it is a deliberate dim-down from the daytime paper; leaving it returns to paper. One prompt per "page", enforced order, step indicator in the header, "~min left" estimate bottom-right. The user's implementation-intention cue sits calmly above the first step: *"After you brush your teeth → tonight's session."* Keyboard auto-focuses the textarea. On final save: a quiet summary card fades in ("Session logged. Anomaly miss-rate: 18%, down from 26%."), then returns home.
- **Recall-then-reveal (N1).** A blank handwriting-font textarea on ruled paper: *"Write what you remember from today. Don't peek at your captures yet."* A centered **"Reveal captures"** button. On tap, the day's D1–D4 entries slide-up/fade-in. Items the user didn't recall get a quiet highlight (`--reveal-missed-bg`, the 5% accent token) **+ checkmark — never a red X**. Footer, curious not evaluative: *"Recalled 3 of 4 captures. Miss rate 25% — down from 31% last week."*
- **"Filling pages" / time passing.** Show "Day 43 of 66" prominently but calm (mono display size). A "Pages filled" stat — **the word count MUST be computed by summing the character/word count of all seeded entry text (then scaled to a believable per-day average), not typed as a fake literal.** Pin it to a value consistent with the seed (~27,400 words across 43 days ≈ ~640 words/day) and derive the visible number from the seed so it never contradicts the entries. The 66-day heatmap is the visual diary. At Day 66: a calm full-screen close ("You've filled 66 days of your journal."), no confetti.

---

# DATA MODEL & SEEDED MOCK DATA

Hold all state in React (`useState`/`useReducer`) — **no localStorage, no fetch**. Provide a hidden **DevTools panel** (toggle via a small gear in the corner or `?dev=1`) that lets a reviewer jump `day`/`phase` and switch `authState` to explore every state, jump to Day 35 (mid-system self-critique), and Day 61–66 (Phase 5 taper / close).

## Global timeline reconciliation rule (MANDATORY — read before seeding)
**All seeded entries share ONE timeline keyed off `startDate: '2026-04-26'` and seeded "today" = program Day 43.** Program-day N = startDate + (N−1) days, so **Day 43 = 2026-06-07**. Therefore:
- A prediction whose `resolutionDate` **< 2026-06-07** MUST render **resolved** (status `resolved-hit`/`resolved-miss`) with a real outcome and a computed Brier contribution.
- A prediction whose `resolutionDate` **== 2026-06-07** is **due today** (status `due`).
- A prediction whose `resolutionDate` **> 2026-06-07** is **open** (status `open`), no outcome.
- **Never render contradictory states.** In particular the Day-22 *"Client signs by Fri" — 65% — resolves 2026-05-22* row is in the PAST relative to today, so it MUST be **resolved** (seed it resolved-hit), NOT shown as open.
- The streak heatmap, calibration curve, Brier trend, and miss-rate are **COMPUTED from the arrays below**, never typed in.

```js
const [app, setApp] = useState({
  authState: 'authed',            // 'login' | 'onboarding' | 'authed'
  user: { email: 'you@signal.dev', cue: 'After I brush my teeth' },
  day: 43, phase: 4, streak: 19, graceActive: false,
  startDate: '2026-04-26',        // Day N = startDate + (N-1) days; Day 43 = 2026-06-07
  todayISO: '2026-06-07',
  unlocked: ['D1','D2','D3','D4','N1','N2','N3','N4','N5','weekly'],
  theme: 'dark',                  // 'dark' | 'light'
})
```

**Phase gates** (drive every locked/unlocked surface):
- Phase 1 (Days 1–14) "Install the anchor": only **D1, D2, 2-line AAR (lives in Night as N2-minimal)**. Everything else locked.
- Phase 2 (Days 15–28) "Add precision": + **N1 recall, N3 forecast, D4 people note, full 4-question AAR, first weekly review (~Day 21)**.
- Phase 3 (Days 29–44) "Add rigor": + **D3 idea seed, N4 consider-the-opposite, N5 SCAMPER, Brier scoring, 1 in-vivo rep/week, drill-of-the-day**; **~Day 35 mid-system self-critique** (one-time).
- Phase 4 (Days 45–60) "Transfer & calibration": + **spaced retrieval sweeps (7/30-day) in weekly, conditional outreach 2–3/week, occasional 2-hypothesis check**.
- Phase 5 (Days 61–66) "Automaticity check": **taper (fewer required items), calibration curve + miss-rate charts, pick top 3 ideas, meta-AAR, design lean maintenance version**.

### AAR location (resolve the ambiguity, do not duplicate)
**The AAR ALWAYS lives in the Night session as N2** — in Phase 1 it is the 2-line minimal form (Happened? / Improve as an if-then); Phase 2+ it is the full 4-question form. **Home NEVER renders an AAR card.** In Phase 1, Home's capture grid shows only **D1, D2, and a "Begin night session (~5 min)" entry point** (the night session then presents N2-minimal). Do not place an AAR surface on Home in any phase.

## Seeded day content (use verbatim — this copy is load-bearing, no empty fields)

**Day 3 — Phase 1 (minimal):**
- D1 — Place: *Kitchen, 7:10am.* Baseline: *kettle on, radio low, kids not up yet.* Anomaly: *neighbor's car still in drive at 7 — he leaves at 6:40 daily.* So what: *maybe off work today; minor, noted.*
- D2 — Three noticings: *1. Frost only on the north-facing cars. 2. The bin lorry came Tuesday not Wednesday. 3. My coffee tasted sharper — different beans?*
- N2 AAR (2-line): Happened: *rushed the school run, forgot the permission slip.* Improve (if-then): *If it's a school morning, then I lay the bag by the door the night before.*

**Day 22 — Phase 2 (precision):**
- D1 — Place: *Coffee shop, 8am.* Baseline: *regulars, laptops, quiet.* Anomaly: *man in a winter coat on a warm day, watching the door, didn't order.* So what: *probably waiting, maybe anxious — low threat, noted the exit.*
- D2 — *1. Barista stacks cups left-handed. 2. Three people in the same shoe brand. 3. Noise drops sharply at 9:10.*
- D4 — Person: *colleague (baseline: leans in, fast talker).* Shift + topic: *went quiet, crossed arms when budget came up.* Open question: *"What's your read on the budget timeline?"*
- N1 recall: missed the colleague's budget reaction → **3/4, miss rate 25%**.
- N2 AAR: Intended *to raise headcount ask in standup.* Happened *deferred it.* Why the gap *no exec in the room.* Sustain *prepped the one-pager.* Improve (if-then) *if the decision-maker is absent, then I postpone the ask and send the one-pager async.*
- N3 prediction: *"Client signs by Fri" — 65% — resolves 2026-05-22* → **resolved-hit** (past relative to today).

**Day 38 — Phase 3 (rigor):**
- D1/D2/D4 present; D3 — Problem: *gym lockers jam at 6pm.* Idea seed: *cheap door sensors + app showing live locker availability.*
- N4 Consider-the-Opposite: Belief *the locker app is worth building.* Strongest case against *people won't install an app for a 20-second annoyance.* Evidence that would change my mind *if 5+ gym-goers said they'd pay or pre-register.*
- N5 SCAMPER on the locker seed (Day 38 is even → SCAMPER runs), today's letter **Combine** highlighted + editable: *combine with the existing gym check-in app so no new download.* Prior letters already filled read-only (see SCAMPER seed below).
- Two resolved predictions visible (one hit, one miss) feeding a Brier value.

**Day 53 — Phase 4 (transfer & calibration):**
- Full Zone 1 + Zone 2; weekly review shows **spaced retrieval**: "Recall what you wrote 7 days ago" and "30 days ago" before reveal. Outreach badge **"Outreach this week: 1 / 2–3"** (separate, never a streak item). Occasional 2-hypothesis check (see N4 variant seed).

## Literal seed arrays — PASTE THESE VERBATIM; compute all charts from them
Give every row a unique `id`. Brier contribution = `(prob − outcome)²` where prob is a 0–1 decimal and outcome is 1 (hit) / 0 (miss).

```js
// ---- PREDICTIONS (17 rows). today = 2026-06-07. resolutionDate < today ⇒ resolved; == today ⇒ due; > today ⇒ open ----
const predictions = [
  { id:'p1',  text:'Client signs by Fri',                      prob:0.65, createdDay:22, resolutionDate:'2026-05-22', status:'resolved-hit',  outcome:1, brier:0.1225 },
  { id:'p2',  text:'PR merges today',                           prob:0.80, createdDay:24, resolutionDate:'2026-05-18', status:'resolved-miss', outcome:0, brier:0.6400 },
  { id:'p3',  text:'Rain before noon',                          prob:0.55, createdDay:25, resolutionDate:'2026-05-19', status:'resolved-hit',  outcome:1, brier:0.2025 },
  { id:'p4',  text:'She replies same day',                      prob:0.30, createdDay:26, resolutionDate:'2026-05-20', status:'resolved-miss', outcome:0, brier:0.0900 },
  { id:'p5',  text:'Standup runs over 30 min',                  prob:0.70, createdDay:27, resolutionDate:'2026-05-21', status:'resolved-hit',  outcome:1, brier:0.0900 },
  { id:'p6',  text:'Gym busy after 6pm',                        prob:0.75, createdDay:29, resolutionDate:'2026-05-23', status:'resolved-hit',  outcome:1, brier:0.0625 },
  { id:'p7',  text:'Headcount ask approved this sprint',        prob:0.40, createdDay:30, resolutionDate:'2026-05-26', status:'resolved-miss', outcome:0, brier:0.1600 },
  { id:'p8',  text:'Neighbor was off work (car in drive)',      prob:0.60, createdDay:31, resolutionDate:'2026-05-25', status:'resolved-hit',  outcome:1, brier:0.1600 },
  { id:'p9',  text:'Beans changed at the coffee shop',          prob:0.50, createdDay:33, resolutionDate:'2026-05-28', status:'resolved-miss', outcome:0, brier:0.2500 },
  { id:'p10', text:'Budget timeline slips a quarter',           prob:0.65, createdDay:34, resolutionDate:'2026-05-30', status:'resolved-hit',  outcome:1, brier:0.1225 },
  { id:'p11', text:'Locker jam recurs at 6pm Thursday',         prob:0.85, createdDay:36, resolutionDate:'2026-06-01', status:'resolved-hit',  outcome:1, brier:0.0225 },
  { id:'p12', text:'5+ gym-goers say they would pre-register',  prob:0.35, createdDay:38, resolutionDate:'2026-06-03', status:'resolved-miss', outcome:0, brier:0.1225 },
  // due today (2026-06-07)
  { id:'p13', text:'Async one-pager gets a reply by EOD',       prob:0.55, createdDay:40, resolutionDate:'2026-06-07', status:'due',           outcome:null, brier:null },
  { id:'p14', text:'Frost again on north-facing cars tomorrow', prob:0.45, createdDay:41, resolutionDate:'2026-06-07', status:'due',           outcome:null, brier:null },
  // open (future)
  { id:'p15', text:'Client renews the contract this month',     prob:0.70, createdDay:42, resolutionDate:'2026-06-20', status:'open',          outcome:null, brier:null },
  { id:'p16', text:'Locker prototype demoed by Day 60',         prob:0.50, createdDay:43, resolutionDate:'2026-06-24', status:'open',          outcome:null, brier:null },
  { id:'p17', text:'Maintenance plan kept 2 weeks past Day 66', prob:0.60, createdDay:43, resolutionDate:'2026-07-19', status:'open',          outcome:null, brier:null },
]
// 12 resolved, 2 due, 3 open. Rolling Brier = mean of resolved .brier ≈ 0.1788 (display "0.21 → trending toward 0.166"
// by showing a per-week trend that starts higher and lands near this mean; benchmark line at 0.166).
// Calibration bins (compute from resolved rows): group by predicted-prob band, plot predicted vs actual-hit-rate.

// ---- IDEA PIPELINE ---- (represent 31 seeds; render ~8 real cards + a "+23 more" count)
const ideaSeeds = [
  { id:'i1', text:'cheap door sensors + app showing live locker availability', day:38, lane:'developed' },
  { id:'i2', text:'frost-pattern microclimate map of the street',              day:3,  lane:'developed' },
  { id:'i3', text:'async-ask one-pager template for absent decision-makers',   day:22, lane:'developed' },
  { id:'i4', text:'bin-collection-day predictor from past anomalies',          day:3,  lane:'developed' },
  { id:'i5', text:'coffee-bean change tracker / taste log',                    day:3,  lane:'cull' },
  { id:'i6', text:'exit-awareness checklist for new rooms',                    day:22, lane:'cull' },
  { id:'i7', text:'left-handed-friendly cup stack layout',                     day:22, lane:'seed' },
  { id:'i8', text:'quiet-hour finder (noise drops at 9:10)',                   day:22, lane:'seed' },
  // ...represent 23 more seeds via a count, do not render all
]
const ideaFunnel = { seeds:31, culls:6, developed:4, top:3 } // bar width ∝ value
const topIdeas = [
  { id:'t1', rank:1, text:'Live locker-availability app (combined with gym check-in)' },
  { id:'t2', rank:2, text:'Async-ask one-pager template' },
  { id:'t3', rank:3, text:'Frost-pattern microclimate map' },
]

// ---- SCAMPER (active seed = locker app). Day 38 even ⇒ SCAMPER night; highlighted letter = 'Combine'. ----
// Prior letters already filled read-only; current editable; later letters empty/upcoming.
const scamper = {
  seedId:'i1', activeLetter:'C',
  cells:[
    { id:'s1', letter:'S', name:'Substitute',        value:'swap the app for an LED board over each locker bank', done:true },
    { id:'s2', letter:'C', name:'Combine',           value:'combine with the existing gym check-in app so no new download', done:true, active:true },
    { id:'s3', letter:'A', name:'Adapt',             value:'adapt airport gate-board UX for "lockers free now"', done:true },
    { id:'s4', letter:'M', name:'Modify',            value:'', done:false },
    { id:'s5', letter:'P', name:'Put to other use',  value:'', done:false },
    { id:'s6', letter:'E', name:'Eliminate',         value:'', done:false },
    { id:'s7', letter:'R', name:'Reverse',           value:'', done:false },
  ]
}

// ---- N4 2-HYPOTHESIS-CHECK variant (Phase 4, ~1×/week, replaces consider-the-opposite that night) ----
const twoHypothesis = {
  id:'h1',
  hypoA:'The client went quiet because budget is being cut.',
  hypoB:'The client went quiet because the decision-maker is on leave until month-end.',
  diagnosticTest:'Ask the assistant when the decision-maker returns — a date answer points to B, a deflection points to A.',
}

// ---- 66-DAY HEATMAP (66 cells). streak=19, graceActive=false. ----
// Days 1..43 are past; 44..66 future. One reset event before the current 19-day streak:
// Days 1..23 completed; Day 24 missed-once; Day 25 missed-twice (the reset); then Days 26..43 = the current
// 19-day streak (completed), with Day 30 a partial/min-day. 44..66 future.
const heatmap = Array.from({length:66}, (_,i)=>{
  const d=i+1
  let state='completed'
  if(d>43) state='future'
  else if(d===24) state='missed-once'
  else if(d===25) state='missed-twice'
  else if(d===30) state='partial'
  return { id:`h${d}`, day:d, phase: d<=14?1:d<=28?2:d<=44?3:d<=60?4:5, state }
})
// Legend MUST match these states 1:1 using the --heat-* tokens. Current streak of 19 = Days 26..43 inclusive.

// ---- ANOMALY MISS-RATE (from N1, by week) ---- declining toward <15%
const missRateByWeek = [
  { id:'w1', week:1, rate:0.42 }, { id:'w2', week:2, rate:0.36 },
  { id:'w3', week:3, rate:0.31 }, { id:'w4', week:4, rate:0.28 },
  { id:'w5', week:5, rate:0.26 }, { id:'w6', week:6, rate:0.22 }, { id:'w7', week:7, rate:0.18 },
]

// ---- READING LIST (each tagged; chip text reads from CITATIONS color tier) ----
const reading = [
  { id:'r1', title:'Thinking in Bets',          author:'Annie Duke',         year:2018, skill:'Forecasting',    chip:'Practitioner', note:'Decide as bets; separate decision quality from outcome.' },
  { id:'r2', title:'Superforecasting',          author:'Tetlock & Gardner',  year:2015, skill:'Forecasting',    chip:'Confirmed',    note:'Calibration, Brier scoring, the outside view.' },
  { id:'r3', title:'The Gift of Fear',          author:'Gavin de Becker',    year:1997, skill:'People-reading', chip:'Practitioner', note:'Pre-incident indicators; trust intuition built on signal.' },
  { id:'r4', title:'Sources of Power',          author:'Gary Klein',         year:1998, skill:'Judgment',       chip:'Practitioner', note:'Recognition-primed decisions under pressure.' },
  { id:'r5', title:'What Every BODY Is Saying', author:'Joe Navarro',        year:2008, skill:'People-reading', chip:'CONTESTED',    note:'Useful vocabulary; lie-detection claims are weak (~54%).' },
  { id:'r6', title:'A Technique for Producing Ideas', author:'James Webb Young', year:1965, skill:'Creativity', chip:'Inference',  note:'Combinatorial idea-making in five steps.' },
  { id:'r7', title:'Left of Bang',              author:'Van Horne & Riley',  year:2014, skill:'Perception',     chip:'Practitioner', note:'Baselines and anomalies; the source of D1.' },
]

// ---- WEEKLY REVIEW seeded synthesis (so tab 4 & 5 are never empty) ----
const weeklySynthesis = {
  ruleOfThree:[ // auto-detected recurrences the user confirms
    { id:'rt1', pattern:'Morning anomalies on north-facing surfaces', count:3, confirmed:true },
    { id:'rt2', pattern:'Deferred asks when the decision-maker is absent', count:3, confirmed:true },
    { id:'rt3', pattern:'Noise/crowd drops around 9:10', count:2, confirmed:false }, // below 3, shown greyed
  ],
  elicitation:'Used a calibrated question with the budget colleague ("What\'s your read on the timeline?") — got a date, which resolved Hypothesis B.',
  outreachThisWeek:1, outreachTarget:'2–3',
}
```

---

# COMPONENT INVENTORY (build these, reuse consistently)
- **AppShell** — desktop: left sidebar nav (Home, Night, Weekly, Predictions, Calibration, Ideas, Archive, Reading, Roadmap, Settings) + content; mobile: bottom tab bar (Home, Night, Calibration, Archive, Settings) + overflow. Sidebar/tab-bar hidden entirely inside the night session; tab bar also hides in daytime focus mode.
- **DayPhaseHeader** — mono **display-size** "Day 43" with "/ 66 · Phase 4" qualifier at body-mono size + 3px progress bar filled `day/66`; streak count; grace icon (a quiet shield/≡) when `graceActive`.
- **CaptureCard / CaptureForm** — pre-structured fields with exact spec labels; states: locked / empty-with-placeholder / filled / focus-mode / saved. Ruled-line textareas.
- **NightSessionFlow** — full-screen sequential N1–N5, step indicator, time estimate, Back/Next, summary card, page-turn between steps. Step count adjusts to the active phase AND to non-SCAMPER nights (see SCAMPER logic).
- **RevealPanel** — the N1 recall-then-reveal with missed-item highlight (`--reveal-missed-bg`) + checkmark.
- **PredictionRow** — prediction text, prob %, resolution date, outcome (✓/✗), Brier contribution; states open / due / resolved-hit / resolved-miss.
- **Charts (hand-rolled inline SVG — NO chart library):** CalibrationCurve, BrierTrend, MissRateTrend, StreakHeatmap, IdeaFunnel. ~40-line coordinate-mapping helper. **All series computed from the seed arrays above.**
- **EvidenceChip** — semantic pill + citation popover (reads from `CITATIONS`).
- **DrillCard** — "Drill of the day" (Phase 3+), see below.
- **OutreachModal** — Who / why now / value offered first; feeds the weekly counter (never a streak item).
- **MaintenanceBuilder** — Day-66 lean-version checklist (Phase 5).
- **PhaseGate** — renders a feature disabled (`opacity: var(--gate-disabled-opacity)`, `pointer-events:none`) with a lock icon and "Unlocks Day N (Phase X)" — never hide locked features, show them disabled with the reason.
- **EmptyState / SkeletonState**, **Toast (inline, calm)**, **Modal (focus-trapped)**, **Tabs**.

## Drill-of-the-day (Phase 3+) — the 8 rotating micro-drills (list verbatim)
A small Home card (Phase 3+) titled "Drill of the day · 2–5 min", cycling deterministically by `day % 8` through these eight, each with its own evidence chip and a one-line instruction. Optional, never a streak item:
1. **Outside View** — *"Before predicting, find the base rate for cases like this."* [Confirmed]
2. **Standalone calibration rep** — *"Make one 1–99% prediction now with a resolution date."* [Confirmed]
3. **Consider-the-opposite on a headline** — *"Pick a headline you believe; argue the strongest opposite."* [Confirmed]
4. **Recall-the-room** — *"Look away; list 5 details of where you are. Then check."* [Confirmed]
5. **Negative-space scan** — *"Note what's missing or absent here, not just what's present."* [Practitioner]
6. **Alternate uses** — *"Name 6 uses for an object in front of you in 60 seconds."* [Inference]
7. **Calibrated question in vivo** — *"Ask one open, non-leading question and just listen."* [Practitioner]
8. **Key-assumptions check** — *"List the 3 assumptions your current plan depends on most."* [Practitioner]
For seeded Day 43: `43 % 8 = 3` → show **"Consider-the-opposite on a headline"** as today's drill.

---

# SCREEN-BY-SCREEN SPEC (all 13 — every screen built to full Home-level fidelity)

### 1. Login / Sign-up `(/login)` — public
**Purpose:** trustworthy, open-source, low-friction entry.
**Layout:** centered card max-width 440px on the default aged-paper `--bg` (a worn diary cover); handwritten title, mono helper text. A faint embossed/foiled feel via `--accent`, no literal leather texture.
**Components/copy:** Title (handwriting font, large) "The 66-Day Perception & Judgment System". Email field (`type=email`, real `<label>`). Primary CTA **"Send login link"** (magic link, amber). OR-divider. Secondary **"Sign up with GitHub"** (outline). Tertiary collapsible "Use a password instead". Privacy line under the buttons (mono, muted): *"End-to-end private. No telemetry. Open source. Your journal is yours."* Footer: GitHub link + star count ("Open Source on GitHub · ★ 1.2k"), "MIT License", "Updated Jun 2026", "Self-host on your own Supabase".
**States:** idle / sending (button disabled, text "Sending link…") / success ("Check your inbox. We sent a login link to you@signal.dev." + "Resend in 60s" countdown + "Check your spam folder.") / error (specific: "That link expired. Send a fresh one?"). Magic-link tokens framed as 15-min single-use.

### 2. Onboarding `(/onboarding)` — max 3 steps + done, Skip on each
**Purpose:** honest expectations + set the cue + pick start date.
- **Step 1 — What this is:** "Train your judgment over 66 days." 3 calm bullets (perception, calibrated forecasting, people-reading — *domain-specific gains, not an IQ boost*). "[Learn more]".
- **Step 2 — Set your nightly ritual (implementation intention):** free-text write-in (not a dropdown): **"After I ______, I will open the journal."** Prefill *"brush my teeth"*; user edits. Microcopy: *"Pair it with an existing habit. This is the single biggest lever for sticking with it."* [Confirmed] chip → Lally/Gollwitzer citation.
- **Step 3 — Start date + expectations:** date picker (default Today; Tomorrow; custom, today..+30d). "What to expect" list: *"~30–40 min nightly (Phase 1 is shorter). Miss one day and nothing resets. Miss two and the streak resets. Range: 18–254 days; 66 is the target."* Show the Phase 1 roadmap card.
- **Done:** "Day 1 awaits. Remember — completing Day 1 of 66 is the real milestone."

### 3. Today / Home `(/home)` — the diary hub (THE DIARY FEELING LIVES HERE)
**Purpose:** current day/phase/streak + today's phase-gated captures + night entry point.
**Layout (mobile-first):** DayPhaseHeader (mono display "Day 43"); cue line; today's captures as a 2×2 grid of CaptureCards (D1 D2 / D3 D4) each showing status (done ✓ / not started / locked with "Unlocks Day N"); a prominent **"Begin night session"** CTA with the cue and "~32–38 min"; **Drill-of-the-day card** (Phase 3+); **"Pages filled" stat (computed word count)**; a compact streak strip linking to the heatmap. Desktop: captures left, stats/heatmap-preview right.
**Phase behavior:** **Phase 1 home shows only D1, D2, and a "Begin night session (~5 min)" entry point** (AAR lives in Night as N2-minimal — Home never renders an AAR card); D3/D4/N-items render via **PhaseGate** (disabled + reason). Phase 4 (seeded Day 43) shows all unlocked + the drill card.
**Day-35 mid-system self-critique (one-time):** when `day === 35` (reachable via DevTools), show a one-time calm banner/modal: *"Mid-system check. Cut anything you're routinely skipping — a lean habit you keep beats a full one you drop."* It surfaces a small **skip-tracker** ("You've skipped N5 on 4 of the last 7 nights") and offers "Trim my nightly set" (toggles which optional items show). Dismissible once.
**Phase-5 taper (Days 61–66):** when `phase === 5`, Home shows a quiet **taper indicator** ("Taper week — required: D1 + N2 + resolve due predictions. Everything else optional.") and the night session requires fewer items.
**Minimum-day fast path:** top-right toggle **"Minimum day"** (surfaced after 9pm or when little time remains) → collapses to the non-negotiable core **D1 + D3 + 2-line AAR (one if-then)**; calendar later marks it a partial day (`--heat-partial`). Honest helper: "For the busiest day. Keeps the streak alive."
**States:** empty/first-run (Day 1: welcome, Phase 1 explainer, "Start your first D1 entry", example placeholders) / loading (skeleton cards) / filled / post-capture success (inline calm toast "Capture saved. Keep going." + ink-settle check) / post-night ("Session logged…" summary).
**Forgiving streak:** if one day missed, a quiet checkpoint line "A grace day is active — finish today's core to keep the streak." No alarm. Second consecutive miss → calm (non-alarm) modal: "Streak reset to Day 0. This is where the real growth happens. Pick it up tomorrow." (Seed shows this happened ONCE at Day 25; current streak 19.)

### 4. Daytime capture flow (D1–D4) `(/capture/:type)`
**Purpose:** fast, low-friction, jot-as-you-go (~1–2 min each).
**Layout:** modal (mobile full-screen) with pre-labeled ruled-line fields, auto-focus first field, save-on-blur, close on success. On mobile the bottom tab bar hides while a capture is focused.
**Exact labels (do not paraphrase):**
- **D1 — Baseline + Anomaly [Confirmed]:** Place · Baseline (what's normal here?) · Anomaly (what broke it?) · So what? (one-line projection).
- **D2 — Three Noticings:** three fields; helper *"Concrete detail only — no judgment."*
- **D3 — One Problem → Idea Seed [Inference]:** Problem (state it first) · Candidate solution; helper *"Anchor it to something you observed today."*
- **D4 — One People Note [CONTESTED]:** Person · Their baseline · The shift (+ topic) · Open question to ask next; persistent helper *"Observations, not conclusions. No verdicts."* (chip popover carries the Bond & DePaulo 54% caveat).
**Outreach capture (Phase 4+) — `OutreachModal`, reachable from Home, NOT a daily capture and NOT a streak item:** fields **Who · Why now · Value offered first** (value-first is required framing); on save it increments the weekly counter only. Helper: *"Only when there's a genuine, value-first reason. Target 2–3 per week."*
**States:** locked (PhaseGate) / empty (placeholders) / filled / validation (gentle, secondary-color inline text, green underline on valid — never a red X) / saved.

### 5. Night session flow (N1–N5) `(/night)` — immersive ritual
Full-screen on Operator Night (`--bg-deep`, lamplit) — forced dark regardless of app theme — no nav/close, Back/Next only, step "Nx / total", "~min left", cue header, page-turn between steps. **Focus-trap the dialog** (Tab cycles within Back/Next/textarea); provide an accessible escape: **Esc opens a small "Leave session? Your entries are saved." confirm**, and **Back on the first step exits to Home** — keyboard users are never stranded.
- **N1 — Retrieval-First Recall [Confirmed]:** blank handwriting-font recall textarea on ruled paper → "Reveal captures" → RevealPanel with missed-item highlight (`--reveal-missed-bg`) + checkmark + miss-rate line. **aria-live announcement on reveal:** *"Captures revealed. You recalled 3 of 4."*
- **N2 — After-Action Review [Practitioner] (US Army TC 25-20):** **Phase 1 = 2 fields (Happened? / Improve as if-then) — this is where the Phase-1 "2-line AAR" lives.** Phase 2+ = Intended · Happened · Why the gap · Sustain · Improve (if-then).
- **N3 — Calibrated Prediction Log [Confirmed]:** new prediction + probability % (1–99, validate) + resolution date; plus a **"Resolve due predictions"** list seeded with the 2 due-today rows (`p13`, `p14`), each with ✓/✗ and a pulse on resolve. **aria-live on resolve:** *"Prediction resolved: hit."* / *"…: miss."*
- **N4 — Consider-the-Opposite [Confirmed] (most days):** Belief · Strongest case against it · Evidence that would change my mind. **2-hypothesis-check variant (Phase 4, ~1×/week, replaces it that night):** distinct fields **Hypothesis A · Hypothesis B · Single most diagnostic test between them** — seed from `twoHypothesis`. Make clear by the step label which variant is showing.
- **N5 — SCAMPER Idea Development [Inference] — alternating days only:** **N5 appears only on even program-days from Phase 3 on.** The active seed is shown at top; 7 letters S·C·A·M·P·E·R; the highlighted/editable letter cycles by occurrence (Day 38 → "Combine"), prior letters show seeded read-only outputs (from `scamper`), later letters are empty/upcoming. **On a NON-SCAMPER night (odd day), omit N5 entirely and the step indicator counts to /4** (N1–N4); on an even day it counts to /5. Phase 1 night = N2 only ("/1", "~5 min").
  - **Responsive:** the 7-letter SCAMPER row must NOT overflow at 375px — render it as a **vertical accordion (or horizontal-scroll snap) on mobile**, 7 columns only on desktop.
**States:** phase-appropriate set only; in-progress autosave; final summary card. Enforce order — no skipping ahead.

### 6. Weekly Review (Sundays) `(/weekly)` — Phase 2+
**Purpose:** the ~25–30 min synthesis. Tabbed, one focused task per tab, "Next" at the bottom of each:
1. **Re-read** the week's captures (Phase 4+: collapsible **Spaced Retrieval** — recall 7-days-ago then 30-days-ago *before* reveal, same recall-then-reveal pattern as N1).
2. **Brier scoring** of resolved predictions + over/under-confidence note computed from the seed (e.g., *"Your 70%s happened 64% of the time — mildly overconfident."*).
3. **Best-idea cull** — pick ONE from this week's seeds.
4. **Pattern synthesis — Rule of Three:** show an **auto-detected list** of recurrences from the week's captures (from `weeklySynthesis.ruleOfThree`) with their counts, which the user confirms with a checkbox; items below 3 are shown greyed ("not yet a pattern"). Seeded confirmed output renders, e.g. *"Showed up 3+ times this week: morning anomalies on north-facing surfaces (×3); deferred asks when the decision-maker is absent (×3)."* Plus a real free-text synthesis field prefilled from the confirmed patterns — **never an empty textarea.**
5. **Elicitation-in-the-wild note** — prefilled from `weeklySynthesis.elicitation`, editable (not empty).
6. **System AAR** on the habit itself + outreach count check ("Outreach: 1 / 2–3" from the counter, framed as separate from the streak). **Phase 5 adds a Meta-AAR** prompt here (*"Across 66 days: what genuinely changed in how you see, decide, and read people?"*).
**States:** locked before Phase 2 / "available Sundays" / in-progress / complete (quiet "Week logged.").

### 7. Calibration / Analytics dashboard `(/calibration)` — desktop-optimized
Four+ hand-rolled SVG cards (stack on mobile, 2-col on desktop), accent + light grid, legend at bottom, calm framing ("You're improving on the measures that matter."). **All series computed from the seed arrays — nothing typed in.**
- **Calibration curve:** x = Predicted % (0–100), y = Actual % (0–100), dashed diagonal at y=x labeled 0%/100%; bins computed from the 12 resolved predictions, plotted as circles sized by √n (min 3px, max 12px); tooltip "Bin 70% · Actual 67% · n=3". Footnote: "Above the line = overconfident, below = underconfident. This is where superforecasters live — you're learning toward it." On touch, tap a bin to show its tooltip (tap target ≥44px hit area).
- **Brier trend:** downward line, y 0–0.5, dashed benchmark at **0.166** labeled "Superforecaster avg [Confirmed]"; ±1 SE band at ~15% opacity; current value figure in **mono display size**, "Brier 0.21 (±0.04), n=12" (trend lands near the computed resolved mean ≈0.179).
- **Anomaly miss-rate trend:** declining line by week from `missRateByWeek` (0.42 → 0.18), dashed target at 15%, "Goal: <10–15% by week 9." Current value in mono display.
- **66-day streak heatmap:** ~10×7 grid from the `heatmap` array, cells 24–28px mobile / 32–36px desktop, 2–3px gap, week labels. **Colors map 1:1 to the named tokens:** completed = `--heat-completed`; missed-once = `--heat-missed-once`; missed-twice = `--heat-missed-twice` (the single reset, Day 25); future = `--heat-future`; partial/min-day = `--heat-partial` (Day 30). **Non-color affordance required:** an inline legend with **text labels for each state**, and the missed-twice oxblood cell additionally carries a small diagonal-stripe/dot pattern (not color-only). Hover/tap → "Day 23 · Phase 3 · completed". No reset button, no shame.
- **Idea funnel** also linkable here.
**Early-data states (Phase 1–2):** faded grid placeholders with honest copy ("Tracking calibration — meaningful after ~20 resolved forecasts, typically Week 6+. 3 of 20 resolved.") — never blank graphs, never treat n<20 as a verdict.
**a11y:** every chart has `role="img"` + `aria-label` + a `<figcaption>` data summary (e.g. "Calibration: your 70% predictions resolved at 67%, n=3."). Confirm curve + heatmap stay legible and tappable at 375px.

### 8. Idea pipeline / library `(/ideas)`
Horizontal funnel from `ideaFunnel`: **Seeds (D3) → Weekly culls → Developed (SCAMPER) → Top 3** with counts overlaid (31 → 6 → 4 → 3), bar width ∝ volume, light→accent gradient. Below: seed cards (D3 text + date, render ~8 real ones + "+23 more"), a "Pick best" action in the cull lane, SCAMPER output in the developed lane, and a **"Top 3 by Day 66"** ranking from `topIdeas`. Tooltip per stage with attrition %.
**Phase 5 — "Pick your top 3 ideas" step:** a confirmation flow where the user promotes 3 finalists from the developed lane (seeded as `topIdeas`), with a calm "These three carry forward into your maintenance plan." Reachable here and from the Day-66 close.

### 9. Prediction log `(/predictions)`
Sections from the `predictions` array: **Due to resolve** (`p13`,`p14` — ✓/✗ actions), **Open** (`p15`–`p17`), **Resolved** (`p1`–`p12`, each with its Brier contribution shown). Manifold-style PredictionRow. Mobile = scrollable cards; desktop = table + a small calibration sparkline. Validation: "Probability must be 1–99%." Empty-state copy (only if a reviewer clears them): "No predictions resolved yet — your scorecard is emerging." **aria-live announces resolutions** here too.

### 10. Reading list / library `(/reading)`
Books from `reading`, grouped by skill area (Perception, Judgment, People-reading, Forecasting, Creativity). Each entry: EvidenceChip (top-left, popover from `CITATIONS` where applicable) + title (serif) + author (serif italic) + year (mono) + skill tag + one-line note; click expands the note/citation. Chips honest, never decorative.

### 11. Journal archive `(/archive)` — the "filled diary"
Three tabs: **Calendar** (month grid, dates with entry counts; hidden on mobile) · **Timeline** (reverse-chron list, primary on mobile, entry-type badges D1/N3/etc. + excerpt — populated from the seeded Days 3/22/38/53) · **Recall Sweeps** (Phase 4+: "What was 7 days ago?" blank field → reveal, same recall-then-reveal pattern). Search filters by entry type and evidence label. Reading old entries should feel like rediscovery. The "Pages filled / words" figure here uses the SAME computed word count as Home.

### 12. Settings `(/settings)`
Sections: **Ritual** (edit cue + a single quiet 10pm fallback reminder toggle — no aggressive notifications), **Account** (email, sign-out), **Appearance** (Aged Diary (paper) default / Operator Night (dark) toggle; note the night session is always dark), **Data** (export journal JSON/Markdown — mocked), **Techniques** (list every technique with its EvidenceChip + clickable source citation, **reading from the SAME `CITATIONS` object** — Van Horne & Riley 2014 / Endsley 1995, Roediger & Karpicke 2006, TC 25-20 1993, Tetlock 2015 / Brier 1950, Lord/Lepper/Preston 1984, Diehl & Stroebe 1987, Navarro 2008 + Bond & DePaulo 2006 caveat, Eberle/Osborn, Lally 2010 / Gollwitzer & Sheeran 2006), **About / Open Source** (GitHub link, license, self-host/privacy note), and the small prototype **Disclaimer**.

### 13. Phase roadmap `(/roadmap)`
Five horizontal phase cards across Days 1–66: name + day range + one-line unlock reason + feature list. **Current phase highlighted amber (`--heat-completed`); past phases muted-complete; future phases dimmed (`--gate-disabled-opacity`) with unlock dates.** Clicking a phase opens its feature detail. **Phase 5 detail must include:** the taper note, a link to the "Pick your top 3 ideas" step, the **Meta-AAR**, and the **`MaintenanceBuilder`** — a "Design your lean maintenance version" checklist (pre-checked non-negotiable core: D1 + N2 + resolve-due; optional add-ons the user can keep: D2/D3/D4/N1/N4/N5/drills/weekly) that produces a saved "maintenance card" shown on the Day-66 close. The **Day-66 close** is a calm full-screen card ("You've filled 66 days of your journal.") that surfaces the top-3 ideas, the meta-AAR summary, and the maintenance card — no confetti.

---

# OUTPUT CONTRACT (how to deliver the artifact)
- **One self-contained React component** (default export) using **Tailwind utility classes**; define exact hex tokens via an inline `<style>` block of CSS variables (including all `--heat-*`, `--reveal-missed-bg`, `--gate-disabled-opacity`, `--focus-ring`) + a small Tailwind-friendly mapping, and load **Patrick Hand, Kalam, Newsreader, JetBrains Mono, Inter** via a Google Fonts `<link>`/`@import`. Include the SVG grain data-URI and the ruled-line gradient recipe inline.
- **In-prototype navigation & state only** — a simple route/screen switch in `useState` (no React Router needed; if used, keep it in-memory). **Mock data in React state. No `fetch`, no Supabase, no localStorage, no external images, no analytics, no LLM calls.** Charts are **hand-rolled inline SVG — no chart library** — and **all chart series are derived from the seed arrays, not literals.** Include the DevTools day/phase/auth jumper (plus quick-jumps to Day 35 and Day 61/66).
- **Disclaimer (small, in Settings/About):** *"High-fidelity prototype of the 66-Day System UX. Auth and persistence are mocked; production uses Supabase."*
- **Responsive:** mobile-first for capture (≤640px: single column, 44px+ tap targets, full-width modals, bottom tab nav that hides in focus mode); 641–1024px tablet (2-col where sensible); ≥1025px desktop (sidebar nav, multi-column analytics, charts side-by-side). Night session is full-width immersive at every breakpoint (centered max-width ~640px on desktop). The SCAMPER 7-letter row becomes a vertical accordion / horizontal scroll on mobile. **Test at 375px.**
- **Theming:** ship **Aged Diary (paper) as the default** with a working **Operator Night (dark)** toggle in Settings; **the night session always renders in the dark theme regardless of the toggle**. Both themes use the token sets above, and the **ruled lines + red margin + grain + vignette must be verified in both themes**, with **all chip/text contrast ≥4.5:1 in both**.
- **Accessibility (built-in, not bolted on):** semantic HTML; every input has a real `<label htmlFor>` (multi-line uses `<textarea aria-label>`); `fieldset/legend` for grouped fields; icon buttons get `aria-label`; modals `role="dialog" aria-labelledby` and are **focus-trapped with an Esc/confirm escape (especially the night session)**; charts include `role="img"` + `aria-label`/`<figcaption>` data summaries; **aria-live regions announce the signature state changes** (N1 reveal: "Captures revealed. You recalled 3 of 4."; prediction resolve: "Prediction resolved: hit/miss."); visible focus ring `outline: 2px solid var(--focus-ring); outline-offset: 2px` (theme accent in both modes); logical tab order; Enter submits, Esc closes; **text contrast ≥ 4.5:1** in BOTH themes (paper `#2e2620` on `#e7dcc4` ≈ 9:1; night `#ece4d4` on `#1c1813` ≈ 12:1); **never color-only status** — always a text label/icon (the heatmap also gets a text legend + a pattern on the reset cell); honor `prefers-reduced-motion`.

Build it complete, opinionated, and immersive on the first pass. Build every one of the 13 screens to the same fidelity as Home — no placeholders, no "coming soon", no generic lists. When in doubt, choose the quieter, more diary-like option.