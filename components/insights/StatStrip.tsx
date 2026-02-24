import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";
import type { StatItem } from "../../lib/useInsights";

interface StatStripProps {
  items: StatItem[];
  accentColor: string;
}

export function StatStrip({ items, accentColor }: StatStripProps) {
  return (
    <View style={styles.statStrip}>
      {items.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={styles.statItem}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {s.value}
              </Text>
              <Text style={[styles.statSuffix, { color: accentColor }]}>
                {s.suffix}
              </Text>
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
          {i < items.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}
