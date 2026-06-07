import { READING, READING_GROUPS } from "@/lib/static/reading";
import { EvidenceChip } from "@/components/ui/EvidenceChip";

export default function ReadingPage() {
  return (
    <div className="anim-fade" style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Reading list</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
        Sources behind the techniques — graded by how well the evidence holds.
      </p>
      {READING_GROUPS.map((g) => {
        const books = READING.filter((b) => b.skill === g);
        if (!books.length) return null;
        return (
          <div key={g} className="mb-7">
            <h2 className="f-mono mb-3" style={{ fontSize: 12, color: "var(--text-3)", letterSpacing: 0.5 }}>{g.toUpperCase()}</h2>
            <div className="space-y-2">
              {books.map((b) => (
                <div key={b.id} className="hairline" style={{ borderRadius: 6, padding: "14px 16px", background: "var(--surface)" }}>
                  <div className="flex items-start gap-3">
                    <EvidenceChip tier={b.chip} />
                    <div className="flex-1">
                      <h3 className="f-serif" style={{ fontSize: 17, fontWeight: 500, color: "var(--text)" }}>{b.title}</h3>
                      <p className="f-serif" style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", margin: "2px 0 0" }}>
                        {b.author} · <span className="f-mono" style={{ fontStyle: "normal" }}>{b.year}</span>
                      </p>
                      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, marginTop: 8 }}>{b.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
