"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV, NAV_MORE, type NavItem } from "@/lib/static/program";

/** Desktop side rail — primary sections up top, deeper ones under a quiet "More". */
export function Sidebar() {
  const pathname = usePathname();

  const Item = ({ n, small }: { n: NavItem; small?: boolean }) => {
    const active = pathname === n.href || (n.href === "/home" && pathname.startsWith("/day"));
    return (
      <Link
        key={n.id}
        href={n.href}
        aria-current={active ? "page" : undefined}
        className="f-mono flex items-center gap-2.5"
        style={{
          padding: small ? "7px 16px" : "9px 16px",
          borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
          background: active ? "var(--surface)" : "transparent",
          color: active ? "var(--text)" : small ? "var(--text-3)" : "var(--text-2)",
          fontSize: small ? 11 : 11.5,
          letterSpacing: ".03em",
          textDecoration: "none",
        }}
      >
        {small ? (
          <Icon name={n.icon} size={14} style={{ color: active ? "var(--accent)" : "var(--text-3)", flexShrink: 0 }} />
        ) : (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "var(--accent)" : "var(--text-3)", flex: "none" }} />
        )}
        {n.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Sections"
      className="hidden flex-col lg:flex"
      style={{
        width: 168,
        flexShrink: 0,
        background: "var(--bg-deep)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: "30px 0",
        gap: 2,
        overflowY: "auto",
      }}
    >
      <div
        className="f-mono"
        style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--text-3)", padding: "0 18px 18px", textTransform: "uppercase" }}
      >
        The 66
        <br />
        Day System
      </div>

      {NAV.map((n) => (
        <Item key={n.id} n={n} />
      ))}

      <div
        className="f-mono"
        style={{ fontSize: 9.5, letterSpacing: ".18em", color: "var(--text-3)", padding: "20px 18px 8px", textTransform: "uppercase", opacity: 0.8 }}
      >
        More
      </div>
      {NAV_MORE.map((n) => (
        <Item key={n.id} n={n} small />
      ))}
    </nav>
  );
}
