import { Icon } from "@/components/ui/Icon";
import type { GameState } from "@/lib/queries/gamification";

/**
 * Craft Points + rank card for the home dashboard. Framed as a competence mirror
 * ("the work you've put in") — never a spendable currency, never a payoff to chase.
 */
export function GameStatsCard({ game }: { game: GameState }) {
  const pct = Math.round(game.rankProgress * 100);
  const toNext = game.rank.next != null ? game.rank.next - game.craftPoints : 0;

  return (
    <div className="hairline" style={{ borderRadius: 6, padding: "16px 18px", background: "var(--surface)" }}>
      <div className="flex items-center justify-between">
        <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
          CRAFT POINTS
        </span>
        <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
          {game.unlockedCount}/{game.totalBadges} badges
        </span>
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="f-mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--text)", lineHeight: 1.1 }}>
          {game.craftPoints.toLocaleString()}
        </span>
        <span className="f-mono" style={{ fontSize: 13, color: "var(--text-2)" }}>CP</span>
        <span className="f-hand ml-auto" style={{ fontSize: 18, color: "var(--accent)" }}>
          {game.rank.name}
        </span>
      </div>

      {/* progress toward the next rank */}
      <div
        style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          game.rank.next != null
            ? `${pct}% toward the next rank`
            : "Top rank reached"
        }
      >
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", transition: "width 300ms ease" }} />
      </div>

      <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", margin: "6px 0 0" }}>
        {game.rank.next != null
          ? `${toNext.toLocaleString()} CP to next rank. Reflects the work you've put in.`
          : "Top rank — you've put in the work."}
      </p>

      {game.freezesAvailable > 0 && (
        <p className="f-serif inline-flex items-center gap-1.5" style={{ fontSize: 13, color: "var(--text-2)", margin: "8px 0 0" }}>
          <Icon name="snowflake" size={14} style={{ color: "var(--accent)" }} />
          {game.freezesAvailable} streak {game.freezesAvailable === 1 ? "freeze" : "freezes"} banked — earned, never bought.
        </p>
      )}
    </div>
  );
}
