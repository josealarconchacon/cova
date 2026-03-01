import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { TABS } from "../../lib/insights";
import { useFeedsSparklineData } from "../../lib/useFeedsSparklineData";
import {
  FeedsStatsRow,
  FeedsChart,
  FeedsPatternsSection,
  ChartLegend,
  ExportButton,
} from "./index";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";
import type { Baby } from "../../types";
import type { InsightCard } from "../../lib/insights";

interface FeedsTabContentProps {
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

const activeConfig = TABS.find((t) => t.id === "feeds")!;

export function FeedsTabContent({
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
}: FeedsTabContentProps) {
  const sparklineData = useFeedsSparklineData();
  const wowPct = stats.weekOverWeek.feedsPctChange;

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
        <FeedsStatsRow
          nursingTotal={stats.feedInsights.nursingTotal}
          bottleTotal={stats.feedInsights.bottleTotal}
          wowPct={wowPct}
          sparklineData={sparklineData}
          accentColor={activeConfig.color}
        />

        <FeedsChart
          chartData={chartData}
          maxVal={maxVal}
          stats={stats}
          currentWeekLogs={currentWeekLogs}
          accentColor={activeConfig.color}
        />

        <ChartLegend
          activeTab="feeds"
          totalFeeds={stats.totalFeeds}
          totalDiapers={0}
          totalSleepHours={0}
        />
      </Animated.View>

      <FeedsPatternsSection
        ribbonText={ribbonText}
        ribbonEmoji={ribbonEmoji}
        feedInsightCards={insights.feeds}
        accentColor={activeConfig.color}
      />

      <ExportButton
        accentColor={activeConfig.color}
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
