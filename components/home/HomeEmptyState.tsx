import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../app/(tabs)/index.styles";

export function HomeEmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🌱</Text>
      <Text style={styles.emptyTitle}>No entries yet</Text>
      <Text style={styles.emptyBody}>Tap an action above to get started</Text>
    </View>
  );
}
