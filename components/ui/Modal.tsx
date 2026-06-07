"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  labelledBy?: string;
  maxWidth?: number;
  dark?: boolean;
}

/** Focus-trapped modal with scrim-click + ESC close. `dark` forces night theme. */
export function Modal({
  open,
  onClose,
  children,
  labelledBy,
  maxWidth = 480,
  dark = false,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = (): HTMLElement[] =>
      el
        ? Array.from(
            el.querySelectorAll<HTMLElement>(
              'button,[href],input,textarea,select,[tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    const t = setTimeout(() => {
      const f = focusables();
      if (f.length) f[0].focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="anim-fade fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "var(--scrim)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      {...(dark ? { "data-theme": "night" } : {})}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="surface hairline anim-up"
        style={{
          maxWidth,
          width: "100%",
          borderRadius: 8,
          boxShadow: "var(--shadow-float)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "var(--surface)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
