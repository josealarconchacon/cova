import type { Log } from "../../types";

export const DAYS_TO_FETCH = 30;

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dayLabel(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const now = new Date();
  const todayKey = toLocalDateKey(now);

  if (dateKey === todayKey) return "Today";

  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (dateKey === toLocalDateKey(y)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export interface DayGroup {
  key: string;
  label: string;
  logs: Log[];
}

export function groupLogsByDay(logs: Log[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const log of logs) {
    const key = toLocalDateKey(new Date(log.started_at));
    if (!groups.has(key)) {
      groups.set(key, { key, label: dayLabel(key), logs: [] });
    }
    groups.get(key)!.logs.push(log);
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.key.localeCompare(a.key),
  );
}
