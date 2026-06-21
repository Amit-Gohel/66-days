"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { NAV, NAV_MORE, MOBILE_NAV } from "@/lib/static/program";

/**
 * Mobile bottom bar — the primary sections (dotted, mono-labelled) plus a "More"
 * tab that opens a sheet for the deeper sections the desktop sidebar tucks under
 * "More". Without it those screens are unreachable on mobile.
 */
export function BottomTabs() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the sheet on navigation (route change, incl. browser back/forward) so it
  // never lingers over a new page.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoreOpen(false);
  }, [pathname]);

  // ESC closes the sheet.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const moreActive = NAV_MORE.some((n) => isActive(n.href));

  return (
    <>
      {moreOpen && (
        <div
          className="anim-fade fixed inset-0 z-50 lg:hidden"
          style={{ background: "var(--scrim)" }}
          onClick={() => setMoreOpen(false)}
          aria-hidden
        >
          <div
            role="menu"
            aria-label="More sections"
            className="surface hairline anim-up no-scrollbar"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              maxHeight: "70vh",
              overflowY: "auto",
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              boxShadow: "var(--shadow-float)",
              padding: "10px 0 calc(16px + env(safe-area-inset-bottom))",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", padding: "2px 0 10px" }}>
              <span style={{ width: 34, height: 4, borderRadius: 2, background: "var(--border)" }} />
            </div>
            <div
              className="f-mono"
              style={{
                fontSize: 10,
                letterSpacing: ".18em",
                color: "var(--text-3)",
                padding: "0 22px 8px",
                textTransform: "uppercase",
              }}
            >
              More
            </div>
            {NAV_MORE.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  role="menuitem"
                  onClick={() => setMoreOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="tap-target f-mono flex items-center gap-3"
                  style={{
                    padding: "11px 22px",
                    color: active ? "var(--text)" : "var(--text-2)",
                    background: active ? "var(--surface-2)" : "transparent",
                    borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                    fontSize: 13,
                    letterSpacing: ".02em",
                    textDecoration: "none",
                  }}
                >
                  <Icon
                    name={n.icon}
                    size={17}
                    style={{ color: active ? "var(--accent)" : "var(--text-3)", flexShrink: 0 }}
                  />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

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

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-label="More sections"
          className="tap-target flex flex-1 flex-col items-center justify-center gap-1"
          style={{
            padding: "4px 10px",
            border: "none",
            background: "transparent",
            color: moreOpen || moreActive ? "var(--text)" : "var(--text-3)",
          }}
        >
          <span style={{ display: "flex", gap: 3, alignItems: "center", height: 7 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: moreOpen || moreActive ? "var(--accent)" : "var(--text-3)",
                }}
              />
            ))}
          </span>
          <span className="f-mono" style={{ fontSize: 10, letterSpacing: ".04em" }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
