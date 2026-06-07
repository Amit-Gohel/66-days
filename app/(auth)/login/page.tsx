"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";

const initial: AuthState = { error: null };

const fieldStyle = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "11px 13px",
  fontSize: 14,
  color: "var(--text)",
  marginBottom: 14,
} as const;

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="anim-fade w-full" style={{ maxWidth: 440 }}>
        <form
          action={action}
          className="surface hairline"
          style={{ borderRadius: 8, padding: "clamp(24px,5vw,36px)" }}
        >
          <Icon name="feather" size={28} style={{ color: "var(--accent)", marginBottom: 16 }} />
          <h1
            className="f-hand"
            style={{ fontSize: 30, lineHeight: 1.15, color: "var(--text)", marginBottom: 8 }}
          >
            The 66-Day Perception &amp; Judgment System
          </h1>
          <p
            className="f-serif"
            style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 28 }}
          >
            A daily field-diary for sharpening perception, judgment, and calibrated forecasting.
          </p>

          <label className="f-mono block" htmlFor="email" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
            EMAIL
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="f-mono w-full" style={fieldStyle} />

          <label className="f-mono block" htmlFor="password" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
            PASSWORD
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" className="f-mono w-full" style={fieldStyle} />

          {state.error && (
            <p className="f-mono" style={{ fontSize: 12, color: "var(--warn)", marginBottom: 12 }}>
              {state.error}
            </p>
          )}

          <Btn type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Btn>

          <p className="f-ui" style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", marginTop: 16 }}>
            Need an account?{" "}
            <Link href="/signup" style={{ color: "var(--accent)" }}>
              Create one
            </Link>
          </p>
          <p className="f-mono" style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6, marginTop: 16, textAlign: "center" }}>
            End-to-end private. No telemetry. Open source. Your journal is yours.
          </p>
        </form>
        <div className="f-mono mt-5 flex items-center justify-center gap-4" style={{ fontSize: 11, color: "var(--text-3)", flexWrap: "wrap" }}>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="github" size={13} /> Open Source
          </span>
          <span>MIT License</span>
          <span>Self-host on Supabase</span>
        </div>
      </div>
    </div>
  );
}
