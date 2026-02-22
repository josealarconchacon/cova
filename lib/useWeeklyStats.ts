import { useMemo } from "react";
import type { Log } from "../types";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  feedCount: number;
  sleepHours: number;
  diaperCount: number;
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
}

export function useWeeklyStats(logs: Log[]): WeeklyStats {
  return useMemo(() => {
    // Build array of the last 7 days
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

    // Aggregate each log into its day bucket
    for (const log of logs) {
      const logDate = log.started_at.split("T")[0];
      const day = days.find((d) => d.date === logDate);
      if (!day) continue;

      if (log.type === "feed") day.feedCount++;
      if (log.type === "diaper") day.diaperCount++;
      if (log.type === "sleep" && log.duration_seconds) {
        day.sleepHours += log.duration_seconds / 3600;
      }
    }

    // Round sleep hours to 1 decimal per day
    days.forEach((d) => {
      d.sleepHours = Math.round(d.sleepHours * 10) / 10;
    });

    const n = days.length;
    const totalFeeds = days.reduce((a, d) => a + d.feedCount, 0);
    const totalSleepHours = days.reduce((a, d) => a + d.sleepHours, 0);
    const totalDiapers = days.reduce((a, d) => a + d.diaperCount, 0);
    const totalMilestones = logs.filter((l) => l.type === "milestone").length;

    return {
      days,
      totalFeeds,
      totalSleepHours: Math.round(totalSleepHours * 10) / 10,
      totalDiapers,
      totalMilestones,
      avgFeeds: Math.round((totalFeeds / n) * 10) / 10,
      avgSleepHours: Math.round((totalSleepHours / n) * 10) / 10,
      avgDiapers: Math.round((totalDiapers / n) * 10) / 10,
    };
  }, [logs]);
}
