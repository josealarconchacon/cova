import React from "react";
import { TouchableOpacity, Text, Share } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";
import { buildWeeklySummaryExport } from "../../lib/insights/smartExport";
import { computeFeedingRhythmScore } from "../../lib/insights/feedingRhythmScore";
import { detectClusterFeeding } from "../../lib/insights/clusterFeedDetector";
import { computeSleepDebt } from "../../lib/insights/sleepDebt";
import { computeNapArchitecture } from "../../lib/insights/napArchitecture";
import {
  computeHydrationSignal,
  computeStoolPattern,
} from "../../lib/insights/diaperHealth";
import type { Baby } from "../../types";
import type { WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";
import type { Tab } from "../../lib/insights";
import type { InsightCard } from "../../lib/insights";

interface ExportButtonProps {
  accentColor: string;
  baby?: Baby | null;
  weekRange?: string;
  stats?: WeeklyStats;
  insights?: Record<Tab, InsightCard[]>;
  currentWeekLogs?: Log[];
  previousWeekLogs?: Log[];
}

export function ExportButton({
  accentColor,
  baby,
  weekRange = "",
  stats,
  insights,
  currentWeekLogs = [],
  previousWeekLogs = [],
}: ExportButtonProps) {
  const handleExport = async () => {
    if (!baby || !stats) return;

    const feedLogs = currentWeekLogs.filter((l) => l.type === "feed");
    const sleepLogs = currentWeekLogs.filter((l) => l.type === "sleep");
    const diaperLogs = currentWeekLogs.filter((l) => l.type === "diaper");

    const rhythmResult = computeFeedingRhythmScore(feedLogs);
    const clusters = detectClusterFeeding(feedLogs);
    const sleepDebtResult = computeSleepDebt(
      stats.days,
      stats.totalSleepHours,
      baby,
    );
    const napArch = computeNapArchitecture(sleepLogs, baby);
    const hydrationResult = computeHydrationSignal(stats.days);
    const stoolResult = computeStoolPattern(
      stats.days,
      diaperLogs,
      (stats.diaperInsights.prevDirtyTotal ?? 0) +
        (stats.diaperInsights.prevBothTotal ?? 0),
    );

    const summary = buildWeeklySummaryExport({
      baby,
      weekRange,
      stats,
      insights: insights ?? { feeds: [], sleep: [], diapers: [] },
      rhythmScore: rhythmResult?.score ?? null,
      clusterDaysCount: clusters.length,
      sleepDebtMessage: sleepDebtResult?.message ?? null,
      napArchitecture: napArch
        ? {
            totalNaps: napArch.totalNaps,
            avgNapMin: napArch.avgNapDurationMin,
            longestStretchMin: napArch.longestStretchMin,
            longestStretchDay: napArch.longestStretchDay,
            totalNapHours: napArch.totalNapHours,
            totalNightHours: napArch.totalNightHours,
          }
        : null,
      hydrationMessage: hydrationResult?.message ?? null,
      stoolMessages: stoolResult?.messages ?? [],
    });

    try {
      await Share.share({
        message: summary,
        title: `${baby.name} — Weekly Summary ${weekRange}`,
      });
    } catch {
      // User cancelled or share failed — no need to surface
    }
  };

  return (
    <TouchableOpacity
      style={[styles.exportBtn, { backgroundColor: accentColor + "12" }]}
      activeOpacity={0.7}
      onPress={handleExport}
    >
      <Text style={[styles.exportBtnText, { color: accentColor }]}>
        Export weekly report
      </Text>
    </TouchableOpacity>
  );
}
