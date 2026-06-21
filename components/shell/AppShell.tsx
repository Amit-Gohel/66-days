import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

/** Authed layout: sticky sidebar (desktop) + bottom tabs (mobile) around the page. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <main className="min-w-0 flex-1" style={{ position: "relative", zIndex: 1 }}>
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
