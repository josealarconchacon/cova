import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import {
  DIAPER_COLORS,
  SLEEP_COLORS,
  formatDayName,
} from "../../lib/insights";
import { getDayLetter } from "../../lib/insights/formatUtils";
import { toLocalDateKey } from "../../lib/home/dateUtils";
import type { Tab } from "../../lib/insights";
import type { DailyStats, WeeklyStats } from "../../lib/useWeeklyStats";

interface InsightsChartProps {
  activeTab: Tab;
  chartData: number[];
  maxVal: number;
  stats: WeeklyStats;
  accentColor: string;
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
}) {
  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
  const totalPct = Math.max(pct, 4);
  const nursingFrac = val > 0 ? day.nursingCount / val : 0;
  const bottleFrac = val > 0 ? day.bottleCount / val : 0;
  const hasBoth = day.nursingCount > 0 && day.bottleCount > 0;
  const isZeroDay = val === 0;
  const opacity = isDimmed ? 0.45 : 1;

  if (isZeroDay) {
    return (
      <Pressable
        style={[styles.barWrap, isSelected && styles.barWrapSelected, { opacity }]}
        onPress={onPress}
      >
        <View style={styles.barTrack}>
          <View style={styles.zeroFeedPlaceholder}>
            <Text style={styles.zeroFeedPlaceholderText}>—</Text>
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
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected, { opacity }]}
      onPress={onPress}
    >
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
          isToday && { color: accentColor, fontWeight: "700" },
          isSelected && { color: accentColor, fontWeight: "700" },
        ]}
      >
        {getDayLetter(day.date)}
      </Text>
    </Pressable>
  );
}

function DiaperBar({
  day,
  val,
  maxVal,
  isToday,
  accentColor,
  dayIndex,
  onPress,
  isSelected,
  isDimmed,
  isPeakDay,
  isLowActivity,
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
  isDimmed: boolean;
  isPeakDay: boolean;
  isLowActivity: boolean;
}) {
  const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
  const totalPct = Math.max(pct, 4);
  const wetFrac = val > 0 ? day.wetCount / val : 0;
  const dirtyFrac = val > 0 ? day.dirtyCount / val : 0;
  const bothFrac = val > 0 ? day.bothCount / val : 0;
  const isZeroDay = val === 0;
  const opacity = isDimmed ? 0.45 : 1;
  const barOpacity = isLowActivity && !isZeroDay ? 0.75 : 1;

  if (isZeroDay) {
    return (
      <Pressable
        style={[styles.barWrap, isSelected && styles.barWrapSelected, { opacity }]}
        onPress={onPress}
      >
        <View style={styles.barTrack}>
          <View style={styles.zeroFeedPlaceholder}>
            <Text style={styles.zeroFeedPlaceholderText}>—</Text>
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
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected, { opacity }]}
      onPress={onPress}
    >
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
        <View
          style={{
            width: "70%",
            height: `${totalPct}%`,
            overflow: "hidden",
            borderRadius: 8,
            opacity: barOpacity,
            borderWidth: isLowActivity ? 1 : 0,
            borderColor: Colors.gold + "99",
          }}
        >
          {day.bothCount > 0 && (
            <View
              style={{
                flex: bothFrac,
                backgroundColor: isToday
                  ? DIAPER_COLORS.both
                  : DIAPER_COLORS.both + "70",
              }}
            />
          )}
          {day.dirtyCount > 0 && (
            <View
              style={{
                flex: dirtyFrac,
                backgroundColor: isToday
                  ? DIAPER_COLORS.dirty
                  : DIAPER_COLORS.dirty + "55",
              }}
            />
          )}
          {day.wetCount > 0 && (
            <View
              style={{
                flex: wetFrac,
                backgroundColor: isToday
                  ? DIAPER_COLORS.wet
                  : DIAPER_COLORS.wet + "55",
              }}
            />
          )}
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

function SleepBar({
  day,
  val,
  maxVal,
  isToday,
  accentColor,
  dayIndex,
  onPress,
  isSelected,
  isDimmed,
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
  isDimmed: boolean;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const napFrac = val > 0 ? day.napHours / val : 0;
  const nightFrac = val > 0 ? day.nightHours / val : 0;
  const hasBoth = day.napHours > 0 && day.nightHours > 0;
  const opacity = isDimmed ? 0.45 : 1;

  return (
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected, { opacity }]}
      onPress={onPress}
    >
      <View style={styles.barTrack}>
        {val > 0 && (
          <Text
            style={[
              styles.barValue,
              { color: isToday ? accentColor : Colors.inkLight },
            ]}
          >
            {val.toFixed(1)}
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
          {day.nightHours > 0 && (
            <View
              style={{
                flex: nightFrac,
                backgroundColor: isToday
                  ? SLEEP_COLORS.night
                  : SLEEP_COLORS.night + "70",
                borderBottomWidth: hasBoth ? 1 : 0,
                borderBottomColor: Colors.sand,
              }}
            />
          )}
          {day.napHours > 0 && (
            <View
              style={{
                flex: napFrac,
                backgroundColor: isToday
                  ? SLEEP_COLORS.nap
                  : SLEEP_COLORS.nap + "99",
              }}
            />
          )}
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

function BarDetailView({
  day,
  activeTab,
  accentColor,
  recommendedMin,
  recommendedMax,
  isPeakDay,
  isLowActivity,
}: {
  day: DailyStats;
  activeTab: Tab;
  accentColor: string;
  recommendedMin: number;
  recommendedMax: number;
  isPeakDay?: boolean;
  isLowActivity?: boolean;
}) {
  const dayName = formatDayName(day.date);

  if (activeTab === "feeds") {
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
    return (
      <View style={styles.barDetail}>
        <Text style={styles.barDetailMain}>
          <Text style={[styles.barDetailDay, { color: accentColor }]}>
            {dayName}
          </Text>
          {" · "}
          <Text style={styles.barDetailValue}>
            {detail} — {day.feedCount} total
          </Text>
        </Text>
        {isPeakDay && (
          <Text
            style={[styles.barDetailSub, { color: Colors.teal, fontWeight: "600" }]}
          >
            Most active day this week
          </Text>
        )}
      </View>
    );
  }

  if (activeTab === "diapers") {
    const lines: string[] = [];
    if (day.wetCount > 0) lines.push(`${day.wetCount} wet`);
    if (day.dirtyCount > 0) lines.push(`${day.dirtyCount} dirty`);
    if (day.bothCount > 0) lines.push(`${day.bothCount} both`);
    const detail = lines.length > 0 ? lines.join(" · ") : "No changes";
    const flags: string[] = [];
    if (isPeakDay) flags.push("Most changes this week");
    if (day.dirtyCount === 0 && day.diaperCount > 0)
      flags.push("No dirty diapers logged");
    if (day.wetCount === 0 && day.diaperCount > 0)
      flags.push("No wet diapers logged");
    if (isLowActivity)
      flags.push("Below expected minimum (6+ changes/day for newborns)");
    return (
      <View style={styles.barDetail}>
        <Text style={styles.barDetailMain}>
          <Text style={[styles.barDetailDay, { color: accentColor }]}>
            {dayName}
          </Text>
          {" · "}
          <Text style={styles.barDetailValue}>
            {detail} — {day.diaperCount} total
          </Text>
        </Text>
        {flags.length > 0 && (
          <Text
            style={[styles.barDetailSub, { color: Colors.teal, fontWeight: "600" }]}
          >
            {flags.join(" · ")}
          </Text>
        )}
      </View>
    );
  }

  const napStr = day.napHours > 0 ? `${day.napHours}h naps` : "";
  const nightStr = day.nightHours > 0 ? `${day.nightHours}h night` : "";
  const parts = [napStr, nightStr].filter(Boolean);
  const detail =
    parts.length > 0 ? parts.join(" · ") + ` — ${day.sleepHours}h total` : "No sleep";
  const meetsTarget = day.sleepHours > 0 && day.sleepHours >= recommendedMin;
  const vsTarget =
    day.sleepHours > 0
      ? meetsTarget
        ? `Meets recommended (${recommendedMin}–${recommendedMax}h)`
        : `Below recommended target (${recommendedMin}–${recommendedMax}h)`
      : null;

  return (
    <View style={styles.barDetail}>
      <Text style={styles.barDetailMain}>
        <Text style={[styles.barDetailDay, { color: accentColor }]}>
          {dayName}
        </Text>
        {" · "}
        <Text style={styles.barDetailValue}>{detail}</Text>
      </Text>
      {vsTarget && (
        <Text
          style={[
            styles.barDetailSub,
            meetsTarget ? { color: Colors.teal } : { color: Colors.inkLight },
          ]}
        >
          {vsTarget}
        </Text>
      )}
    </View>
  );
}

export function InsightsChart({
  activeTab,
  chartData,
  maxVal,
  stats,
  accentColor,
}: InsightsChartProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const detailOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelectedDayIndex(null);
  }, [activeTab]);

  useEffect(() => {
    Animated.timing(detailOpacity, {
      toValue: selectedDayIndex != null ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedDayIndex, detailOpacity]);

  const isSleep = activeTab === "sleep";
  const recommendedMin = stats.sleepInsights.recommendedMin;
  const recommendedMax = stats.sleepInsights.recommendedMax;
  const effectiveMax = isSleep
    ? Math.max(maxVal, recommendedMax * 1.15)
    : maxVal;
  const recommendedLinePct =
    isSleep && effectiveMax > 0
      ? Math.min(95, Math.max(5, (recommendedMin / effectiveMax) * 100))
      : null;

  const handleBarPress = (index: number) => {
    setSelectedDayIndex((prev) => (prev === index ? null : index));
  };

  const isFeeds = activeTab === "feeds";
  const isDiapers = activeTab === "diapers";
  const feedWow = stats.weekOverWeek.feedsPctChange;
  const diaperWow = stats.weekOverWeek.diapersPctChange;
  const avgFeeds = stats.avgFeeds;
  const avgDiapers = stats.avgDiapers;
  const avgLinePct =
    isFeeds && maxVal > 0 && avgFeeds > 0
      ? Math.min(95, Math.max(5, (avgFeeds / maxVal) * 100))
      : isDiapers && maxVal > 0 && avgDiapers > 0
        ? Math.min(95, Math.max(5, (avgDiapers / maxVal) * 100))
        : null;
  const avgLineLabel = isFeeds ? avgFeeds.toFixed(1) : avgDiapers.toFixed(1);
  const peakDayIndex =
    isFeeds
      ? stats.feedInsights.peakDayIndex
      : isDiapers
        ? stats.diaperInsights.peakDayIndex
        : null;
  const wowForTab = isFeeds ? feedWow : isDiapers ? diaperWow : null;
  const todayStr = toLocalDateKey(new Date());

  return (
    <View style={{ position: "relative" }}>
      {(isFeeds || isDiapers) && wowForTab != null && (
        <View style={styles.trendArrowWrap}>
          <Text
            style={[
              styles.trendArrowText,
              {
                color:
                  wowForTab > 0
                    ? Colors.teal
                    : wowForTab < 0
                      ? Colors.dusk
                      : Colors.inkLight,
              },
            ]}
          >
            {wowForTab > 0 ? "↑" : wowForTab < 0 ? "↓" : "→"}{" "}
            {wowForTab > 0 ? "+" : ""}
            {wowForTab}%
          </Text>
          <Text style={[styles.trendArrowText, { color: Colors.inkLight, fontWeight: "500", fontSize: 10 }]}>
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
        {recommendedLinePct != null && (
          <View
            style={[styles.referenceLine, { bottom: `${recommendedLinePct}%` }]}
          >
            <Text style={styles.referenceLineLabel}>
              Recommended {recommendedMin}–{recommendedMax}h
            </Text>
            <View style={styles.referenceLineTrack} />
          </View>
        )}
        {avgLinePct != null && (
          <View style={[styles.referenceLine, { bottom: `${avgLinePct}%` }]}>
            <Text style={styles.avgLineLabel}>
              Avg {avgLineLabel}
            </Text>
            <View style={styles.avgLine} />
          </View>
        )}
        <View style={styles.barsRow}>
        {chartData.map((val: number, i: number) => {
          const day = stats.days[i];
          const isToday = day.date === todayStr;
          const isDimmed =
            selectedDayIndex != null && selectedDayIndex !== i;

          if (activeTab === "feeds") {
            return (
              <FeedBar
                key={i}
                day={day}
                val={val}
                maxVal={maxVal}
                isToday={isToday}
                accentColor={accentColor}
                dayIndex={i}
                onPress={() => handleBarPress(i)}
                isSelected={selectedDayIndex === i}
                isPeakDay={peakDayIndex === i}
                isDimmed={isDimmed}
              />
            );
          }

          if (activeTab === "diapers") {
            const diaperPeak = stats.diaperInsights.peakDayIndex;
            const diaperLow = stats.diaperInsights.lowActivityDayIndices;
            return (
              <DiaperBar
                key={i}
                day={day}
                val={val}
                maxVal={maxVal}
                isToday={isToday}
                accentColor={accentColor}
                dayIndex={i}
                onPress={() => handleBarPress(i)}
                isSelected={selectedDayIndex === i}
                isDimmed={isDimmed}
                isPeakDay={diaperPeak === i}
                isLowActivity={diaperLow.includes(i)}
              />
            );
          }

          return (
            <SleepBar
              key={i}
              day={day}
              val={val}
              maxVal={effectiveMax}
              isToday={isToday}
              accentColor={accentColor}
              dayIndex={i}
              onPress={() => handleBarPress(i)}
              isSelected={selectedDayIndex === i}
              isDimmed={isDimmed}
            />
          );
        })}
        </View>
      </View>
      {selectedDayIndex != null ? (
        <Animated.View style={{ opacity: detailOpacity }}>
          <BarDetailView
            day={stats.days[selectedDayIndex]}
            activeTab={activeTab}
            accentColor={accentColor}
            recommendedMin={recommendedMin}
            recommendedMax={recommendedMax}
            isPeakDay={
              (activeTab === "feeds" &&
                stats.feedInsights.peakDayIndex === selectedDayIndex) ||
              (activeTab === "diapers" &&
                stats.diaperInsights.peakDayIndex === selectedDayIndex)
            }
            isLowActivity={
              activeTab === "diapers" &&
              stats.diaperInsights.lowActivityDayIndices.includes(
                selectedDayIndex,
              )
            }
          />
        </Animated.View>
      ) : (
        <Text style={styles.barDetailHint}>Tap a bar for details</Text>
      )}
    </View>
  );
}
