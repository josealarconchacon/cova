import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";
import type { InsightCard as InsightCardType } from "../../lib/insights";

interface InsightCardProps {
  item: InsightCardType;
}

export function InsightCard({ item }: InsightCardProps) {
  return (
    <View
      style={[styles.insightCard, { borderLeftColor: item.color }]}
    >
      <View style={styles.insightHeader}>
        <View
          style={[
            styles.insightIcon,
            { backgroundColor: item.color + "15" },
          ]}
        >
          {item.IconComponent ? (
            <item.IconComponent size={20} color={item.color} />
          ) : (
            <Text style={{ fontSize: 16 }}>{item.icon}</Text>
          )}
        </View>
        <Text style={styles.insightTitle}>{item.title}</Text>
      </View>
      <Text style={styles.insightText}>{item.text}</Text>
    </View>
  );
}
