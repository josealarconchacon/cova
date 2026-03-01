import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeekSparklinePoint } from "../../lib/useFeedsSparklineData";

interface FeedsStatsRowProps {
  nursingTotal: number;
  bottleTotal: number;
  wowPct: number | null;
  sparklineData: WeekSparklinePoint[];
  accentColor: string;
}

function MiniSparkline({
  data,
  valueKey,
  color,
}: {
  data: WeekSparklinePoint[];
  valueKey: "nursing" | "bottle" | "total";
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

  const isPositive = wowPct > 0;
  const isSignificantDrop = wowPct < -20;
  const badgeColor = isPositive
    ? Colors.teal
    : isSignificantDrop
      ? Colors.error
      : Colors.inkLight;

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

export function FeedsStatsRow({
  nursingTotal,
  bottleTotal,
  wowPct,
  sparklineData,
  accentColor,
}: FeedsStatsRowProps) {
  return (
    <View style={styles.feedsStatsRow}>
      <Pressable
        style={({ pressed }) => [
          styles.feedsStatPill,
          pressed && { opacity: 0.8 },
        ]}
        hitSlop={8}
      >
        <Text style={[styles.feedsStatPillValue, { color: accentColor }]}>
          {nursingTotal}
        </Text>
        <Text style={styles.feedsStatPillLabel}>Nursing</Text>
        <MiniSparkline
          data={sparklineData}
          valueKey="nursing"
          color={Colors.dusk}
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
        <Text style={[styles.feedsStatPillValue, { color: accentColor }]}>
          {bottleTotal}
        </Text>
        <Text style={styles.feedsStatPillLabel}>Bottle</Text>
        <MiniSparkline
          data={sparklineData}
          valueKey="bottle"
          color={Colors.dawn}
        />
      </Pressable>

      <View style={styles.feedsStatDivider} />

      <View style={[styles.feedsStatPill, { justifyContent: "center" }]}>
        <WowBadge wowPct={wowPct} />
      </View>
    </View>
  );
}
