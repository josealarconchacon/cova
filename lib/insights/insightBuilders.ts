import React from "react";
import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  StartTimerIcon,
} from "../../assets/icons/QuickActionIcons";
import { formatDayName } from "./constants";
import { hourRangeLabel } from "../useWeeklyStats";
import type { WeeklyStats } from "../useWeeklyStats";
import type { Baby } from "../../types";

export interface InsightCard {
  icon: string;
  title: string;
  text: string;
  color: string;
  IconComponent?: React.ComponentType<{ size?: number; color?: string }>;
}

const IRREGULAR_GAP_THRESHOLD_MIN = 300;

export function buildFeedInsights(stats: WeeklyStats): InsightCard[] {
  const cards: InsightCard[] = [];
  const { feedInsights } = stats;

  const hasNursing = feedInsights.nursingTotal > 0;
  const hasBottle = feedInsights.bottleTotal > 0;
  const feedTotal = stats.totalFeeds;

  if (feedTotal === 0) {
    cards.push({
      icon: "📝",
      title: "No feed data yet",
      text: "Start logging feeds to see patterns here.",
      color: Colors.inkLight,
    });
    return cards;
  }

  const parts: string[] = [];
  if (hasNursing) parts.push(`${feedInsights.nursingTotal} nursing`);
  if (hasBottle) parts.push(`${feedInsights.bottleTotal} bottle`);
  const pctParts: string[] = [];
  if (feedInsights.nursingPct > 0)
    pctParts.push(`${feedInsights.nursingPct}% nursing`);
  if (feedInsights.bottlePct > 0)
    pctParts.push(`${feedInsights.bottlePct}% bottle`);
  cards.push({
    icon: "🍼",
    title: "Feed Type Breakdown",
    text: `${parts.join(", ")} — ${feedTotal} total feeds this week. ${pctParts.length > 0 ? `(${pctParts.join(" / ")})` : ""}`,
    color: Colors.dusk,
    IconComponent: FeedIcon,
  });

  const peakDayName =
    feedInsights.peakDayIndex != null
      ? formatDayName(stats.days[feedInsights.peakDayIndex].date)
      : null;
  const leastDayName =
    feedInsights.leastActiveDayIndex != null
      ? formatDayName(stats.days[feedInsights.leastActiveDayIndex].date)
      : null;
  const peakCount =
    feedInsights.peakDayIndex != null
      ? stats.days[feedInsights.peakDayIndex].feedCount
      : 0;
  const leastCount =
    feedInsights.leastActiveDayIndex != null
      ? stats.days[feedInsights.leastActiveDayIndex].feedCount
      : 0;
  const freqParts: string[] = [
    `Average ${stats.avgFeeds} feeds per day`,
  ];
  if (peakDayName && leastDayName) {
    if (peakDayName !== leastDayName) {
      freqParts.push(
        `Most active: ${peakDayName} (${peakCount}), least: ${leastDayName} (${leastCount})`,
      );
    } else {
      freqParts.push(`All days similar (${peakCount} feeds/day)`);
    }
  }
  cards.push({
    icon: "📈",
    title: "Feeding Frequency",
    text: freqParts.join(". "),
    color: Colors.teal,
  });

  cards.push({
    icon: "⚖️",
    title: "Nursing Side Balance",
    text: "Log nursing side (left/right) when recording feeds to see balance and flag any imbalance over 60/40.",
    color: Colors.inkLight,
  });

  if (hasBottle && feedInsights.bottleAvgMl > 0) {
    const prev = feedInsights.prevBottleAvgMl;
    const curr = feedInsights.bottleAvgMl;
    let trend = "no prior week to compare";
    if (prev > 0) {
      const pct = Math.round(((curr - prev) / prev) * 100);
      if (pct > 5) trend = `↑ ${pct}% vs last week`;
      else if (pct < -5) trend = `↓ ${Math.abs(pct)}% vs last week`;
      else trend = "similar to last week";
    }
    cards.push({
      icon: "🥛",
      title: "Feed Volume Trend",
      text: `Average ~${feedInsights.bottleAvgMl} ml per bottle feed this week — ${trend}.`,
      color: Colors.moss,
    });
  }

  const hungerParts: string[] = [];
  if (feedInsights.peakHour != null) {
    hungerParts.push(
      `Most feeds happen between ${hourRangeLabel(feedInsights.peakHour)}`,
    );
  }
  if (feedInsights.maxGapMin != null) {
    const hrs = Math.floor(feedInsights.maxGapMin / 60);
    const mins = Math.round(feedInsights.maxGapMin % 60);
    const gapStr = hrs > 0 ? `${hrs}h ${mins}min` : `${mins} min`;
    if (feedInsights.maxGapMin >= IRREGULAR_GAP_THRESHOLD_MIN) {
      hungerParts.push(
        `Longest gap: ${gapStr} — may exceed age-typical intervals`,
      );
    } else if (feedInsights.avgGapMin != null) {
      hungerParts.push(
        `Average gap between feeds: ~${Math.round(feedInsights.avgGapMin)} min`,
      );
    }
  }
  if (hungerParts.length > 0) {
    cards.push({
      icon: "🕐",
      title: "Hunger Pattern",
      text: hungerParts.join(". "),
      color: Colors.teal,
    });
  }

  if (feedInsights.nightFeedCount > 0) {
    cards.push({
      icon: "🌙",
      title: "Night feeds",
      text: `${feedInsights.nightFeedCount} night feed${feedInsights.nightFeedCount === 1 ? "" : "s"} this week (10 PM – 6 AM).`,
      color: Colors.sky,
      IconComponent: SleepIcon,
    });
  } else if (feedTotal > 0) {
    cards.push({
      icon: "🌙",
      title: "No night feeds",
      text: "No feeds recorded between 10 PM and 6 AM this week.",
      color: Colors.sky,
      IconComponent: SleepIcon,
    });
  }

  if (
    feedInsights.nursingVsBottleShift != null &&
    feedInsights.nursingVsBottleShift !== "balanced"
  ) {
    const shiftLabel =
      feedInsights.nursingVsBottleShift === "more_nursing"
        ? "more nursing"
        : "more bottle";
    cards.push({
      icon: "📊",
      title: "Nursing vs Bottle Shift",
      text: `This week shows ${shiftLabel} compared to last week.`,
      color: Colors.dusk,
    });
  }

  return cards;
}

function getAapRecommendation(baby: Baby | null): { min: number; max: number } {
  if (!baby?.date_of_birth) return { min: 14, max: 17 };
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (ageMonths < 4) return { min: 14, max: 17 };
  if (ageMonths < 12) return { min: 12, max: 15 };
  if (ageMonths < 24) return { min: 11, max: 14 };
  return { min: 10, max: 13 };
}

function getWakeWindowLabel(avgMin: number, baby: Baby | null): string {
  if (!baby?.date_of_birth) return "";
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  const newbornMax = 90;
  const infantMax = 120;
  const toddlerMax = 180;
  if (ageMonths < 3 && avgMin > newbornMax)
    return "Wake windows may be too long for a newborn.";
  if (ageMonths < 12 && avgMin > infantMax)
    return "Wake windows may be a bit long for this age.";
  if (ageMonths >= 12 && avgMin > toddlerMax)
    return "Wake windows may be long for a toddler.";
  if (avgMin < 30 && ageMonths > 2)
    return "Wake windows seem short — baby may be undertired.";
  return "";
}

export function buildSleepInsights(
  stats: WeeklyStats,
  baby: Baby | null,
): InsightCard[] {
  const cards: InsightCard[] = [];
  const { sleepInsights } = stats;
  const aap = getAapRecommendation(baby);
  const avgPerDay = stats.totalSleepHours / 7;

  cards.push({
    icon: "📊",
    title: "Sleep Debt Tracker",
    text:
      stats.totalSleepHours > 0
        ? `Baby slept ${avgPerDay.toFixed(1)} hrs/day this week — AAP recommends ${aap.min}–${aap.max} hrs for ${baby?.date_of_birth ? "this age" : "newborns"}.`
        : "Log sleep to compare against AAP age-recommended totals (14–17 hrs for newborns).",
    color: Colors.sky,
    IconComponent: SleepIcon,
  });

  if (sleepInsights.avgWakeWindowMin != null) {
    const label = getWakeWindowLabel(sleepInsights.avgWakeWindowMin, baby);
    cards.push({
      icon: "⏱️",
      title: "Wake Window Analysis",
      text:
        label ||
        `Average awake time between sleep sessions: ${sleepInsights.avgWakeWindowMin} min.`,
      color: Colors.teal,
      IconComponent: StartTimerIcon,
    });
  } else if (stats.totalSleepHours > 0) {
    cards.push({
      icon: "⏱️",
      title: "Wake Window Analysis",
      text: "Not enough sleep sessions to compute wake windows yet.",
      color: Colors.teal,
      IconComponent: StartTimerIcon,
    });
  }

  if (sleepInsights.sleepQualityScore != null) {
    const label =
      sleepInsights.sleepQualityScore >= 80
        ? "Good"
        : sleepInsights.sleepQualityScore >= 60
          ? "Fair"
          : "Poor";
    cards.push({
      icon: "😴",
      title: "Sleep Quality Score",
      text: `${sleepInsights.sleepQualityScore}/100 — ${label}. Based on night wakings, sleep block length, and daily totals.`,
      color: Colors.lav,
    });
  } else if (stats.totalSleepHours > 0) {
    cards.push({
      icon: "😴",
      title: "Sleep Quality Score",
      text: "Keep logging sleep to see a quality score.",
      color: Colors.lav,
    });
  }

  if (stats.totalSleepHours > 0) {
    cards.push({
      icon: "🌙",
      title: "Nap vs. Night Split",
      text: `${sleepInsights.nightPct}% night sleep, ${sleepInsights.napPct}% naps this week.`,
      color: Colors.dusk,
      IconComponent: SleepIcon,
    });
  }

  if (cards.length === 0) {
    cards.push({
      icon: "📝",
      title: "No sleep data yet",
      text: "Start logging sleep to see patterns here.",
      color: Colors.inkLight,
    });
  }

  return cards;
}

export function buildDiaperInsights(stats: WeeklyStats): InsightCard[] {
  const cards: InsightCard[] = [];
  const { diaperInsights } = stats;

  const hasWet = diaperInsights.wetTotal > 0;
  const hasDirty = diaperInsights.dirtyTotal > 0;
  const hasBoth = diaperInsights.bothTotal > 0;

  if (hasWet || hasDirty || hasBoth) {
    const parts: string[] = [];
    if (hasWet) parts.push(`${diaperInsights.wetTotal} wet`);
    if (hasDirty) parts.push(`${diaperInsights.dirtyTotal} dirty`);
    if (hasBoth) parts.push(`${diaperInsights.bothTotal} both`);
    cards.push({
      icon: "🧷",
      title: "Wet, Dirty & Both",
      text: `${parts.join(", ")} — ${stats.totalDiapers} total changes this week.`,
      color: Colors.moss,
    });
  }

  if (stats.totalDiapers > 0) {
    const pctParts: string[] = [];
    if (diaperInsights.wetPct > 0)
      pctParts.push(`${diaperInsights.wetPct}% wet`);
    if (diaperInsights.dirtyPct > 0)
      pctParts.push(`${diaperInsights.dirtyPct}% dirty`);
    if (diaperInsights.bothPct > 0)
      pctParts.push(`${diaperInsights.bothPct}% both`);
    if (pctParts.length > 0) {
      cards.push({
        icon: "📊",
        title: "Type breakdown",
        text: `${pctParts.join(", ")} of all changes.`,
        color: Colors.teal,
      });
    }
  }

  if (diaperInsights.peakHour != null) {
    cards.push({
      icon: "🕐",
      title: "Peak change time",
      text: `Most changes happen around ${hourRangeLabel(diaperInsights.peakHour)}.`,
      color: Colors.dusk,
    });
  }

  if (stats.avgDiapers > 0) {
    cards.push({
      icon: "📈",
      title: "Daily average",
      text: `Averaging ${stats.avgDiapers} change${stats.avgDiapers === 1 ? "" : "s"} per day.`,
      color: Colors.sky,
    });
  }

  if (cards.length === 0) {
    cards.push({
      icon: "📝",
      title: "No diaper data yet",
      text: "Start logging diapers to see patterns here.",
      color: Colors.inkLight,
    });
  }

  return cards;
}
