import { SCAMPER_LENSES } from "@/lib/static/scamper";

// A collapsible, always-on-page reference for SCAMPER. Native <details> so it
// works without client JS and is safe in a Server Component. Collapsed by
// default to keep the pipeline uncluttered; one tap reveals all seven lenses.
export function ScamperGuide() {
  return (
    <details className="hairline" style={{ borderRadius: 8, background: "var(--surface)", marginBottom: 24 }}>
      <summary className="f-mono" style={{ cursor: "pointer", padding: "12px 16px", fontSize: 13, color: "var(--text-2)", userSelect: "none" }}>
        What do S · C · A · M · P · E · R mean?
        <span style={{ color: "var(--text-3)" }}> — the 7 idea-development lenses</span>
      </summary>
      <div style={{ padding: "4px 16px 16px" }}>
        <p className="f-serif" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-2)", margin: "0 0 14px", maxWidth: "70ch" }}>
          SCAMPER turns one idea into many by running it through seven prompts. Most good ideas are
          recombinations, not bolts from the blue — pick a lens and force a fresh angle on a seed.
        </p>
        <div className="flex flex-col" style={{ gap: 10 }}>
          {SCAMPER_LENSES.map((l) => (
            <div key={l.id} className="flex items-start" style={{ gap: 11 }}>
              <span
                className="f-mono"
                style={{ flex: "0 0 auto", width: 26, height: 26, borderRadius: 5, background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}
              >
                {l.id}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="ink" style={{ fontSize: 15, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 600 }}>{l.verb}</span>
                  <span style={{ color: "var(--text-2)" }}> — {l.gloss}</span>
                </div>
                <div className="f-mono" style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 2 }}>{l.question}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
