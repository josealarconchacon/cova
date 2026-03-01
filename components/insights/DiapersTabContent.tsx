import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  DiapersStatsRow,
  DiapersChart,
  DiapersPatternsSection,
  ExportButton,
} from "./index";
import { useDiapersSparklineData } from "../../lib/useDiapersSparklineData";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";
import type { Baby } from "../../types";
import type { InsightCard } from "../../lib/insights";

const DIAPER_ACCENT = "#8B5E3C";

interface DiapersTabContentProps {
  stats: WeeklyStats;
  chartData: number[];
  maxVal: number;
  insights: Record<"feeds" | "sleep" | "diapers", InsightCard[]>;
  ribbonText: string;
  ribbonEmoji: string;
  currentWeekLogs: Log[];
  previousWeekLogs: Log[];
  weekRange: string;
  baby: Baby;
  scrollY: { value: number };
}

export function DiapersTabContent({
  stats,
  chartData,
  maxVal,
  insights,
  ribbonText,
  ribbonEmoji,
  currentWeekLogs,
  previousWeekLogs,
  weekRange,
  baby,
  scrollY,
}: DiapersTabContentProps) {
  const sparklineData = useDiapersSparklineData();
  const wowPct = stats.weekOverWeek.diapersPctChange;

  const totalWet = stats.diaperInsights.wetTotal + stats.diaperInsights.bothTotal;
  const totalDirty =
    stats.diaperInsights.dirtyTotal + stats.diaperInsights.bothTotal;
  const avgWetPerDay = totalWet / 7;
  const avgDirtyPerDay = totalDirty / 7;

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const lift = interpolate(scrollY.value, [0, 100], [0, 2]);
    return {
      shadowOffset: { width: 0, height: lift },
      shadowOpacity: interpolate(scrollY.value, [0, 50], [0.05, 0.12]),
      shadowRadius: 8,
      shadowColor: "#000",
      elevation: interpolate(scrollY.value, [0, 50], [1, 3]),
    };
  });

  return (
    <>
      <Animated.View style={[styles.chartCard, cardAnimatedStyle]}>
        <DiapersStatsRow
          wetTotal={totalWet}
          dirtyTotal={totalDirty}
          wowPct={wowPct}
          sparklineData={sparklineData}
          avgWetPerDay={avgWetPerDay}
          avgDirtyPerDay={avgDirtyPerDay}
        />

        <DiapersChart
          chartData={chartData}
          maxVal={maxVal}
          stats={stats}
          currentWeekLogs={currentWeekLogs}
        />
      </Animated.View>

      <DiapersPatternsSection
        ribbonText={ribbonText}
        ribbonEmoji={ribbonEmoji}
        diaperInsightCards={insights.diapers}
        stats={stats}
        currentWeekLogs={currentWeekLogs}
        baby={baby}
      />

      <ExportButton
        accentColor={DIAPER_ACCENT}
        baby={baby}
        weekRange={weekRange}
        stats={stats}
        insights={insights}
        currentWeekLogs={currentWeekLogs}
        previousWeekLogs={previousWeekLogs}
      />
    </>
  );
}
