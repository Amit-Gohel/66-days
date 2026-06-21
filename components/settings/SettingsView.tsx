"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { useTheme } from "@/components/shell/ThemeProvider";
import { updateSettings, exportData } from "@/lib/actions/settings";
import { TECHNIQUES } from "@/lib/static/program";
import { CITATIONS, type Tier } from "@/lib/static/citations";

const cardStyle: React.CSSProperties = { border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 4, padding: "16px 18px", marginBottom: 14 };

export function SettingsView({ email, cueHabit }: { email: string; cueHabit: string }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [cue, setCue] = useState(cueHabit);
  const [cueSaved, setCueSaved] = useState(false);
  const nightOn = theme === "dark";

  const saveCue = async () => {
    await updateSettings({ cueHabit: cue });
    setCueSaved(true);
    setTimeout(() => setCueSaved(false), 1800);
  };
  const toggleTheme = async () => {
    const t = nightOn ? "light" : "dark";
    setTheme(t);
    await updateSettings({ theme: t });
  };
  const onExport = async () => {
    const json = await exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "66-days-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 560, margin: "0 auto", padding: "clamp(26px,4vw,46px) clamp(18px,4vw,40px) 96px" }}>
      <header style={{ marginBottom: 24 }}>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--accent)" }}>QUIET</div>
        <h2 className="f-serif" style={{ fontWeight: 300, fontSize: 30, margin: "6px 0 0", color: "var(--text)" }}>Settings</h2>
      </header>

      {/* theme */}
      <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div className="f-serif" style={{ fontSize: 17, color: "var(--text)" }}>Paper light</div>
          <div className="f-serif" style={{ fontSize: 13.5, color: "var(--text-2)" }}>Warm daytime paper, or the lamplit night book. Tonight’s review stays lamplit either way.</div>
        </div>
        <button onClick={toggleTheme} role="switch" aria-checked={nightOn} aria-label="Toggle night theme" style={{ position: "relative", width: 58, height: 30, borderRadius: 30, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", flex: "none" }}>
          <span style={{ position: "absolute", top: 2, left: nightOn ? 31 : 3, width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", transition: "left .2s ease" }} />
        </button>
      </div>

      {/* look back */}
      <button onClick={() => router.push("/look-back")} style={{ ...cardStyle, width: "100%", textAlign: "left", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div>
          <div className="f-serif" style={{ fontSize: 17, color: "var(--text)" }}>Look back</div>
          <div className="f-serif" style={{ fontSize: 13.5, color: "var(--text-2)" }}>The optional cohort and a cooperative buddy streak — both off by default. Folded away until you want it.</div>
        </div>
        <span className="f-mono" style={{ fontSize: 18, color: "var(--text-3)" }}>→</span>
      </button>

      {/* ritual */}
      <div style={cardStyle}>
        <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 9 }}>Nightly cue</div>
        <div className="flex flex-wrap items-center" style={{ gap: 8 }}>
          <span className="f-serif" style={{ fontSize: 14, color: "var(--text-2)" }}>After I</span>
          <input value={cue} onChange={(e) => setCue(e.target.value)} onBlur={saveCue} className="f-mono" style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 3, padding: "8px 12px", fontSize: 13, color: "var(--text)" }} />
          {cueSaved && <span className="f-mono" style={{ fontSize: 12, color: "var(--accent)" }}>saved ✓</span>}
        </div>
        <div className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 8 }}>Pairing the review with an existing habit is the single biggest lever for sticking with it.</div>
      </div>

      {/* techniques */}
      <div style={cardStyle}>
        <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 11 }}>The methodology, sourced</div>
        <div className="flex flex-col" style={{ gap: 8 }}>
          {TECHNIQUES.filter((t) => CITATIONS[t.key]).map((t) => (
            <div key={t.id} className="flex items-center" style={{ gap: 10 }}>
              <span className="f-serif" style={{ flex: 1, fontSize: 14, color: "var(--text)" }}>{t.name}</span>
              <EvidenceChip tier={CITATIONS[t.key].tier as Tier} citeKey={t.key} />
            </div>
          ))}
        </div>
      </div>

      {/* account + data */}
      <div style={cardStyle}>
        <div className="f-mono" style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 9 }}>Account</div>
        <div className="f-mono" style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>{email}</div>
        <div className="flex" style={{ gap: 10, flexWrap: "wrap" }}>
          <button onClick={onExport} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, letterSpacing: ".04em", padding: "8px 14px", cursor: "pointer" }}>Export your journal (JSON)</button>
          <form action="/auth/signout" method="post">
            <button type="submit" className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 11, letterSpacing: ".04em", padding: "8px 14px", cursor: "pointer" }}>Sign out</button>
          </form>
        </div>
      </div>

      <div className="f-serif" style={{ fontSize: 13, fontStyle: "italic", color: "var(--text-3)", padding: "6px 2px", lineHeight: 1.55 }}>
        Animations respect your system’s reduced-motion setting. Open source · MIT · self-host on your own Supabase. Nothing here is sent anywhere — it’s your book.
      </div>
    </div>
  );
}
