import { getIdeas } from "@/lib/queries/ideas";
import { IdeaFunnel } from "@/components/charts/IdeaFunnel";

export default async function IdeasPage() {
  const { funnel, seeds, developed } = await getIdeas();

  return (
    <div className="anim-fade" style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Idea pipeline</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24 }}>
        Seeds become finalists. Most are culled — that&apos;s the point.
      </p>

      <div className="hairline" style={{ borderRadius: 8, padding: 20, background: "var(--surface)", marginBottom: 24 }}>
        <IdeaFunnel counts={funnel} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h2 className="f-hand" style={{ fontSize: 20, color: "var(--text)", marginBottom: 12 }}>Seeds (from D3)</h2>
          {seeds.length === 0 ? (
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Capture a D3 idea seed to start the pipeline.</p>
          ) : (
            <div className="space-y-2">
              {seeds.map((i) => (
                <div key={i.id} className="hairline" style={{ borderRadius: 4, padding: "12px 14px", background: "var(--surface)" }}>
                  <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>Day {i.day ?? "—"}</span>
                  <p className="ink m-0" style={{ fontSize: 17, lineHeight: "25px" }}>{i.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="f-hand" style={{ fontSize: 20, color: "var(--text)", marginBottom: 12 }}>Developed (SCAMPER)</h2>
          {developed.length === 0 ? (
            <p className="f-serif" style={{ fontSize: 14, color: "var(--text-3)" }}>Develop a seed via SCAMPER in the night session (N5).</p>
          ) : (
            <div className="space-y-2">
              {developed.map((d) => (
                <div key={d.id} className="hairline" style={{ borderRadius: 4, padding: "12px 14px", background: "var(--surface)" }}>
                  <span className="f-mono" style={{ fontSize: 11, color: "var(--accent)" }}>{d.prompt ? `SCAMPER · ${d.prompt}` : "developed"}</span>
                  {d.idea && <p className="ink m-0" style={{ fontSize: 15, lineHeight: "22px", color: "var(--text-2)" }}>{d.idea}</p>}
                  <p className="ink m-0" style={{ fontSize: 17, lineHeight: "25px" }}>{d.result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
