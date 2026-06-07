"use client";

export interface RuledTextareaProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  rows?: number;
  minHeight?: number;
}

/** The signature ruled-paper writing surface (handwriting font + ruled lines). */
export function RuledTextarea({
  value,
  onChange,
  placeholder,
  ariaLabel,
  rows = 3,
  minHeight,
}: RuledTextareaProps) {
  return (
    <textarea
      className="ink ruled w-full"
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 2,
        resize: "vertical",
        width: "100%",
        minHeight: minHeight ?? rows * 30 + 12,
        paddingRight: 14,
        paddingBottom: 8,
      }}
    />
  );
}

export function WriteField({
  label,
  hint,
  ...props
}: RuledTextareaProps & { label: string; hint?: string }) {
  return (
    <div className="mb-4">
      <label
        className="f-mono block"
        style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6, letterSpacing: 0.3 }}
      >
        {label}
      </label>
      <RuledTextarea ariaLabel={label} {...props} />
      {hint && (
        <p className="f-serif" style={{ fontSize: 13, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
