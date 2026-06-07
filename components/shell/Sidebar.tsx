"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV } from "@/lib/static/program";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      className="hidden flex-col lg:flex"
      style={{
        width: 212,
        flexShrink: 0,
        background: "var(--bg-deep)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: "24px 14px",
      }}
    >
      <div className="mb-8 flex items-center gap-2 px-2">
        <Icon name="feather" size={22} style={{ color: "var(--accent)" }} />
        <span className="f-hand" style={{ fontSize: 19, color: "var(--text)", lineHeight: 1 }}>
          66 Days
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.id}
              href={n.href}
              className="tap-target flex items-center gap-3"
              style={{
                padding: "9px 12px",
                borderRadius: 6,
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-2)",
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                textDecoration: "none",
              }}
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
