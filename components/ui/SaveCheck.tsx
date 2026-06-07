import { Icon } from "./Icon";

/** Ink-settle "saved" indicator, fixed lower-right. */
export function SaveCheck({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="anim-ink f-mono fixed z-[60] flex items-center gap-1.5"
      style={{ bottom: 24, right: 24, color: "var(--accent)", fontSize: 12 }}
    >
      <Icon name="check" size={16} /> saved
    </div>
  );
}
