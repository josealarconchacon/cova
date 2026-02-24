import { useMemo } from "react";
import type { Log } from "../types";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  feedCount: number;
  nursingCount: number;
  bottleCount: number;
  nursingDurationMin: number;
  bottleTotalMl: number;
  sleepHours: number;
  napHours: number;
  nightHours: number;
  diaperCount: number;
  wetCount: number;
  dirtyCount: number;
  bothCount: number;
}

export interface FeedInsights {
  peakHour: number | null;
  peakDayIndex: number | null;
  leastActiveDayIndex: number | null;
  avgDurationMin: number;
  nightFeedCount: number;
  nursingTotal: number;
  bottleTotal: number;
  nursingAvgMin: number;
  bottleAvgMin: number;
  bottleAvgMl: number;
  nursingPct: number;
  bottlePct: number;
  prevBottleAvgMl: number;
  nursingVsBottleShift: "more_nursing" | "more_bottle" | "balanced" | null;
  maxGapMin: number | null;
  avgGapMin: number | null;
}

export interface SleepInsights {
  bestDay: { dayName: string; hours: number } | null;
  avgNapsPerDay: number;
  longestNapMin: number;
  totalNapHours: number;
  totalNightHours: number;
  napPct: number;
  nightPct: number;
  avgWakeWindowMin: number | null;
  nightWakingsCount: number;
  sleepQualityScore: number | null;
  aapRecommendedMin: number;
  aapRecommendedMax: number;
}

export interface DiaperInsights {
  wetTotal: number;
  dirtyTotal: number;
  bothTotal: number;
  wetPct: number;
  dirtyPct: number;
  bothPct: number;
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
        nursingCount: 0,
        bottleCount: 0,
        nursingDurationMin: 0,
        bottleTotalMl: 0,
        sleepHours: 0,
        napHours: 0,
        nightHours: 0,
        diaperCount: 0,
        wetCount: 0,
        dirtyCount: 0,
        bothCount: 0,
      };
    });

    for (const log of currentWeekLogs) {
      const logDate = log.started_at.split("T")[0];
      const day = days.find((d) => d.date === logDate);
      if (!day) continue;
      if (log.type === "feed") {
        day.feedCount++;
        const ft = (log.metadata?.feed_type as string) ?? "";
        if (ft === "bottle") {
          day.bottleCount++;
          const amt = log.metadata?.amount_ml as number | undefined;
          if (amt != null) day.bottleTotalMl += amt;
        } else {
          day.nursingCount++;
          if (log.duration_seconds != null && log.duration_seconds > 0) {
            day.nursingDurationMin += log.duration_seconds / 60;
          }
        }
      }
      if (log.type === "diaper") {
        day.diaperCount++;
        const dt = (log.metadata?.diaper_type as string) ?? "";
        if (dt === "both") day.bothCount++;
        else if (dt === "dirty") day.dirtyCount++;
        else day.wetCount++;
      }
      if (log.type === "sleep" && log.duration_seconds) {
        const hours = log.duration_seconds / 3600;
        day.sleepHours += hours;
        const startHour = new Date(log.started_at).getHours();
        const isNight = startHour >= 22 || startHour < 6;
        if (isNight) {
          day.nightHours += hours;
        } else {
          day.napHours += hours;
        }
      }
    }

    days.forEach((d) => {
      d.sleepHours = Math.round(d.sleepHours * 10) / 10;
      d.napHours = Math.round(d.napHours * 10) / 10;
      d.nightHours = Math.round(d.nightHours * 10) / 10;
      d.nursingDurationMin = Math.round(d.nursingDurationMin * 10) / 10;
    });

    const n = days.length;
    const totalFeeds = days.reduce((a, d) => a + d.feedCount, 0);
    const totalSleepHours = days.reduce((a, d) => a + d.sleepHours, 0);
    const totalDiapers = days.reduce((a, d) => a + d.diaperCount, 0);
    const totalMilestones = currentWeekLogs.filter((l) => l.type === "milestone").length;

    // ── Feed insights ──
    const feedLogs = currentWeekLogs.filter((l) => l.type === "feed");
    const nursingLogs = feedLogs.filter(
      (l) => (l.metadata?.feed_type as string) !== "bottle",
    );
    const bottleLogs = feedLogs.filter(
      (l) => (l.metadata?.feed_type as string) === "bottle",
    );

    const avgDur = (logs: Log[]) => {
      const durations = logs
        .filter((l) => l.duration_seconds != null && l.duration_seconds > 0)
        .map((l) => l.duration_seconds!);
      if (durations.length === 0) return 0;
      return Math.round(
        (durations.reduce((a, b) => a + b, 0) / durations.length / 60) * 10,
      ) / 10;
    };

    const feedDurations = feedLogs
      .filter((l) => l.duration_seconds != null && l.duration_seconds > 0)
      .map((l) => l.duration_seconds!);
    const avgDurationMin =
      feedDurations.length > 0
        ? Math.round(
            (feedDurations.reduce((a, b) => a + b, 0) / feedDurations.length / 60) * 10,
          ) / 10
        : 0;

    const bottleAmounts = bottleLogs
      .filter((l) => l.metadata?.amount_ml != null)
      .map((l) => l.metadata!.amount_ml as number);
    const bottleAvgMl =
      bottleAmounts.length > 0
        ? Math.round(bottleAmounts.reduce((a, b) => a + b, 0) / bottleAmounts.length)
        : 0;

    const prevBottleLogs = previousWeekLogs.filter(
      (l) => l.type === "feed" && (l.metadata?.feed_type as string) === "bottle",
    );
    const prevBottleAmounts = prevBottleLogs
      .filter((l) => l.metadata?.amount_ml != null)
      .map((l) => l.metadata!.amount_ml as number);
    const prevBottleAvgMl =
      prevBottleAmounts.length > 0
        ? Math.round(prevBottleAmounts.reduce((a, b) => a + b, 0) / prevBottleAmounts.length)
        : 0;

    const feedTotal = nursingLogs.length + bottleLogs.length || 1;
    const nursingPct = Math.round((nursingLogs.length / feedTotal) * 100);
    const bottlePct = Math.round((bottleLogs.length / feedTotal) * 100);

    const prevNursing = previousWeekLogs.filter(
      (l) => l.type === "feed" && (l.metadata?.feed_type as string) !== "bottle",
    ).length;
    const prevBottle = prevBottleLogs.length;
    const prevFeedTotal = prevNursing + prevBottle || 1;
    const prevNursingPct = prevFeedTotal > 0 ? prevNursing / prevFeedTotal : 0.5;
    const prevBottlePct = prevFeedTotal > 0 ? prevBottle / prevFeedTotal : 0.5;
    const currNursingPct = nursingLogs.length / feedTotal;
    const currBottlePct = bottleLogs.length / feedTotal;
    const nursingShift = currNursingPct - prevNursingPct;
    const bottleShift = currBottlePct - prevBottlePct;
    let nursingVsBottleShift: FeedInsights["nursingVsBottleShift"] = null;
    if (feedTotal > 0 && prevFeedTotal > 0) {
      if (nursingShift > 0.1) nursingVsBottleShift = "more_nursing";
      else if (bottleShift > 0.1) nursingVsBottleShift = "more_bottle";
      else nursingVsBottleShift = "balanced";
    }

    let peakDayIndex: number | null = null;
    let leastActiveDayIndex: number | null = null;
    let maxFeeds = 0;
    let minFeeds = Infinity;
    days.forEach((d, i) => {
      if (d.feedCount > maxFeeds) {
        maxFeeds = d.feedCount;
        peakDayIndex = i;
      }
      if (d.feedCount < minFeeds) {
        minFeeds = d.feedCount;
        leastActiveDayIndex = i;
      }
    });
    if (totalFeeds === 0) {
      peakDayIndex = null;
      leastActiveDayIndex = null;
    }

    const nightFeedCount = feedLogs.filter((l) => {
      const h = new Date(l.started_at).getHours();
      return h >= 22 || h < 6;
    }).length;

    let maxGapMin: number | null = null;
    let avgGapMin: number | null = null;
    if (feedLogs.length >= 2) {
      const sorted = [...feedLogs].sort(
        (a, b) =>
          new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
      );
      const gaps: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        const prevEnd = sorted[i - 1].started_at;
        const prevDur = (sorted[i - 1].duration_seconds ?? 0) * 1000;
        const prevEndTime = new Date(prevEnd).getTime() + prevDur;
        const nextStart = new Date(sorted[i].started_at).getTime();
        const gapMin = (nextStart - prevEndTime) / 60000;
        if (gapMin > 0 && gapMin < 24 * 60) gaps.push(gapMin);
      }
      if (gaps.length > 0) {
        maxGapMin = Math.round(Math.max(...gaps));
        avgGapMin = Math.round(
          gaps.reduce((a, b) => a + b, 0) / gaps.length,
        );
      }
    }

    // ── Sleep insights ──
    const sleepLogs = currentWeekLogs
      .filter((l) => l.type === "sleep" && l.duration_seconds)
      .sort(
        (a, b) =>
          new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
      );
    const totalNapHours = days.reduce((a, d) => a + d.napHours, 0);
    const totalNightHours = days.reduce((a, d) => a + d.nightHours, 0);
    const totalSleepForPct = totalNapHours + totalNightHours || 1;
    const napPct = Math.round((totalNapHours / totalSleepForPct) * 100);
    const nightPct = Math.round((totalNightHours / totalSleepForPct) * 100);

    let avgWakeWindowMin: number | null = null;
    if (sleepLogs.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < sleepLogs.length; i++) {
        const prevEnd = sleepLogs[i - 1].started_at;
        const prevDur = (sleepLogs[i - 1].duration_seconds ?? 0) * 1000;
        const prevEndTime = new Date(prevEnd).getTime() + prevDur;
        const nextStart = new Date(sleepLogs[i].started_at).getTime();
        const gapMin = (nextStart - prevEndTime) / 60000;
        if (gapMin > 0 && gapMin < 24 * 60) gaps.push(gapMin);
      }
      if (gaps.length > 0) {
        avgWakeWindowMin = Math.round(
          gaps.reduce((a, b) => a + b, 0) / gaps.length,
        );
      }
    }

    const nightSleepSessions = sleepLogs.filter((l) => {
      const h = new Date(l.started_at).getHours();
      return h >= 22 || h < 6;
    }).length;
    const nightWakingsCount = Math.max(0, nightSleepSessions - 1);

    const totalSleepForQuality = totalNapHours + totalNightHours;
    let sleepQualityScore: number | null = null;
    if (totalSleepForQuality > 0 && sleepLogs.length > 0) {
      const avgSleepPerDay = totalSleepForQuality / n;
      let score = 70;
      score -= nightWakingsCount * 8;
      const avgBlockMin =
        sleepLogs.reduce((a, l) => a + (l.duration_seconds ?? 0), 0) /
        sleepLogs.length /
        60;
      if (avgBlockMin >= 120) score += 15;
      else if (avgBlockMin >= 60) score += 5;
      if (avgSleepPerDay >= 12) score += 15;
      else if (avgSleepPerDay >= 10) score += 5;
      sleepQualityScore = Math.max(0, Math.min(100, Math.round(score)));
    }

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

    const aapNewborn = { min: 14, max: 17 };

    // ── Diaper insights ──
    const diaperLogs = currentWeekLogs.filter((l) => l.type === "diaper");
    let wetTotal = 0;
    let dirtyTotal = 0;
    let bothTotal = 0;
    for (const log of diaperLogs) {
      const dt = (log.metadata?.diaper_type as string) ?? "";
      if (dt === "both") bothTotal++;
      else if (dt === "dirty") dirtyTotal++;
      else wetTotal++;
    }
    const diaperTotal = diaperLogs.length || 1;
    const wetPct = Math.round((wetTotal / diaperTotal) * 100);
    const dirtyPct = Math.round((dirtyTotal / diaperTotal) * 100);
    const bothPct = Math.round((bothTotal / diaperTotal) * 100);

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
        peakDayIndex,
        leastActiveDayIndex,
        avgDurationMin,
        nightFeedCount,
        nursingTotal: nursingLogs.length,
        bottleTotal: bottleLogs.length,
        nursingAvgMin: avgDur(nursingLogs),
        bottleAvgMin: avgDur(bottleLogs),
        bottleAvgMl,
        nursingPct,
        bottlePct,
        prevBottleAvgMl,
        nursingVsBottleShift,
        maxGapMin,
        avgGapMin,
      },
      sleepInsights: {
        bestDay,
        avgNapsPerDay,
        longestNapMin,
        totalNapHours,
        totalNightHours,
        napPct,
        nightPct,
        avgWakeWindowMin,
        nightWakingsCount,
        sleepQualityScore,
        aapRecommendedMin: aapNewborn.min,
        aapRecommendedMax: aapNewborn.max,
      },
      diaperInsights: {
        wetTotal,
        dirtyTotal,
        bothTotal,
        wetPct,
        dirtyPct,
        bothPct,
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
