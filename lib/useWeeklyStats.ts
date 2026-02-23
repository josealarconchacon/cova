import { useMemo } from "react";
import type { Log } from "../types";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  feedCount: number;
  sleepHours: number;
  diaperCount: number;
}

export interface FeedInsights {
  peakHour: number | null;
  avgDurationMin: number;
  nightFeedCount: number;
}

export interface SleepInsights {
  bestDay: { dayName: string; hours: number } | null;
  avgNapsPerDay: number;
  longestNapMin: number;
}

export interface DiaperInsights {
  wetPct: number;
  dirtyPct: number;
  peakHour: number | null;
}

export interface WeekOverWeek {
  feedsPctChange: number | null;
  sleepPctChange: number | null;
  diapersPctChange: number | null;
}

export interface WeeklyStats {
  days: DailyStats[];
  avgFeeds: number;
  avgSleepHours: number;
  avgDiapers: number;
  totalFeeds: number;
  totalSleepHours: number;
  totalDiapers: number;
  totalMilestones: number;
  feedInsights: FeedInsights;
  sleepInsights: SleepInsights;
  diaperInsights: DiaperInsights;
  weekOverWeek: WeekOverWeek;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function hourRangeLabel(h: number): string {
  return `${formatHour(h)}–${formatHour((h + 2) % 24)}`;
}

export { formatHour, hourRangeLabel };

function computePeakHour(logs: Log[], type: string): number | null {
  const buckets = new Array(24).fill(0);
  for (const log of logs) {
    if (log.type !== type) continue;
    const hour = new Date(log.started_at).getHours();
    buckets[hour]++;
  }
  const max = Math.max(...buckets);
  if (max === 0) return null;
  return buckets.indexOf(max);
}

export function useWeeklyStats(
  currentWeekLogs: Log[],
  previousWeekLogs: Log[] = [],
): WeeklyStats {
  return useMemo(() => {
    const days: DailyStats[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split("T")[0],
        feedCount: 0,
        sleepHours: 0,
        diaperCount: 0,
      };
    });

    for (const log of currentWeekLogs) {
      const logDate = log.started_at.split("T")[0];
      const day = days.find((d) => d.date === logDate);
      if (!day) continue;
      if (log.type === "feed") day.feedCount++;
      if (log.type === "diaper") day.diaperCount++;
      if (log.type === "sleep" && log.duration_seconds) {
        day.sleepHours += log.duration_seconds / 3600;
      }
    }

    days.forEach((d) => {
      d.sleepHours = Math.round(d.sleepHours * 10) / 10;
    });

    const n = days.length;
    const totalFeeds = days.reduce((a, d) => a + d.feedCount, 0);
    const totalSleepHours = days.reduce((a, d) => a + d.sleepHours, 0);
    const totalDiapers = days.reduce((a, d) => a + d.diaperCount, 0);
    const totalMilestones = currentWeekLogs.filter((l) => l.type === "milestone").length;

    // ── Feed insights ──
    const feedLogs = currentWeekLogs.filter((l) => l.type === "feed");
    const feedDurations = feedLogs
      .filter((l) => l.duration_seconds != null && l.duration_seconds > 0)
      .map((l) => l.duration_seconds!);
    const avgDurationMin =
      feedDurations.length > 0
        ? Math.round(
            (feedDurations.reduce((a, b) => a + b, 0) / feedDurations.length / 60) * 10,
          ) / 10
        : 0;
    const nightFeedCount = feedLogs.filter((l) => {
      const h = new Date(l.started_at).getHours();
      return h >= 22 || h < 6;
    }).length;

    // ── Sleep insights ──
    const sleepLogs = currentWeekLogs.filter((l) => l.type === "sleep");
    let bestDay: SleepInsights["bestDay"] = null;
    for (const d of days) {
      if (d.sleepHours > 0 && (!bestDay || d.sleepHours > bestDay.hours)) {
        const dayOfWeek = new Date(d.date + "T12:00:00").getDay();
        bestDay = { dayName: DAY_NAMES[dayOfWeek], hours: d.sleepHours };
      }
    }
    const daysWithSleep = days.filter((d) => d.sleepHours > 0).length || 1;
    const sleepSessionCount = sleepLogs.length;
    const avgNapsPerDay = Math.round((sleepSessionCount / daysWithSleep) * 10) / 10;
    const longestNapMin =
      sleepLogs.length > 0
        ? Math.round(
            Math.max(...sleepLogs.map((l) => (l.duration_seconds ?? 0) / 60)),
          )
        : 0;

    // ── Diaper insights ──
    const diaperLogs = currentWeekLogs.filter((l) => l.type === "diaper");
    let wetCount = 0;
    let dirtyCount = 0;
    for (const log of diaperLogs) {
      const dt = (log.metadata?.diaper_type as string) ?? "";
      if (dt === "wet" || dt === "both") wetCount++;
      if (dt === "dirty" || dt === "both") dirtyCount++;
    }
    const diaperTotal = diaperLogs.length || 1;
    const wetPct = Math.round((wetCount / diaperTotal) * 100);
    const dirtyPct = Math.round((dirtyCount / diaperTotal) * 100);

    // ── Week-over-week ──
    const prevFeeds = previousWeekLogs.filter((l) => l.type === "feed").length;
    const prevSleep = previousWeekLogs
      .filter((l) => l.type === "sleep" && l.duration_seconds)
      .reduce((a, l) => a + l.duration_seconds! / 3600, 0);
    const prevDiapers = previousWeekLogs.filter((l) => l.type === "diaper").length;

    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : null;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      days,
      totalFeeds,
      totalSleepHours: Math.round(totalSleepHours * 10) / 10,
      totalDiapers,
      totalMilestones,
      avgFeeds: Math.round((totalFeeds / n) * 10) / 10,
      avgSleepHours: Math.round((totalSleepHours / n) * 10) / 10,
      avgDiapers: Math.round((totalDiapers / n) * 10) / 10,
      feedInsights: {
        peakHour: computePeakHour(currentWeekLogs, "feed"),
        avgDurationMin,
        nightFeedCount,
      },
      sleepInsights: {
        bestDay,
        avgNapsPerDay,
        longestNapMin,
      },
      diaperInsights: {
        wetPct,
        dirtyPct,
        peakHour: computePeakHour(currentWeekLogs, "diaper"),
      },
      weekOverWeek: {
        feedsPctChange: pctChange(totalFeeds, prevFeeds),
        sleepPctChange: pctChange(
          Math.round(totalSleepHours * 10) / 10,
          Math.round(prevSleep * 10) / 10,
        ),
        diapersPctChange: pctChange(totalDiapers, prevDiapers),
      },
    };
  }, [currentWeekLogs, previousWeekLogs]);
}
