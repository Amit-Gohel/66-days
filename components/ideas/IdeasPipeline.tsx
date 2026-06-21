"use client"; // Client Component: holds local state and handles clicks/edits.

// ============================================================================
// IdeasPipeline — the body of the /ideas page ("Idea pipeline").
//
//   • A full-width funnel header (Captured → Kept → Developed → Finalists).
//   • Filter chips (All / Seeds / Developed / Finalists / Culled) with counts.
//   • A composer for adding a seed by hand.
//
// SAFETY MODEL (decided with the user): a row has NO one-tap mutating buttons —
// stray clicks can't change anything. Every change (text, stage, SCAMPER,
// finalist flag, rank) is made inside the Edit form and only takes effect on
// Save; Cancel discards. Culling — the one "removal" action — additionally
// asks for confirmation. All saves are optimistic with rollback on error.
// ============================================================================

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SaveCheck } from "@/components/ui/SaveCheck";
import { IdeaFunnel } from "@/components/charts/IdeaFunnel";
import { createIdea, editIdea, setFinalists } from "@/lib/actions/ideas";
import { SCAMPER_LENSES, SCAMPER_BY_ID } from "@/lib/static/scamper";
import type { Idea, ScamperPrompt } from "@/lib/types";

// The five saved views shown as filter chips.
type FilterKey = "all" | "seed" | "developed" | "top" | "culled";
// Ordering options offered in the SORT dropdown.
type SortKey = "smart" | "newest" | "oldest" | "day";
// What the Edit form hands back on Save.
interface EditValues {
  text: string;
  scamper_prompt: string | null;
  scamper_result: string | null;
  lane: string;
  isFinalist: boolean;
  rank: number;
}

const SORTS: { id: SortKey; label: string }[] = [
  { id: "smart", label: "Smart order" }, // finalists → developed → seeds → culled
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "day", label: "By day" },
];

// What an idea's lane (or finalist flag) looks like: badge label, icon, colour.
function laneStyle(i: Idea) {
  if (i.is_top3) return { label: "Finalist", icon: "star", tone: "var(--chip-confirmed)" };
  if (i.lane === "developed") return { label: "Developed", icon: "wand", tone: "var(--accent)" };
  if (i.lane === "culled") return { label: "Culled", icon: "scissors", tone: "var(--text-3)" };
  return { label: "Seed", icon: "lightbulb", tone: "var(--text-2)" };
}

// Shared dark inset field chrome, so inputs match the rest of the app.
const field: React.CSSProperties = {
  background: "var(--bg-deep)",
  border: "1px solid var(--border)",
  borderRadius: 4,
  color: "var(--text)",
  padding: "8px 10px",
};

// The three stages an idea can sit in — the edit form's segmented control.
const STAGES: { id: string; label: string; tone: string }[] = [
  { id: "seed", label: "Seed", tone: "var(--text-2)" },
  { id: "developed", label: "Developed", tone: "var(--accent)" },
  { id: "culled", label: "Culled", tone: "var(--chip-contested)" },
];

// A small field label used throughout the edit form.
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--text-3)" }}>{children}</span>;
}

// ──────────────────────────────────────────────────────────────────────────
// EditForm — the single place ALL changes happen. Mounted only while a row is
// editing, so its fields seed fresh from `idea`. Nothing here mutates the store
// until Save; culling asks for confirmation first.
// ──────────────────────────────────────────────────────────────────────────
function EditForm({
  idea,
  finalistCount,
  busy,
  onSave,
  onCancel,
}: {
  idea: Idea;
  finalistCount: number; // current number of finalists, for the rank default/cap
  busy: boolean;
  onSave: (f: EditValues) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(idea.text);
  const [lane, setLane] = useState<string>(idea.lane);
  const [isFinalist, setIsFinalist] = useState(idea.is_top3);
  // rank is a string so the number field can be edited freely; parsed on save.
  const [rank, setRank] = useState<string>(String(idea.top3_rank ?? finalistCount + 1));
  const [prompt, setPrompt] = useState<string>(idea.scamper_prompt ?? "");
  const [result, setResult] = useState(idea.scamper_result ?? "");
  const [err, setErr] = useState("");

  const culled = lane === "culled";

  const submit = () => {
    if (!text.trim()) return setErr("Write the idea.");
    // Confirm the one removal-style change.
    if (culled && idea.lane !== "culled") {
      if (!window.confirm("Cull this idea? It leaves your active pipeline — you can restore it anytime from the Culled filter.")) return;
    }
    setErr("");
    onSave({
      text: text.trim(),
      scamper_prompt: prompt || null,
      scamper_result: result.trim() || null,
      lane,
      isFinalist: !culled && isFinalist,
      rank: Math.max(1, parseInt(rank, 10) || finalistCount + 1),
    });
  };

  return (
    <div className="space-y-3" style={{ padding: "13px 15px" }}>
      <label className="flex flex-col" style={{ gap: 4 }}>
        <FieldLabel>IDEA</FieldLabel>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          autoFocus
          className="ink"
          style={{ ...field, width: "100%", fontSize: 16, lineHeight: 1.4, resize: "vertical", minHeight: 46 }}
          placeholder="The idea seed…"
        />
      </label>

      {/* STAGE + FINALIST sit on one wrapping row */}
      <div className="flex flex-wrap items-end" style={{ gap: 18 }}>
        <label className="flex flex-col" style={{ gap: 4 }}>
          <FieldLabel>STAGE</FieldLabel>
          <div className="flex" style={{ border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden", width: "fit-content" }}>
            {STAGES.map((s, i) => {
              const on = lane === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setLane(s.id)}
                  className="f-mono tap-target"
                  style={{ fontSize: 12, padding: "8px 14px", border: "none", borderLeft: i === 0 ? "none" : "1px solid var(--border)", background: on ? "color-mix(in srgb, " + s.tone + " 18%, transparent)" : "transparent", color: on ? s.tone : "var(--text-3)", cursor: "pointer" }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </label>

        {/* Finalist flag + rank — hidden once culled (a culled idea can't be a finalist) */}
        {!culled && (
          <label className="flex flex-col" style={{ gap: 4 }}>
            <FieldLabel>FINALIST</FieldLabel>
            <div className="flex items-center" style={{ gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsFinalist((v) => !v)}
                className="f-mono tap-target inline-flex items-center"
                style={{ gap: 6, fontSize: 12, padding: "8px 12px", borderRadius: 4, border: `1px solid ${isFinalist ? "var(--chip-confirmed)" : "var(--border)"}`, background: isFinalist ? "color-mix(in srgb, var(--chip-confirmed) 16%, transparent)" : "transparent", color: isFinalist ? "var(--chip-confirmed)" : "var(--text-3)", cursor: "pointer" }}
              >
                <Icon name="star" size={14} /> {isFinalist ? "Finalist" : "Not a finalist"}
              </button>
              {isFinalist && (
                <span className="inline-flex items-center" style={{ gap: 6 }}>
                  <FieldLabel>RANK #</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    title="Position among finalists — the rest renumber to fit"
                    className="f-mono"
                    style={{ ...field, width: 60, fontSize: 13 }}
                  />
                </span>
              )}
            </div>
          </label>
        )}
      </div>

      {/* SCAMPER development — the lens you applied and the result it produced */}
      <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
        <label className="flex items-center" style={{ gap: 7 }}>
          <FieldLabel>SCAMPER LENS</FieldLabel>
          <select
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="f-mono"
            style={{ ...field, fontSize: 13, cursor: "pointer" }}
          >
            <option value="">— none —</option>
            {SCAMPER_LENSES.map((s) => (
              <option key={s.id} value={s.id}>{s.id} · {s.verb}</option>
            ))}
          </select>
        </label>
      </div>

      {/* live explanation of the chosen lens — so the dropdown is never a mystery */}
      {prompt && SCAMPER_BY_ID[prompt] && (
        <div className="f-serif" style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--text-2)", background: "color-mix(in srgb, var(--accent) 8%, transparent)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 11px" }}>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>{SCAMPER_BY_ID[prompt].verb}</span>
          {" — "}
          {SCAMPER_BY_ID[prompt].gloss}{" "}
          <span style={{ color: "var(--accent)" }}>{SCAMPER_BY_ID[prompt].question}</span>
        </div>
      )}
      <label className="flex flex-col" style={{ gap: 4 }}>
        <FieldLabel>DEVELOPED RESULT</FieldLabel>
        <textarea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          rows={2}
          className="ink"
          style={{ ...field, width: "100%", fontSize: 15, lineHeight: 1.45, resize: "vertical", minHeight: 40 }}
          placeholder="How the lens recombines it (optional)…"
        />
      </label>

      <div className="flex flex-wrap items-center" style={{ gap: 10, justifyContent: "space-between" }}>
        <p className="f-mono m-0" style={{ fontSize: 11, color: "var(--text-3)" }}>
          {err ? <span style={{ color: "var(--chip-contested)" }}>{err}</span> : "Nothing changes until you Save."}
        </p>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button
            onClick={submit}
            disabled={busy}
            className="f-mono tap-target"
            style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, padding: "8px 18px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}
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
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// IdeaRow — read-only display + a single Edit button. No stray-click hazards:
// every mutation goes through the EditForm.
// ──────────────────────────────────────────────────────────────────────────
function IdeaRow({
  idea,
  editing,
  busy,
  finalistCount,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  idea: Idea;
  editing: boolean;
  busy: boolean;
  finalistCount: number;
  onStartEdit: () => void;
  onSaveEdit: (f: EditValues) => void;
  onCancelEdit: () => void;
}) {
  const meta = laneStyle(idea);
  const culled = idea.lane === "culled";
  const edge = idea.is_top3 ? "var(--chip-confirmed)" : idea.lane === "developed" ? "var(--accent)" : "var(--border)";

  return (
    <div
      className="hairline"
      style={{
        borderRadius: 5,
        borderLeft: `3px solid ${edge}`,
        background: "var(--surface)",
        opacity: busy ? 0.55 : culled ? 0.62 : 1, // dim while saving; culled rows sit quietly
        transition: "opacity 120ms ease",
      }}
    >
      {editing ? (
        <EditForm idea={idea} finalistCount={finalistCount} busy={busy} onSave={onSaveEdit} onCancel={onCancelEdit} />
      ) : (
        <div className="flex flex-wrap items-start" style={{ gap: 12, padding: "11px 13px" }}>
          {/* badge · day · lens, then the idea text, then the developed result */}
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <div className="f-mono flex flex-wrap items-center" style={{ gap: 8, fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
              <span className="inline-flex items-center" style={{ gap: 4, color: meta.tone }}>
                <Icon name={meta.icon} size={12} /> {meta.label}
                {idea.is_top3 && idea.top3_rank ? ` #${idea.top3_rank}` : ""}
              </span>
              {idea.day_number != null && (
                <>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>Day {idea.day_number}</span>
                </>
              )}
              {idea.scamper_prompt && SCAMPER_BY_ID[idea.scamper_prompt] && (
                <>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span style={{ color: "var(--accent)", cursor: "help" }} title={`${SCAMPER_BY_ID[idea.scamper_prompt].verb} — ${SCAMPER_BY_ID[idea.scamper_prompt].gloss}`}>
                    {idea.scamper_prompt} {SCAMPER_BY_ID[idea.scamper_prompt].verb}
                  </span>
                </>
              )}
            </div>
            <div className="ink" style={{ fontSize: 16.5, lineHeight: 1.35, textDecoration: culled ? "line-through" : "none" }}>{idea.text}</div>
            {idea.scamper_result && (
              <div className="f-serif" style={{ fontSize: 14.5, lineHeight: 1.45, color: "var(--text-2)", marginTop: 5 }}>
                → {idea.scamper_result}
              </div>
            )}
          </div>

          {/* the ONLY action on a row — everything happens inside Edit */}
          <button
            onClick={onStartEdit}
            disabled={busy}
            aria-label="Edit this idea"
            className="f-mono tap-target inline-flex items-center"
            style={{ gap: 6, height: 32, padding: "0 13px", border: "1px solid var(--border)", borderRadius: 4, background: "transparent", color: "var(--text-2)", fontSize: 12, cursor: busy ? "wait" : "pointer" }}
          >
            <Icon name="edit" size={14} /> Edit
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────
export function IdeasPipeline({ all }: { all: Idea[] }) {
  const [items, setItems] = useState<Idea[]>(all);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("smart");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState(""); // transient inline message (e.g. a save error)
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [creating, setCreating] = useState(false);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  const flashNote = (m: string) => {
    setNote(m);
    setTimeout(() => setNote(""), 2600);
  };

  // ── derived counts + funnel stages ──────────────────────────────────────
  const stats = useMemo(() => {
    const seed = items.filter((i) => i.lane === "seed").length;
    const developed = items.filter((i) => i.lane === "developed").length;
    const culled = items.filter((i) => i.lane === "culled").length;
    const top = items.filter((i) => i.is_top3).length;
    const kept = items.length - culled;
    return {
      counts: { all: items.length, seed, developed, top, culled },
      funnel: [
        { label: "Captured", val: items.length }, // every idea began as a seed
        { label: "Kept", val: kept }, // survived culling
        { label: "Developed", val: developed },
        { label: "Finalists", val: top },
      ],
    };
  }, [items]);

  const matches = (i: Idea, f: FilterKey): boolean => {
    switch (f) {
      case "all": return true;
      case "seed": return i.lane === "seed";
      case "developed": return i.lane === "developed";
      case "top": return i.is_top3;
      case "culled": return i.lane === "culled";
    }
  };

  const sortFn = (a: Idea, b: Idea): number => {
    switch (sort) {
      case "newest": return b.created_at.localeCompare(a.created_at);
      case "oldest": return a.created_at.localeCompare(b.created_at);
      case "day": return (b.day_number ?? -1) - (a.day_number ?? -1);
      case "smart":
      default: {
        // finalists (by rank) → developed → seeds → culled; ties newest first
        const rank = (i: Idea) => (i.lane === "culled" ? 3 : i.is_top3 ? 0 : i.lane === "developed" ? 1 : 2);
        const ra = rank(a), rb = rank(b);
        if (ra !== rb) return ra - rb;
        if (ra === 0) return (a.top3_rank ?? 99) - (b.top3_rank ?? 99); // finalists in pick order
        return b.created_at.localeCompare(a.created_at);
      }
    }
  };

  const visible = useMemo(
    () => items.filter((i) => matches(i, filter)).sort(sortFn),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, filter, sort],
  );

  // Current finalists as an ordered id list (by rank) — the basis for placing a
  // finalist at a chosen position while keeping ranks contiguous.
  const finalistOrder = () =>
    items.filter((i) => i.is_top3).sort((a, b) => (a.top3_rank ?? 99) - (b.top3_rank ?? 99)).map((i) => i.id);

  // ── mutations (optimistic, with rollback) ──────────────────────────────
  // Single-row change: patch one item, run one action, revert on failure.
  const run = async (id: string, optimistic: Partial<Idea>, action: () => Promise<unknown>) => {
    const snapshot = items.find((i) => i.id === id);
    if (!snapshot) return;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, ...optimistic } : i)));
    setBusyId(id);
    flashSaved();
    try {
      await action();
    } catch (e) {
      setItems((cur) => cur.map((i) => (i.id === id ? snapshot : i)));
      flashNote(e instanceof Error ? e.message : "Couldn’t save.");
    } finally {
      setBusyId(null);
    }
  };

  // Finalist-aware save: optimistically renumber the finalist set to 1..N (per
  // `orderedIds`) AND apply the edited row's content patch, then persist both.
  const persistWithFinalists = async (
    orderedIds: string[],
    edited: { id: string; patch: Partial<Idea>; action: () => Promise<unknown> },
  ) => {
    const snapshot = items;
    setItems((cur) =>
      cur.map((i) => {
        let next = i;
        const pos = orderedIds.indexOf(i.id);
        if (pos >= 0) next = { ...next, is_top3: true, top3_rank: pos + 1 };
        else if (i.is_top3) next = { ...next, is_top3: false, top3_rank: null };
        if (i.id === edited.id) next = { ...next, ...edited.patch };
        return next;
      }),
    );
    flashSaved();
    try {
      await edited.action();
      await setFinalists(orderedIds);
    } catch (e) {
      setItems(snapshot);
      flashNote(e instanceof Error ? e.message : "Couldn’t save.");
    }
  };

  // The one save path for every change made in the Edit form.
  const onSaveEdit = (i: Idea, f: EditValues) => {
    setEditingId(null);
    const patch: Partial<Idea> = {
      text: f.text,
      scamper_prompt: (f.scamper_result ? f.scamper_prompt : null) as ScamperPrompt | null,
      scamper_result: f.scamper_result,
      lane: f.lane as Idea["lane"],
    };
    const editAction = () =>
      editIdea({ id: i.id, text: f.text, scamper_prompt: f.scamper_prompt, scamper_result: f.scamper_result, lane: f.lane });

    if (f.isFinalist) {
      // place at the requested rank, shifting the rest to stay contiguous
      const order = finalistOrder().filter((x) => x !== i.id);
      const at = Math.max(1, Math.min(f.rank, order.length + 1)) - 1;
      order.splice(at, 0, i.id);
      persistWithFinalists(order, { id: i.id, patch, action: editAction });
    } else if (i.is_top3) {
      // was a finalist, no longer one (un-starred or culled) → drop + renumber
      patch.is_top3 = false;
      patch.top3_rank = null;
      const survivors = finalistOrder().filter((x) => x !== i.id);
      persistWithFinalists(survivors, { id: i.id, patch, action: editAction });
    } else {
      run(i.id, patch, editAction);
    }
  };

  const onCreate = async () => {
    const t = newText.trim();
    if (!t) return;
    setCreating(true);
    flashSaved();
    try {
      const row = await createIdea({ text: t });
      setItems((cur) => [row, ...cur]);
      setNewText("");
      setAdding(false);
    } catch (e) {
      flashNote(e instanceof Error ? e.message : "Couldn’t add the idea.");
    } finally {
      setCreating(false);
    }
  };

  // ── filter chips ────────────────────────────────────────────────────────
  const CHIPS: { id: FilterKey; label: string; icon?: string; tone?: string }[] = [
    { id: "all", label: "All" },
    { id: "seed", label: "Seeds", icon: "lightbulb" },
    { id: "developed", label: "Developed", icon: "wand", tone: "var(--accent)" },
    { id: "top", label: "Finalists", icon: "star", tone: "var(--chip-confirmed)" },
    { id: "culled", label: "Culled", icon: "scissors", tone: "var(--chip-contested)" },
  ];

  const showSort = visible.length > 1;

  return (
    <div className="space-y-6">
      <SaveCheck show={saved} />

      {/* ── full-width pipeline funnel ── */}
      <div className="hairline" style={{ borderRadius: 8, padding: "18px 20px", background: "var(--surface)" }}>
        <IdeaFunnel stages={stats.funnel} />
      </div>

      {/* ── filter chips (left) + sort & add (right) ── */}
      <div className="flex flex-wrap items-center" style={{ gap: 8, justifyContent: "space-between" }}>
        <div className="flex flex-wrap" style={{ gap: 6 }} role="tablist" aria-label="Filter ideas">
          {CHIPS.map((c) => {
            const active = filter === c.id;
            const tone = c.tone ?? "var(--accent)";
            const n = stats.counts[c.id];
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
                  opacity: n === 0 && !active ? 0.45 : 1,
                }}
              >
                {c.icon && <Icon name={c.icon} size={13} />}
                {c.label}
                <span style={{ opacity: 0.7 }}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
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
          <button
            onClick={() => setAdding((v) => !v)}
            className="f-mono tap-target inline-flex items-center"
            style={{ gap: 5, fontSize: 12, padding: "7px 12px", borderRadius: 5, border: "1px solid var(--accent)", background: adding ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent", color: "var(--accent)", cursor: "pointer" }}
          >
            <Icon name="plus" size={14} /> Add idea
          </button>
        </div>
      </div>

      {/* transient note (save error) */}
      {note && <p className="f-mono" style={{ fontSize: 12, color: "var(--chip-contested)", margin: 0 }}>{note}</p>}

      {/* ── add-idea composer ── */}
      {adding && (
        <div className="hairline" style={{ borderRadius: 5, borderLeft: "3px solid var(--accent)", background: "var(--surface)", padding: "12px 14px" }}>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={2}
            autoFocus
            className="ink"
            style={{ ...field, width: "100%", fontSize: 16, lineHeight: 1.4, resize: "vertical", minHeight: 46 }}
            placeholder="A new idea seed — state the problem, then the idea…"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onCreate();
            }}
          />
          <div className="flex items-center" style={{ gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
            <button
              onClick={onCreate}
              disabled={creating || !newText.trim()}
              className="f-mono tap-target"
              style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, padding: "8px 16px", cursor: creating ? "wait" : "pointer", opacity: creating || !newText.trim() ? 0.6 : 1 }}
            >
              Add seed
            </button>
            <button
              onClick={() => { setAdding(false); setNewText(""); }}
              className="f-mono tap-target"
              style={{ background: "none", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: 4, fontSize: 12, padding: "8px 14px", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── the list (or a context-aware empty state) ── */}
      {visible.length === 0 ? (
        <div className="hairline f-serif" style={{ borderRadius: 6, padding: "28px 18px", textAlign: "center", color: "var(--text-3)", background: "var(--surface)", fontSize: 14.5 }}>
          {items.length === 0
            ? "No ideas yet. Capture a D3 seed in today’s session, or add one here."
            : filter === "developed"
              ? "Nothing developed yet. Open a seed’s Edit and set its stage to Developed."
              : filter === "top"
                ? "No finalists yet. Open an idea’s Edit, mark it a Finalist, and number it."
                : filter === "culled"
                  ? "Nothing culled — your pipeline is all live."
                  : "Nothing here under this filter."}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((i) => (
            <IdeaRow
              key={i.id}
              idea={i}
              editing={editingId === i.id}
              busy={busyId === i.id}
              finalistCount={stats.counts.top}
              onStartEdit={() => setEditingId(i.id)}
              onSaveEdit={(f) => onSaveEdit(i, f)}
              onCancelEdit={() => setEditingId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
