---
type: spec
role: research-evidence
app: 66-day-system
feature: gamification
status: reference
created: 2026-06-08
informs: gamification.md
---

# Gamification — Research Evidence Archive

> **Why this file exists:** so a new agent or teammate never has to re-run the research.
> This is the durable evidence base behind [`gamification.md`](./gamification.md) (the design).
> Part A (theory) was gathered by a fan-out deep-research pass and **adversarially verified**
> (25 claims, 3-vote refute test, 0 refuted). Part B (user sentiment + dark-pattern/addiction
> risk) was **started but halted early to conserve budget** — its sources were fetched but not
> individually verified, so Part B is labelled *directional*. Evidence labels follow the canonical
> doc's convention: `Confirmed by research / Practitioner-endorsed / User-reported / Reasonable inference / Speculative`.

## How to use this
- Building a mechanic? Check it against **§3 ranked mechanics** and **§4 failure modes**.
- Need the primary citation for a design choice? It's in **§1** (theory) or **§2** (sentiment), each row links its source.
- The one rule that governs everything: **show progress, never threaten it; affirm competence, never coerce.**

---

## 1. Part A — Theory & evidence (verified)

Vote = adversarial verifier result (3-0 unanimous; 2-1 = one dissent, noted).

| # | Finding | Label | Vote | Primary source (date) |
|---|---------|-------|------|------------------------|
| E1 | Build for SDT's three needs — **competence, autonomy, relatedness**. Thwarting them lowers motivation *and* wellbeing. SDT is the dominant lens in gamification research. | Confirmed by research | 3-0 | Ryan & Deci, *American Psychologist* 55(1):68-78 (2000) — https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf |
| E2 | **Expected tangible rewards contingent on behavior UNDERMINE intrinsic motivation** (engagement-contingent d=−0.40, completion d=−0.36, performance d=−0.28). **Positive/verbal feedback ENHANCES it** (d≈+0.31). Magnitude is debated (Cameron & Pierce) but existence is consensus. | Confirmed by research (effect) / Reasonable inference (app) | 2-1 | Deci, Koestner & Ryan, *Psych. Bulletin* 125(6):627-668, 128 experiments (1999) |
| E3 | **Threats, deadlines, directives, pressured evaluation, imposed goals diminish** intrinsic motivation; choice & self-direction enhance it. (p.70, verbatim.) → indicts anxiety countdowns, punitive loss, coercive notifications. | Confirmed by research (mechanism) / Practitioner-endorsed (streak application) | 3-0 | Ryan & Deci (2000), p.70 |
| E4 | **Positive/competence-affirming feedback beats punitive framing** (negative vs positive g≈−0.37). Negative feedback isn't worse than *no* feedback (g≈.07 n.s.). Competence motivates only when paired with autonomy. | Confirmed by research | 3-0 | Ryan & Deci (2000); Fong, Patall, Vasquez & Stautberg, *Educ. Psych. Review* (2019), DOI 10.1007/s10648-018-9446-6 |
| E5 | Gamification "works" — **qualified yes**: effects are context- & user-dependent, often *partial*, may fade (novelty). **Removing** earned points/badges can *harm* engaged users (loss aversion). Points/badges/leaderboards are the most-studied (and most shallowly applied) elements. | Confirmed by research | 3-0 / 2-1 | Hamari, Koivisto & Sarsa, HICSS-47 (2014) — http://creativegames.org.uk/modules/Gamification/Hamari_etal_Does_gamification_work-2014.pdf |
| E6 | Larger review (N=819 studies, 273 empirical): results lean positive **but the amount of mixed/inconclusive results is "remarkable."** Not reliably positive. | Confirmed by research | 3-0 | Koivisto & Hamari, *Int. J. Information Management* 45:191-210 (2019) — https://www.sciencedirect.com/science/article/pii/S0268401217305169 |
| E7 | Effect sizes: cognitive **g=.49** [.30,.69], motivational **g=.36** [.18,.54], **behavioral g=.25** [.04,.46]. Under high methodological rigor cognitive held (g=.42) but **motivational (p=.20) and behavioral (p=.22) lost significance.** The outcome a habit app needs most is the smallest & least stable. | Confirmed by research | 3-0 | Sailer & Homner, *Educ. Psych. Review* 32:77-112 (2020) — https://link.springer.com/article/10.1007/s10648-019-09498-w |
| E8 | **Specific elements → specific effects** (gamification is not motivating per se). Badges + leaderboards + progress graphs → *competence* (M=4.19 vs 3.76). Avatars + story + teammates → *relatedness* (M=1.77 vs 1.49). **Game-fiction and combining competition WITH collaboration are particularly effective.** Effect sizes small (ηp²≈.02–.03). | Confirmed by research | 3-0 | Sailer, Hense, Mayr & Mandl, *Computers in Human Behavior* 69:371-380, RCT N=419 (2017); Sailer & Homner (2020) |
| E9 | 66 days is the **median** to 95% automaticity, **range 18–254** — an average, not a guarantee. Don't present day 66 as "habit unlocked." | Confirmed by research | 3-0 | Lally, van Jaarsveld, Potts & Wardle, *Eur. J. Social Psych.* (2010), DOI 10.1002/ejsp.674 |
| E10 | Automaticity follows a **diminishing-returns curve** — early reps yield the largest gains → **front-load support** (maps to Phase 1, days 1–14). | Confirmed (curve) / Reasonable inference (design) | 3-0 | Lally et al. (2010); Gardner, Lally & Wardle, PMC3505409 |
| E11 | **Missing one day does not derail habit formation** → forgiving streaks (grace/freeze) are evidence-backed; punitive resets are not. **Caveat: study tested *single* misses, not consecutive lapses.** | Confirmed (single miss) / Reasonable inference (grace design) | 2-1 | Lally et al. (2010); Lally & Gardner (2013), PMC3505409 |
| E12 | **Fogg B=MAP** — behavior fires only when Motivation + Ability + Prompt converge; when it fails ≥1 is missing. Make the action tiny, prompt well, *celebrate* completion. | Practitioner-endorsed / definitional | 3-0 | BJ Fogg, behaviormodel.org; Stanford Behavior Design Lab |
| E13 | **Goal-gradient effect** is real (interpurchase time −20% near a reward; acceleration predicts retention). **Endowed/illusory progress** is real (pre-filled "head start" → faster completion; 34% vs 19% redemption). **⚠️ These are commercial loyalty mechanics that work via extrinsic pull — in direct conflict with E2/E3.** Goal-gradient *weakens under low autonomy* (Hu et al. 2021). | Confirmed (mechanism) / Reasonable inference (app) | 3-0 | Kivetz, Urminsky & Zheng, *J. Marketing Research* 43(1):39-58 (2006); Nunes & Drèze, *JCR* 32(4):504-512 (2006) |
| E14 | **Implementation intentions** ("if-then" plans) raise goal achievement, **d≈0.65** (medium-large). The app already uses this as `habit_cue`. | Confirmed by research | (pass-1 fetched; also cited in canonical doc) | Gollwitzer & Sheeran (2006) |
| E15 | **Goal-setting theory:** specific + challenging goals beat "do your best"; commitment, feedback, and task complexity moderate. | Confirmed by research | (pass-1 fetched) | Locke & Latham, *American Psychologist* (2002) |

### Verification stats (pass 1)
5 search angles · 26 sources fetched · 109 claims extracted · **25 verified · 0 refuted · 14 after dedup.**
108 sub-agents, ~2.4M tokens. Full raw output preserved in the session transcript.

---

## 2. Part B — Real user sentiment & ethical risk (directional; verification halted)

> **Caveat:** these sources were fetched but **not** individually adversarially verified (research was
> stopped to conserve budget). Treat as *directional*, label `[User-reported]` / `[Practitioner-endorsed]`.
> A dedicated, verified sentiment pass (r/duolingo, r/getdisciplined, r/Habitica, r/Snapchat, HN,
> Product Hunt, app-store reviews) remains an open task before finalizing failure-mode guidance.

**What users LOVE** `[User-reported]`
- Streaks/visible progress create momentum and identity ("I'm someone who shows up"); the daily
  "don't break the chain" pull is genuinely motivating *while it lasts*.
- Celebration / competence feedback feels good; badges that mark *real* milestones are valued.
- Cooperative/social accountability (a buddy who also shows up) builds belonging.

**What users HATE → failure modes to design AROUND**

| # | Failure mode | Label | Sources fetched (date) |
|---|--------------|-------|------------------------|
| F1 | **Streak anxiety & loss-rage.** Long streaks become dread; breaking one (often to a bug/timezone/one busy day) → grief + "why bother now" abandonment. | User-reported / Practitioner-endorsed | Decision Lab "Streak-creep" (2024); networkcultures.org "Baby please don't break the streak" (2026-01-19); Smashing Magazine "Designing a Streak System" (2026-02) |
| F2 | **The streak replaces the goal.** People optimize the *number*, do the minimum / game it, learn nothing. | User-reported | dev.to "Duolingo's shallow learning trap"; Medium "How Duolingo makes me feel guilty (and why that works)" |
| F3 | **Guilt & manufactured obligation**, esp. social streaks (Snapchat) — become a chore and a social *debt*. | User-reported | screenwiseapp "Snapchat streaks & social obligation"; evolvetreatment "Snapchat streaks & addicted teens" |
| F4 | **Leaderboard toxicity:** cheating/bots, demotion/relegation anxiety, sandbagging, stress; competition-only demotivates the middle/bottom. | User-reported | (Duolingo leagues sentiment — fetch not fully verified) |
| F5 | **Pay-to-restore-streak resentment.** Paywalling streak repair/freezes reads as manipulation, breeds distrust. | User-reported | (Duolingo Streak Repair sentiment — fetch not fully verified) |
| F6 | **Notification spam & manufactured urgency** ("streak ends in 2 hours!") — classic dark patterns; reads as coercive (violates E3). | Practitioner-endorsed | Brignull *deceptive.design*; UX Mag "Gamification or Manipulation"; Wikipedia "Dark pattern" |
| F7 | **ADHD / variable-life users** punished by rigid daily streaks; all-or-nothing resets especially harmful. | User-reported | helloklarity "Why streak features fail ADHD users" |
| F8 | **Variable-ratio reward risk.** Unpredictable/random rewards (Skinner-box) drive compulsion. **Avoid entirely** — give deterministic competence feedback, never random payoffs. | Practitioner-endorsed | thebrink.me "gamified life: dark psychology & app addiction" |

---

## 3. Synthesis — ranked mechanics that WORK (confidence)

1. **Competence-affirming progress feedback / celebration** — *high*. (E1, E4, E12)
2. **Forgiving streaks (grace + earned freeze), never punitive** — *high*. (E11, F1, F7)
3. **Progress visualization (badges / progress graph / heatmap)** for competence — *med-high*. (E8)
4. **Achievements tied to real milestones** (not vanity) — *med*. (E8, designs around F2)
5. **Cooperative social (buddy) > competition-only** for relatedness — *med*. (E8, F3/F4)
6. **Endowed-progress onboarding + goal-gradient progress** — *med*, **but only as honest visualization, never coercive payoff** (the E13↔E2/E3 tension). 
7. **Opt-in leaderboard, small cohort, no relegation drama** — *low-med* (toxicity risk F4).

**Behavioral effects are small and fragile (E7)** — temper expectations; don't over-engineer.

## 4. Where evidence and sentiment AGREE / DISAGREE
- **Agree:** forgiving streaks (E11↔F1/F7); celebration over punishment (E4↔F1); cooperation over pure competition (E8↔F4); no manipulation/urgency (E3↔F6).
- **Disagree (the core tension):** loss-aversion streak pressure & goal-gradient countdowns *raise short-term engagement* (commercially proven, E13) but *erode intrinsic motivation* (E2/E3) and *anger users* (F1/F5/F6). **Resolution adopted in the design: favor intrinsic motivation + trust — progress is shown, never threatened; nothing is paywalled.**

## 5. Open questions (carry forward)
- Verified user-sentiment quotes (Part B) — not yet collected quote-by-quote.
- Optimal forgiving policy beyond a *single* miss (Lally tested single misses only).
- Buddy streaks: relatedness vs guilt — net effect on this audience is unverified.
- CP point weights and leaderboard cohort sizing are product calls, not settled by evidence.
