export function formatWeekRange(daysAgo: number): string {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo + 1);
  const end = new Date();
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Week range for Sunday–Saturday (S M T W T F S). offset 0 = this week, 1 = last week, etc. */
export function formatWeekRangeSunSat(weekOffset = 0): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - 7 * weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/** Same as formatWeekRangeSunSat but with spaces around the dash for calendar display. */
export function formatWeekRangeSunSatSpaced(weekOffset = 0): string {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - 7 * weekOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startStr} – ${endStr}`;
}

/** Single-letter weekday for a date (S M T W T F S). Uses native Date only. */
export function getDayLetter(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dayOfWeek = d.getDay();
  const letters = ["S", "M", "T", "W", "T", "F", "S"];
  return letters[dayOfWeek];
}
