// Date helpers — all "today"/day-number math happens in the USER's timezone,
// never server UTC, so day rollover matches the user's real day.

/** Current date in the given IANA timezone, as a YYYY-MM-DD string. */
export function todayInTz(timezone: string): string {
  try {
    // en-CA formats as YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}

/** Whole days between two YYYY-MM-DD dates (b - a). Negative if b is before a. */
export function daysBetween(a: string, b: string): number {
  const da = Date.parse(`${a}T00:00:00Z`);
  const db = Date.parse(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86_400_000);
}

/** Add n days to a YYYY-MM-DD date, returning a YYYY-MM-DD date. */
export function addDays(date: string, n: number): string {
  const ms = Date.parse(`${date}T00:00:00Z`) + n * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * 1-based program day for `todayISO` given the challenge `startDate`.
 * Day of startDate = 1. Clamped to a minimum of 1 (returns 0 if not started).
 * May exceed 66 — caller treats >66 as "complete".
 */
export function dayNumber(
  startDate: string | null,
  todayISO: string,
): number {
  if (!startDate) return 0;
  const elapsed = daysBetween(startDate, todayISO);
  if (elapsed < 0) return 0; // start date in the future
  return elapsed + 1;
}

/** The Sunday on or before the given YYYY-MM-DD date (week start). */
export function startOfWeek(dateISO: string): string {
  const dow = new Date(`${dateISO}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(dateISO, -dow);
}

export const TOTAL_DAYS = 66;
