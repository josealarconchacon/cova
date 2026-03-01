import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useStore } from "../../store/useStore";
import { useInsights } from "../../lib/useInsights";
import { TABS } from "../../lib/insights";
import {
  InsightsHeader,
  TabPills,
  StatStrip,
  InsightsChart,
  InsightCard,
  ChartLegend,
  ExportButton,
  WeeklyProgressRibbon,
  FeedsTabContent,
} from "../../components/insights";
import { styles } from "./insights.styles";

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });
  const { activeBaby } = useStore();
  const {
    stats,
    insights,
    chartData,
    maxVal,
    statItems,
    weekRange,
    activeTab,
    setActiveTab,
    ribbonText,
    ribbonEmoji,
    currentWeekLogs,
    previousWeekLogs,
    refetch,
  } = useInsights();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const activeConfig = TABS.find((t) => t.id === activeTab)!;

  if (!activeBaby) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.cream,
        }}
      >
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 20,
          backgroundColor: Colors.cream,
        }}
      >
        <InsightsHeader
          weekRange={weekRange}
          babyName={activeBaby.name}
          scrollY={scrollY}
        />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.teal}
          />
        }
      >
        <TabPills
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "feeds" ? (
          <FeedsTabContent
            stats={stats}
            chartData={chartData}
            maxVal={maxVal}
            insights={insights}
            ribbonText={ribbonText}
            ribbonEmoji={ribbonEmoji}
            currentWeekLogs={currentWeekLogs}
            previousWeekLogs={previousWeekLogs}
            weekRange={weekRange}
            baby={activeBaby}
            scrollY={scrollY}
          />
        ) : (
          <>
            <View style={styles.chartCard}>
              <StatStrip items={statItems} accentColor={activeConfig.color} />

              <InsightsChart
                activeTab={activeTab}
                chartData={chartData}
                maxVal={maxVal}
                stats={stats}
                accentColor={activeConfig.color}
              />

              <ChartLegend
                activeTab={activeTab}
                totalFeeds={stats.totalFeeds}
                totalDiapers={stats.totalDiapers}
                totalSleepHours={stats.totalSleepHours}
              />

              {activeTab === "diapers" &&
                stats.totalDiapers > 0 &&
                stats.diaperInsights.wetVsDirtyShift != null &&
                stats.diaperInsights.wetVsDirtyShift !== "balanced" && (
                  <Text style={styles.wetDirtyShiftNote}>
                    {stats.diaperInsights.wetVsDirtyShift === "more_wet"
                      ? "Wet/dirty ratio shifted toward more wet this week"
                      : "Wet/dirty ratio shifted toward more dirty this week"}
                  </Text>
                )}
            </View>

            <Text style={styles.sectionLabel}>Patterns</Text>
            <WeeklyProgressRibbon
              text={ribbonText}
              emoji={ribbonEmoji}
              activeTab={activeTab}
            />
            {insights[activeTab].map((item) => (
              <InsightCard key={item.title} item={item} />
            ))}

            <ExportButton
              accentColor={activeConfig.color}
              baby={activeBaby}
              weekRange={weekRange}
              stats={stats}
              insights={insights}
              currentWeekLogs={currentWeekLogs}
              previousWeekLogs={previousWeekLogs}
            />
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}
