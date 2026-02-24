import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";

interface InsightsHeaderProps {
  weekRange: string;
  babyName: string;
}

export function InsightsHeader({ weekRange, babyName }: InsightsHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Weekly Insights</Text>
        <Text style={styles.subtitle}>
          {weekRange} · {babyName}
        </Text>
      </View>
    </View>
  );
}
