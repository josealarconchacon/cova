import React from "react";
import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  StartTimerIcon,
} from "../../assets/icons/QuickActionIcons";
import { hourRangeLabel } from "../useWeeklyStats";
import type { WeeklyStats } from "../useWeeklyStats";

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

export function buildSleepInsights(stats: WeeklyStats): InsightCard[] {
  const cards: InsightCard[] = [];
  const { sleepInsights } = stats;

  if (sleepInsights.bestDay) {
    cards.push({
      icon: "🌟",
      title: "Best sleep day",
      text: `${sleepInsights.bestDay.dayName} had the most sleep at ${sleepInsights.bestDay.hours}h total.`,
      color: Colors.sky,
    });
  }

  if (sleepInsights.avgNapsPerDay > 0) {
    const longestH = Math.floor(sleepInsights.longestNapMin / 60);
    const longestM = sleepInsights.longestNapMin % 60;
    const longestStr =
      longestH > 0 ? `${longestH}h ${longestM}m` : `${longestM} min`;
    cards.push({
      icon: "📊",
      title: "Nap rhythm",
      text: `Averaging ${sleepInsights.avgNapsPerDay} nap${sleepInsights.avgNapsPerDay === 1 ? "" : "s"}/day. Longest: ${longestStr}.`,
      color: Colors.teal,
    });
  }

  if (stats.avgSleepHours > 0) {
    cards.push({
      icon: "😴",
      title: "Daily average",
      text: `Averaging ${stats.avgSleepHours}h of sleep per day this week.`,
      color: Colors.lav,
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
