import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { WEEK_DAYS, DIAPER_COLORS } from "../../lib/insights";
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
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const nursingFrac = val > 0 ? day.nursingCount / val : 0;
  const bottleFrac = val > 0 ? day.bottleCount / val : 0;
  const hasBoth = day.nursingCount > 0 && day.bottleCount > 0;

  return (
    <View style={styles.barWrap}>
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
        ]}
      >
        {WEEK_DAYS[dayIndex]}
      </Text>
    </View>
  );
}

function DiaperBar({
  day,
  val,
  maxVal,
  isToday,
  accentColor,
  dayIndex,
}: {
  day: DailyStats;
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
}) {
  const pct = (val / maxVal) * 100;
  const totalPct = Math.max(pct, 4);
  const wetFrac = val > 0 ? day.wetCount / val : 0;
  const dirtyFrac = val > 0 ? day.dirtyCount / val : 0;
  const bothFrac = val > 0 ? day.bothCount / val : 0;

  return (
    <View style={styles.barWrap}>
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
        ]}
      >
        {WEEK_DAYS[dayIndex]}
      </Text>
    </View>
  );
}

function SleepBar({
  val,
  maxVal,
  isToday,
  accentColor,
  dayIndex,
}: {
  val: number;
  maxVal: number;
  isToday: boolean;
  accentColor: string;
  dayIndex: number;
}) {
  const pct = (val / maxVal) * 100;

  return (
    <View style={styles.barWrap}>
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
          style={[
            styles.bar,
            {
              height: `${Math.max(pct, 4)}%`,
              backgroundColor: isToday
                ? accentColor
                : accentColor + "40",
              borderRadius: 8,
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.dayLabel,
          isToday && { color: accentColor, fontWeight: "700" },
        ]}
      >
        {WEEK_DAYS[dayIndex]}
      </Text>
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
  return (
    <View style={styles.chartArea}>
      {[0.25, 0.5, 0.75].map((frac) => (
        <View
          key={frac}
          style={[styles.gridLine, { bottom: `${frac * 100}%` }]}
        />
      ))}
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
              />
            );
          }

          return (
            <SleepBar
              key={i}
              val={val}
              maxVal={maxVal}
              isToday={isToday}
              accentColor={accentColor}
              dayIndex={i}
            />
          );
        })}
      </View>
    </View>
  );
}
