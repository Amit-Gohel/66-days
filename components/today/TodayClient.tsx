"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { CHIP_COLORS, CITATIONS, type Tier } from "@/lib/static/citations";
import { TODAY_CARDS, readLabel, type TodayCard } from "@/lib/static/today-cards";
import type { CaptureKey } from "@/lib/static/capture-spec";
import type { BadgeView } from "@/lib/queries/gamification";
import type { Prediction } from "@/lib/types";
import { upsertDayCapture } from "@/lib/actions/captures";
import { completeNight, createPrediction, resolvePrediction } from "@/lib/actions/night";

// ── serializable props from the server ──────────────────────────────────────
export interface TodayGame {
  craftPoints: number;
  rankName: string;
  rankProgressPct: number; // 0–100
  toNext: number | null; // CP to next rank, or null at top
  freezesAvailable: number;
  badges: BadgeView[];
  unlockedCount: number;
  totalBadges: number;
}
export interface NightPredictions {
  due: Prediction[];
  open: Prediction[];
  brier: number | null;
  resolvedCount: number;
}
export interface TodayProps {
  mode: "today" | "past";
  dayNum: number;
  phase: number;
  phaseLabel: string;
  values: Record<CaptureKey, Record<string, string>>; // saved field values per section
  night: { recall: string; replay: string; done: boolean };
  predictions?: NightPredictions | null; // today only
  game: TodayGame | null; // today only
  stats: { streak: number; words: number; week: string };
}

const NIGHT_VARS: React.CSSProperties = {
  ["--bg" as string]: "#1c1813",
  ["--bg-deep" as string]: "#141009",
  ["--surface" as string]: "#262019",
  ["--surface-2" as string]: "#2e271e",
  ["--border" as string]: "#3c352a",
  ["--text" as string]: "#ece4d4",
  ["--text-2" as string]: "#a59c8a",
  ["--text-3" as string]: "#6f6757",
  ["--accent" as string]: "#d4a574",
  ["--accent-hover" as string]: "#c49860",
  ["--rule" as string]: "rgba(212,165,116,.16)",
  ["--margin-rule" as string]: "rgba(150,70,55,.30)",
};

const RULED: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(transparent 0 33px, var(--rule) 33px 34px), linear-gradient(to right, transparent 15px, var(--margin-rule) 15px 16px, transparent 16px)",
  backgroundAttachment: "local, scroll",
};

function sectionFilled(v: Record<string, string> | undefined): boolean {
  return !!v && Object.values(v).some((x) => x && x.trim());
}

// ── evidence chip ────────────────────────────────────────────────────────────
function EvidenceChip({
  tier,
  src,
  open,
  onToggle,
  dark,
}: {
  tier: Tier;
  src: string;
  open: boolean;
  onToggle: () => void;
  dark?: boolean;
}) {
  const color = CHIP_COLORS[tier];
  return (
    <div style={{ marginTop: 9 }}>
      <button
        onClick={onToggle}
        aria-label="Evidence basis for this technique"
        className="f-mono"
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: 11,
          letterSpacing: ".03em",
          border: `1px solid ${color}`,
          color,
          background: "transparent",
          borderRadius: 3,
          padding: "2px 7px",
          cursor: "pointer",
        }}
      >
        [{tier}]
      </button>
      {open && (
        <div
          className="f-serif"
          style={{
            marginTop: 8,
            border: "1px solid var(--border)",
            background: dark ? "var(--bg-deep)" : "var(--bg)",
            borderRadius: 3,
            padding: "9px 11px",
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "var(--text-2)",
            maxWidth: "52ch",
          }}
        >
          {src}
        </div>
      )}
    </div>
  );
}

// ── capture card (view / edit / empty) ───────────────────────────────────────
function CaptureCard({
  card,
  values,
  editable,
  editing,
  draft,
  chipOpen,
  justSaved,
  onOpen,
  onChange,
  onSave,
  onCancel,
  onToggleChip,
}: {
  card: TodayCard;
  values: Record<string, string>;
  editable: boolean;
  editing: boolean;
  draft: Record<string, string>;
  chipOpen: boolean;
  justSaved: boolean;
  onOpen: () => void;
  onChange: (k: string, v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onToggleChip: () => void;
}) {
  const filled = sectionFilled(values);
  const status = editing ? "Writing" : filled ? "Written" : "To do";
  const showBorder = editing || filled;

  return (
    <article style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}>
      {/* header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${showBorder ? "var(--border)" : "transparent"}` }}>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>
          {card.kicker}
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <h3 className="f-serif" style={{ margin: 0, fontWeight: 500, fontSize: 21, color: "var(--text)" }}>
            {card.title}
          </h3>
          <span
            className="f-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              padding: "4px 9px",
              borderRadius: 20,
              background: filled ? "rgba(154,107,52,.14)" : "var(--surface-2)",
              color: filled ? "var(--accent)" : "var(--text-3)",
            }}
          >
            {status}
          </span>
        </div>
        <div className="f-serif" style={{ fontSize: 15, color: "var(--text-2)", marginTop: 4 }}>
          {card.what}
        </div>
        <EvidenceChip tier={card.tier} src={card.src} open={chipOpen} onToggle={onToggleChip} />
      </div>

      {/* editing */}
      {editing && (
        <div style={{ padding: "14px 16px 16px" }}>
          {card.fields.map((f) => (
            <div key={f.k} style={{ marginBottom: 13 }}>
              <label htmlFor={`${card.key}-${f.k}`} className="f-mono" style={{ display: "block", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-2)", marginBottom: 5 }}>
                {f.label}
              </label>
              <div className="f-serif" style={{ fontSize: 15, lineHeight: 1.5, color: "var(--text-2)", marginBottom: 8 }}>
                {f.hint} <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>{f.eg}</span>
              </div>
              <textarea
                id={`${card.key}-${f.k}`}
                value={draft[f.k] ?? ""}
                onChange={(e) => onChange(f.k, e.target.value)}
                rows={f.rows}
                className="f-hand"
                style={{
                  width: "100%",
                  display: "block",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  borderRadius: 3,
                  color: "var(--text)",
                  fontSize: 18,
                  lineHeight: "30px",
                  padding: "8px 14px 6px 20px",
                  resize: "none",
                  ...RULED,
                }}
              />
            </div>
          ))}
          <div className="flex items-center gap-2.5" style={{ marginTop: 4 }}>
            <button onClick={onSave} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#f4ead3", fontSize: 11, letterSpacing: ".08em", borderRadius: 3, padding: "9px 16px", cursor: "pointer" }}>
              Save
            </button>
            <button onClick={onCancel} className="f-mono" style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 11, letterSpacing: ".06em", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* saved (read + edit) */}
      {!editing && filled && (
        <div style={{ padding: "8px 16px 14px" }}>
          {card.fields
            .filter((f) => values[f.k] && values[f.k].trim())
            .map((f) => (
              <div key={f.k} style={{ marginBottom: 7 }}>
                <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 1 }}>
                  {readLabel(card, f.k)}
                </div>
                <div
                  className="f-hand"
                  style={{
                    fontSize: 18,
                    lineHeight: "30px",
                    color: "var(--text)",
                    paddingLeft: 18,
                    backgroundImage: "linear-gradient(to right, transparent 13px, var(--margin-rule) 13px 14px, transparent 14px)",
                  }}
                >
                  {values[f.k]}
                </div>
              </div>
            ))}
          {editable && (
            <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
              <button onClick={onOpen} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, letterSpacing: ".04em", padding: "6px 12px", cursor: "pointer" }}>
                ✎ Edit
              </button>
              {justSaved && (
                <span className="f-mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--accent)" }}>
                  ✓ saved
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* empty (teach + first action) */}
      {!editing && !filled && (
        <div style={{ padding: "14px 16px 16px" }}>
          <div className="f-serif" style={{ fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: "var(--text-2)", marginBottom: 13 }}>
            {card.emptyText}
          </div>
          {editable && (
            <button onClick={onOpen} className="f-mono" style={{ background: "none", border: "1px solid var(--accent)", borderRadius: 3, color: "var(--accent)", fontSize: 11, letterSpacing: ".06em", padding: "8px 14px", cursor: "pointer" }}>
              + {card.openText}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ── ledger (Craft Points + freeze + badges) ──────────────────────────────────
function Ledger({ game, stats, onCalendar }: { game: TodayGame; stats: TodayProps["stats"]; onCalendar: () => void }) {
  return (
    <div>
      <div className="f-mono" style={{ fontSize: 11.5, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 16 }}>
        The ledger · kept in the back of the book
      </div>

      <div className="flex flex-wrap items-baseline" style={{ gap: 20, marginBottom: 18 }}>
        <Stat n={stats.words.toLocaleString()} label="words written" />
        <button onClick={onCalendar} className="flex items-baseline" style={{ gap: 6, background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
          <span className="f-mono" style={{ fontSize: 21, color: "var(--text-2)" }}>{stats.week}</span>
          <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--text-3)", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
            this week · open the calendar
          </span>
        </button>
      </div>

      {/* Craft Points */}
      <div style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 5, padding: "16px 18px", marginBottom: 14 }}>
        <div className="f-mono" style={{ fontSize: 11.5, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 9 }}>
          Craft Points
        </div>
        <div className="flex flex-wrap items-baseline" style={{ gap: 10 }}>
          <span className="f-mono" style={{ fontSize: 34, lineHeight: 1, color: "var(--accent)" }}>{game.craftPoints.toLocaleString()}</span>
          <span className="f-mono" style={{ fontSize: 13, color: "var(--accent)" }}>CP</span>
          <span className="f-serif" style={{ fontStyle: "italic", fontSize: 20, color: "var(--text)", marginLeft: 2 }}>{game.rankName}</span>
        </div>
        <div style={{ height: 3, borderRadius: 3, background: "var(--surface-2)", margin: "13px 0 9px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${game.rankProgressPct}%`, background: "var(--accent)", borderRadius: 3 }} />
        </div>
        <div className="f-serif" style={{ fontSize: 13.5, color: "var(--text-2)" }}>
          {game.toNext != null ? `${game.toNext.toLocaleString()} CP to next rank. Reflects the work you’ve put in.` : "Top rank — you’ve put in the work."}
        </div>
        <div className="f-serif" style={{ fontStyle: "italic", fontSize: 13, color: "var(--text-2)", marginTop: 7 }}>
          CP mirrors the work you’ve put in — it isn’t a currency. Nothing is ever spent, bought, or locked behind it.
        </div>
      </div>

      {/* freeze */}
      {game.freezesAvailable > 0 ? (
        <div className="flex items-center" style={{ gap: 8, border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 20, padding: "6px 13px 6px 10px", marginBottom: 16, color: "var(--accent)", width: "fit-content" }}>
          <Icon name="snowflake" size={15} />
          <span className="f-mono" style={{ fontSize: 12.5, color: "var(--text-2)" }}>
            {game.freezesAvailable} streak {game.freezesAvailable === 1 ? "freeze" : "freezes"} banked — earned, never bought.
          </span>
        </div>
      ) : (
        <div className="flex items-start" style={{ gap: 9, marginBottom: 18, color: "var(--text-3)" }}>
          <span style={{ flex: "none", marginTop: 1 }}><Icon name="snowflake" size={15} /></span>
          <span className="f-serif" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-2)", maxWidth: "56ch" }}>
            Streak freezes are earned — the first at your first weekly review (around Day 15). One quietly absorbs a missed day. Earned, never bought.
          </span>
        </div>
      )}

      {/* badges */}
      <div className="f-mono" style={{ fontSize: 11.5, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 11 }}>
        Your craft · {game.unlockedCount}/{game.totalBadges} badges
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(74px, 1fr))", gap: 10 }}>
        {game.badges.map((b) => (
          <div
            key={b.key}
            title={`${b.name} — ${b.desc}`}
            aria-label={`${b.name}: ${b.desc} ${b.unlocked ? "Unlocked." : "Locked."}`}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 7,
              padding: "11px 6px 9px",
              border: "1px solid var(--border)",
              borderRadius: 5,
              background: b.unlocked ? "var(--surface)" : "transparent",
              opacity: b.unlocked ? 1 : 0.5,
            }}
          >
            {!b.unlocked && (
              <span aria-hidden style={{ position: "absolute", top: 5, right: 5, color: "var(--text-3)", opacity: 0.8, display: "flex" }}>
                <Icon name="lock" size={13} />
              </span>
            )}
            <span style={{ color: b.unlocked ? "var(--accent)" : "var(--text-3)", display: "flex" }}>
              <Icon name={b.icon} size={22} />
            </span>
            <span className="f-mono" style={{ fontSize: 10, letterSpacing: ".02em", lineHeight: 1.3, textAlign: "center", color: b.unlocked ? "var(--text-2)" : "var(--text-3)" }}>
              {b.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-baseline" style={{ gap: 6 }}>
      <span className="f-mono" style={{ fontSize: 21, color: "var(--text-2)" }}>{n}</span>
      <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--text-3)", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────
// A fully worked example day — shown so a first-timer can see exactly what goes in
// every box. Keys match TODAY_CARDS field keys. Clearly labelled EXAMPLE so it can
// never be mistaken for the user's own entries.
const EXAMPLE_VALUES: Record<CaptureKey, Record<string, string>> = {
  D1: { place: "Coffee shop, 8am.", baseline: "Regulars, laptops, quiet.", anomaly: "A man in a winter coat watching the door — didn’t order.", sowhat: "Probably waiting, anxious — low threat, noted the exit." },
  D2: { a: "Barista re-stacks cups left-handed.", b: "Three people in the same trainers.", c: "Street noise drops at 9:10." },
  D3: { problem: "Gym lockers jam at 6pm.", solution: "Cheap door-sensors + an app showing free lockers." },
  D4: { person: "Client lead.", baseline: "Replies within hours, warm.", shift: "No reply for days, terse — on budget.", question: "“When does the team reconvene on this?”" },
};
const EXAMPLE_NIGHT: [string, string][] = [
  ["Recalled", "Recalled 2 of 3 + the locker idea. Forgot the budget reaction."],
  ["Replayed", "If it’s a school morning, then I lay the bag by the door the night before."],
];

function ExampleDay({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const exLabel = (text: string) => (
    <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 1 }}>{text}</div>
  );
  const exInk = (text: string) => (
    <div className="f-hand" style={{ fontSize: 19, lineHeight: "30px", color: "var(--text)" }}>{text}</div>
  );
  return (
    <div style={{ border: "1px dashed var(--accent)", background: "var(--surface)", borderRadius: 4, marginBottom: 26, overflow: "hidden" }}>
      <button onClick={onToggle} className="flex w-full items-center justify-between" style={{ gap: 10, background: "none", border: "none", cursor: "pointer", padding: "13px 16px", textAlign: "left", color: "var(--text)" }}>
        <span className="flex items-center" style={{ gap: 10 }}>
          <span className="f-mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 3, padding: "2px 7px" }}>EXAMPLE</span>
          <span className="f-serif" style={{ fontSize: 17, color: "var(--text)" }}>What a finished day looks like</span>
        </span>
        <span className="f-mono" style={{ fontSize: 15, color: "var(--text-3)" }}>{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "2px 18px 20px" }}>
          <p className="f-serif" style={{ fontSize: 15, color: "var(--text-2)", margin: "0 0 18px", maxWidth: "64ch", lineHeight: 1.55 }}>
            A whole day, filled in — so you can see exactly what goes in each box. This is just an example; your own day starts below.
          </p>
          {TODAY_CARDS.map((card) => (
            <div key={card.key} style={{ marginBottom: 18, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 3 }}>{card.kicker}</div>
              <div className="f-serif" style={{ fontSize: 18, color: "var(--text)", marginBottom: 9 }}>{card.title}</div>
              {card.fields.map((f) => (
                <div key={f.k} style={{ marginBottom: 7 }}>
                  {exLabel(f.label)}
                  {exInk(EXAMPLE_VALUES[card.key][f.k])}
                </div>
              ))}
            </div>
          ))}
          <div>
            <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 3 }}>Tonight’s review</div>
            <div className="f-serif" style={{ fontSize: 18, color: "var(--text)", marginBottom: 9 }}>A short, lamplit pass over the day</div>
            {EXAMPLE_NIGHT.map(([l, v]) => (
              <div key={l} style={{ marginBottom: 7 }}>
                {exLabel(l)}
                {exInk(v)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TodayClient(props: TodayProps) {
  const { mode, dayNum, phase, phaseLabel, game, stats } = props;
  const router = useRouter();
  const editable = mode === "today";

  const [values, setValues] = useState(props.values);
  const [editing, setEditing] = useState<CaptureKey | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [chipOpen, setChipOpen] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState<CaptureKey | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [nightDone, setNightDone] = useState(props.night.done);

  const [introOpen, setIntroOpen] = useState(true);
  const [introDismissed, setIntroDismissed] = useState(true); // start hidden until localStorage resolves
  const [exampleOpen, setExampleOpen] = useState(true);

  useEffect(() => {
    if (mode !== "today") return;
    // Post-mount read of persisted UI prefs (localStorage is client-only, so this
    // intentionally syncs after hydration to avoid an SSR mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    setIntroDismissed(localStorage.getItem("intro66Dismissed") === "1");
    setExampleOpen(localStorage.getItem("example66Closed") !== "1");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mode]);

  const toggleExample = () =>
    setExampleOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem("example66Closed", next ? "0" : "1");
      } catch {
        /* ignore */
      }
      return next;
    });

  const open = (k: CaptureKey) => {
    setDraft({ ...values[k] });
    setEditing(k);
  };
  const save = async (k: CaptureKey) => {
    setValues((v) => ({ ...v, [k]: { ...draft } }));
    setEditing(null);
    setJustSaved(k);
    setTimeout(() => setJustSaved((c) => (c === k ? null : c)), 1400);
    try {
      await upsertDayCapture(k, draft);
    } catch {
      /* optimistic; revalidate will reconcile */
    }
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 5000);
  };

  const subtitle =
    mode === "today"
      ? "A 66-day practice for noticing more and thinking more clearly. Each day: jot a few things you noticed, then a short review tonight. That’s the whole loop."
      : "Turn the page back to any day to re-read what you wrote in ink.";

  // Live "how much detail today" — filled capture fields (13) + night recall/replay (2).
  const filledFields = Object.values(values).reduce(
    (a, sec) => a + Object.values(sec).filter((v) => v && v.trim()).length,
    0,
  );
  const nightFilled = props.night.recall?.trim() || props.night.replay?.trim() || nightDone ? 2 : 0;
  const pct = Math.min(100, Math.round(((filledFields + nightFilled) / 15) * 100));

  return (
    <div className="anim-fade" style={{ maxWidth: game ? 1320 : 820, margin: "0 auto", padding: "clamp(26px,4vw,46px) clamp(18px,5vw,56px) 96px" }}>
      <header style={{ marginBottom: 26 }}>
        <div className="flex items-baseline justify-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div className="f-mono" style={{ fontSize: 13, letterSpacing: ".16em", color: "var(--accent)", fontWeight: 600 }}>DAY {dayNum} / 66</div>
          <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--text-3)" }}>{phaseLabel}</div>
        </div>
        <p className="f-serif" style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.6, color: "var(--text-2)", maxWidth: "60ch", fontWeight: 300 }}>{subtitle}</p>
      </header>

      {/* hero: big streak (the reward) + live completeness of today's page */}
      {mode === "today" && (
        <div className="flex flex-wrap items-center" style={{ gap: "clamp(16px,4vw,40px)", justifyContent: "space-between", border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 6, padding: "18px 22px", marginBottom: 26, boxShadow: "var(--shadow-card)" }}>
          <div>
            <div className="flex items-end" style={{ gap: 11 }}>
              <span className="f-mono" style={{ fontSize: 56, lineHeight: 0.82, fontWeight: 600, color: "var(--accent)" }}>{stats.streak}</span>
              <span className="f-serif" style={{ fontSize: 20, color: "var(--text)", paddingBottom: 6 }}>days in a row</span>
            </div>
            <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".04em", color: "var(--text-3)", marginTop: 7 }}>The chain the whole practice runs on — keep it alive.</div>
          </div>
          <div style={{ flex: "1 1 240px", maxWidth: 380, minWidth: 220 }}>
            <div className="flex items-baseline justify-between" style={{ marginBottom: 7 }}>
              <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)" }}>Today’s page</span>
              <span className="f-mono" style={{ fontSize: 15, color: "var(--accent)" }}>{pct}% filled</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: "var(--surface-2)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 8, transition: "width 320ms ease" }} />
            </div>
            <div className="f-serif" style={{ fontSize: 13, color: "var(--text-2)", marginTop: 7 }}>{pct >= 100 ? "A full page today — nicely done." : "Fills as you add detail to each card and the night review."}</div>
          </div>
        </div>
      )}

      {/* looking-back banner */}
      {mode === "past" && (
        <div className="flex items-center justify-between" style={{ gap: 10, border: "1px dashed var(--border)", background: "var(--surface)", borderRadius: 3, padding: "11px 15px", marginBottom: 24 }}>
          <span className="f-serif" style={{ fontStyle: "italic", fontSize: 15, color: "var(--text-2)" }}>Looking back — Day {dayNum} of 66</span>
          <button onClick={() => router.push("/home")} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#f4ead3", fontSize: 11, letterSpacing: ".06em", borderRadius: 3, padding: "7px 12px", cursor: "pointer" }}>Return to today</button>
        </div>
      )}

      {/* intro strip */}
      {mode === "today" && !introDismissed && (
        <div style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 3, marginBottom: 26, overflow: "hidden" }}>
          <button onClick={() => setIntroOpen((o) => !o)} className="flex w-full items-center justify-between" style={{ gap: 10, background: "none", border: "none", cursor: "pointer", padding: "13px 16px", textAlign: "left", color: "var(--text)" }}>
            <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-2)" }}>New here? The whole system in 20 seconds</span>
            <span className="f-mono" style={{ fontSize: 14, color: "var(--text-3)" }}>{introOpen ? "–" : "+"}</span>
          </button>
          {introOpen && (
            <div style={{ padding: "4px 16px 18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 }}>
                {[
                  ["During the day", "Jot what you notice. About five minutes, in small pieces."],
                  ["At night", "A short review, right on this page. What stuck, what you’d change."],
                  ["Over time", "Each day fills a square on your 66-day calendar."],
                ].map(([h, b]) => (
                  <div key={h} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: 13 }}>
                    <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 6 }}>{h}</div>
                    <div className="f-serif" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-2)" }}>{b}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setIntroDismissed(true); localStorage.setItem("intro66Dismissed", "1"); }} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, letterSpacing: ".06em", padding: "7px 13px", cursor: "pointer" }}>
                Got it — hide this
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "today" && <ExampleDay open={exampleOpen} onToggle={toggleExample} />}

      <div className={game ? "today-grid" : undefined}>
      <div className="min-w-0">
      <h2 className="f-serif" style={{ fontWeight: 300, fontSize: 30, letterSpacing: "-.01em", margin: "0 0 5px", color: "var(--text)" }}>What you noticed{mode === "past" ? "" : " today"}</h2>
      <div className="f-mono" style={{ fontSize: 12.5, letterSpacing: ".04em", color: "var(--text-2)", marginBottom: 20 }}>
        {mode === "today" ? "Tap a card to write · your words stay right here" : "Read-only · tap Edit to change anything"}
      </div>

      <div className="flex flex-col" style={{ gap: 16 }}>
        {TODAY_CARDS.map((card) => (
          <CaptureCard
            key={card.key}
            card={card}
            values={values[card.key] ?? {}}
            editable={editable}
            editing={editing === card.key}
            draft={draft}
            chipOpen={chipOpen === card.key}
            justSaved={justSaved === card.key}
            onOpen={() => open(card.key)}
            onChange={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
            onSave={() => save(card.key)}
            onCancel={() => setEditing(null)}
            onToggleChip={() => setChipOpen((c) => (c === card.key ? null : card.key))}
          />
        ))}
      </div>

      {/* tonight's review */}
      <NightReview
        mode={mode}
        phase={phase}
        initial={props.night}
        predictions={props.predictions ?? null}
        chipOpen={chipOpen}
        onToggleChip={(id) => setChipOpen((c) => (c === id ? null : id))}
        onDone={() => { setNightDone(true); flash("Review done. The chain holds."); }}
      />
      </div>

      {/* ledger rail (right column on desktop, below on mobile) */}
      {mode === "today" && game && (
        <aside className="today-rail">
          <Ledger game={game} stats={stats} onCalendar={() => router.push("/archive")} />
        </aside>
      )}
      </div>

      {/* toast */}
      {toast && (
        <div role="status" aria-live="polite" className="flex items-center" style={{ position: "fixed", left: "50%", bottom: 26, transform: "translateX(-50%)", zIndex: 60, gap: 12, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, padding: "11px 14px 11px 16px", boxShadow: "0 14px 40px -20px rgba(40,28,12,.6)", maxWidth: "90vw" }}>
          <span className="f-serif" style={{ fontStyle: "italic", fontSize: 15, color: "var(--text)" }}>{toast}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss" className="f-mono" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>×</button>
        </div>
      )}
    </div>
  );
}

// ── tonight's review (on-page night) ─────────────────────────────────────────
const NIGHT_STEPS = [
  { title: "Recall first", hint: "Before checking your notes, write what you remember from today.", eg: "e.g. Recalled 2 of 3 + the locker idea. Forgot the budget reaction.", tier: CITATIONS.N1.tier, src: CITATIONS.N1.src },
  { title: "Replay one moment", hint: "What you intended, what happened, one fix as an “if… then…”.", eg: "e.g. If it’s a school morning, then I lay the bag by the door the night before.", tier: CITATIONS.N2.tier, src: CITATIONS.N2.src },
];

type FiledPred = { id: string; claim: string; probability: number; resolves_on: string | null };

function NightReview({
  mode,
  phase,
  initial,
  predictions,
  chipOpen,
  onToggleChip,
  onDone,
}: {
  mode: "today" | "past";
  phase: number;
  initial: { recall: string; replay: string; done: boolean };
  predictions: NightPredictions | null;
  chipOpen: string | null;
  onToggleChip: (id: string) => void;
  onDone: () => void;
}) {
  const [recall, setRecall] = useState(initial.recall);
  const [replay, setReplay] = useState(initial.replay);
  const [done, setDone] = useState(initial.done);
  const [step, setStep] = useState(0); // 0 recall, 1 replay, 2 prediction
  const [active, setActive] = useState(false);
  const predUnlocked = phase >= 2;

  // prediction logging + resolving
  const [pClaim, setPClaim] = useState("");
  const [pProb, setPProb] = useState("");
  const [pDate, setPDate] = useState("");
  const [pErr, setPErr] = useState("");
  const [pFlash, setPFlash] = useState(false);
  const [filed, setFiled] = useState<FiledPred[]>([]);
  const [dueState, setDueState] = useState<(Prediction & { hit: boolean | null })[]>(
    (predictions?.due ?? []).map((p) => ({ ...p, hit: null })),
  );

  const dot = (on: boolean) => ({ width: 7, height: 7, borderRadius: "50%", background: on ? "var(--accent)" : "var(--border)" });

  const begin = () => { setActive(true); setStep(0); };
  const next = () => setStep((s) => Math.min(2, s + 1));
  const finish = async () => {
    try {
      await completeNight({ n1_recalled_text: recall, n2_happened: replay });
    } catch { /* optimistic */ }
    setActive(false);
    setDone(true);
    onDone();
  };

  const logPrediction = async () => {
    const n = parseInt(pProb, 10);
    if (!pClaim.trim()) return setPErr("Write the prediction first.");
    if (isNaN(n) || n < 1 || n > 99) return setPErr("How sure? Enter 1–99%.");
    setPErr("");
    try {
      const created = await createPrediction({ claim: pClaim.trim(), probability: n, resolves_on: pDate || null });
      setFiled((f) => [{ id: created.id, claim: created.claim, probability: created.probability, resolves_on: pDate || null }, ...f]);
      setPClaim(""); setPProb(""); setPDate("");
      setPFlash(true);
      setTimeout(() => setPFlash(false), 1800);
    } catch (e) {
      setPErr(e instanceof Error ? e.message : "Could not save.");
    }
  };
  const resolveDue = async (id: string, hit: boolean) => {
    setDueState((d) => d.map((p) => (p.id === id ? { ...p, hit } : p)));
    try {
      await resolvePrediction(id, hit);
    } catch {
      setDueState((d) => d.map((p) => (p.id === id ? { ...p, hit: null } : p)));
    }
  };

  const heading = (
    <>
      <div className="flex items-baseline justify-between" style={{ gap: 10, marginBottom: 3 }}>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--accent)" }}>Tonight</div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "radial-gradient(circle at 50% 38%, rgba(212,165,116,.55), rgba(212,165,116,.05) 70%)", flex: "none" }} />
      </div>
      <h2 className="f-serif" style={{ margin: "0 0 4px", fontWeight: 300, fontSize: 25, color: "var(--text)" }}>Tonight’s review</h2>
      <p className="f-serif" style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.6, color: "var(--text-2)", maxWidth: "58ch" }}>A short, lamplit pass over the day — recall it, replay one moment{predUnlocked ? ", log a forecast" : ""}.</p>
    </>
  );

  const ta = (value: string, set: (v: string) => void) => (
    <textarea
      value={value}
      onChange={(e) => set(e.target.value)}
      rows={3}
      className="f-hand"
      style={{ width: "100%", display: "block", border: "1px solid var(--border)", background: "var(--bg-deep)", borderRadius: 3, color: "var(--text)", fontSize: 20, lineHeight: "34px", padding: "8px 14px 6px 20px", resize: "none", minHeight: 56, ...RULED }}
    />
  );

  const openList: FiledPred[] = [
    ...filed,
    ...((predictions?.open ?? []).map((p) => ({ id: p.id, claim: p.claim, probability: p.probability, resolves_on: p.resolves_on }))),
  ];
  const pendingDue = dueState.filter((p) => p.hit === null);

  // The always-visible forecasts panel (phase 2+, today). Makes a logged prediction
  // immediately visible and lets you resolve due ones — the rest of canonical N3.
  const forecasts = predUnlocked && mode === "today" && (
    <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
      <div className="flex items-baseline justify-between" style={{ gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span className="f-mono" style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-3)" }}>Forecasts</span>
        <span className="f-mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
          Brier <span style={{ color: "var(--accent)" }}>{predictions?.brier != null ? predictions.brier.toFixed(3) : "—"}</span> · {predictions?.resolvedCount ?? 0} resolved · aim 0.166
        </span>
      </div>

      {dueState.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)", marginBottom: 7 }}>DUE TO RESOLVE — DID IT HAPPEN?</div>
          <div className="flex flex-col" style={{ gap: 7 }}>
            {dueState.map((p) => (
              <div key={p.id} className="flex items-center" style={{ gap: 10, border: "1px solid var(--border)", borderRadius: 4, padding: "9px 11px", background: "var(--bg-deep)" }}>
                <span className="f-hand" style={{ flex: 1, fontSize: 18, lineHeight: 1.35, color: "var(--text)" }}>{p.claim}</span>
                <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{p.probability}%</span>
                {p.hit === null ? (
                  <span className="flex" style={{ gap: 6 }}>
                    <button onClick={() => resolveDue(p.id, true)} aria-label="It happened" className="f-mono flex items-center" style={{ gap: 4, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)", padding: "5px 9px", cursor: "pointer", background: "none", fontSize: 11 }}><Icon name="check" size={13} /> yes</button>
                    <button onClick={() => resolveDue(p.id, false)} aria-label="It did not happen" className="f-mono flex items-center" style={{ gap: 4, border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)", padding: "5px 9px", cursor: "pointer", background: "none", fontSize: 11 }}><Icon name="x" size={13} /> no</button>
                  </span>
                ) : (
                  <span className="f-mono flex items-center" style={{ gap: 4, fontSize: 11, color: p.hit ? "var(--accent)" : "var(--warn)" }}><Icon name={p.hit ? "check" : "x"} size={14} /> {p.hit ? "hit" : "miss"}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)", marginBottom: 7 }}>OPEN FORECASTS ({openList.length})</div>
      {openList.length === 0 ? (
        <div className="f-serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "var(--text-3)" }}>None yet. File one in the prediction step.</div>
      ) : (
        <div className="flex flex-col" style={{ gap: 7 }}>
          {openList.map((p) => (
            <div key={p.id} className="flex items-center" style={{ gap: 10, border: "1px solid var(--border)", borderRadius: 4, padding: "9px 11px", background: "var(--bg-deep)" }}>
              <span className="f-hand" style={{ flex: 1, fontSize: 18, lineHeight: 1.35, color: "var(--text)" }}>{p.claim}</span>
              <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)" }}>{p.probability}%</span>
              <span className="f-mono" style={{ fontSize: 10.5, color: "var(--text-3)", minWidth: 84, textAlign: "right" }}>{p.resolves_on ?? "no date"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section aria-label="Tonight's review" style={{ marginTop: 30, ...NIGHT_VARS, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "22px 22px 24px", boxShadow: "0 1px 0 rgba(255,255,255,.03) inset, 0 18px 50px -30px rgba(0,0,0,.7)" }}>
      {heading}

      {/* done / read-only */}
      {(done || mode === "past") && !active ? (
        recall || replay || done ? (
          <div>
            <div className="f-mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, color: "var(--accent)", marginBottom: 12 }}>✓ Review done{mode === "past" ? ` for Day` : " for today"}</div>
            {[["Recalled", recall], ["Replayed", replay]].map(([label, text]) => (
              <div key={label} style={{ marginBottom: 9 }}>
                <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 1 }}>{label}</div>
                <div className="f-hand" style={{ fontSize: 20, lineHeight: "34px", color: "var(--text)", paddingLeft: 20, backgroundImage: "linear-gradient(to right, transparent 15px, var(--margin-rule) 15px 16px, transparent 16px)" }}>{text || "—"}</div>
              </div>
            ))}
            {mode === "today" && (
              <button onClick={begin} className="f-mono" style={{ marginTop: 6, background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, padding: "6px 12px", cursor: "pointer" }}>✎ Edit</button>
            )}
            {forecasts}
          </div>
        ) : (
          <div className="f-serif" style={{ fontStyle: "italic", fontSize: 15, color: "var(--text-3)" }}>No review recorded for this day.</div>
        )
      ) : !active ? (
        <div>
          <div className="f-serif" style={{ fontStyle: "italic", fontSize: 15, color: "var(--text-3)", marginBottom: 14 }}>Not done yet. When the day’s over, take a few quiet minutes.{predUnlocked && pendingDue.length > 0 ? ` ${pendingDue.length} forecast${pendingDue.length === 1 ? "" : "s"} due to resolve.` : ""}</div>
          <button onClick={begin} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#1c1813", fontSize: 11.5, letterSpacing: ".08em", fontWeight: 600, borderRadius: 3, padding: "10px 18px", cursor: "pointer" }}>Begin tonight’s review</button>
          {forecasts}
        </div>
      ) : (
        <div>
          <div className="flex" style={{ gap: 6, marginBottom: 16 }}>
            <span style={dot(true)} /><span style={dot(step >= 1)} /><span style={dot(step >= 2)} />
          </div>

          {step < 2 ? (
            <>
              <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--text-3)", marginBottom: 5 }}>STEP {step + 1} / 3</div>
              <h3 className="f-serif" style={{ margin: "0 0 5px", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>{NIGHT_STEPS[step].title}</h3>
              <div className="f-serif" style={{ fontSize: 15.5, lineHeight: 1.55, color: "var(--text-2)", marginBottom: 4 }}>{NIGHT_STEPS[step].hint}</div>
              <div className="f-serif" style={{ fontStyle: "italic", fontSize: 14.5, color: "var(--text-2)", marginBottom: 10 }}>{NIGHT_STEPS[step].eg}</div>
              <EvidenceChip tier={NIGHT_STEPS[step].tier} src={NIGHT_STEPS[step].src} open={chipOpen === `night${step}`} onToggle={() => onToggleChip(`night${step}`)} dark />
              <div style={{ marginTop: 12 }}>{ta(step === 0 ? recall : replay, step === 0 ? setRecall : setReplay)}</div>
              <div className="flex items-center" style={{ gap: 10, marginTop: 12 }}>
                <button onClick={next} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#1c1813", fontSize: 11, letterSpacing: ".08em", fontWeight: 600, borderRadius: 3, padding: "9px 16px", cursor: "pointer" }}>Next →</button>
                <button onClick={() => setActive(false)} className="f-mono" style={{ background: "none", border: "none", color: "var(--text-3)", fontSize: 11, cursor: "pointer" }}>Later</button>
              </div>
            </>
          ) : (
            <>
              <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--text-3)", marginBottom: 5 }}>STEP 3 / 3{predUnlocked ? "" : " · LOCKED"}</div>
              <h3 className="f-serif" style={{ margin: "0 0 5px", fontWeight: 500, fontSize: 22, color: "var(--text)" }}>A prediction</h3>
              {predUnlocked ? (
                <div style={{ margin: "8px 0 4px" }}>
                  <div className="f-serif" style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--text-2)", marginBottom: 8 }}>What do you think will happen, how sure are you, and when will you know? File it, then resolve old ones below.</div>
                  <textarea value={pClaim} onChange={(e) => setPClaim(e.target.value)} rows={2} placeholder="" className="f-hand" style={{ width: "100%", border: "1px solid var(--border)", background: "var(--bg-deep)", borderRadius: 3, color: "var(--text)", fontSize: 20, lineHeight: "34px", padding: "8px 14px 6px 20px", resize: "none", minHeight: 56, ...RULED }} />
                  <div className="flex items-center" style={{ gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>how sure?</span>
                    <input value={pProb} onChange={(e) => setPProb(e.target.value)} placeholder="70" inputMode="numeric" aria-label="Probability percent" className="f-mono" style={{ width: 70, border: "1px solid var(--border)", background: "var(--bg-deep)", borderRadius: 3, color: "var(--text)", fontSize: 14, padding: "8px 10px" }} />
                    <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>% · resolves</span>
                    <input type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} aria-label="Resolution date" className="f-mono" style={{ border: "1px solid var(--border)", background: "var(--bg-deep)", borderRadius: 3, color: "var(--text)", fontSize: 14, padding: "8px 10px" }} />
                    <button onClick={logPrediction} className="f-mono" style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 11, letterSpacing: ".06em", borderRadius: 3, padding: "8px 14px", cursor: "pointer" }}>+ Log prediction</button>
                    {pFlash && <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)" }}>✓ filed</span>}
                  </div>
                  {pErr && <div className="f-serif" style={{ fontSize: 13, color: "var(--warn)", marginTop: 7 }}>{pErr}</div>}
                </div>
              ) : (
                <div style={{ border: "1px dashed var(--border)", borderRadius: 4, padding: 14, background: "rgba(212,165,116,.05)", margin: "8px 0 14px" }}>
                  <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".08em", color: "var(--accent)", marginBottom: 6 }}>🔒 Unlocks later in the program</div>
                  <div className="f-serif" style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--text-2)" }}>Once you’ve built the habit, you’ll add one prediction a day — a thing you think will happen, how sure you are, and when you’ll know. For now, the two steps above are the whole night.</div>
                </div>
              )}
              <div style={{ marginTop: 10 }}>
                <EvidenceChip tier={CITATIONS.N3.tier} src={CITATIONS.N3.src} open={chipOpen === "nightpred"} onToggle={() => onToggleChip("nightpred")} dark />
              </div>
              {forecasts}
              <div style={{ marginTop: 16 }}>
                <button onClick={finish} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#1c1813", fontSize: 11, letterSpacing: ".08em", fontWeight: 600, borderRadius: 3, padding: "9px 16px", cursor: "pointer" }}>Finish review</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
