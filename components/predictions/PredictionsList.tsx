"use client"; // Client Component: it holds local state and handles clicks/edits.

// ============================================================================
// PredictionsList — the body of the /predictions page ("Prediction log").
//
// Responsibilities:
//   • Show summary stats (rolling Brier, accuracy, pipeline).
//   • Let the user filter the log (All / Due / Open / Resolved / Hits / Misses)
//     and sort it.
//   • Resolve open/due forecasts in one tap (Yes/No).
//   • Edit a forecast inline — claim, confidence, resolve-date, AND outcome.
//
// Design rule (decided with the user): an already-RESOLVED outcome can only be
// changed through the Edit form, never by a stray click on the row. Creating a
// resolution on an open/due forecast is still one tap, because that's additive.
//
// All writes are optimistic: we update local state immediately, fire the server
// action, and roll back if it throws. The DB's brier_score is a *generated*
// column, so we never persist it — we only mirror it locally for instant feedback.
// ============================================================================

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SaveCheck } from "@/components/ui/SaveCheck"; // the "saved" flash, lower-right
import { resolvePrediction, editPrediction, deletePrediction } from "@/lib/actions/night";
import { brierFor } from "@/lib/domain/brier"; // (p - outcome)^2, same formula as the DB
import type { Prediction } from "@/lib/types";

// Superforecasting reference point: a Brier at/under this reads as "sharp".
const BENCHMARK = 0.166;

// The six saved views shown as filter chips.
type FilterKey = "all" | "due" | "open" | "resolved" | "hits" | "misses";
// Ordering options offered in the SORT dropdown.
type SortKey = "smart" | "newest" | "oldest" | "confident" | "best" | "worst";
// The three resolution states a forecast can be put into from the edit form.
type Resolution = "open" | "hit" | "miss";

// Labels for the SORT dropdown (kept here so the <select> stays declarative).
const SORTS: { id: SortKey; label: string }[] = [
  { id: "smart", label: "Smart order" }, // due → open → resolved (the default)
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "confident", label: "Most confident" },
  { id: "best", label: "Best Brier" },
  { id: "worst", label: "Worst Brier" },
];

/** Colour a Brier score by quality relative to the benchmark.
 *  null (unresolved) → muted; ≤0.166 → green; ≤0.25 → gold; worse → clay. */
function brierColor(b: number | null): string {
  if (b == null) return "var(--text-3)";
  if (b <= BENCHMARK) return "var(--chip-confirmed)";
  if (b <= 0.25) return "var(--accent)";
  return "var(--chip-contested)";
}

/** A forecast is "due" when it's still open and its resolve date has arrived.
 *  `today` is the user's local date (computed server-side, passed down as a prop)
 *  so the boundary matches their timezone, not the browser's. */
const isOpenDue = (p: Prediction, today: string) =>
  p.status === "open" && p.resolves_on != null && p.resolves_on <= today;

// ──────────────────────────────────────────────────────────────────────────
// Confidence meter — gives the probability a visual weight instead of bare text
// ──────────────────────────────────────────────────────────────────────────
function Meter({ pct, color }: { pct: number; color: string }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 7 }}>
      {/* track + fill: fill width = the probability % */}
      <span style={{ position: "relative", width: 46, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
        <span style={{ position: "absolute", inset: 0, width: `${pct}%`, background: color, borderRadius: 3 }} />
      </span>
      <span className="f-mono" style={{ fontSize: 12, color, minWidth: 30, textAlign: "right" }}>{pct}%</span>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Inline edit form — the single deliberate place to change a forecast.
// It is mounted only while a row is being edited, so its useState fields
// initialise fresh from `p` every time the form opens (no stale values).
// ──────────────────────────────────────────────────────────────────────────
function EditForm({
  p,
  busy,
  onSave,
  onCancel,
}: {
  p: Prediction;
  busy: boolean; // a save is in flight → disable the buttons
  onSave: (f: { claim: string; probability: number; resolves_on: string | null; resolution: Resolution }) => void;
  onCancel: () => void;
}) {
  // Local draft state — seeded from the current row.
  const [claim, setClaim] = useState(p.claim);
  const [prob, setProb] = useState(String(p.probability)); // string: it's an <input>
  const [date, setDate] = useState(p.resolves_on ?? "");
  // Outcome selector starts on the forecast's current state.
  const [resolution, setResolution] = useState<Resolution>(
    p.status === "resolved" ? (p.outcome ? "hit" : "miss") : "open",
  );
  const [err, setErr] = useState(""); // inline validation message

  // Validate, then hand the cleaned values up to the parent's save handler.
  const submit = () => {
    const n = parseInt(prob, 10);
    if (!claim.trim()) return setErr("Write the prediction.");
    if (isNaN(n) || n < 1 || n > 99) return setErr("Probability must be 1–99%.");
    setErr("");
    onSave({ claim: claim.trim(), probability: n, resolves_on: date || null, resolution });
  };

  // The three-way OUTCOME segmented control, each colour-coded.
  const OUTCOMES: { id: Resolution; label: string; tone: string }[] = [
    { id: "hit", label: "Hit", tone: "var(--chip-confirmed)" },
    { id: "miss", label: "Miss", tone: "var(--chip-contested)" },
    { id: "open", label: "Still open", tone: "var(--accent)" }, // = reopen / un-resolve
  ];

  // Shared input chrome (dark inset field) so the three inputs match.
  const field: React.CSSProperties = {
    background: "var(--bg-deep)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text)",
    padding: "8px 10px",
  };

  return (
    <div className="space-y-3" style={{ padding: "12px 14px" }}>
      {/* the claim itself */}
      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        rows={2}
        autoFocus
        className="ink"
        style={{ ...field, width: "100%", fontSize: 16, lineHeight: 1.4, resize: "vertical", minHeight: 46 }}
        placeholder="A falsifiable claim…"
      />
      {/* one wrapping row: confidence · resolve-date · outcome · save/cancel */}
      <div className="flex flex-wrap items-end" style={{ gap: 14 }}>
        <label className="flex flex-col" style={{ gap: 4 }}>
          <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)" }}>CONFIDENCE %</span>
          <input
            type="number"
            min={1}
            max={99}
            value={prob}
            onChange={(e) => setProb(e.target.value)}
            className="f-mono"
            style={{ ...field, width: 86, fontSize: 14 }}
          />
        </label>
        <label className="flex flex-col" style={{ gap: 4 }}>
          <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)" }}>RESOLVES ON</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="f-mono"
            style={{ ...field, fontSize: 13, colorScheme: "dark" }}
          />
        </label>
        {/* OUTCOME — the gate. Changing a resolved call happens only here. */}
        <label className="flex flex-col" style={{ gap: 4 }}>
          <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)" }}>OUTCOME</span>
          <div className="flex" style={{ border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", width: "fit-content" }}>
            {OUTCOMES.map((o, i) => {
              const on = resolution === o.id; // is this option selected?
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setResolution(o.id)}
                  className="f-mono tap-target"
                  // selected → tinted with its tone; others → muted. First button has no left divider.
                  style={{ fontSize: 12, padding: "8px 12px", border: "none", borderLeft: i === 0 ? "none" : "1px solid var(--border)", background: on ? "color-mix(in srgb, " + o.tone + " 18%, transparent)" : "transparent", color: on ? o.tone : "var(--text-3)", cursor: "pointer" }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </label>
        {/* save / cancel pushed to the right */}
        <div className="flex items-center" style={{ gap: 8, marginLeft: "auto" }}>
          <button
            onClick={submit}
            disabled={busy}
            className="f-mono tap-target"
            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, padding: "8px 16px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="f-mono tap-target"
            style={{ background: "none", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, padding: "8px 14px", cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
      {/* validation error, then a standing reminder of what saving does */}
      {err && <p className="f-mono" style={{ fontSize: 12, color: "var(--chip-contested)" }}>{err}</p>}
      <p className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
        Set the outcome here — saving rescores your Brier.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// IconBtn — a small square icon button (edit / delete / etc.), 32×32.
// `active` tints it with `tone`; otherwise it's a muted outline.
// ──────────────────────────────────────────────────────────────────────────
function IconBtn({
  name,
  label,
  onClick,
  active,
  tone = "var(--text-3)",
  disabled,
}: {
  name: string;
  label: string; // used for both aria-label and the native tooltip
  onClick: () => void;
  active?: boolean;
  tone?: string;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="tap-target flex items-center justify-center"
      style={{
        width: 32,
        height: 32,
        borderRadius: 4,
        border: `1px solid ${active ? tone : "var(--border)"}`,
        background: active ? "color-mix(in srgb, " + tone + " 14%, transparent)" : "transparent",
        color: active ? tone : "var(--text-3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon name={name} size={15} />
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// PredictionRow — one forecast. Renders the inline EditForm when `editing`,
// otherwise the read view whose controls adapt to open / due / resolved.
// ──────────────────────────────────────────────────────────────────────────
function PredictionRow({
  p,
  due,
  editing,
  busy,
  onResolve,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  p: Prediction;
  due: boolean; // open AND its resolve date has passed
  editing: boolean; // is this the row currently in edit mode?
  busy: boolean; // is a write for this row in flight?
  onResolve: (outcome: boolean) => void;
  onStartEdit: () => void;
  onSaveEdit: (f: { claim: string; probability: number; resolves_on: string | null; resolution: Resolution }) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const resolved = p.status === "resolved";
  const hit = p.outcome === true;
  // Left edge + meter tint communicate the outcome at a glance, before any filtering.
  const edge = resolved ? (hit ? "var(--chip-confirmed)" : "var(--chip-contested)") : due ? "var(--accent)" : "var(--border)";
  const meterColor = resolved ? (hit ? "var(--chip-confirmed)" : "var(--chip-contested)") : "var(--accent)";

  return (
    <div
      className="hairline"
      style={{
        borderRadius: 5,
        borderLeft: `3px solid ${edge}`,
        background: "var(--surface)",
        opacity: busy ? 0.55 : 1, // dim while saving
        transition: "opacity 120ms ease",
      }}
    >
      {editing ? (
        // ── edit mode ──
        <EditForm p={p} busy={busy} onSave={onSaveEdit} onCancel={onCancelEdit} />
      ) : (
        // ── read mode ──
        <div className="flex flex-wrap items-center" style={{ gap: 12, padding: "11px 13px" }}>
          {/* claim + meta (status badge · date) */}
          <div style={{ flex: "1 1 240px", minWidth: 0 }}>
            <div className="ink" style={{ fontSize: 16.5, lineHeight: 1.35 }}>{p.claim}</div>
            <div className="f-mono flex flex-wrap items-center" style={{ gap: 8, fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>
              {resolved ? (
                // resolved → coloured HIT / MISS badge
                <span className="inline-flex items-center" style={{ gap: 4, color: hit ? "var(--chip-confirmed)" : "var(--chip-contested)" }}>
                  <Icon name={hit ? "check" : "x"} size={12} /> {hit ? "HIT" : "MISS"}
                </span>
              ) : due ? (
                <span style={{ color: "var(--accent)" }}>● due to resolve</span>
              ) : (
                <span>open</span>
              )}
              <span style={{ opacity: 0.5 }}>·</span>
              {/* resolved → the resolution date; otherwise → the scheduled resolve date */}
              <span>{resolved ? `resolved ${(p.resolved_at ?? "").slice(0, 10) || "—"}` : `resolves ${p.resolves_on ?? "no date"}`}</span>
            </div>
          </div>

          {/* confidence meter */}
          <Meter pct={p.probability} color={meterColor} />

          {/* Brier score (resolved only), coloured by quality */}
          {resolved && (
            <span className="f-mono" style={{ fontSize: 12, color: brierColor(p.brier_score), minWidth: 46, textAlign: "right" }} title="Brier score — lower is sharper">
              {p.brier_score != null ? p.brier_score.toFixed(3) : "—"}
            </span>
          )}

          {/* controls — differ by status */}
          {resolved ? (
            // RESOLVED: outcome is locked on the row. Change it deliberately via Edit.
            <div className="flex items-center" style={{ gap: 6 }}>
              <IconBtn name="edit" label="Edit prediction & outcome" onClick={onStartEdit} disabled={busy} />
              <IconBtn name="trash" label="Delete prediction" onClick={onDelete} tone="var(--chip-contested)" disabled={busy} />
            </div>
          ) : (
            // OPEN / DUE: one-tap resolve (additive), plus edit + delete.
            <div className="flex items-center" style={{ gap: 6 }}>
              <button
                aria-label="Resolve as hit"
                onClick={() => onResolve(true)}
                disabled={busy}
                className="f-mono tap-target inline-flex items-center"
                style={{ gap: 5, height: 32, padding: "0 11px", border: "1px solid var(--border)", borderRadius: 4, background: "transparent", color: "var(--text-2)", fontSize: 12, cursor: "pointer" }}
              >
                <Icon name="check" size={14} /> yes
              </button>
              <button
                aria-label="Resolve as miss"
                onClick={() => onResolve(false)}
                disabled={busy}
                className="f-mono tap-target inline-flex items-center"
                style={{ gap: 5, height: 32, padding: "0 11px", border: "1px solid var(--border)", borderRadius: 4, background: "transparent", color: "var(--text-2)", fontSize: 12, cursor: "pointer" }}
              >
                <Icon name="x" size={14} /> no
              </button>
              <IconBtn name="edit" label="Edit prediction" onClick={onStartEdit} disabled={busy} />
              <IconBtn name="trash" label="Delete prediction" onClick={onDelete} tone="var(--chip-contested)" disabled={busy} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stat — one summary card (label · big value · sub-line).
// ──────────────────────────────────────────────────────────────────────────
function Stat({ label, value, valueColor, sub }: { label: string; value: string; valueColor?: string; sub: React.ReactNode }) {
  return (
    <div className="hairline" style={{ borderRadius: 6, padding: "13px 15px", background: "var(--surface-2)" }}>
      <div className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--text-3)" }}>{label}</div>
      <div className="f-mono" style={{ fontSize: 26, lineHeight: 1.1, marginTop: 4, color: valueColor ?? "var(--text)" }}>{value}</div>
      <div className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────
export function PredictionsList({
  all, // every prediction, newest-created first (from getPredictions)
  meanBrier: initialBrier, // server-computed Brier; we recompute live after edits
  today, // the user's local date string, for the due/overdue boundary
}: {
  all: Prediction[];
  meanBrier: number | null;
  today: string;
}) {
  // `items` is the single source of truth the UI renders. It starts from the
  // server prop and is mutated optimistically; the server is the durable store.
  const [items, setItems] = useState<Prediction[]>(all);
  const [filter, setFilter] = useState<FilterKey>("all"); // active chip
  const [sort, setSort] = useState<SortKey>("smart"); // active sort
  const [editingId, setEditingId] = useState<string | null>(null); // which row's form is open (one at a time)
  const [busyId, setBusyId] = useState<string | null>(null); // which row has a write in flight
  const [saved, setSaved] = useState(false); // toggles the "saved" flash

  // Briefly show the lower-right "saved" indicator.
  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // ── derived counts + live Brier ────────────────────────────────────────
  // Recomputed whenever items/today/initialBrier change. Drives the stat cards
  // and the per-chip counts, and recomputes the rolling Brier so it reflects
  // optimistic edits instantly (falling back to the server value when nothing
  // is resolved yet).
  const stats = useMemo(() => {
    const resolved = items.filter((p) => p.status === "resolved");
    const hits = resolved.filter((p) => p.outcome === true);
    const misses = resolved.filter((p) => p.outcome === false);
    const due = items.filter((p) => isOpenDue(p, today));
    const open = items.filter((p) => p.status === "open" && !isOpenDue(p, today));
    const briers = resolved.map((p) => p.brier_score).filter((v): v is number => v != null);
    const liveBrier = briers.length ? briers.reduce((a, b) => a + b, 0) / briers.length : initialBrier;
    return {
      counts: { all: items.length, due: due.length, open: open.length, resolved: resolved.length, hits: hits.length, misses: misses.length },
      accuracy: resolved.length ? Math.round((hits.length / resolved.length) * 100) : null,
      hits: hits.length,
      misses: misses.length,
      liveBrier,
    };
  }, [items, today, initialBrier]);

  // Does a prediction belong in the currently-selected filter view?
  const matches = (p: Prediction, f: FilterKey): boolean => {
    switch (f) {
      case "all": return true;
      case "due": return isOpenDue(p, today);
      case "open": return p.status === "open" && !isOpenDue(p, today);
      case "resolved": return p.status === "resolved";
      case "hits": return p.status === "resolved" && p.outcome === true;
      case "misses": return p.status === "resolved" && p.outcome === false;
    }
  };

  // Comparator for the active sort. Date strings are ISO/`YYYY-MM-DD`, so plain
  // string comparison orders them chronologically.
  const sortFn = (a: Prediction, b: Prediction): number => {
    const at = (p: Prediction) => p.resolved_at ?? p.created_at; // "activity" timestamp
    switch (sort) {
      case "newest": return at(b).localeCompare(at(a));
      case "oldest": return at(a).localeCompare(at(b));
      case "confident": return b.probability - a.probability;
      case "best": return (a.brier_score ?? Infinity) - (b.brier_score ?? Infinity); // unresolved sink to the end
      case "worst": return (b.brier_score ?? -Infinity) - (a.brier_score ?? -Infinity);
      case "smart":
      default: {
        // due first (most overdue), then open (soonest), then resolved (newest)
        const rank = (p: Prediction) => (isOpenDue(p, today) ? 0 : p.status === "open" ? 1 : 2);
        const ra = rank(a), rb = rank(b);
        if (ra !== rb) return ra - rb;
        if (ra === 2) return at(b).localeCompare(at(a)); // resolved bucket → newest first
        return (a.resolves_on ?? "9999").localeCompare(b.resolves_on ?? "9999"); // open/due → soonest date, undated last
      }
    }
  };

  // The list actually rendered: filtered, then sorted. (matches/sortFn read
  // filter/sort/today, which are in the dep array; disable the lint rule that
  // wants the function identities themselves listed.)
  const visible = useMemo(
    () => items.filter((p) => matches(p, filter)).sort(sortFn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, filter, sort, today],
  );

  // ── mutations (optimistic, with rollback) ──────────────────────────────
  /** Apply `optimistic` to the row immediately, run the server `action`, and
   *  restore the pre-edit snapshot if it throws. Marks the row busy meanwhile. */
  const run = async (id: string, optimistic: Partial<Prediction>, action: () => Promise<unknown>) => {
    const snapshot = items.find((p) => p.id === id); // capture for rollback
    if (!snapshot) return;
    setItems((cur) => cur.map((p) => (p.id === id ? { ...p, ...optimistic } : p)));
    setBusyId(id);
    flashSaved();
    try {
      await action();
    } catch {
      setItems((cur) => cur.map((p) => (p.id === id ? snapshot : p))); // revert
    } finally {
      setBusyId(null);
    }
  };

  // One-tap resolve of an open/due forecast. brier_score is mirrored locally via
  // brierFor (the DB regenerates the authoritative value).
  const onResolve = (p: Prediction, outcome: boolean) =>
    run(
      p.id,
      { status: "resolved", outcome, resolved_at: new Date().toISOString(), brier_score: brierFor(p.probability, outcome) },
      () => resolvePrediction(p.id, outcome),
    );

  // Save the inline edit. Builds the optimistic patch from the chosen resolution,
  // then calls the single atomic editPrediction action.
  const onSaveEdit = (
    p: Prediction,
    f: { claim: string; probability: number; resolves_on: string | null; resolution: Resolution },
  ) => {
    setEditingId(null); // close the form
    const base = { claim: f.claim, probability: f.probability, resolves_on: f.resolves_on };
    const patch: Partial<Prediction> =
      f.resolution === "open"
        ? // un-resolve: clear outcome/date/score
          { ...base, status: "open", outcome: null, resolved_at: null, brier_score: null }
        : {
            ...base,
            status: "resolved",
            outcome: f.resolution === "hit",
            // keep the original resolve date when it was already resolved; stamp now otherwise
            resolved_at: p.status === "resolved" ? p.resolved_at : new Date().toISOString(),
            brier_score: brierFor(f.probability, f.resolution === "hit"),
          };
    run(p.id, patch, () =>
      editPrediction({ id: p.id, ...base, resolution: f.resolution, wasResolved: p.status === "resolved" }),
    );
  };

  // Delete, guarded by a native confirm. Optimistically drop the row; restore the
  // whole list on failure.
  const onDelete = async (p: Prediction) => {
    if (!window.confirm("Delete this prediction? This can’t be undone.")) return;
    const snapshot = items;
    setItems((cur) => cur.filter((x) => x.id !== p.id));
    flashSaved();
    try {
      await deletePrediction(p.id);
    } catch {
      setItems(snapshot);
    }
  };

  // ── filter chips ────────────────────────────────────────────────────────
  // `tone` colours the active chip; Hits/Misses also carry an icon.
  const CHIPS: { id: FilterKey; label: string; icon?: string; tone?: string }[] = [
    { id: "all", label: "All" },
    { id: "due", label: "Due", tone: "var(--accent)" },
    { id: "open", label: "Open" },
    { id: "resolved", label: "Resolved" },
    { id: "hits", label: "Hits", icon: "check", tone: "var(--chip-confirmed)" },
    { id: "misses", label: "Misses", icon: "x", tone: "var(--chip-contested)" },
  ];

  const showSort = visible.length > 1; // a sort control is pointless on 0–1 rows

  return (
    <div className="space-y-6">
      {/* lower-right "saved" flash, shared with the rest of the app */}
      <SaveCheck show={saved} />

      {/* ── summary stats (auto-fit grid so cards fill the row width) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <Stat
          label="ROLLING BRIER"
          value={stats.liveBrier != null ? stats.liveBrier.toFixed(3) : "—"}
          valueColor={brierColor(stats.liveBrier)}
          sub={<>benchmark {BENCHMARK} · {stats.counts.resolved} resolved</>}
        />
        <Stat
          label="ACCURACY"
          value={stats.accuracy != null ? `${stats.accuracy}%` : "—"}
          sub={<><span style={{ color: "var(--chip-confirmed)" }}>{stats.hits} hit</span> · <span style={{ color: "var(--chip-contested)" }}>{stats.misses} miss</span></>}
        />
        <Stat
          label="PIPELINE"
          value={String(stats.counts.open + stats.counts.due)}
          sub={stats.counts.due > 0 ? <span style={{ color: "var(--accent)" }}>{stats.counts.due} due to resolve now</span> : <>all open forecasts scheduled</>}
        />
      </div>

      {/* ── filter chips (left) + sort (right) ── */}
      <div className="flex flex-wrap items-center" style={{ gap: 8, justifyContent: "space-between" }}>
        <div className="flex flex-wrap" style={{ gap: 6 }} role="tablist" aria-label="Filter predictions">
          {CHIPS.map((c) => {
            const active = filter === c.id;
            const tone = c.tone ?? "var(--accent)";
            const n = stats.counts[c.id]; // count shown on the chip
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(c.id)}
                className="f-mono tap-target inline-flex items-center"
                style={{
                  gap: 5,
                  fontSize: 12,
                  padding: "6px 11px",
                  borderRadius: 999,
                  border: `1px solid ${active ? tone : "var(--border)"}`,
                  background: active ? "color-mix(in srgb, " + tone + " 16%, transparent)" : "transparent",
                  color: active ? tone : "var(--text-2)",
                  cursor: "pointer",
                  opacity: n === 0 && !active ? 0.45 : 1, // dim empty, unselected views
                }}
              >
                {c.icon && <Icon name={c.icon} size={13} />}
                {c.label}
                <span style={{ opacity: 0.7 }}>{n}</span>
              </button>
            );
          })}
        </div>

        {showSort && (
          <label className="inline-flex items-center" style={{ gap: 6 }}>
            <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)" }}>SORT</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="f-mono"
              style={{ background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 5, fontSize: 12, padding: "6px 8px", cursor: "pointer" }}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* ── the list (or a context-aware empty state) ── */}
      {visible.length === 0 ? (
        <div className="hairline f-serif" style={{ borderRadius: 6, padding: "28px 18px", textAlign: "center", color: "var(--text-3)", background: "var(--surface)", fontSize: 14.5 }}>
          {items.length === 0
            ? "No predictions yet. File your first forecast in tonight’s session."
            : filter === "due"
              ? "Nothing due. Resolve predictions on their date or in the night session."
              : filter === "hits"
                ? "No hits recorded yet."
                : filter === "misses"
                  ? "No misses recorded yet."
                  : "Nothing here under this filter."}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((p) => (
            <PredictionRow
              key={p.id}
              p={p}
              due={isOpenDue(p, today)}
              editing={editingId === p.id}
              busy={busyId === p.id}
              onResolve={(o) => onResolve(p, o)}
              onStartEdit={() => setEditingId(p.id)}
              onSaveEdit={(f) => onSaveEdit(p, f)}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => onDelete(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
