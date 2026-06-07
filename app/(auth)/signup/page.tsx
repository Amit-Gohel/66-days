"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/lib/actions/auth";
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

export default function SignupPage() {
  const [state, action, pending] = useActionState(signUp, initial);

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="anim-fade w-full" style={{ maxWidth: 440 }}>
        <form
          action={action}
          className="surface hairline"
          style={{ borderRadius: 8, padding: "clamp(24px,5vw,36px)" }}
        >
          <Icon name="feather" size={28} style={{ color: "var(--accent)", marginBottom: 16 }} />
          <h1 className="f-hand" style={{ fontSize: 30, lineHeight: 1.15, color: "var(--text)", marginBottom: 8 }}>
            Start your 66 days
          </h1>
          <p className="f-serif" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 28 }}>
            Create an account to keep your field-diary private and yours.
          </p>

          <label className="f-mono block" htmlFor="email" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
            EMAIL
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className="f-mono w-full" style={fieldStyle} />

          <label className="f-mono block" htmlFor="password" style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
            PASSWORD
          </label>
          <input id="password" name="password" type="password" required autoComplete="new-password" placeholder="At least 6 characters" className="f-mono w-full" style={fieldStyle} />

          {state.error && (
            <p className="f-mono" style={{ fontSize: 12, color: "var(--warn)", marginBottom: 12 }}>
              {state.error}
            </p>
          )}

          <Btn type="submit" variant="primary" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Btn>

          <p className="f-ui" style={{ fontSize: 13, color: "var(--text-2)", textAlign: "center", marginTop: 16 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)" }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
