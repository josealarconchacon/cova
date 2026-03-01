import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";
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
        <View style={{ flex: 1 }}>
          <Text style={styles.insightTitle}>{item.title}</Text>
          {item.scoreBar != null && (
            <Text
              style={[
                styles.insightTitle,
                {
                  fontSize: 28,
                  marginTop: 4,
                  color: item.color,
                },
              ]}
            >
              {item.scoreBar.score}
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.insightText}>{item.text}</Text>
      {item.scoreBar != null && (
        <View style={styles.balanceBarTrack}>
          <View
            style={[
              styles.balanceBarLeft,
              {
                flex: item.scoreBar.score / item.scoreBar.maxScore,
                backgroundColor: item.color + "60",
              },
            ]}
          />
          <View
            style={[
              styles.balanceBarRight,
              {
                flex:
                  (item.scoreBar.maxScore - item.scoreBar.score) /
                  item.scoreBar.maxScore,
                backgroundColor: Colors.sandDark + "40",
              },
            ]}
          />
        </View>
      )}
      {item.balanceBar != null && item.scoreBar == null && (
        <View style={styles.balanceBarTrack}>
          <View
            style={[
              styles.balanceBarLeft,
              {
                flex: item.balanceBar.leftPct / 100,
                backgroundColor: item.color + "40",
              },
            ]}
          />
          <View
            style={[
              styles.balanceBarRight,
              {
                flex: item.balanceBar.rightPct / 100,
                backgroundColor: item.color + "80",
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}
