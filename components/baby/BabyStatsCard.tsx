import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";
import type { BabyStats } from "../../lib/useBabyData";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
  MomentIcon,
} from "../../assets/icons/QuickActionIcons";
import { styles } from "../../app/(tabs)/baby.styles";

interface BabyStatsCardProps {
  stats: BabyStats | undefined;
  milestoneCount: number;
}

const STAT_ITEMS = [
  {
    Icon: FeedIcon,
    label: "Total feeds",
    getValue: (stats: BabyStats | undefined) => stats?.feed.toLocaleString() ?? "—",
    color: Colors.dusk,
  },
  {
    Icon: SleepIcon,
    label: "Total sleep",
    getValue: () => "—",
    color: Colors.sky,
  },
  {
    Icon: DiaperIcon,
    label: "Diaper changes",
    getValue: (stats: BabyStats | undefined) => stats?.diaper.toLocaleString() ?? "—",
    color: Colors.moss,
  },
  {
    Icon: MomentIcon,
    label: "Milestones",
    getValue: (_: BabyStats | undefined, count: number) => count.toString(),
    color: Colors.gold,
  },
] as const;

export function BabyStatsCard({ stats, milestoneCount }: BabyStatsCardProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>All-time stats</Text>
      <View style={styles.statsCard}>
        {STAT_ITEMS.map((s, i, arr) => (
          <View
            key={s.label}
            style={[styles.statRow, i < arr.length - 1 && styles.statRowBorder]}
          >
            <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
              <s.Icon size={20} color={s.color} />
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.getValue(stats, milestoneCount)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
