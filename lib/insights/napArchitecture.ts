import type { Log } from "../../types";
import { formatDayName } from "./constants";

/** Night = 7PM–6AM, Nap = 6AM–7PM */
const NIGHT_START_HOUR = 19;
const NIGHT_END_HOUR = 6;

function isNightSession(startedAt: string): boolean {
  const h = new Date(startedAt).getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

export interface NapArchitectureResult {
  totalNapHours: number;
  totalNightHours: number;
  avgNapDurationMin: number;
  napsPerDayAvg: number;
  totalNaps: number;
  longestStretchMin: number;
  longestStretchDay: string | null;
  daysWithSleep: number;
  fewerNapsThanTypical: boolean;
  ageMonths: number;
}

export function computeNapArchitecture(
  sleepLogs: Log[],
  baby: { date_of_birth: string } | null,
): NapArchitectureResult | null {
  const filtered = sleepLogs
    .filter((l) => l.type === "sleep" && l.duration_seconds != null)
    .sort(
      (a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    );

  if (filtered.length === 0) return null;

  let totalNapHours = 0;
  let totalNightHours = 0;
  const napDurations: number[] = [];
  const napsByDay = new Map<string, number>();
  let longestStretchMin = 0;
  let longestStretchDay: string | null = null;

  for (const log of filtered) {
    const hours = (log.duration_seconds ?? 0) / 3600;
    const dateKey = log.started_at.slice(0, 10);

    if (isNightSession(log.started_at)) {
      totalNightHours += hours;
    } else {
      totalNapHours += hours;
      napDurations.push(hours * 60);
      napsByDay.set(dateKey, (napsByDay.get(dateKey) ?? 0) + 1);
    }

    const stretchMin = (log.duration_seconds ?? 0) / 60;
    if (stretchMin > longestStretchMin) {
      longestStretchMin = stretchMin;
      longestStretchDay = formatDayName(dateKey);
    }
  }

  const daysWithSleep = new Set([
    ...filtered.map((l) => l.started_at.slice(0, 10)),
  ]).size;
  const totalNaps = napDurations.length;
  const avgNapDurationMin =
    napDurations.length > 0
      ? napDurations.reduce((a, b) => a + b, 0) / napDurations.length
      : 0;
  const napsPerDayAvg =
    daysWithSleep > 0 ? totalNaps / daysWithSleep : 0;

  let ageMonths = 24;
  if (baby?.date_of_birth) {
    const dob = new Date(baby.date_of_birth);
    const now = new Date();
    ageMonths =
      (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth());
  }

  const fewerNapsThanTypical = ageMonths < 6 && napsPerDayAvg < 2;

  return {
    totalNapHours: Math.round(totalNapHours * 10) / 10,
    totalNightHours: Math.round(totalNightHours * 10) / 10,
    avgNapDurationMin: Math.round(avgNapDurationMin),
    napsPerDayAvg: Math.round(napsPerDayAvg * 10) / 10,
    totalNaps,
    longestStretchMin: Math.round(longestStretchMin),
    longestStretchDay,
    daysWithSleep,
    fewerNapsThanTypical,
    ageMonths,
  };
}
