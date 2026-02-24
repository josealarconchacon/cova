import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { DIAPER_COLORS, SLEEP_COLORS } from "../../lib/insights";
import type { Tab } from "../../lib/insights";

interface ChartLegendProps {
  activeTab: Tab;
  totalFeeds: number;
  totalDiapers: number;
  totalSleepHours: number;
}

export function ChartLegend({
  activeTab,
  totalFeeds,
  totalDiapers,
  totalSleepHours,
}: ChartLegendProps) {
  if (activeTab === "sleep" && totalSleepHours > 0) {
    return (
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: SLEEP_COLORS.night }]}
          />
          <Text style={styles.legendText}>Night</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: SLEEP_COLORS.nap }]}
          />
          <Text style={styles.legendText}>Nap</Text>
        </View>
      </View>
    );
  }

  if (activeTab === "feeds" && totalFeeds > 0) {
    return (
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.dusk }]} />
          <Text style={styles.legendText}>Nursing</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.dawn }]} />
          <Text style={styles.legendText}>Bottle</Text>
        </View>
      </View>
    );
  }

  if (activeTab === "diapers" && totalDiapers > 0) {
    return (
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.wet }]}
          />
          <Text style={styles.legendText}>Wet</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.dirty }]}
          />
          <Text style={styles.legendText}>Dirty</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: DIAPER_COLORS.both }]}
          />
          <Text style={styles.legendText}>Both</Text>
        </View>
      </View>
    );
  }

  return null;
}
