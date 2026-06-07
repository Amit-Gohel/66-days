"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const BASE: CSSProperties = {
  borderRadius: 6,
  padding: "10px 18px",
  fontSize: 14,
  fontFamily: "var(--font-inter), 'Inter', sans-serif",
  fontWeight: 500,
  transition: "all 120ms ease",
  border: "1px solid transparent",
};

const VARIANTS: Record<Variant, CSSProperties> = {
  primary: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
  outline: { background: "transparent", color: "var(--text)", borderColor: "var(--border)" },
  ghost: { background: "transparent", color: "var(--text-2)" },
  danger: { background: "transparent", color: "var(--warn)", borderColor: "var(--warn)" },
};

export interface BtnProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Btn({
  children,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
  style = {},
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`tap-target ${className}`}
      style={{
        ...BASE,
        ...VARIANTS[variant],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant === "primary")
          e.currentTarget.style.background = "var(--accent-hover)";
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === "primary")
          e.currentTarget.style.background = "var(--accent)";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
