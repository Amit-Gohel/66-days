"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV, MOBILE_NAV } from "@/lib/static/program";

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: "var(--bg-deep)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {MOBILE_NAV.map((id) => {
        const n = NAV.find((x) => x.id === id);
        if (!n) return null;
        const active = pathname === n.href;
        return (
          <Link
            key={id}
            href={n.href}
            className="tap-target flex flex-1 flex-col items-center justify-center gap-1"
            style={{
              padding: "8px 0",
              color: active ? "var(--accent)" : "var(--text-3)",
              textDecoration: "none",
            }}
          >
            <Icon name={n.icon} size={22} />
            <span className="f-ui" style={{ fontSize: 10, fontWeight: active ? 500 : 400 }}>
              {n.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
