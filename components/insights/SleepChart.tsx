import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { formatDayName } from "../../lib/insights";
import { getDayLetter } from "../../lib/insights/formatUtils";
import { toLocalDateKey } from "../../lib/home/dateUtils";
import type { DailyStats, WeeklyStats } from "../../lib/useWeeklyStats";
import type { Log } from "../../types";

const SLEEP_ACCENT = "#2C3E6B";
const NIGHT_COLOR = "#2C3E6B";
const NAP_COLOR = "#B8A9D4";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function isNightSession(startedAt: string): boolean {
  const h = new Date(startedAt).getHours();
  return h >= 22 || h < 6;
}

interface SleepChartProps {
  chartData: number[];
  maxVal: number;
  stats: WeeklyStats;
  currentWeekLogs: Log[];
}

function SleepBar({
  day,
  val,
  maxVal,
  isToday,
  dayIndex,
  onPress,
  isSelected,
  isPeakDay,
  isDimmed,
  animValue,
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
  isPeakDay: boolean;
  isDimmed: boolean;
  animValue: Animated.Value;
}) {
  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
  const totalPct = Math.max(pct, 4);
  const nightFrac = val > 0 ? day.nightHours / val : 0;
  const napFrac = val > 0 ? day.napHours / val : 0;
  const hasBoth = day.nightHours > 0 && day.napHours > 0;
  const isZeroDay = val === 0;
  const opacity = isDimmed ? 0.45 : 1;

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
            isToday && { color: SLEEP_ACCENT, fontWeight: "700" },
            isSelected && { color: SLEEP_ACCENT, fontWeight: "700" },
          ]}
        >
          {getDayLetter(day.date)}
        </Text>
      </Pressable>
    );
  }

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
      {isPeakDay && (
        <View style={styles.peakIndicator}>
          <Text style={[styles.peakIndicatorText, { color: SLEEP_ACCENT }]}>
            Peak
          </Text>
        </View>
      )}
      <View style={styles.barTrack}>
        <Text
          style={[
            styles.barValue,
            { color: isToday ? SLEEP_ACCENT : Colors.inkLight },
          ]}
        >
          {val.toFixed(1)}h
        </Text>
        <View
          style={{
            width: "70%",
            height: `${totalPct}%`,
            overflow: "hidden",
            borderRadius: 8,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: animValue,
              transform: [{ scaleY: animValue }],
            }}
          >
          {day.nightHours > 0 && (
            <View
              style={{
                flex: nightFrac,
                backgroundColor: isToday ? NIGHT_COLOR : NIGHT_COLOR + "99",
                borderBottomWidth: hasBoth ? 1 : 0,
                borderBottomColor: Colors.sand,
              }}
            />
          )}
          {day.napHours > 0 && (
            <View
              style={{
                flex: napFrac,
                backgroundColor: isToday ? NAP_COLOR : NAP_COLOR + "99",
              }}
            />
          )}
          </Animated.View>
        </View>
      </View>
      <Text
        style={[
          styles.dayLabel,
          isToday && { color: SLEEP_ACCENT, fontWeight: "700" },
          isSelected && { color: SLEEP_ACCENT, fontWeight: "700" },
        ]}
      >
        {getDayLetter(day.date)}
      </Text>
    </Pressable>
  );
}

function BarDetailCard({
  day,
  sleepLogsForDay,
}: {
  day: DailyStats;
  sleepLogsForDay: Log[];
}) {
  const dayName = formatDayName(day.date);
  const sortedLogs = [...sleepLogsForDay].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  let longestStretchMin = 0;
  let longestStretchLog: Log | null = null;
  for (const log of sortedLogs) {
    const min = (log.duration_seconds ?? 0) / 60;
    if (min > longestStretchMin) {
      longestStretchMin = min;
      longestStretchLog = log;
    }
  }

  const nightLogs = sortedLogs.filter((l) => isNightSession(l.started_at));
  const napLogs = sortedLogs.filter((l) => !isNightSession(l.started_at));
  const firstNight = nightLogs[0];
  const lastNight = nightLogs[nightLogs.length - 1];
  const bedtime = firstNight
    ? formatTime(firstNight.started_at)
    : napLogs[0]
      ? formatTime(napLogs[0].started_at)
      : null;
  const wakeTime = lastNight
    ? formatTime(
        new Date(
          new Date(lastNight.started_at).getTime() +
            (lastNight.duration_seconds ?? 0) * 1000,
        ).toISOString(),
      )
    : napLogs[napLogs.length - 1]
      ? formatTime(
          new Date(
            new Date(napLogs[napLogs.length - 1].started_at).getTime() +
              (napLogs[napLogs.length - 1].duration_seconds ?? 0) * 1000,
          ).toISOString(),
        )
      : null;

  return (
    <View style={styles.feedsBarDetailCard}>
      <Text style={[styles.feedsBarDetailDay, { color: SLEEP_ACCENT }]}>
        {dayName}
      </Text>
      <Text style={styles.feedsBarDetailBreakdown}>
        {day.sleepHours.toFixed(1)}h total · {day.nightHours.toFixed(1)}h night ·{" "}
        {day.napHours.toFixed(1)}h naps
      </Text>
      {bedtime && wakeTime && (
        <Text
          style={[
            styles.feedsBarDetailBreakdown,
            { marginTop: 6, fontWeight: "600" },
          ]}
        >
          Bedtime {bedtime} · Wake {wakeTime}
        </Text>
      )}
      {napLogs.length > 0 && (
        <View style={styles.feedsBarDetailTimeline}>
          <Text style={styles.feedsBarDetailTimelineTitle}>Naps</Text>
          {napLogs.map((log) => {
            const start = formatTime(log.started_at);
            const end = formatTime(
              new Date(
                new Date(log.started_at).getTime() +
                  (log.duration_seconds ?? 0) * 1000,
              ).toISOString(),
            );
            const min = (log.duration_seconds ?? 0) / 60;
            const isLongest = log === longestStretchLog;
            return (
              <View key={log.id} style={styles.feedsBarDetailTimelineItem}>
                <Text
                  style={[
                    styles.feedsBarDetailTimelineTime,
                    isLongest && { fontWeight: "700", color: SLEEP_ACCENT },
                  ]}
                >
                  {start}–{end}
                </Text>
                <Text
                  style={[
                    styles.feedsBarDetailTimelineLabel,
                    isLongest && { fontWeight: "700", color: SLEEP_ACCENT },
                  ]}
                >
                  {formatDuration(min)}
                  {isLongest ? " · Longest stretch" : ""}
                </Text>
              </View>
            );
          })}
        </View>
      )}
      {nightLogs.length > 0 && napLogs.length === 0 && longestStretchLog && (
        <View style={styles.feedsBarDetailTimeline}>
          <Text style={styles.feedsBarDetailTimelineTitle}>Night sleep</Text>
          <View style={styles.feedsBarDetailTimelineItem}>
            <Text
              style={[
                styles.feedsBarDetailTimelineTime,
                { fontWeight: "700", color: SLEEP_ACCENT },
              ]}
            >
              {formatTime(longestStretchLog.started_at)}–
              {formatTime(
                new Date(
                  new Date(longestStretchLog.started_at).getTime() +
                    (longestStretchLog.duration_seconds ?? 0) * 1000,
                ).toISOString(),
              )}
            </Text>
            <Text
              style={[
                styles.feedsBarDetailTimelineLabel,
                { fontWeight: "700", color: SLEEP_ACCENT },
              ]}
            >
              {formatDuration(
                (longestStretchLog.duration_seconds ?? 0) / 60,
              )}{" "}
              · Longest stretch
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export function SleepChart({
  chartData,
  maxVal,
  stats,
  currentWeekLogs,
}: SleepChartProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [hasTappedBar, setHasTappedBar] = useState(false);
  const barAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0)),
  ).current;

  const sleepWow = stats.weekOverWeek.sleepPctChange;
  const recommendedMin = stats.sleepInsights.recommendedMin;
  const recommendedMax = stats.sleepInsights.recommendedMax;
  const effectiveMax = Math.max(maxVal, recommendedMax * 1.15);
  const todayStr = toLocalDateKey(new Date());

  const peakDayIndex = useMemo(() => {
    let max = 0;
    let idx = 0;
    chartData.forEach((v, i) => {
      if (v > max) {
        max = v;
        idx = i;
      }
    });
    return max > 0 ? idx : null;
  }, [chartData]);

  useEffect(() => {
    barAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: i * 200,
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const handleBarPress = (index: number) => {
    setHasTappedBar(true);
    setSelectedDayIndex((prev) => (prev === index ? null : index));
  };

  const handleQuickLog = () => {
    router.push("/(tabs)");
  };

  const sleepLogsByDate = useMemo(() => {
    const map: Record<string, Log[]> = {};
    for (const log of currentWeekLogs) {
      if (log.type !== "sleep") continue;
      const key = toLocalDateKey(new Date(log.started_at));
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [currentWeekLogs]);

  return (
    <View style={{ position: "relative" }}>
      {sleepWow != null && (
        <View style={styles.trendArrowWrap}>
          <Text
            style={[
              styles.trendArrowText,
              {
                color:
                  sleepWow > 0
                    ? Colors.teal
                    : sleepWow >= -10
                      ? Colors.gold
                      : Colors.error,
              },
            ]}
          >
            {sleepWow > 0 ? "↑" : sleepWow < 0 ? "↓" : "→"}{" "}
            {sleepWow > 0 ? "+" : ""}
            {sleepWow}%
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
        <View style={styles.barsRow}>
          {chartData.map((val: number, i: number) => {
            const day = stats.days[i];
            const isToday = day.date === todayStr;
            const isDimmed = selectedDayIndex != null && selectedDayIndex !== i;

            return (
              <SleepBar
                key={i}
                day={day}
                val={val}
                maxVal={effectiveMax}
                isToday={isToday}
                dayIndex={i}
                onPress={val === 0 ? handleQuickLog : () => handleBarPress(i)}
                isSelected={selectedDayIndex === i}
                isPeakDay={peakDayIndex === i}
                isDimmed={isDimmed}
                animValue={barAnims[i]}
              />
            );
          })}
        </View>
      </View>
      {stats.totalSleepHours > 0 && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: NIGHT_COLOR }]}
            />
            <Text style={styles.legendText}>Night</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: NAP_COLOR }]}
            />
            <Text style={styles.legendText}>Nap</Text>
          </View>
        </View>
      )}
      {selectedDayIndex != null ? (
        <BarDetailCard
          day={stats.days[selectedDayIndex]}
          sleepLogsForDay={
            sleepLogsByDate[stats.days[selectedDayIndex].date] ?? []
          }
        />
      ) : !hasTappedBar ? (
        <View style={[styles.feedsFirstTapTooltip, { backgroundColor: "#2C3E6B15" }]}>
          <Text style={[styles.feedsFirstTapTooltipText, { color: SLEEP_ACCENT }]}>
            Tap a bar to see daily details
          </Text>
        </View>
      ) : null}
    </View>
  );
}
