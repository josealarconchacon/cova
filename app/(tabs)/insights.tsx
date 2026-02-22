import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import { useWeeklyStats, type DailyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Tab = "feeds" | "sleep" | "diapers";

const TABS = [
  { id: "feeds" as Tab, icon: "🍼", label: "Feeds", color: Colors.dusk },
  { id: "sleep" as Tab, icon: "💤", label: "Sleep", color: Colors.sky },
  { id: "diapers" as Tab, icon: "🩲", label: "Diapers", color: Colors.moss },
];

const INSIGHTS: Record<
  Tab,
  Array<{ icon: string; text: string; color: string }>
> = {
  feeds: [
    {
      icon: "📈",
      text: "Luna feeds most between 7–9 AM. Morning feeds average 25% longer.",
      color: Colors.dusk,
    },
    {
      icon: "🌙",
      text: "Night feeds reduced this week — 1 fewer than last week!",
      color: Colors.sky,
    },
    {
      icon: "⏱️",
      text: "Average feeding duration: 19 min. Consistent with healthy intake.",
      color: Colors.moss,
    },
  ],
  sleep: [
    {
      icon: "🌟",
      text: "Best sleep day was Wednesday with 15.5h total.",
      color: Colors.sky,
    },
    {
      icon: "📊",
      text: "Average 3 naps per day. Longest nap: 2h 18m.",
      color: Colors.teal,
    },
    {
      icon: "😴",
      text: "Nighttime sleep settling into a 10 PM–5 AM pattern.",
      color: Colors.lav,
    },
  ],
  diapers: [
    {
      icon: "📉",
      text: "Changes down 12% vs last week — normal as feeding stabilises.",
      color: Colors.moss,
    },
    {
      icon: "🕐",
      text: "Most changes happen between 6–8 AM and 6–8 PM.",
      color: Colors.dusk,
    },
    {
      icon: "✅",
      text: "Healthy ratio: 70% wet, 30% dirty.",
      color: Colors.teal,
    },
  ],
};

export default function InsightsScreen() {
  const { activeBaby } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("feeds");

  // Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: logs = [] } = useQuery({
    queryKey: ["insights-logs", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .gte("started_at", sevenDaysAgo.toISOString())
        .order("started_at", { ascending: true });
      if (error) throw error;
      return data as Log[];
    },
  });

  const stats = useWeeklyStats(logs);

  const activeConfig = TABS.find((t) => t.id === activeTab)!;
  const typeMap: Record<Tab, keyof (typeof stats.days)[0]> = {
    feeds: "feedCount",
    sleep: "sleepHours",
    diapers: "diaperCount",
  };
  const chartData = stats.days.map(
    (d: DailyStats) => d[typeMap[activeTab]] as number,
  );
  const maxVal = Math.max(...chartData, 1) * 1.2;
  const avg =
    activeTab === "feeds"
      ? stats.avgFeeds
      : activeTab === "sleep"
        ? stats.avgSleepHours
        : stats.avgDiapers;

  const weekRange = () => {
    const start = new Date(sevenDaysAgo);
    start.setDate(start.getDate() + 1);
    const end = new Date();
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  if (!activeBaby) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.eyebrow}>This week</Text>
      <Text style={styles.title}>Weekly{"\n"}Insights</Text>
      <Text style={styles.subtitle}>
        {weekRange()} · {activeBaby.name}
      </Text>

      {/* Tab pills */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.tab,
              activeTab === t.id && {
                backgroundColor: t.color,
                shadowColor: t.color,
                shadowOpacity: 0.4,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 10,
                elevation: 6,
              },
            ]}
            onPress={() => setActiveTab(t.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text
              style={[styles.tabText, activeTab === t.id && { color: "white" }]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Bar chart ── */}
      <View style={styles.chartCard}>
        <View style={styles.barsRow}>
          {chartData.map((val: number, i: number) => {
            const pct = (val / maxVal) * 100;
            const isToday = i === 6;
            return (
              <View key={i} style={styles.barWrap}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(pct, 3)}%`,
                        backgroundColor: isToday
                          ? activeConfig.color
                          : activeConfig.color + "55",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayLabel,
                    isToday && { color: activeConfig.color, fontWeight: "700" },
                  ]}
                >
                  {WEEK_DAYS[i]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Stat cards ── */}
      <View style={styles.statRow}>
        {[
          {
            label: "Daily avg",
            value: avg.toFixed(1),
            unit: activeTab === "sleep" ? "hrs" : "×",
          },
          {
            label: "This week",
            value:
              activeTab === "sleep"
                ? stats.totalSleepHours.toFixed(1) + "h"
                : (activeTab === "feeds"
                    ? stats.totalFeeds
                    : stats.totalDiapers
                  ).toString(),
            unit: "total",
          },
          { label: "vs last wk", value: "+8%", unit: "↑ more" },
        ].map((s) => (
          <View
            key={s.label}
            style={[
              styles.statCard,
              {
                backgroundColor: activeConfig.color + "18",
                borderColor: activeConfig.color + "22",
              },
            ]}
          >
            <Text style={[styles.statValue, { color: activeConfig.color }]}>
              {s.value}
            </Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statUnit, { color: activeConfig.color }]}>
              {s.unit}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Patterns ── */}
      <Text style={styles.sectionLabel}>Patterns this week</Text>
      {INSIGHTS[activeTab].map((item) => (
        <View
          key={item.text}
          style={[styles.insightCard, { borderColor: item.color + "22" }]}
        >
          <View
            style={[styles.insightIcon, { backgroundColor: item.color + "18" }]}
          >
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
          </View>
          <Text style={styles.insightText}>{item.text}</Text>
        </View>
      ))}

      {/* ── Export ── */}
      <TouchableOpacity style={styles.exportBtn}>
        <Text style={styles.exportBtnText}>📤 Export this week's report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  eyebrow: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: Colors.teal,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 38,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginBottom: 28,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    backgroundColor: Colors.sand,
    borderRadius: 20,
    padding: 4,
  },
  tab: { flex: 1, borderRadius: 16, paddingVertical: 10, alignItems: "center" },
  tabIcon: { fontSize: 16, marginBottom: 2 },
  tabText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 12,
    color: Colors.inkLight,
  },
  chartCard: {
    backgroundColor: Colors.sand,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  barsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-end",
    height: 160,
    marginBottom: 8,
  },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  dayLabel: { fontFamily: "DM-Sans", fontSize: 10, color: Colors.inkLight },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: "DM-Sans",
    fontSize: 9,
    color: Colors.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 2,
  },
  statUnit: {
    fontFamily: "DM-Sans",
    fontSize: 9,
    fontStyle: "italic",
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.inkLight,
    marginBottom: 12,
    fontWeight: "600",
  },
  insightCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    backgroundColor: Colors.cream,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightText: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkMid,
    flex: 1,
    lineHeight: 19,
  },
  exportBtn: {
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  exportBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.inkMid,
  },
});
