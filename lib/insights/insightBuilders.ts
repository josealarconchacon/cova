import React from "react";
import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  StartTimerIcon,
} from "../../assets/icons/QuickActionIcons";
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

export function buildFeedInsights(stats: WeeklyStats): InsightCard[] {
  const cards: InsightCard[] = [];
  const { feedInsights } = stats;

  const hasNursing = feedInsights.nursingTotal > 0;
  const hasBottle = feedInsights.bottleTotal > 0;

  if (hasNursing || hasBottle) {
    const parts: string[] = [];
    if (hasNursing) parts.push(`${feedInsights.nursingTotal} nursing`);
    if (hasBottle) parts.push(`${feedInsights.bottleTotal} bottle`);
    cards.push({
      icon: "🍼",
      title: "Nursing vs Bottle",
      text: `${parts.join(", ")} — ${stats.totalFeeds} total feeds this week.`,
      color: Colors.dusk,
      IconComponent: FeedIcon,
    });
  }

  if (hasNursing && hasBottle) {
    const parts: string[] = [];
    if (feedInsights.nursingAvgMin > 0)
      parts.push(`Nursing avg: ${feedInsights.nursingAvgMin} min`);
    if (feedInsights.bottleAvgMin > 0)
      parts.push(`Bottle avg: ${feedInsights.bottleAvgMin} min`);
    if (feedInsights.bottleAvgMl > 0)
      parts.push(`~${feedInsights.bottleAvgMl} ml/feed`);
    if (parts.length > 0) {
      cards.push({
        icon: "⏱️",
        title: "Duration comparison",
        text: `${parts.join(". ")}.`,
        color: Colors.moss,
        IconComponent: StartTimerIcon,
      });
    }
  } else if (hasNursing && feedInsights.nursingAvgMin > 0) {
    cards.push({
      icon: "⏱️",
      title: "Nursing duration",
      text: `Average nursing session: ${feedInsights.nursingAvgMin} min.`,
      color: Colors.moss,
      IconComponent: StartTimerIcon,
    });
  } else if (hasBottle) {
    const parts: string[] = [];
    if (feedInsights.bottleAvgMin > 0)
      parts.push(`Avg session: ${feedInsights.bottleAvgMin} min`);
    if (feedInsights.bottleAvgMl > 0)
      parts.push(`~${feedInsights.bottleAvgMl} ml per feed`);
    if (parts.length > 0) {
      cards.push({
        icon: "⏱️",
        title: "Bottle details",
        text: `${parts.join(". ")}.`,
        color: Colors.moss,
        IconComponent: StartTimerIcon,
      });
    }
  }

  if (feedInsights.nightFeedCount > 0) {
    cards.push({
      icon: "🌙",
      title: "Night feeds",
      text: `${feedInsights.nightFeedCount} night feed${feedInsights.nightFeedCount === 1 ? "" : "s"} this week (10 PM – 6 AM).`,
      color: Colors.sky,
      IconComponent: SleepIcon,
    });
  } else if (stats.totalFeeds > 0) {
    cards.push({
      icon: "🌙",
      title: "No night feeds",
      text: "No feeds recorded between 10 PM and 6 AM this week.",
      color: Colors.sky,
      IconComponent: SleepIcon,
    });
  }

  if (feedInsights.peakHour != null) {
    cards.push({
      icon: "📈",
      title: "Peak feeding time",
      text: `Most feeds happen around ${hourRangeLabel(feedInsights.peakHour)}.`,
      color: Colors.teal,
    });
  }

  if (cards.length === 0) {
    cards.push({
      icon: "📝",
      title: "No feed data yet",
      text: "Start logging feeds to see patterns here.",
      color: Colors.inkLight,
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
