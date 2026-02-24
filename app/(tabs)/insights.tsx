import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
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
} from "../../components/insights";
import { styles } from "./insights.styles";

export default function InsightsScreen() {
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
  } = useInsights();

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <InsightsHeader weekRange={weekRange} babyName={activeBaby.name} />

      <TabPills
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
      </View>

      <Text style={styles.sectionLabel}>Patterns</Text>
      {insights[activeTab].map((item) => (
        <InsightCard key={item.title} item={item} />
      ))}

      <ExportButton accentColor={activeConfig.color} />
    </ScrollView>
  );
}
