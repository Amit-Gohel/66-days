import { getDashboard } from "@/lib/queries/dashboard";
import { CalendarGrid, type CalCell } from "@/components/calendar/CalendarGrid";

export default async function CalendarPage() {
  const { app, heatmap } = await getDashboard();

  const cells: CalCell[] = Array.from({ length: 66 }, (_, i) => {
    const n = i + 1;
    const hc = heatmap.find((c) => c.day === n);
    let state: CalCell["state"];
    if (n === app.day) state = "today";
    else if (n > app.day) state = "future";
    else if (hc && (hc.state === "completed" || hc.state === "partial" || hc.state === "frozen")) state = "logged";
    else state = "missed";
    return { n, state };
  });

  return <CalendarGrid cells={cells} day={app.day} />;
}
