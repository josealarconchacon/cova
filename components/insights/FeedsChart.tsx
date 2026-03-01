import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { formatDayName } from "../../lib/insights";
import { getDayLetter } from "../../lib/insights/formatUtils";
import { toLocalDateKey } from "../../lib/home/dateUtils";
import type { DailyStats, WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";

interface FeedsChartProps {
  chartData: number[];
  maxVal: number;
  stats: WeeklyStats;
  currentWeekLogs: Log[];
  accentColor: string;
}

function formatFeedTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function FeedBar({
  day,
  val,
  maxVal,
  isToday,
  accentColor,
  dayIndex,
  onPress,
  isSelected,
  isPeakDay,
  isDimmed,
  animValue,
  hasPulsed,
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
  isPeakDay: boolean;
  isDimmed: boolean;
  animValue: Animated.Value;
  hasPulsed: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
  const totalPct = Math.max(pct, 4);
  const nursingFrac = val > 0 ? day.nursingCount / val : 0;
  const bottleFrac = val > 0 ? day.bottleCount / val : 0;
  const hasBoth = day.nursingCount > 0 && day.bottleCount > 0;
  const isZeroDay = val === 0;
  const opacity = isDimmed ? 0.45 : 1;

  useEffect(() => {
    if (isPeakDay && hasPulsed) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPeakDay, hasPulsed]);

  if (isZeroDay) {
    return (
      <Pressable
        style={[
          styles.barWrap,
          isSelected && styles.barWrapSelected,
          { opacity },
          { minHeight: 44 },
        ]}
        onPress={onPress}
      >
        <View style={styles.barTrack}>
          <View style={styles.feedsEmptyBar}>
            <Text style={styles.feedsEmptyBarPlus}>+</Text>
          </View>
        </View>
        <Text
          style={[
            styles.dayLabel,
            isToday && { color: accentColor, fontWeight: "700" },
            isSelected && { color: accentColor, fontWeight: "700" },
          ]}
        >
          {getDayLetter(day.date)}
        </Text>
      </Pressable>
    );
  }

  return (
    <Animated.View
      style={[
        styles.barWrap,
        isSelected && styles.barWrapSelected,
        { opacity },
        { minHeight: 44 },
        isPeakDay && {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Pressable style={{ flex: 1, alignItems: "center" }} onPress={onPress}>
        {isPeakDay && (
          <View style={styles.peakIndicator}>
            <Text style={styles.peakIndicatorText}>Peak</Text>
          </View>
        )}
        <View style={styles.barTrack}>
          <Text
            style={[
              styles.barValue,
              { color: isToday ? accentColor : Colors.inkLight },
            ]}
          >
            {val}
          </Text>
          <Animated.View
            style={{
              width: "70%",
              height: `${totalPct}%`,
              overflow: "hidden",
              borderRadius: 8,
              opacity: animValue,
              transform: [{ scaleY: animValue }],
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
          </Animated.View>
        </View>
        <Text
          style={[
            styles.dayLabel,
            isToday && { color: accentColor, fontWeight: "700" },
            isSelected && { color: accentColor, fontWeight: "700" },
          ]}
        >
          {getDayLetter(day.date)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function BarDetailCard({
  day,
  accentColor,
  isPeakDay,
  feedLogsForDay,
}: {
  day: DailyStats;
  accentColor: string;
  isPeakDay: boolean;
  feedLogsForDay: Log[];
}) {
  const dayName = formatDayName(day.date);
  const lines: string[] = [];
  if (day.nursingCount > 0) {
    const part = `${day.nursingCount} nursing`;
    const extra =
      day.nursingDurationMin > 0
        ? ` (${Math.round(day.nursingDurationMin)} min total)`
        : "";
    lines.push(part + extra);
  }
  if (day.bottleCount > 0) {
    const part = `${day.bottleCount} bottle`;
    const extra =
      day.bottleTotalMl > 0 ? ` (${day.bottleTotalMl} ml total)` : "";
    lines.push(part + extra);
  }
  const detail = lines.length > 0 ? lines.join(" · ") : "No feeds";

  const sortedLogs = [...feedLogsForDay].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  return (
    <View style={styles.feedsBarDetailCard}>
      <Text style={[styles.feedsBarDetailDay, { color: accentColor }]}>
        {dayName}
      </Text>
      <Text style={styles.feedsBarDetailBreakdown}>
        {detail} — {day.feedCount} total
      </Text>
      {isPeakDay && (
        <Text
          style={[
            styles.barDetailSub,
            { color: Colors.teal, fontWeight: "600", marginTop: 4 },
          ]}
        >
          Most active day this week
        </Text>
      )}
      {sortedLogs.length > 0 && (
        <View style={styles.feedsBarDetailTimeline}>
          <Text style={styles.feedsBarDetailTimelineTitle}>
            Feeds this day
          </Text>
          {sortedLogs.map((log) => {
            const ft = (log.metadata?.feed_type as string) ?? "";
            const label = ft === "bottle" ? "Bottle" : "Nursing";
            const dur =
              log.duration_seconds != null && log.duration_seconds > 0
                ? ` (${Math.round(log.duration_seconds / 60)} min)`
                : "";
            return (
              <View key={log.id} style={styles.feedsBarDetailTimelineItem}>
                <Text style={styles.feedsBarDetailTimelineTime}>
                  {formatFeedTime(log.started_at)}
                </Text>
                <Text style={styles.feedsBarDetailTimelineLabel}>
                  {label}
                  {dur}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

export function FeedsChart({
  chartData,
  maxVal,
  stats,
  currentWeekLogs,
  accentColor,
}: FeedsChartProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [hasTappedBar, setHasTappedBar] = useState(false);
  const [peakHasPulsed, setPeakHasPulsed] = useState(false);
  const detailOpacity = useRef(new Animated.Value(0)).current;
  const barAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0)),
  ).current;

  const feedWow = stats.weekOverWeek.feedsPctChange;
  const avgFeeds = stats.avgFeeds;
  const avgLinePct =
    maxVal > 0 && avgFeeds > 0
      ? Math.min(95, Math.max(5, (avgFeeds / maxVal) * 100))
      : null;
  const peakDayIndex = stats.feedInsights.peakDayIndex;
  const todayStr = toLocalDateKey(new Date());

  useEffect(() => {
    barAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: i * 200,
        useNativeDriver: false,
      }).start(() => {
        if (i === peakDayIndex) setPeakHasPulsed(true);
      });
    });
  }, []);

  useEffect(() => {
    Animated.timing(detailOpacity, {
      toValue: selectedDayIndex != null ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedDayIndex, detailOpacity]);

  const handleBarPress = (index: number) => {
    setHasTappedBar(true);
    setSelectedDayIndex((prev) => (prev === index ? null : index));
  };

  const handleQuickLog = () => {
    router.push("/(tabs)");
  };

  const feedLogsByDate = React.useMemo(() => {
    const map: Record<string, Log[]> = {};
    for (const log of currentWeekLogs) {
      if (log.type !== "feed") continue;
      const key = toLocalDateKey(new Date(log.started_at));
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [currentWeekLogs]);

  return (
    <View style={{ position: "relative" }}>
      {feedWow != null && (
        <View style={styles.trendArrowWrap}>
          <Text
            style={[
              styles.trendArrowText,
              {
                color:
                  feedWow > 0
                    ? Colors.teal
                    : feedWow < -20
                      ? Colors.error
                      : Colors.inkLight,
              },
            ]}
          >
            {feedWow > 0 ? "↑" : feedWow < 0 ? "↓" : "→"}{" "}
            {feedWow > 0 ? "+" : ""}
            {feedWow}%
          </Text>
          <Text
            style={[
              styles.trendArrowText,
              { color: Colors.inkLight, fontWeight: "500", fontSize: 10 },
            ]}
          >
            vs last week
          </Text>
        </View>
      )}
      <View style={styles.chartArea}>
        {[0.25, 0.5, 0.75].map((frac) => (
          <View
            key={frac}
            style={[styles.gridLine, { bottom: `${frac * 100}%` }]}
          />
        ))}
        {avgLinePct != null && (
          <View
            style={[styles.referenceLine, { bottom: `${avgLinePct}%` }]}
          >
            <Text style={styles.avgLineLabel}>Avg {avgFeeds.toFixed(1)}</Text>
            <View style={styles.avgLine} />
          </View>
        )}
        <View style={styles.barsRow}>
          {chartData.map((val: number, i: number) => {
            const day = stats.days[i];
            const isToday = day.date === todayStr;
            const isDimmed = selectedDayIndex != null && selectedDayIndex !== i;

            return (
              <FeedBar
                key={i}
                day={day}
                val={val}
                maxVal={maxVal}
                isToday={isToday}
                accentColor={accentColor}
                dayIndex={i}
                onPress={
                  val === 0 ? handleQuickLog : () => handleBarPress(i)
                }
                isSelected={selectedDayIndex === i}
                isPeakDay={peakDayIndex === i}
                isDimmed={isDimmed}
                animValue={barAnims[i]}
                hasPulsed={peakHasPulsed}
              />
            );
          })}
        </View>
      </View>
      {selectedDayIndex != null ? (
        <Animated.View style={{ opacity: detailOpacity }}>
          <BarDetailCard
            day={stats.days[selectedDayIndex]}
            accentColor={accentColor}
            isPeakDay={peakDayIndex === selectedDayIndex}
            feedLogsForDay={
              feedLogsByDate[stats.days[selectedDayIndex].date] ?? []
            }
          />
        </Animated.View>
      ) : !hasTappedBar ? (
        <View style={styles.feedsFirstTapTooltip}>
          <Text style={styles.feedsFirstTapTooltipText}>
            Tap a bar to see daily details
          </Text>
        </View>
      ) : null}
    </View>
  );
}
