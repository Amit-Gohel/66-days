"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LeaderboardData, BuddyData } from "@/lib/queries/social";
import {
  setLeaderboardOptIn,
  sendBuddyRequest,
  respondBuddyRequest,
  endBuddy,
} from "@/lib/actions/social";

const card: React.CSSProperties = { border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 5, padding: 18, marginBottom: 16 };
const kicker: React.CSSProperties = { fontSize: 10, letterSpacing: ".16em", color: "var(--text-3)", textTransform: "uppercase", marginBottom: 8 };
const h3: React.CSSProperties = { margin: "0 0 4px", fontWeight: 500, fontSize: 19, color: "var(--text)" };
const body: React.CSSProperties = { margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text-2)", maxWidth: "52ch" };

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label} style={{ position: "relative", width: 48, height: 26, borderRadius: 26, border: "1px solid var(--border)", background: on ? "rgba(154,107,52,.2)" : "var(--surface-2)", cursor: "pointer", flex: "none" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", transition: "left .2s ease" }} />
    </button>
  );
}

export function LookBackView({ leaderboard, buddies }: { leaderboard: LeaderboardData; buddies: BuddyData }) {
  const router = useRouter();
  const [name, setName] = useState(leaderboard.displayName ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [buddyId, setBuddyId] = useState("");
  const [buddyErr, setBuddyErr] = useState("");
  const [copied, setCopied] = useState(false);

  const refresh = () => router.refresh();

  const toggleCohort = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await setLeaderboardOptIn(!leaderboard.optedIn, name);
      if (!res.ok && "error" in res && res.error) setErr(res.error);
      else refresh();
    } finally {
      setBusy(false);
    }
  };

  const invite = async () => {
    setBuddyErr("");
    const res = await sendBuddyRequest(buddyId);
    if (!res.ok && "error" in res && res.error) setBuddyErr(res.error);
    else { setBuddyId(""); refresh(); }
  };
  const respond = async (id: string, accept: boolean) => { await respondBuddyRequest(id, accept); refresh(); };
  const end = async (id: string) => { await endBuddy(id); refresh(); };

  const copyId = () => {
    navigator.clipboard?.writeText(leaderboard.myUserId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(26px,4vw,46px) clamp(18px,4vw,40px) 96px" }}>
      <header style={{ marginBottom: 22 }}>
        <button onClick={() => router.push("/settings")} className="f-mono" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: ".06em", color: "var(--text-3)", padding: "0 0 10px" }}>← Settings</button>
        <div className="f-mono" style={{ fontSize: 11, letterSpacing: ".16em", color: "var(--accent)" }}>FOLDED AWAY</div>
        <h2 className="f-serif" style={{ fontWeight: 300, fontSize: 30, margin: "6px 0 4px", color: "var(--text)" }}>Look back</h2>
        <p className="f-serif" style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "var(--text-2)", maxWidth: "60ch", fontWeight: 300 }}>
          Two optional, social ways to look up from your own page. Both are off until you turn them on, and you can turn them off again anytime.
        </p>
      </header>

      {/* COHORT */}
      <div style={card}>
        <div className="f-mono" style={kicker}>Cohort</div>
        <div className="flex items-start justify-between" style={{ gap: 16 }}>
          <div style={{ flex: 1 }}>
            <h3 className="f-serif" style={h3}>See how the cohort is doing?</h3>
            <p className="f-serif" style={body}>Share only your name and points. Off by default; turn it off anytime. No leagues, no demotion, no notifications.</p>
          </div>
          <Switch on={leaderboard.optedIn} onClick={toggleCohort} label="Join cohort leaderboard" />
        </div>

        {!leaderboard.optedIn && (
          <div className="flex items-center" style={{ gap: 8, marginTop: 14 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="f-mono" style={{ flex: 1, border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 3, color: "var(--text)", fontSize: 13, padding: "8px 11px" }} />
            <button onClick={toggleCohort} disabled={busy} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#f4ead3", fontSize: 11, letterSpacing: ".06em", borderRadius: 3, padding: "9px 14px", cursor: "pointer" }}>Join</button>
          </div>
        )}
        {err && <div className="f-serif" style={{ fontSize: 12.5, color: "var(--warn)", marginTop: 8 }}>{err}</div>}

        {leaderboard.optedIn && leaderboard.rows.length > 0 && (
          <div style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div className="f-mono" style={{ display: "grid", gridTemplateColumns: "34px 1fr 64px 44px", gap: 8, padding: "8px 12px", background: "var(--surface-2)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-3)" }}>
              <span>#</span><span>Name</span><span style={{ textAlign: "right" }}>CP</span><span style={{ textAlign: "right" }}>Streak</span>
            </div>
            {leaderboard.rows.map((r) => (
              <div key={r.userId} className="f-mono" style={{ display: "grid", gridTemplateColumns: "34px 1fr 64px 44px", gap: 8, alignItems: "center", padding: "9px 12px", background: r.isMe ? "rgba(154,107,52,.12)" : "transparent", fontSize: 12, color: r.isMe ? "var(--text)" : "var(--text-2)" }}>
                <span style={{ color: "var(--text-3)" }}>#{r.rank}</span>
                <span>{r.displayName}{r.isMe ? " · you" : ""}</span>
                <span style={{ textAlign: "right", color: "var(--accent)" }}>{r.points}</span>
                <span style={{ textAlign: "right", color: "var(--text-3)" }}>{r.streak}d</span>
              </div>
            ))}
          </div>
        )}
        {leaderboard.optedIn && (
          <div className="f-serif" style={{ fontStyle: "italic", fontSize: 12.5, color: "var(--text-3)", marginTop: 9 }}>Name and points only — never your email or a word of what you wrote.</div>
        )}
      </div>

      {/* BUDDY */}
      <div style={card}>
        <div className="f-mono" style={kicker}>Buddy</div>
        <h3 className="f-serif" style={h3}>A cooperative buddy streak</h3>
        <p className="f-serif" style={body}>
          Invite one person by buddy-ID. The shared streak counts days you both showed up. They see only the dates you completed — never a word of your journal. One person’s gap never resets the other’s streak.
        </p>

        {/* my id */}
        <div className="flex items-center" style={{ gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span className="f-mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>YOUR BUDDY-ID</span>
          <code className="f-mono" style={{ fontSize: 11, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leaderboard.myUserId}</code>
          <button onClick={copyId} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 10.5, padding: "5px 10px", cursor: "pointer" }}>{copied ? "copied ✓" : "copy"}</button>
        </div>

        {/* invite */}
        <div className="flex items-center" style={{ gap: 8, marginTop: 12 }}>
          <input value={buddyId} onChange={(e) => setBuddyId(e.target.value)} placeholder="Paste a buddy-ID to invite" className="f-mono" style={{ flex: 1, border: "1px solid var(--border)", background: "var(--bg)", borderRadius: 3, color: "var(--text)", fontSize: 12, padding: "8px 11px" }} />
          <button onClick={invite} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#f4ead3", fontSize: 11, letterSpacing: ".06em", borderRadius: 3, padding: "9px 14px", cursor: "pointer" }}>Invite</button>
        </div>
        {buddyErr && <div className="f-serif" style={{ fontSize: 12.5, color: "var(--warn)", marginTop: 8 }}>{buddyErr}</div>}

        {/* incoming */}
        {buddies.incoming.map((b) => (
          <div key={b.connectionId} className="flex items-center justify-between" style={{ gap: 10, marginTop: 12, padding: "10px 12px", border: "1px dashed var(--border)", borderRadius: 4 }}>
            <span className="f-serif" style={{ fontSize: 14, color: "var(--text)" }}>{b.displayName} wants to be your buddy</span>
            <span className="flex" style={{ gap: 6 }}>
              <button onClick={() => respond(b.connectionId, true)} className="f-mono" style={{ background: "var(--accent)", border: "none", color: "#f4ead3", fontSize: 11, borderRadius: 3, padding: "6px 12px", cursor: "pointer" }}>Accept</button>
              <button onClick={() => respond(b.connectionId, false)} className="f-mono" style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 11, borderRadius: 3, padding: "6px 12px", cursor: "pointer" }}>Decline</button>
            </span>
          </div>
        ))}

        {/* outgoing */}
        {buddies.outgoing.map((b) => (
          <div key={b.connectionId} className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 12 }}>Invite sent to {b.displayName} — waiting for them to accept.</div>
        ))}

        {/* accepted */}
        {buddies.accepted.map((b) => (
          <div key={b.connectionId} style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 4, padding: 16, background: "var(--bg)" }}>
            <div className="flex items-baseline" style={{ gap: 10, flexWrap: "wrap" }}>
              <span className="f-mono" style={{ fontSize: 28, color: "var(--accent)", lineHeight: 1 }}>{b.sharedStreak}</span>
              <span className="f-serif" style={{ fontSize: 17, fontStyle: "italic", color: "var(--text)" }}>You both showed up on {b.sharedStreak} {b.sharedStreak === 1 ? "day" : "days"}.</span>
            </div>
            <div className="f-mono" style={{ fontSize: 11, color: "var(--text-2)", marginTop: 10 }}>Connected with <span style={{ color: "var(--text)" }}>{b.displayName}</span></div>
            <div className="f-serif" style={{ fontStyle: "italic", fontSize: 12.5, color: "var(--text-3)", marginTop: 8, lineHeight: 1.55 }}>No guilt, no debt — a missed day on either side never breaks the other’s chain. Either of you can end the connection anytime.</div>
            <button onClick={() => end(b.connectionId)} className="f-mono" style={{ marginTop: 12, background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-2)", fontSize: 10.5, letterSpacing: ".04em", padding: "6px 12px", cursor: "pointer" }}>End connection</button>
          </div>
        ))}
      </div>
    </div>
  );
}
