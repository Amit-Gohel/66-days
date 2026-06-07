import type { ReactNode } from "react";

export function ChartCard({
  title,
  subtitle,
  big,
  children,
}: {
  title: string;
  subtitle?: string;
  big?: string;
  children: ReactNode;
}) {
  return (
    <div className="hairline" style={{ borderRadius: 8, padding: "18px 20px", background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="f-hand" style={{ fontSize: 19, color: "var(--text)" }}>{title}</h3>
        {big && <span className="f-mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--accent)", lineHeight: 1 }}>{big}</span>}
      </div>
      {subtitle && <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 12 }}>{subtitle}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
