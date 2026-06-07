"use client";

import { useState, type ReactNode } from "react";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { useTheme } from "@/components/shell/ThemeProvider";
import { updateSettings, exportData } from "@/lib/actions/settings";
import { TECHNIQUES } from "@/lib/static/program";
import { CITATIONS, type Tier } from "@/lib/static/citations";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="hairline mb-6" style={{ borderRadius: 8, padding: "18px 20px", background: "var(--surface)" }}>
      <h2 className="f-hand" style={{ fontSize: 19, color: "var(--text)", marginBottom: 14 }}>{title}</h2>
      {children}
    </div>
  );
}

export function SettingsView({ email, cueHabit }: { email: string; cueHabit: string }) {
  const { theme, setTheme } = useTheme();
  const [cue, setCue] = useState(cueHabit);
  const [cueSaved, setCueSaved] = useState(false);

  const saveCue = async () => {
    await updateSettings({ cueHabit: cue });
    setCueSaved(true);
    setTimeout(() => setCueSaved(false), 1800);
  };

  const pickTheme = async (t: "light" | "dark") => {
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
    <div className="anim-fade" style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 20 }}>Settings</h1>

      <Section title="Ritual">
        <label className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>NIGHTLY CUE</label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="f-serif" style={{ fontSize: 14, color: "var(--text-2)" }}>After I</span>
          <input
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            onBlur={saveCue}
            className="f-mono"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "var(--text)" }}
          />
          {cueSaved && <span className="f-mono" style={{ fontSize: 12, color: "var(--accent)" }}>saved ✓</span>}
        </div>
      </Section>

      <Section title="Appearance">
        <div className="flex gap-2">
          {([["light", "Aged Diary (paper)"], ["dark", "Operator Night (dark)"]] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => pickTheme(k)}
              className="f-ui tap-target"
              style={{
                fontSize: 13,
                padding: "10px 16px",
                borderRadius: 6,
                border: `1px solid ${theme === k ? "var(--accent)" : "var(--border)"}`,
                color: theme === k ? "var(--accent)" : "var(--text-2)",
                background: theme === k ? "var(--surface-2)" : "transparent",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 10 }}>
          The night session always renders in the dark theme, regardless of this setting.
        </p>
      </Section>

      <Section title="Account">
        <p className="f-mono" style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>{email}</p>
        <form action="/auth/signout" method="post">
          <Btn type="submit" variant="outline">Sign out</Btn>
        </form>
      </Section>

      <Section title="Data">
        <Btn variant="outline" onClick={onExport}>Export JSON</Btn>
        <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 10 }}>Your whole journal, downloaded to your device. It&apos;s yours.</p>
      </Section>

      <Section title="Techniques">
        <div className="space-y-2">
          {TECHNIQUES.map((t) => (
            <div key={t.id} className="hairline flex items-center gap-3" style={{ borderRadius: 4, padding: "10px 12px", background: "var(--surface)" }}>
              <span className="f-serif flex-1" style={{ fontSize: 14, color: "var(--text)" }}>{t.name}</span>
              <EvidenceChip tier={CITATIONS[t.key].tier as Tier} citeKey={t.key} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="About / Open Source">
        <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 10 }}>
          End-to-end private. No telemetry. Self-host on your own Supabase.
        </p>
        <div className="f-mono flex items-center gap-4" style={{ fontSize: 12, color: "var(--text-3)", flexWrap: "wrap" }}>
          <span className="inline-flex items-center gap-1.5"><Icon name="github" size={13} /> Open Source</span>
          <span>MIT License</span>
        </div>
      </Section>
    </div>
  );
}
