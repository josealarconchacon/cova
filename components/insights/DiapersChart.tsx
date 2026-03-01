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

const DIAPER_ACCENT = "#8B5E3C";
const WET_COLOR = "#F5D76E";
const DIRTY_COLOR = "#8B5E3C";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDiaperTypeLabel(log: Log): string {
  const dt = (log.metadata?.diaper_type as string) ?? "";
  if (dt === "both") return "Wet + Dirty";
  if (dt === "dirty") return "Dirty";
  return "Wet";
}

interface DiapersChartProps {
  chartData: number[];
  maxVal: number;
  stats: WeeklyStats;
  currentWeekLogs: Log[];
}

function DiaperBar({
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
  const wetSegment = day.wetCount + day.bothCount;
  const dirtySegment = day.dirtyCount;
  const wetFrac = val > 0 ? wetSegment / val : 0;
  const dirtyFrac = val > 0 ? dirtySegment / val : 0;
  const hasBoth = wetSegment > 0 && dirtySegment > 0;
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
            isToday && { color: DIAPER_ACCENT, fontWeight: "700" },
            isSelected && { color: DIAPER_ACCENT, fontWeight: "700" },
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
          <Text style={[styles.peakIndicatorText, { color: DIAPER_ACCENT }]}>
            Peak
          </Text>
        </View>
      )}
      <View style={styles.barTrack}>
        <Text
          style={[
            styles.barValue,
            { color: isToday ? DIAPER_ACCENT : Colors.inkLight },
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
          {wetSegment > 0 && (
            <View
              style={{
                flex: wetFrac,
                backgroundColor: isToday ? WET_COLOR : WET_COLOR + "99",
                borderBottomWidth: hasBoth ? 1 : 0,
                borderBottomColor: Colors.sand,
              }}
            />
          )}
          {dirtySegment > 0 && (
            <View
              style={{
                flex: dirtyFrac,
                backgroundColor: isToday ? DIRTY_COLOR : DIRTY_COLOR + "99",
              }}
            />
          )}
        </Animated.View>
      </View>
      <Text
        style={[
          styles.dayLabel,
          isToday && { color: DIAPER_ACCENT, fontWeight: "700" },
          isSelected && { color: DIAPER_ACCENT, fontWeight: "700" },
        ]}
      >
        {getDayLetter(day.date)}
      </Text>
    </Pressable>
  );
}

function BarDetailCard({
  day,
  diaperLogsForDay,
}: {
  day: DailyStats;
  diaperLogsForDay: Log[];
}) {
  const dayName = formatDayName(day.date);
  const wetTotal = day.wetCount + day.bothCount;
  const dirtyTotal = day.dirtyCount + day.bothCount;
  const sortedLogs = [...diaperLogsForDay].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  return (
    <View style={styles.feedsBarDetailCard}>
      <Text style={[styles.feedsBarDetailDay, { color: DIAPER_ACCENT }]}>
        {dayName}
      </Text>
      <Text style={styles.feedsBarDetailBreakdown}>
        {wetTotal} wet · {dirtyTotal} dirty · {day.diaperCount} total
      </Text>
      {sortedLogs.length > 0 && (
        <View style={styles.feedsBarDetailTimeline}>
          <Text style={styles.feedsBarDetailTimelineTitle}>Changes</Text>
          {sortedLogs.map((log) => (
            <View key={log.id} style={styles.feedsBarDetailTimelineItem}>
              <Text style={styles.feedsBarDetailTimelineTime}>
                {formatTime(log.started_at)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.feedsBarDetailTimelineLabel}>
                  {getDiaperTypeLabel(log)}
                </Text>
                {log.notes && (
                  <Text
                    style={[
                      styles.feedsBarDetailTimelineLabel,
                      {
                        fontStyle: "italic",
                        marginTop: 2,
                        color: Colors.inkLight,
                      },
                    ]}
                  >
                    {log.notes}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function DiapersChart({
  chartData,
  maxVal,
  stats,
  currentWeekLogs,
}: DiapersChartProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [hasTappedBar, setHasTappedBar] = useState(false);
  const barAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0)),
  ).current;

  const diaperWow = stats.weekOverWeek.diapersPctChange;
  const todayStr = toLocalDateKey(new Date());
  const peakDayIndex = stats.diaperInsights.peakDayIndex;

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

  const diaperLogsByDate = useMemo(() => {
    const map: Record<string, Log[]> = {};
    for (const log of currentWeekLogs) {
      if (log.type !== "diaper") continue;
      const key = toLocalDateKey(new Date(log.started_at));
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [currentWeekLogs]);

  return (
    <View style={{ position: "relative" }}>
      {diaperWow != null && (
        <View style={styles.trendArrowWrap}>
          <Text
            style={[
              styles.trendArrowText,
              {
                color:
                  diaperWow > 0
                    ? Colors.teal
                    : diaperWow >= -20
                      ? Colors.gold
                      : Colors.error,
              },
            ]}
          >
            {diaperWow > 0 ? "↑" : diaperWow < 0 ? "↓" : "→"}{" "}
            {diaperWow > 0 ? "+" : ""}
            {diaperWow}%
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
              <DiaperBar
                key={i}
                day={day}
                val={val}
                maxVal={maxVal}
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
      {stats.totalDiapers > 0 && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: WET_COLOR }]} />
            <Text style={styles.legendText}>Wet</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: DIRTY_COLOR }]}
            />
            <Text style={styles.legendText}>Dirty</Text>
          </View>
        </View>
      )}
      {selectedDayIndex != null ? (
        <BarDetailCard
          day={stats.days[selectedDayIndex]}
          diaperLogsForDay={
            diaperLogsByDate[stats.days[selectedDayIndex].date] ?? []
          }
        />
      ) : !hasTappedBar ? (
        <View
          style={[
            styles.feedsFirstTapTooltip,
            { backgroundColor: DIAPER_ACCENT + "15" },
          ]}
        >
          <Text
            style={[
              styles.feedsFirstTapTooltipText,
              { color: DIAPER_ACCENT },
            ]}
          >
            Tap a bar to see daily details
          </Text>
        </View>
      ) : null}
    </View>
  );
}
