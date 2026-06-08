import { Icon } from "@/components/ui/Icon";
import type { BadgeView } from "@/lib/queries/gamification";

/**
 * The badge shelf — competence milestones tied to the real methodology. Unlocked badges
 * are never removed (E5: removing earned rewards harms via loss aversion). Locked badges
 * stay visible (and named) so they read as attainable goals, not mysteries.
 */
export function BadgeShelf({ badges }: { badges: BadgeView[] }) {
  return (
    <div className="hairline" style={{ borderRadius: 6, padding: "16px 18px", background: "var(--surface)" }}>
      <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
        BADGES
      </span>
      <ul
        className="mt-3 grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", listStyle: "none", margin: 0, padding: 0 }}
      >
        {badges.map((b) => (
          <li
            key={b.key}
            className="flex flex-col items-center text-center"
            style={{ opacity: b.unlocked ? 1 : 0.45 }}
            aria-label={`${b.name}: ${b.desc} ${
              b.unlocked
                ? `Unlocked${b.unlockedOn ? ` on ${b.unlockedOn}` : ""}.`
                : "Locked."
            }`}
            title={`${b.name} — ${b.desc}${b.unlocked && b.unlockedOn ? ` (unlocked ${b.unlockedOn})` : b.unlocked ? "" : " · locked"}`}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: b.unlocked ? "var(--surface-2)" : "transparent",
                border: `1px solid ${b.unlocked ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <Icon
                name={b.unlocked ? b.icon : "lock"}
                size={22}
                style={{ color: b.unlocked ? "var(--accent)" : "var(--text-3)" }}
              />
            </div>
            <span className="f-ui mt-1.5" style={{ fontSize: 11, lineHeight: 1.2, color: b.unlocked ? "var(--text)" : "var(--text-3)" }}>
              {b.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
