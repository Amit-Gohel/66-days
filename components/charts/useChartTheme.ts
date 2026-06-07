"use client";

import { useEffect, useState } from "react";

export interface ChartTheme {
  accent: string;
  text: string;
  text2: string;
  text3: string;
  border: string;
}

// Dark-theme fallbacks for SSR/first paint; corrected from CSS vars after mount.
const FALLBACK: ChartTheme = {
  accent: "#d4a574",
  text: "#ece4d4",
  text2: "#a59c8a",
  text3: "#6f6757",
  border: "#3c352a",
};

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK);
  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const get = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
    // Reading resolved CSS variables from the DOM is only possible after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme({
      accent: get("--accent", FALLBACK.accent),
      text: get("--text", FALLBACK.text),
      text2: get("--text-2", FALLBACK.text2),
      text3: get("--text-3", FALLBACK.text3),
      border: get("--border", FALLBACK.border),
    });
  }, []);
  return theme;
}
