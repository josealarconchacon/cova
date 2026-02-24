import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { styles } from "../../app/(tabs)/insights.styles";

const SCROLL_RANGE = 100;

interface InsightsHeaderProps {
  weekRange: string;
  babyName: string;
  scrollY?: SharedValue<number>;
}

export function InsightsHeader({
  weekRange,
  babyName,
  scrollY,
}: InsightsHeaderProps) {
  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      marginBottom: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [24, 12],
        Extrapolation.CLAMP
      ),
      shadowColor: "#000",
      shadowOpacity: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [0, 0.06],
        Extrapolation.CLAMP
      ),
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [0, 2],
        Extrapolation.CLAMP
      ),
    };
  }, [scrollY]);

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE * 0.6],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  }, [scrollY]);

  const titleAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [1, 0.92],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  }, [scrollY]);

  return (
    <Animated.View style={[styles.headerRow, headerAnimatedStyle]}>
      <View style={{ flex: 1 }}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Weekly Insights
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          {weekRange} · {babyName}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}
