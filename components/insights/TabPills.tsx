import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { styles } from "../../app/(tabs)/insights.styles";
import { Colors } from "../../constants/theme";
import type { Tab } from "../../lib/insights";

const ICON_SIZE = 18;
const ACTIVE_PILL_COLOR = "#A06050";
const ANIM_DURATION = 150;

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

function TabPill({
  tab,
  active,
  onPress,
}: {
  tab: TabConfig;
  active: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, {
      duration: ANIM_DURATION,
    });
  }, [active, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["transparent", ACTIVE_PILL_COLOR],
    ),
  }));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        pressed && { opacity: 0.9 },
      ]}
    >
      <Animated.View style={[styles.tabPill, animatedStyle]}>
        <tab.Icon
          size={ICON_SIZE}
          color={active ? "#fff" : Colors.inkLight}
        />
        <Text
          style={[
            styles.tabText,
            active ? { color: "#fff", fontWeight: "700" } : { color: Colors.inkMid },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function TabPills({ tabs, activeTab, onTabChange }: TabPillsProps) {
  return (
    <View style={wrapperStyle}>
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TabPill
            key={t.id}
            tab={t}
            active={activeTab === t.id}
            onPress={() => onTabChange(t.id)}
          />
        ))}
      </View>
    </View>
  );
}

const wrapperStyle = {
  flexDirection: "row" as const,
  width: "100%" as const,
};
