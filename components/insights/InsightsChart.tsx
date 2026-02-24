import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import {
  WEEK_DAYS,
  DIAPER_COLORS,
  SLEEP_COLORS,
  formatDayName,
} from "../../lib/insights";
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
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const nursingFrac = val > 0 ? day.nursingCount / val : 0;
  const bottleFrac = val > 0 ? day.bottleCount / val : 0;
  const hasBoth = day.nursingCount > 0 && day.bottleCount > 0;

  return (
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected]}
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
          isToday && { color: accentColor, fontWeight: "700" },
          isSelected && { color: accentColor, fontWeight: "700" },
        ]}
      >
        {WEEK_DAYS[dayIndex]}
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
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const wetFrac = val > 0 ? day.wetCount / val : 0;
  const dirtyFrac = val > 0 ? day.dirtyCount / val : 0;
  const bothFrac = val > 0 ? day.bothCount / val : 0;

  return (
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected]}
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
        {WEEK_DAYS[dayIndex]}
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
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
  onPress: () => void;
  isSelected: boolean;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const napFrac = val > 0 ? day.napHours / val : 0;
  const nightFrac = val > 0 ? day.nightHours / val : 0;
  const hasBoth = day.napHours > 0 && day.nightHours > 0;

  return (
    <Pressable
      style={[styles.barWrap, isSelected && styles.barWrapSelected]}
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
        {WEEK_DAYS[dayIndex]}
      </Text>
    </Pressable>
  );
}

function BarDetailView({
  day,
  activeTab,
  accentColor,
  aapMin,
  aapMax,
}: {
  day: DailyStats;
  activeTab: Tab;
  accentColor: string;
  aapMin: number;
  aapMax: number;
}) {
  const dayName = formatDayName(day.date);

  if (activeTab === "feeds") {
    const lines: string[] = [];
    if (day.nursingCount > 0) lines.push(`${day.nursingCount} nursing`);
    if (day.bottleCount > 0) lines.push(`${day.bottleCount} bottle`);
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
      </View>
    );
  }

  if (activeTab === "diapers") {
    const lines: string[] = [];
    if (day.wetCount > 0) lines.push(`${day.wetCount} wet`);
    if (day.dirtyCount > 0) lines.push(`${day.dirtyCount} dirty`);
    if (day.bothCount > 0) lines.push(`${day.bothCount} both`);
    const detail = lines.length > 0 ? lines.join(" · ") : "No changes";
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
      </View>
    );
  }

  const napStr = day.napHours > 0 ? `${day.napHours}h naps` : "";
  const nightStr = day.nightHours > 0 ? `${day.nightHours}h night` : "";
  const parts = [napStr, nightStr].filter(Boolean);
  const detail =
    parts.length > 0 ? parts.join(" · ") + ` — ${day.sleepHours}h total` : "No sleep";
  const meetsAap = day.sleepHours > 0 && day.sleepHours >= aapMin;
  const vsAap =
    day.sleepHours > 0
      ? meetsAap
        ? `Meets AAP (${aapMin}–${aapMax}h)`
        : `Below AAP target (${aapMin}–${aapMax}h)`
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
      {vsAap && (
        <Text
          style={[
            styles.barDetailSub,
            meetsAap ? { color: Colors.teal } : { color: Colors.inkLight },
          ]}
        >
          {vsAap}
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

  useEffect(() => {
    setSelectedDayIndex(null);
  }, [activeTab]);

  const isSleep = activeTab === "sleep";
  const aapMin = stats.sleepInsights.aapRecommendedMin;
  const aapMax = stats.sleepInsights.aapRecommendedMax;
  const effectiveMax = isSleep
    ? Math.max(maxVal, aapMax * 1.15)
    : maxVal;
  const aapLinePct =
    isSleep && effectiveMax > 0
      ? Math.min(95, Math.max(5, (aapMin / effectiveMax) * 100))
      : null;

  const handleBarPress = (index: number) => {
    setSelectedDayIndex((prev) => (prev === index ? null : index));
  };

  return (
    <View>
      <View style={styles.chartArea}>
        {[0.25, 0.5, 0.75].map((frac) => (
          <View
            key={frac}
            style={[styles.gridLine, { bottom: `${frac * 100}%` }]}
          />
        ))}
        {aapLinePct != null && (
          <View
            style={[styles.referenceLine, { bottom: `${aapLinePct}%` }]}
          >
            <Text style={styles.referenceLineLabel}>
              AAP {aapMin}–{aapMax}h
            </Text>
            <View style={styles.referenceLineTrack} />
          </View>
        )}
        <View style={styles.barsRow}>
        {chartData.map((val: number, i: number) => {
          const isToday = i === 6;
          const day = stats.days[i];

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
              />
            );
          }

          if (activeTab === "diapers") {
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
            />
          );
        })}
        </View>
      </View>
      {selectedDayIndex != null ? (
        <BarDetailView
          day={stats.days[selectedDayIndex]}
          activeTab={activeTab}
          accentColor={accentColor}
          aapMin={aapMin}
          aapMax={aapMax}
        />
      ) : (
        <Text style={styles.barDetailHint}>Tap a bar for details</Text>
      )}
    </View>
  );
}
