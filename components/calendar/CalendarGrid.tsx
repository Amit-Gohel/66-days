"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface CalCell {
  n: number;
  state: "logged" | "missed" | "today" | "future";
}

const LEGEND: { label: string; swatch: React.CSSProperties }[] = [
  { label: "Logged", swatch: { background: "var(--accent)", border: "1px solid var(--accent-hover)" } },
  { label: "Missed", swatch: { background: "transparent", border: "1px dashed var(--border)" } },
  { label: "Today", swatch: { background: "rgba(154,107,52,.14)", border: "2px solid var(--accent)" } },
  { label: "To come", swatch: { background: "var(--surface)", border: "1px solid var(--border)", opacity: 0.5 } },
];

export function CalendarGrid({ cells, day }: { cells: CalCell[]; day: number }) {
  const router = useRouter();
  const [focus, setFocus] = useState(day);

  const openDay = (c: CalCell) => {
    if (c.state === "future") return;
    if (c.state === "today") router.push("/home");
    else router.push(`/day/${c.n}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    let t = focus;
    if (e.key === "ArrowRight") t = focus + 1;
    else if (e.key === "ArrowLeft") t = focus - 1;
    else if (e.key === "ArrowDown") t = focus + 11;
    else if (e.key === "ArrowUp") t = focus - 11;
    else return;
    if (t < 1 || t > 66) return;
    e.preventDefault();
    setFocus(t);
    document.getElementById(`cell-${t}`)?.focus();
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(26px,4vw,46px) clamp(18px,4vw,40px) 96px" }}>
      <header style={{ marginBottom: 22 }}>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--accent)" }}>THE BOOK&apos;S INDEX</div>
        <h2 className="f-serif" style={{ fontWeight: 300, fontSize: 30, margin: "6px 0 4px", color: "var(--text)" }}>The 66 Days</h2>
        <p className="f-serif" style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text-2)", maxWidth: "60ch", fontWeight: 300 }}>
          The whole practice on one page. Tap any day you&apos;ve reached to turn to its entry.
        </p>
      </header>

      <div role="grid" aria-label="66 day calendar" onKeyDown={onKey} style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 8, maxWidth: 560, marginBottom: 22 }}>
        {cells.map((c) => {
          const logged = c.state === "logged";
          const missed = c.state === "missed";
          const today = c.state === "today";
          const future = c.state === "future";
          const style: React.CSSProperties = {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            borderRadius: 4,
            cursor: future ? "default" : "pointer",
            fontWeight: 500,
            background: logged ? "var(--accent)" : today ? "rgba(154,107,52,.14)" : missed ? "transparent" : "var(--surface)",
            border: logged ? "1px solid var(--accent-hover)" : today ? "2px solid var(--accent)" : missed ? "1px dashed var(--border)" : "1px solid var(--border)",
            color: logged ? "#f4ead3" : today ? "var(--accent)" : "var(--text-3)",
            boxShadow: today ? "0 0 0 4px rgba(154,107,52,.12)" : undefined,
            opacity: future ? 0.5 : 1,
          };
          const aria = `Day ${c.n}, ${logged ? "logged" : missed ? "missed" : today ? "today" : "to come"}`;
          return (
            <button
              key={c.n}
              id={`cell-${c.n}`}
              role="gridcell"
              aria-label={aria}
              aria-current={today ? "date" : undefined}
              disabled={future}
              tabIndex={c.n === focus && !future ? 0 : -1}
              onClick={() => openDay(c)}
              style={style}
              className="f-mono"
            >
              {today && (
                <span aria-hidden style={{ position: "absolute", top: -5, right: 5, width: 7, height: 13, background: "var(--warn)", clipPath: "polygon(0 0,100% 0,100% 100%,50% 78%,0 100%)" }} />
              )}
              <span style={{ fontSize: 12 }}>{c.n}</span>
              {logged && <span aria-hidden style={{ fontSize: 9, lineHeight: 1, marginTop: 1 }}>✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap" style={{ gap: 16, marginBottom: 22 }}>
        {LEGEND.map((lg) => (
          <div key={lg.label} className="flex items-center" style={{ gap: 7 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, ...lg.swatch }} />
            <span className="f-mono" style={{ fontSize: 10.5, letterSpacing: ".04em", color: "var(--text-3)" }}>{lg.label}</span>
          </div>
        ))}
      </div>

      <p className="f-serif" style={{ margin: "0 0 18px", fontSize: 14, fontStyle: "italic", lineHeight: 1.6, color: "var(--text-3)", maxWidth: "60ch", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        Day 66 is the average finish, not a finish line — habits settle anywhere from 18 to 254 days. You&apos;ve already begun; the squares just show the work, honestly.
      </p>

      <button onClick={() => router.push("/look-back")} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, letterSpacing: ".04em", padding: "8px 14px", cursor: "pointer" }}>
        Look back · cohort &amp; buddy →
      </button>
    </div>
  );
}
