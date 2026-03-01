import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";

interface WeeklyProgressRibbonProps {
  text: string;
  emoji: string;
  activeTab: string;
}

export function WeeklyProgressRibbon({
  text,
  emoji,
  activeTab,
}: WeeklyProgressRibbonProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [activeTab, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.progressRibbon, animatedStyle]}>
      <Text style={styles.progressRibbonText} numberOfLines={2}>
        <Text style={{ fontWeight: "700", color: Colors.ink }}>
          {text}
        </Text>
        {emoji ? ` ${emoji}` : ""}
      </Text>
    </Animated.View>
  );
}
