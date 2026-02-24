export function formatWeekRange(daysAgo: number): string {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo + 1);
  const end = new Date();
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Week range for Sunday–Saturday (S M T W T F S). */
export function formatWeekRangeSunSat(): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Single-letter weekday for a date (S M T W T F S). Uses native Date only. */
export function getDayLetter(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayOfWeek = d.getDay();
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  return letters[dayOfWeek];
}
