import React, { useMemo } from "react";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useRealtimeSync } from "../../lib/useRealtimeSync";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import {
  useWeeklyStats,
  hourRangeLabel,
  type DailyStats,
  type WeeklyStats,
} from "../../lib/useWeeklyStats";
import type { Log } from "../../types";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
} from "../../assets/icons/QuickActionIcons";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const DIAPER_COLORS = {
  wet: Colors.sky,
  dirty: Colors.bark,
  both: Colors.gold,
} as const;

type Tab = "feeds" | "sleep" | "diapers";

const TABS = [
  { id: "feeds" as Tab, Icon: FeedIcon, label: "Feeds", color: Colors.dusk },
  { id: "sleep" as Tab, Icon: SleepIcon, label: "Sleep", color: Colors.sky },
  { id: "diapers" as Tab, Icon: DiaperIcon, label: "Diapers", color: Colors.moss },
];

interface InsightCard {
  icon: string;
  title: string;
  text: string;
  color: string;
}

function buildFeedInsights(stats: WeeklyStats): InsightCard[] {
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
      });
    }
  } else if (hasNursing && feedInsights.nursingAvgMin > 0) {
    cards.push({
      icon: "⏱️",
      title: "Nursing duration",
      text: `Average nursing session: ${feedInsights.nursingAvgMin} min.`,
      color: Colors.moss,
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
      });
    }
  }

  if (feedInsights.nightFeedCount > 0) {
    cards.push({
      icon: "🌙",
      title: "Night feeds",
      text: `${feedInsights.nightFeedCount} night feed${feedInsights.nightFeedCount === 1 ? "" : "s"} this week (10 PM – 6 AM).`,
      color: Colors.sky,
    });
  } else if (stats.totalFeeds > 0) {
    cards.push({
      icon: "🌙",
      title: "No night feeds",
      text: "No feeds recorded between 10 PM and 6 AM this week.",
      color: Colors.sky,
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

function buildSleepInsights(stats: WeeklyStats): InsightCard[] {
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

function buildDiaperInsights(stats: WeeklyStats): InsightCard[] {
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
    if (diaperInsights.wetPct > 0) pctParts.push(`${diaperInsights.wetPct}% wet`);
    if (diaperInsights.dirtyPct > 0) pctParts.push(`${diaperInsights.dirtyPct}% dirty`);
    if (diaperInsights.bothPct > 0) pctParts.push(`${diaperInsights.bothPct}% both`);
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

export default function InsightsScreen() {
  const { profile, activeBaby } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("feeds");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const insightsQueryKey = useMemo(
    () => ["insights-logs", activeBaby?.id],
    [activeBaby?.id],
  );

  const { data: allLogs = [] } = useQuery({
    queryKey: insightsQueryKey,
    enabled: !!activeBaby,
    refetchOnMount: "always",
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .gte("started_at", fourteenDaysAgo.toISOString())
        .order("started_at", { ascending: true });
      if (error) throw error;
      return data as Log[];
    },
  });

  useRealtimeSync({
    familyId: profile?.family_id ?? "",
    babyId: activeBaby?.id ?? "",
    table: "logs",
    queryKey: insightsQueryKey,
  });

  const sevenDaysAgoISO = sevenDaysAgo.toISOString();
  const currentWeekLogs = allLogs.filter((l) => l.started_at >= sevenDaysAgoISO);
  const previousWeekLogs = allLogs.filter((l) => l.started_at < sevenDaysAgoISO);

  const stats = useWeeklyStats(currentWeekLogs, previousWeekLogs);

  const activeConfig = TABS.find((t) => t.id === activeTab)!;
  const typeMap: Record<Tab, keyof (typeof stats.days)[0]> = {
    feeds: "feedCount",
    sleep: "sleepHours",
    diapers: "diaperCount",
  };
  const chartData = stats.days.map(
    (d: DailyStats) => d[typeMap[activeTab]] as number,
  );
  const maxVal = Math.max(...chartData, 1) * 1.25;
  const avg =
    activeTab === "feeds"
      ? stats.avgFeeds
      : activeTab === "sleep"
        ? stats.avgSleepHours
        : stats.avgDiapers;

  const total =
    activeTab === "feeds"
      ? stats.totalFeeds
      : activeTab === "sleep"
        ? stats.totalSleepHours
        : stats.totalDiapers;

  const wowChange =
    activeTab === "feeds"
      ? stats.weekOverWeek.feedsPctChange
      : activeTab === "sleep"
        ? stats.weekOverWeek.sleepPctChange
        : stats.weekOverWeek.diapersPctChange;

  const insights = useMemo((): Record<Tab, InsightCard[]> => ({
    feeds: buildFeedInsights(stats),
    sleep: buildSleepInsights(stats),
    diapers: buildDiaperInsights(stats),
  }), [stats]);

  const weekRange = () => {
    const start = new Date(sevenDaysAgo);
    start.setDate(start.getDate() + 1);
    const end = new Date();
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  if (!activeBaby) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  const wowLabel =
    wowChange == null
      ? "—"
      : `${wowChange > 0 ? "+" : ""}${wowChange}`;

  const buildStatItems = () => {
    const wowStat = {
      label: "vs Last Week",
      value: wowLabel,
      suffix: wowChange != null ? "%" : "",
    };

    if (activeTab === "feeds") {
      return [
        { label: "Nursing", value: stats.feedInsights.nursingTotal.toString(), suffix: "" },
        { label: "Bottle", value: stats.feedInsights.bottleTotal.toString(), suffix: "" },
        wowStat,
      ];
    }

    if (activeTab === "diapers") {
      return [
        { label: "Wet", value: stats.diaperInsights.wetTotal.toString(), suffix: "" },
        { label: "Dirty", value: stats.diaperInsights.dirtyTotal.toString(), suffix: "" },
        { label: "Both", value: stats.diaperInsights.bothTotal.toString(), suffix: "" },
      ];
    }

    return [
      { label: "Daily Avg", value: avg.toFixed(1), suffix: "h" },
      { label: "This Week", value: stats.totalSleepHours.toFixed(1), suffix: "h" },
      wowStat,
    ];
  };

  const statItems = buildStatItems();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Weekly Insights</Text>
          <Text style={styles.subtitle}>
            {weekRange()} · {activeBaby.name}
          </Text>
        </View>
      </View>

      {/* ── Tab pills ── */}
      <View style={styles.tabRow}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.tab,
                active && {
                  backgroundColor: t.color,
                  shadowColor: t.color,
                  shadowOpacity: 0.3,
                  shadowOffset: { width: 0, height: 3 },
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.8}
            >
              <t.Icon size={16} color={active ? "#fff" : t.color} />
              <Text
                style={[
                  styles.tabText,
                  active && { color: "#fff" },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Stat strip + chart ── */}
      <View style={styles.chartCard}>
        <View style={styles.statStrip}>
          {statItems.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={[styles.statValue, { color: activeConfig.color }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statSuffix, { color: activeConfig.color }]}>
                    {s.suffix}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < statItems.length - 1 && (
                <View style={styles.statDivider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── Bar chart ── */}
        <View style={styles.chartArea}>
          {[0.25, 0.5, 0.75].map((frac) => (
            <View
              key={frac}
              style={[
                styles.gridLine,
                { bottom: `${frac * 100}%` },
              ]}
            />
          ))}
          <View style={styles.barsRow}>
            {chartData.map((val: number, i: number) => {
              const pct = (val / maxVal) * 100;
              const isToday = i === 6;

              if (activeTab === "feeds") {
                const day = stats.days[i];
                const totalPct = Math.max(pct, 4);
                const nursingFrac = val > 0 ? day.nursingCount / val : 0;
                const bottleFrac = val > 0 ? day.bottleCount / val : 0;
                const hasBoth = day.nursingCount > 0 && day.bottleCount > 0;
                return (
                  <View key={i} style={styles.barWrap}>
                    <View style={styles.barTrack}>
                      {val > 0 && (
                        <Text
                          style={[
                            styles.barValue,
                            { color: isToday ? activeConfig.color : Colors.inkLight },
                          ]}
                        >
                          {val}
                        </Text>
                      )}
                      <View
                        style={{
                          width: "70%",
                          height: `${totalPct}%`,
                          overflow: "hidden",
                          borderRadius: 8,
                        }}
                      >
                        {day.bottleCount > 0 && (
                          <View
                            style={{
                              flex: bottleFrac,
                              backgroundColor: isToday ? Colors.dawn : Colors.dawn + "90",
                              borderBottomWidth: hasBoth ? 1 : 0,
                              borderBottomColor: Colors.sand,
                            }}
                          />
                        )}
                        {day.nursingCount > 0 && (
                          <View
                            style={{
                              flex: nursingFrac,
                              backgroundColor: isToday ? Colors.dusk : Colors.dusk + "55",
                            }}
                          />
                        )}
                      </View>
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
              }

              if (activeTab === "diapers") {
                const day = stats.days[i];
                const totalPct = Math.max(pct, 4);
                const wetFrac = val > 0 ? day.wetCount / val : 0;
                const dirtyFrac = val > 0 ? day.dirtyCount / val : 0;
                const bothFrac = val > 0 ? day.bothCount / val : 0;
                return (
                  <View key={i} style={styles.barWrap}>
                    <View style={styles.barTrack}>
                      {val > 0 && (
                        <Text
                          style={[
                            styles.barValue,
                            { color: isToday ? activeConfig.color : Colors.inkLight },
                          ]}
                        >
                          {val}
                        </Text>
                      )}
                      <View
                        style={{
                          width: "70%",
                          height: `${totalPct}%`,
                          overflow: "hidden",
                          borderRadius: 8,
                        }}
                      >
                        {day.bothCount > 0 && (
                          <View
                            style={{
                              flex: bothFrac,
                              backgroundColor: isToday ? DIAPER_COLORS.both : DIAPER_COLORS.both + "70",
                            }}
                          />
                        )}
                        {day.dirtyCount > 0 && (
                          <View
                            style={{
                              flex: dirtyFrac,
                              backgroundColor: isToday ? DIAPER_COLORS.dirty : DIAPER_COLORS.dirty + "55",
                            }}
                          />
                        )}
                        {day.wetCount > 0 && (
                          <View
                            style={{
                              flex: wetFrac,
                              backgroundColor: isToday ? DIAPER_COLORS.wet : DIAPER_COLORS.wet + "55",
                            }}
                          />
                        )}
                      </View>
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
              }

              return (
                <View key={i} style={styles.barWrap}>
                  <View style={styles.barTrack}>
                    {val > 0 && (
                      <Text
                        style={[
                          styles.barValue,
                          { color: isToday ? activeConfig.color : Colors.inkLight },
                        ]}
                      >
                        {val.toFixed(1)}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(pct, 4)}%`,
                          backgroundColor: isToday
                            ? activeConfig.color
                            : activeConfig.color + "40",
                          borderRadius: 8,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      isToday && {
                        color: activeConfig.color,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {WEEK_DAYS[i]}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Legend for feeds */}
        {activeTab === "feeds" && stats.totalFeeds > 0 && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.dusk }]} />
              <Text style={styles.legendText}>Nursing</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.dawn }]} />
              <Text style={styles.legendText}>Bottle</Text>
            </View>
          </View>
        )}

        {/* Legend for diapers */}
        {activeTab === "diapers" && stats.totalDiapers > 0 && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.wet }]} />
              <Text style={styles.legendText}>Wet</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.dirty }]} />
              <Text style={styles.legendText}>Dirty</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.both }]} />
              <Text style={styles.legendText}>Both</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Patterns ── */}
      <Text style={styles.sectionLabel}>Patterns</Text>
      {insights[activeTab].map((item) => (
        <View
          key={item.title}
          style={[
            styles.insightCard,
            { borderLeftColor: item.color },
          ]}
        >
          <View style={styles.insightHeader}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: item.color + "15" },
              ]}
            >
              <Text style={{ fontSize: 16 }}>{item.icon}</Text>
            </View>
            <Text style={styles.insightTitle}>{item.title}</Text>
          </View>
          <Text style={styles.insightText}>{item.text}</Text>
        </View>
      ))}

      {/* ── Export ── */}
      <TouchableOpacity
        style={[
          styles.exportBtn,
          { backgroundColor: activeConfig.color + "12" },
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.exportBtnText, { color: activeConfig.color }]}>
          Export weekly report
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 32,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginTop: 4,
  },

  tabRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
    backgroundColor: Colors.sand,
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  tabText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 13,
    color: Colors.inkLight,
  },

  chartCard: {
    backgroundColor: Colors.sand,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
  },
  statStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
  },
  statSuffix: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 1,
  },
  statLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.sandDark,
  },

  chartArea: {
    position: "relative",
    height: 170,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.sandDark + "80",
  },
  barsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    flex: 1,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barTrack: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    minHeight: 4,
  },
  barValue: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  dayLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    marginTop: 8,
    fontWeight: "500",
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    fontWeight: "500",
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
    padding: 14,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.sandDark + "60",
    borderLeftWidth: 3,
    marginBottom: 10,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightTitle: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
  },
  insightText: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 19,
    paddingLeft: 42,
  },
  exportBtn: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  exportBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
  },
});
