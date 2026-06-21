import { getDashboard } from "@/lib/queries/dashboard";
import { getGameState } from "@/lib/queries/gamification";
import { getNightData } from "@/lib/queries/night";
import { getPredictions } from "@/lib/queries/predictions";
import { entryToValues, type CaptureKey } from "@/lib/static/capture-spec";
import { PHASES } from "@/lib/static/program";
import { GameSync } from "@/components/game/GameSync";
import { TodayClient, type TodayGame } from "@/components/today/TodayClient";

export default async function HomePage() {
  const [{ app, heatmap, pagesFilled, todayEntry }, game, nightData, preds] = await Promise.all([
    getDashboard(),
    getGameState(),
    getNightData(),
    getPredictions(),
  ]);

  const prefill = Object.fromEntries(
    (["D1", "D2", "D3", "D4"] as CaptureKey[]).map((k) => [k, entryToValues(todayEntry, k)]),
  ) as Record<CaptureKey, Record<string, string>>;

  const session = nightData.session;
  const night = {
    recall: session?.n1_recalled_text ?? "",
    replay: session?.n2_happened ?? "",
    done: !!session?.completed_at,
  };

  const phaseName = PHASES.find((p) => p.n === app.phase)?.name ?? "";
  const phaseLabel = `PHASE ${app.phase} · ${phaseName.toUpperCase()}`;

  const gameVM: TodayGame = {
    craftPoints: game.craftPoints,
    rankName: game.rank.name,
    rankProgressPct: Math.round(game.rankProgress * 100),
    toNext: game.rank.next != null ? game.rank.next - game.craftPoints : null,
    freezesAvailable: game.freezesAvailable,
    badges: game.badges,
    unlockedCount: game.unlockedCount,
    totalBadges: game.totalBadges,
  };

  const weekDone = heatmap.filter(
    (c) => c.day >= app.day - 6 && c.day <= app.day && (c.state === "completed" || c.state === "partial" || c.state === "frozen"),
  ).length;

  return (
    <>
      <TodayClient
        mode="today"
        dayNum={app.day}
        phase={app.phase}
        phaseLabel={phaseLabel}
        values={prefill}
        night={night}
        predictions={{ due: preds.due, open: preds.open, brier: preds.meanBrier, resolvedCount: preds.resolved.length }}
        game={gameVM}
        stats={{ streak: app.streak, words: pagesFilled.totalWords, week: `${weekDone} / 7` }}
      />
      <GameSync leaderboardOptIn={game.leaderboardOptIn} />
    </>
  );
}
