import React from "react";
import { Colors } from "../../constants/theme";
import {
  FeedIcon,
  SleepIcon,
  StartTimerIcon,
  DiaperIcon,
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
  /** Optional balance bar for Nursing Side Balance */
  balanceBar?: { leftPct: number; rightPct: number };
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

  // Nursing Side Balance — show real data when side records exist
  const {
    nursingWithSideTotal,
    nursingLeftPct,
    nursingRightPct,
    nursingWithoutSideCount,
  } = feedInsights;

  if (nursingWithSideTotal > 0) {
    const imbalanceThreshold = 60;
    const isImbalanced =
      nursingLeftPct >= imbalanceThreshold ||
      nursingRightPct >= imbalanceThreshold;
    const imbalancedSide =
      nursingLeftPct >= imbalanceThreshold ? "left" : "right";
    const lessUsedSide = nursingLeftPct >= imbalanceThreshold ? "right" : "left";

    let balanceText = `Left ${nursingLeftPct}% · Right ${nursingRightPct}%`;
    if (nursingWithoutSideCount > 0) {
      balanceText += ` — ${nursingWithSideTotal} of ${nursingWithSideTotal + nursingWithoutSideCount} sessions this week have side data`;
    }
    if (isImbalanced) {
      balanceText += `. ⚠️ Imbalance detected — consider starting more feeds on the ${lessUsedSide} side this week`;
    }

    cards.push({
      icon: "⚖️",
      title: "Nursing Side Balance",
      text: balanceText,
      color: isImbalanced ? Colors.gold : Colors.dusk,
      balanceBar: { leftPct: nursingLeftPct, rightPct: nursingRightPct },
    });
  } else if (hasNursing) {
    cards.push({
      icon: "⚖️",
      title: "Nursing Side Balance",
      text: "Log nursing side (left/right) when recording feeds to see balance and flag any imbalance over 60/40.",
      color: Colors.inkLight,
    });
  }

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

function getSleepRecommendation(baby: Baby | null): { min: number; max: number } {
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
  const recommended = getSleepRecommendation(baby);
  const avgPerDay = stats.totalSleepHours / 7;

  cards.push({
    icon: "📊",
    title: "Sleep Debt Tracker",
    text:
      stats.totalSleepHours > 0
        ? `Baby slept ${avgPerDay.toFixed(1)} hrs/day this week — recommended: ${recommended.min}–${recommended.max} hrs for ${baby?.date_of_birth ? "this age" : "newborns"}.`
        : "Log sleep to compare against age-recommended totals (14–17 hrs for newborns).",
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

function getDiaperMinWetPerDay(baby: Baby | null): number {
  if (!baby?.date_of_birth) return 6;
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (ageMonths < 1) return 6;
  if (ageMonths < 4) return 6;
  if (ageMonths < 12) return 4;
  return 3;
}

function getDiaperMinPerDay(baby: Baby | null): number {
  if (!baby?.date_of_birth) return 6;
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (ageMonths < 1) return 6;
  if (ageMonths < 4) return 6;
  if (ageMonths < 12) return 4;
  return 3;
}

export function buildDiaperInsights(
  stats: WeeklyStats,
  baby: Baby | null,
): InsightCard[] {
  const cards: InsightCard[] = [];
  const { diaperInsights } = stats;

  const hasWet = diaperInsights.wetTotal > 0;
  const hasDirty = diaperInsights.dirtyTotal > 0;
  const hasBoth = diaperInsights.bothTotal > 0;

  if (stats.totalDiapers === 0) {
    cards.push({
      icon: "📝",
      title: "No diaper data yet",
      text: "Start logging diapers to see patterns here.",
      color: Colors.inkLight,
    });
    return cards;
  }

  // 1. Type Breakdown — X wet, Y dirty, Z both — N total with % split
  const parts: string[] = [];
  if (hasWet) parts.push(`${diaperInsights.wetTotal} wet`);
  if (hasDirty) parts.push(`${diaperInsights.dirtyTotal} dirty`);
  if (hasBoth) parts.push(`${diaperInsights.bothTotal} both`);
  const pctParts: string[] = [];
  if (diaperInsights.wetPct > 0)
    pctParts.push(`${diaperInsights.wetPct}% wet`);
  if (diaperInsights.dirtyPct > 0)
    pctParts.push(`${diaperInsights.dirtyPct}% dirty`);
  if (diaperInsights.bothPct > 0)
    pctParts.push(`${diaperInsights.bothPct}% both`);
  cards.push({
    icon: "🧷",
    title: "Type Breakdown",
    text: `${parts.join(", ")} — ${stats.totalDiapers} total changes this week. ${pctParts.length > 0 ? `(${pctParts.join(", ")} of all changes)` : ""}`,
    color: Colors.moss,
    IconComponent: DiaperIcon,
  });

  // 2. Daily Change Frequency
  const minPerDay = getDiaperMinPerDay(baby);
  const peakDayName =
    diaperInsights.peakDayIndex != null
      ? formatDayName(stats.days[diaperInsights.peakDayIndex].date)
      : null;
  const leastDayName =
    diaperInsights.leastActiveDayIndex != null
      ? formatDayName(stats.days[diaperInsights.leastActiveDayIndex].date)
      : null;
  const peakCount =
    diaperInsights.peakDayIndex != null
      ? stats.days[diaperInsights.peakDayIndex].diaperCount
      : 0;
  const leastCount =
    diaperInsights.leastActiveDayIndex != null
      ? stats.days[diaperInsights.leastActiveDayIndex].diaperCount
      : 0;
  const belowMinDays = diaperInsights.lowActivityDayIndices.length;
  let freqText = `Average ${stats.avgDiapers} diaper changes per day this week.`;
  if (peakDayName && leastDayName && peakDayName !== leastDayName) {
    freqText += ` Most active: ${peakDayName} (${peakCount}), least: ${leastDayName} (${leastCount}).`;
  }
  if (belowMinDays > 0) {
    freqText += ` ${belowMinDays} day${belowMinDays === 1 ? "" : "s"} below age-recommended minimum (${minPerDay}+ changes/day).`;
  }
  cards.push({
    icon: "📈",
    title: "Daily Change Frequency",
    text: freqText,
    color: Colors.teal,
  });

  // 3. Wet Diaper Hydration Indicator
  const minWetPerDay = getDiaperMinWetPerDay(baby);
  const lowWetDays = diaperInsights.lowWetDayIndices.length;
  const hydrationText =
    lowWetDays === 0
      ? "Hydration looks good this week — wet diaper counts meet expected levels."
      : `${lowWetDays} day${lowWetDays === 1 ? "" : "s"} this week had fewer wet diapers than expected (${minWetPerDay}+/day for age).`;
  cards.push({
    icon: "💧",
    title: "Wet Diaper Hydration Indicator",
    text: hydrationText,
    color: lowWetDays === 0 ? Colors.teal : Colors.gold,
  });

  // 4. Stool Pattern Tracker — no consistency/color data exists, encourage logging
  const dirtyDays = stats.days.filter((d) => d.dirtyCount > 0).length;
  const consecutiveNoDirty = (() => {
    let max = 0;
    let curr = 0;
    for (const d of stats.days) {
      if (d.dirtyCount === 0) curr++;
      else {
        max = Math.max(max, curr);
        curr = 0;
      }
    }
    return Math.max(max, curr);
  })();
  let stoolText = "";
  if (hasDirty) {
    stoolText = `${diaperInsights.dirtyTotal} dirty diapers across ${dirtyDays} day${dirtyDays === 1 ? "" : "s"} this week.`;
    if (consecutiveNoDirty >= 2) {
      stoolText += ` Up to ${consecutiveNoDirty} consecutive days without a dirty diaper.`;
    }
  }
  stoolText += " Log consistency and color when recording diapers for richer insights.";
  cards.push({
    icon: "💩",
    title: "Stool Pattern Tracker",
    text: stoolText,
    color: Colors.dusk,
  });

  // 5. Change Timing Pattern
  if (diaperInsights.peakHour != null) {
    const gapParts: string[] = [];
    if (diaperInsights.avgGapMin != null) {
      gapParts.push(`Average ~${diaperInsights.avgGapMin} min between changes`);
    }
    if (
      diaperInsights.maxGapMin != null &&
      diaperInsights.maxGapMin > 240
    ) {
      const hrs = Math.floor(diaperInsights.maxGapMin / 60);
      gapParts.push(`longest gap ${hrs}h — may exceed age-typical expectations`);
    }
    const timingText =
      gapParts.length > 0
        ? `Most changes happen between ${hourRangeLabel(diaperInsights.peakHour)}. ${gapParts.join(". ")}.`
        : `Most changes happen between ${hourRangeLabel(diaperInsights.peakHour)}.`;
    cards.push({
      icon: "🕐",
      title: "Change Timing Pattern",
      text: timingText,
      color: Colors.sky,
    });
  } else if (stats.totalDiapers > 0) {
    cards.push({
      icon: "🕐",
      title: "Change Timing Pattern",
      text: "Keep logging to identify the most common windows for diaper changes.",
      color: Colors.sky,
    });
  }

  // 6. Week-over-Week Comparison
  const prevTotal =
    diaperInsights.prevWetTotal +
    diaperInsights.prevDirtyTotal +
    diaperInsights.prevBothTotal;
  if (prevTotal > 0) {
    const wetDir =
      diaperInsights.wetTotal > diaperInsights.prevWetTotal
        ? "↑"
        : diaperInsights.wetTotal < diaperInsights.prevWetTotal
          ? "↓"
          : "→";
    const dirtyDir =
      diaperInsights.dirtyTotal > diaperInsights.prevDirtyTotal
        ? "↑"
        : diaperInsights.dirtyTotal < diaperInsights.prevDirtyTotal
          ? "↓"
          : "→";
    const bothDir =
      diaperInsights.bothTotal > diaperInsights.prevBothTotal
        ? "↑"
        : diaperInsights.bothTotal < diaperInsights.prevBothTotal
          ? "↓"
          : "→";
    let wowText = `Wet ${wetDir} · Dirty ${dirtyDir} · Both ${bothDir} vs last week.`;
    if (diaperInsights.wetVsDirtyShift === "more_wet") {
      wowText += " More wet diapers relative to dirty this week.";
    } else if (diaperInsights.wetVsDirtyShift === "more_dirty") {
      wowText += " More dirty diapers relative to wet this week.";
    }
    cards.push({
      icon: "📊",
      title: "Week-over-Week Comparison",
      text: wowText,
      color: Colors.lav,
    });
  } else {
    cards.push({
      icon: "📊",
      title: "Week-over-Week Comparison",
      text: "First week of data — compare against next week for trends.",
      color: Colors.lav,
    });
  }

  return cards;
}
