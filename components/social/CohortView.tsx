"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";
import { Toast } from "@/components/ui/Toast";
import {
  setLeaderboardOptIn,
  sendBuddyRequest,
  respondBuddyRequest,
  endBuddy,
} from "@/lib/actions/social";
import type { LeaderboardData, BuddyData } from "@/lib/queries/social";

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="hairline mb-6" style={{ borderRadius: 8, padding: "18px 20px", background: "var(--surface)" }}>
      <h2 className="f-hand" style={{ fontSize: 19, color: "var(--text)", marginBottom: hint ? 4 : 14 }}>
        {title}
      </h2>
      {hint && <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 14px" }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--text)",
} as const;

export function CohortView({ leaderboard, buddies }: { leaderboard: LeaderboardData; buddies: BuddyData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState("");
  const [name, setName] = useState(leaderboard.displayName ?? "");
  const [buddyId, setBuddyId] = useState("");

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) =>
    start(async () => {
      try {
        const r = await fn();
        if (r && r.ok === false) {
          flash(r.error ?? "Something went wrong.");
          return;
        }
        if (okMsg) flash(okMsg);
        router.refresh();
      } catch {
        flash("Something went wrong.");
      }
    });

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(buddies.myUserId);
      flash("Buddy ID copied.");
    } catch {
      flash("Couldn't copy — select it manually.");
    }
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 680, margin: "0 auto", padding: "clamp(16px,4vw,32px) clamp(16px,4vw,28px) 100px" }}>
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 6 }}>Cohort</h1>
      <p className="f-serif" style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.5 }}>
        Optional and cooperative. Everything here is off until you turn it on, and only ever shows a
        display name and progress numbers — never a word of your journal.
      </p>

      {/* ── Leaderboard ─────────────────────────────────────────── */}
      <Section
        title="Leaderboard"
        hint="Opt in to compare Craft Points with others who chose to share. No leagues, no demotion, no notifications."
      >
        {leaderboard.optedIn ? (
          <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 14 }}>
            <span className="f-serif" style={{ fontSize: 14, color: "var(--text-2)" }}>
              Shown as <strong style={{ color: "var(--text)" }}>{leaderboard.displayName}</strong>.
            </span>
            <Btn variant="outline" disabled={pending} onClick={() => run(() => setLeaderboardOptIn(false), "Left the leaderboard.")}>
              Leave
            </Btn>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 14 }}>
            <label htmlFor="ln" className="f-mono" style={{ fontSize: 12, color: "var(--text-2)" }}>DISPLAY NAME</label>
            <input
              id="ln"
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nightwatch"
              className="f-mono"
              style={inputStyle}
            />
            <Btn disabled={pending || !name.trim()} onClick={() => run(() => setLeaderboardOptIn(true, name), "You're on the leaderboard.")}>
              Join
            </Btn>
          </div>
        )}

        {leaderboard.rows.length === 0 ? (
          <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)" }}>No one has joined yet — be the first.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }} aria-label="Leaderboard">
            {leaderboard.rows.map((r) => (
              <li
                key={r.userId}
                className="flex items-center gap-3"
                style={{
                  padding: "9px 12px",
                  borderRadius: 6,
                  marginBottom: 4,
                  background: r.isMe ? "var(--surface-2)" : "transparent",
                  border: `1px solid ${r.isMe ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                <span className="f-mono" style={{ fontSize: 13, color: "var(--text-3)", width: 28 }}>#{r.rank}</span>
                <span className="f-serif flex-1" style={{ fontSize: 14, color: "var(--text)" }}>
                  {r.displayName}{r.isMe && <span style={{ color: "var(--accent)" }}> · you</span>}
                </span>
                <span className="f-mono inline-flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-2)" }} title="streak">
                  <Icon name="flag" size={13} />{r.streak}
                </span>
                <span className="f-mono" style={{ fontSize: 13, color: "var(--accent)", width: 70, textAlign: "right" }}>
                  {r.points.toLocaleString()} CP
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Buddies ─────────────────────────────────────────────── */}
      <Section
        title="Buddies"
        hint="A buddy is one person who shows up alongside you. Your shared streak counts the days you both turned up — a gap is never framed as letting anyone down, and either of you can end it anytime."
      >
        {/* your id */}
        <div style={{ marginBottom: 16 }}>
          <span className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>YOUR BUDDY ID</span>
          <div className="flex flex-wrap items-center gap-2">
            <code className="f-mono" style={{ fontSize: 12, color: "var(--text-2)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", wordBreak: "break-all" }}>
              {buddies.myUserId}
            </code>
            <Btn variant="outline" onClick={copyId}>Copy</Btn>
          </div>
        </div>

        {/* invite */}
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="bid" className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>ADD A BUDDY BY THEIR ID</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="bid"
              value={buddyId}
              onChange={(e) => setBuddyId(e.target.value)}
              placeholder="paste a buddy ID"
              className="f-mono"
              style={{ ...inputStyle, minWidth: 260 }}
            />
            <Btn
              disabled={pending || !buddyId.trim()}
              onClick={() => {
                run(() => sendBuddyRequest(buddyId), "Request sent.");
                setBuddyId("");
              }}
            >
              Send request
            </Btn>
          </div>
        </div>

        {/* incoming requests */}
        {buddies.incoming.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>REQUESTS FOR YOU</span>
            {buddies.incoming.map((b) => (
              <div key={b.connectionId} className="flex items-center gap-2" style={{ padding: "8px 0" }}>
                <span className="f-serif flex-1" style={{ fontSize: 14, color: "var(--text)" }}>{b.displayName}</span>
                <Btn disabled={pending} onClick={() => run(() => respondBuddyRequest(b.connectionId, true), "Buddy added.")}>Accept</Btn>
                <Btn variant="ghost" disabled={pending} onClick={() => run(() => respondBuddyRequest(b.connectionId, false))}>Decline</Btn>
              </div>
            ))}
          </div>
        )}

        {/* outgoing pending */}
        {buddies.outgoing.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span className="f-mono block" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>SENT · PENDING</span>
            {buddies.outgoing.map((b) => (
              <div key={b.connectionId} className="flex items-center gap-2" style={{ padding: "8px 0" }}>
                <span className="f-serif flex-1" style={{ fontSize: 14, color: "var(--text-2)" }}>{b.displayName}</span>
                <span className="f-mono" style={{ fontSize: 12, color: "var(--text-3)" }}>awaiting reply</span>
              </div>
            ))}
          </div>
        )}

        {/* accepted */}
        {buddies.accepted.length === 0 ? (
          <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)" }}>No buddies yet. Share your ID with someone on the same journey.</p>
        ) : (
          buddies.accepted.map((b) => (
            <div
              key={b.connectionId}
              className="flex flex-wrap items-center gap-3"
              style={{ padding: "12px", borderRadius: 6, marginBottom: 6, border: "1px solid var(--border)", background: "var(--surface)" }}
            >
              <span className="f-serif flex-1" style={{ fontSize: 15, color: "var(--text)" }}>{b.displayName}</span>
              <span className="f-mono inline-flex items-center gap-1.5" style={{ fontSize: 13, color: "var(--accent)" }}>
                <Icon name="flag" size={14} />
                {b.sharedStreak}-day shared streak
              </span>
              <Btn variant="ghost" disabled={pending} onClick={() => run(() => endBuddy(b.connectionId), "Buddy ended.")}>End</Btn>
            </div>
          ))
        )}
      </Section>

      <Toast msg={toast} />
    </div>
  );
}
