"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, MOBILE_NAV } from "@/lib/static/program";

/** Mobile bottom bar — same three sections, dotted, mono-labelled. */
export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: "var(--bg-deep)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-around",
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        paddingTop: 6,
      }}
    >
      {MOBILE_NAV.map((id) => {
        const n = NAV.find((x) => x.id === id);
        if (!n) return null;
        const active = pathname === n.href || (n.href === "/home" && pathname.startsWith("/day"));
        return (
          <Link
            key={id}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className="tap-target flex flex-1 flex-col items-center justify-center gap-1"
            style={{ padding: "4px 10px", color: active ? "var(--text)" : "var(--text-3)", textDecoration: "none" }}
          >
            <span
              style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "var(--accent)" : "var(--text-3)" }}
            />
            <span className="f-mono" style={{ fontSize: 10, letterSpacing: ".04em" }}>
              {n.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
