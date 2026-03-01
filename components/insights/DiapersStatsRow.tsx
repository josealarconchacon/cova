import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import type { WeekDiaperPoint } from "../../lib/useDiapersSparklineData";

const DIAPER_ACCENT = "#8B5E3C";

interface DiapersStatsRowProps {
  wetTotal: number;
  dirtyTotal: number;
  wowPct: number | null;
  sparklineData: WeekDiaperPoint[];
  avgWetPerDay: number;
  avgDirtyPerDay: number;
}

function MiniSparkline({
  data,
  valueKey,
  color,
}: {
  data: WeekDiaperPoint[];
  valueKey: "wetTotal" | "dirtyTotal" | "total";
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

  const isHealthyIncrease = wowPct > 0;
  const isStable = wowPct >= -20 && wowPct <= 20;
  const isSignificantDrop = wowPct < -20;
  const badgeColor = isHealthyIncrease
    ? Colors.teal
    : isStable
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

export function DiapersStatsRow({
  wetTotal,
  dirtyTotal,
  wowPct,
  sparklineData,
  avgWetPerDay,
  avgDirtyPerDay,
}: DiapersStatsRowProps) {
  return (
    <View>
      <View style={styles.feedsStatsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.feedsStatPill,
            pressed && { opacity: 0.8 },
          ]}
          hitSlop={8}
        >
          <Text style={[styles.feedsStatPillValue, { color: DIAPER_ACCENT }]}>
            {wetTotal}
          </Text>
          <Text style={styles.feedsStatPillLabel}>Wet</Text>
          <MiniSparkline
            data={sparklineData}
            valueKey="wetTotal"
            color="#F5D76E"
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
          <Text style={[styles.feedsStatPillValue, { color: DIAPER_ACCENT }]}>
            {dirtyTotal}
          </Text>
          <Text style={styles.feedsStatPillLabel}>Dirty</Text>
          <MiniSparkline
            data={sparklineData}
            valueKey="dirtyTotal"
            color={DIAPER_ACCENT}
          />
        </Pressable>

        <View style={styles.feedsStatDivider} />

        <View style={[styles.feedsStatPill, { justifyContent: "center" }]}>
          <WowBadge wowPct={wowPct} />
        </View>
      </View>
      <Text
        style={{
          fontFamily: "DM-Sans",
          fontSize: 11,
          color: Colors.inkLight,
          textAlign: "center",
          marginTop: -8,
          marginBottom: 12,
        }}
      >
        Daily avg: {avgWetPerDay.toFixed(1)} wet · {avgDirtyPerDay.toFixed(1)}{" "}
        dirty
      </Text>
    </View>
  );
}
