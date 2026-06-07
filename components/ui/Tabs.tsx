"use client";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div
      className="no-scrollbar flex gap-1 overflow-x-auto"
      role="tablist"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className="f-ui tap-target whitespace-nowrap"
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "10px 14px",
            color: active === t.id ? "var(--accent)" : "var(--text-2)",
            borderBottom:
              active === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: -1,
            background: "transparent",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
