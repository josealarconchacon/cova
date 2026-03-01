import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeekSleepPoint } from "../../lib/useSleepSparklineData";

const SLEEP_ACCENT = "#2C3E6B";

interface SleepStatsRowProps {
  totalSleepHours: number;
  napCount: number;
  wowPct: number | null;
  sparklineData: WeekSleepPoint[];
  recommendedMin: number;
  recommendedMax: number;
}

function MiniSparkline({
  data,
  valueKey,
  color,
}: {
  data: WeekSleepPoint[];
  valueKey: "totalHours" | "napCount";
  color: string;
}) {
  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values, 1);
  const w = 48;
  const h = 16;
  const padding = 2;

  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1 || 1)) * (w - padding * 2);
      const y = h - padding - (v / max) * (h - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={w} height={h} style={{ marginTop: 4 }}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function WowBadge({ wowPct }: { wowPct: number | null }) {
  if (wowPct == null) {
    return (
      <View style={styles.feedsWowBadge}>
        <Text style={[styles.feedsWowBadgeText, { color: Colors.inkLight }]}>
          — vs last week
        </Text>
      </View>
    );
  }

  const isMore = wowPct > 0;
  const isWithin10 = wowPct >= -10 && wowPct <= 10;
  const isLess = wowPct < -10;
  const badgeColor = isMore
    ? Colors.teal
    : isWithin10
      ? Colors.gold
      : Colors.error;

  return (
    <View
      style={[styles.feedsWowBadge, { backgroundColor: badgeColor + "15" }]}
    >
      <Text style={[styles.feedsWowBadgeText, { color: badgeColor }]}>
        {wowPct > 0 ? "+" : ""}
        {wowPct}% vs last week
      </Text>
    </View>
  );
}

export function SleepStatsRow({
  totalSleepHours,
  napCount,
  wowPct,
  sparklineData,
  recommendedMin,
  recommendedMax,
}: SleepStatsRowProps) {
  return (
    <View style={styles.feedsStatsRow}>
      <Pressable
        style={({ pressed }) => [
          styles.feedsStatPill,
          pressed && { opacity: 0.8 },
        ]}
        hitSlop={8}
      >
        <Text style={[styles.feedsStatPillValue, { color: SLEEP_ACCENT }]}>
          {totalSleepHours.toFixed(1)}
        </Text>
        <Text style={styles.feedsStatPillLabel}>Total Hours</Text>
        <Text
          style={{
            fontFamily: "DM-Sans",
            fontSize: 9,
            color: Colors.inkLight,
            marginTop: 2,
          }}
        >
          Rec. {recommendedMin}–{recommendedMax}h
        </Text>
        <MiniSparkline
          data={sparklineData}
          valueKey="totalHours"
          color={SLEEP_ACCENT}
        />
      </Pressable>

      <View style={styles.feedsStatDivider} />

      <Pressable
        style={({ pressed }) => [
          styles.feedsStatPill,
          pressed && { opacity: 0.8 },
        ]}
        hitSlop={8}
      >
        <Text style={[styles.feedsStatPillValue, { color: SLEEP_ACCENT }]}>
          {napCount}
        </Text>
        <Text style={styles.feedsStatPillLabel}>Nap Count</Text>
        <MiniSparkline
          data={sparklineData}
          valueKey="napCount"
          color={Colors.lav}
        />
      </Pressable>

      <View style={styles.feedsStatDivider} />

      <View style={[styles.feedsStatPill, { justifyContent: "center" }]}>
        <WowBadge wowPct={wowPct} />
      </View>
    </View>
  );
}
