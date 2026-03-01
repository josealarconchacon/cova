import type { WeeklyStats } from "../useWeeklyStats";
import type { Tab } from "./constants";

export interface RibbonResult {
  text: string;
  emoji: string;
}

export function computeWeeklyProgressRibbon(
  activeTab: Tab,
  stats: WeeklyStats,
  babyName: string,
): RibbonResult {
  if (activeTab === "feeds") {
    const total = stats.totalFeeds;
    const wow = stats.weekOverWeek.feedsPctChange;
    const nursingPct = stats.feedInsights.nursingPct;
    const bottlePct = stats.feedInsights.bottlePct;
    const peakHour = stats.feedInsights.peakHour;

    if (total === 0) {
      return { text: "No feeds logged this week yet", emoji: "🍼" };
    }

    if (wow != null && wow > 50) {
      return {
        text: `${babyName} had ${total} feeds this week — up ${wow}% from last week`,
        emoji: "🍼",
      };
    }
    if (wow != null && wow < -30) {
      return {
        text: `${babyName} had ${total} feeds this week — down ${Math.abs(wow)}% from last week`,
        emoji: "🍼",
      };
    }
    if (bottlePct >= 70) {
      return {
        text: `Bottle feeds dominated this week (${bottlePct}%)`,
        emoji: "🍼",
      };
    }
    if (nursingPct >= 70) {
      return {
        text: `Nursing dominated this week (${nursingPct}%)`,
        emoji: "🍼",
      };
    }
    if (peakHour != null) {
      const morning = peakHour >= 5 && peakHour < 12;
      const afternoon = peakHour >= 12 && peakHour < 17;
      if (morning) {
        return {
          text: "Most feeds happened in the morning this week",
          emoji: "🍼",
        };
      }
      if (afternoon) {
        return {
          text: "Most feeds happened in the afternoon this week",
          emoji: "🍼",
        };
      }
    }
    return {
      text: `${babyName} had ${total} feeds this week`,
      emoji: "🍼",
    };
  }

  if (activeTab === "sleep") {
    const total = stats.totalSleepHours;
    const longestMin = stats.sleepInsights.longestNapMin;

    if (total === 0) {
      return { text: "No sleep logged this week yet", emoji: "🌙" };
    }

    if (longestMin >= 240) {
      const h = Math.floor(longestMin / 60);
      const m = Math.round(longestMin % 60);
      return {
        text: `Best sleep week so far — longest stretch was ${h}h ${m}m`,
        emoji: "🌙",
      };
    }
    const wow = stats.weekOverWeek.sleepPctChange;
    if (wow != null && wow > 10) {
      return {
        text: `Sleep was up ${wow}% vs last week — great progress`,
        emoji: "🌙",
      };
    }
    return {
      text: "Sleep was consistent this week — great rhythm",
      emoji: "🌙",
    };
  }

  if (activeTab === "diapers") {
    const total = stats.totalDiapers;
    const lowWetCount = stats.diaperInsights.lowWetDayIndices.length;

    if (total === 0) {
      return { text: "No diaper changes logged this week yet", emoji: "💚" };
    }

    if (lowWetCount === 0 && total >= 5) {
      return {
        text: "Hydration looked strong all week",
        emoji: "💚",
      };
    }
    return {
      text: `${total} diaper changes this week — healthy output`,
      emoji: "💚",
    };
  }

  return { text: "", emoji: "" };
}
