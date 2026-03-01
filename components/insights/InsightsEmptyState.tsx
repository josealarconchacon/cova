import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";
import { TABS } from "../../lib/insights";
import type { Tab } from "../../lib/insights";

const ICON_SIZE = 48;
const ICON_OPACITY = 0.4;

const TAB_TITLES: Record<Tab, string> = {
  feeds: "No Feeds this week",
  sleep: "No Sleep this week",
  diapers: "No Diapers this week",
};

interface InsightsEmptyStateProps {
  tab: Tab;
}

export function InsightsEmptyState({ tab }: InsightsEmptyStateProps) {
  const tabConfig = TABS.find((t) => t.id === tab);
  const Icon = tabConfig?.Icon;

  if (!Icon) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Icon size={ICON_SIZE} color={Colors.inkMid} />
        </View>
        <Text style={styles.title}>{TAB_TITLES[tab]}</Text>
        <Text style={styles.subtitle}>
          Start logging to see your weekly insights
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  card: {
    backgroundColor: Colors.sand,
    borderRadius: 22,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    opacity: ICON_OPACITY,
    marginBottom: 12,
  },
  title: {
    fontFamily: "DM-Sans",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.inkMid,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "400",
    color: Colors.inkLight,
    textAlign: "center",
  },
});
