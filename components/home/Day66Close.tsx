"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";

export function Day66Close() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div className="grain fixed inset-0 z-[95] flex items-center justify-center p-5" style={{ background: "var(--bg-deep)" }}>
      <div className="anim-up text-center" style={{ maxWidth: 520 }}>
        <Icon name="feather" size={34} style={{ color: "var(--accent)", margin: "0 auto 18px" }} />
        <h1 className="f-hand" style={{ fontSize: 30, color: "var(--text)", marginBottom: 14 }}>
          You&apos;ve filled 66 days of your journal.
        </h1>
        <p className="f-serif" style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 24 }}>
          No confetti. Just the record — and what you carry forward.
        </p>
        <div className="hairline text-left" style={{ borderRadius: 8, padding: "18px 20px", background: "var(--surface)", marginBottom: 24 }}>
          <span className="f-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>MAINTENANCE CARD</span>
          <p className="f-serif m-0" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            Daily: D1 + N2 + resolve due predictions. Keep the add-ons that stuck. Weekly review on Sundays.
            Your top ideas live in the <Link href="/ideas" style={{ color: "var(--accent)" }}>Ideas pipeline</Link>.
          </p>
        </div>
        <Btn variant="primary" onClick={() => setClosed(true)}>Return to the diary</Btn>
      </div>
    </div>
  );
}
