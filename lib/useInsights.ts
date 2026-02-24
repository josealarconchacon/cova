import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { useRealtimeSync } from "./useRealtimeSync";
import { useStore } from "../store/useStore";
import {
  useWeeklyStats,
  type DailyStats,
  type WeeklyStats,
} from "./useWeeklyStats";
import {
  buildFeedInsights,
  buildSleepInsights,
  buildDiaperInsights,
  type InsightCard,
  type Tab,
} from "./insights";
import { formatWeekRangeSunSat } from "./insights/formatUtils";
import type { Log } from "../types";

export interface StatItem {
  label: string;
  value: string;
  suffix: string;
}

export interface UseInsightsResult {
  allLogs: Log[];
  stats: WeeklyStats;
  insights: Record<Tab, InsightCard[]>;
  chartData: number[];
  maxVal: number;
  statItems: StatItem[];
  weekRange: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function useInsights(): UseInsightsResult {
  const { profile, activeBaby } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("feeds");

  const weekBounds = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart, weekEnd };
  }, []);

  const fourteenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d;
  }, []);

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

  const weekStartISO = weekBounds.weekStart.toISOString();
  const weekEndISO = weekBounds.weekEnd.toISOString();
  const currentWeekLogs = allLogs.filter(
    (l) => l.started_at >= weekStartISO && l.started_at <= weekEndISO,
  );
  const previousWeekLogs = allLogs.filter(
    (l) => l.started_at < weekStartISO,
  );

  const stats = useWeeklyStats(currentWeekLogs, previousWeekLogs);

  const typeMap: Record<Tab, keyof (typeof stats.days)[0]> = {
    feeds: "feedCount",
    sleep: "sleepHours",
    diapers: "diaperCount",
  };

  const chartData = useMemo(
    () =>
      stats.days.map(
        (d: DailyStats) => d[typeMap[activeTab]] as number,
      ),
    [stats.days, activeTab],
  );

  const maxVal = useMemo(
    () => Math.max(...chartData, 1) * 1.25,
    [chartData],
  );

  const insights = useMemo(
    (): Record<Tab, InsightCard[]> => ({
      feeds: buildFeedInsights(stats),
      sleep: buildSleepInsights(stats, activeBaby ?? null),
      diapers: buildDiaperInsights(stats, activeBaby ?? null),
    }),
    [stats, activeBaby],
  );

  const weekRange = formatWeekRangeSunSat();

  const wowChange =
    activeTab === "feeds"
      ? stats.weekOverWeek.feedsPctChange
      : activeTab === "sleep"
        ? stats.weekOverWeek.sleepPctChange
        : stats.weekOverWeek.diapersPctChange;

  const wowLabel =
    wowChange == null ? "—" : `${wowChange > 0 ? "+" : ""}${wowChange}`;

  const avg =
    activeTab === "feeds"
      ? stats.avgFeeds
      : activeTab === "sleep"
        ? stats.avgSleepHours
        : stats.avgDiapers;

  const statItems = useMemo((): StatItem[] => {
    const wowStat: StatItem = {
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
      { label: "This Week", value: stats.totalSleepHours.toFixed(1), suffix: "h" },
      { label: "Daily Avg", value: avg.toFixed(1), suffix: "h" },
      wowStat,
    ];
  }, [activeTab, stats, wowLabel, wowChange, avg]);

  return {
    allLogs,
    stats,
    insights,
    chartData,
    maxVal,
    statItems,
    weekRange,
    activeTab,
    setActiveTab,
  };
}
