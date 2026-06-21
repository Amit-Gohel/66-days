import { getIdeas } from "@/lib/queries/ideas";
import { IdeasPipeline } from "@/components/ideas/IdeasPipeline";
import { ScamperGuide } from "@/components/ideas/ScamperGuide";

// /ideas — the full idea pipeline. Server Component: it fetches (and lazily
// imports) the ideas, then hands them to the client IdeasPipeline, which owns
// filtering, editing, and the lane/Top-3 transitions.
export default async function IdeasPage() {
  const { ideas } = await getIdeas();
  return (
    <div className="anim-fade" style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 4 }}>Idea pipeline</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 24, maxWidth: "64ch" }}>
        Seeds become finalists. Develop the promising ones through a SCAMPER lens, cull the rest, and
        pick your top 3 — most get cut, and that&apos;s the point.
      </p>
      <ScamperGuide />
      <IdeasPipeline all={ideas} />
    </div>
  );
}
