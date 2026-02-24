import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../app/(tabs)/insights.styles";
import type { Tab } from "../../lib/insights";

interface TabConfig {
  id: Tab;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  color: string;
}

interface TabPillsProps {
  tabs: TabConfig[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function TabPills({ tabs, activeTab, onTabChange }: TabPillsProps) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((t) => {
        const active = activeTab === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.tab,
              active && {
                backgroundColor: t.color,
                shadowColor: t.color,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                elevation: 5,
              },
            ]}
            onPress={() => onTabChange(t.id)}
            activeOpacity={0.8}
          >
            <t.Icon size={16} color={active ? "#fff" : t.color} />
            <Text style={[styles.tabText, active && { color: "#fff" }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
