export function formatWeekRange(daysAgo: number): string {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo + 1);
  const end = new Date();
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
