import type { CSSProperties, ReactNode } from "react";

// Single-stroke, Lucide-ish icon set (ported verbatim from the prototype).
// Pure/presentational — safe to render in Server Components.

const PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </>
  ),
  moon: <path d="M21 12.8A8 8 0 1 1 11.2 3a6.2 6.2 0 0 0 9.8 9.8Z" />,
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="1.5" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M4 5.5V20.5" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
      <path d="M9 4v13M15 6.5v13" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  flag: <path d="M5 21V4M5 4h12l-2 4 2 4H5" />,
  lightbulb: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  shield: <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />,
  edit: (
    <>
      <path d="M4 20h4L18 10l-4-4L4 16v4Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  feather: (
    <>
      <path d="M20 4C13 4 8 9 6 15l-2 5 5-2c6-2 11-7 11-14Z" />
      <path d="M16 8 8 16M11 12h6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  github: (
    <path d="M9 19c-4 1.5-4-2-6-2.5m12 4.5v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.5a5 5 0 0 0-1.4-3.5 4.7 4.7 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6 0C6.5 1.8 5.4 2.1 5.4 2.1a4.7 4.7 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 5 3 6.2 6 6.5a3 3 0 0 0-.9 2.4V21" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  snowflake: <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" />,
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
    </>
  ),
  // trash = delete a prediction; rotateCcw = undo/reopen glyph (kept for reuse)
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </>
  ),
  rotateCcw: (
    <>
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.4 2.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  // scissors = cull an idea; star = mark a Top-3 finalist; wand = develop (SCAMPER)
  scissors: (
    <>
      <circle cx="6" cy="6" r="2.6" />
      <circle cx="6" cy="18" r="2.6" />
      <path d="M8.4 7.6 20 18M8.4 16.4 20 6" />
    </>
  ),
  star: (
    <path d="M12 3l2.7 5.5 6 .9-4.35 4.2 1.03 6L12 17.8 6.62 19.6l1.03-6L3.3 9.4l6-.9L12 3Z" />
  ),
  wand: (
    <>
      <path d="M4 20 15 9" />
      <path d="M13 4.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z" />
    </>
  ),
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, className = "", style = {} }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
