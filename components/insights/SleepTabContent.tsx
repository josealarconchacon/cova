import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import {
  SleepStatsRow,
  SleepChart,
  SleepPatternsSection,
  ExportButton,
} from "./index";
import { useSleepSparklineData } from "../../lib/useSleepSparklineData";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";
import type { Baby } from "../../types";
import type { InsightCard } from "../../lib/insights";

const SLEEP_ACCENT = "#2C3E6B";

interface SleepTabContentProps {
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

export function SleepTabContent({
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
}: SleepTabContentProps) {
  const sparklineData = useSleepSparklineData();
  const wowPct = stats.weekOverWeek.sleepPctChange;
  const napCount = currentWeekLogs.filter((l) => {
    if (l.type !== "sleep") return false;
    const h = new Date(l.started_at).getHours();
    return h >= 6 && h < 22;
  }).length;

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
        <SleepStatsRow
          totalSleepHours={stats.totalSleepHours}
          napCount={napCount}
          wowPct={wowPct}
          sparklineData={sparklineData}
          recommendedMin={stats.sleepInsights.recommendedMin}
          recommendedMax={stats.sleepInsights.recommendedMax}
        />

        <SleepChart
          chartData={chartData}
          maxVal={maxVal}
          stats={stats}
          currentWeekLogs={currentWeekLogs}
        />
      </Animated.View>

      <SleepPatternsSection
        ribbonText={ribbonText}
        ribbonEmoji={ribbonEmoji}
        sleepInsightCards={insights.sleep}
        sleepQualityScore={stats.sleepInsights.sleepQualityScore}
        currentWeekLogs={currentWeekLogs}
        baby={baby}
      />

      <ExportButton
        accentColor={SLEEP_ACCENT}
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
