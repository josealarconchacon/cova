import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SharedValue } from "react-native-reanimated";
import type { Baby } from "../../types";
import { calcAge } from "../../lib/babyUtils";
import { styles } from "../../app/(tabs)/baby.styles";

const SCROLL_RANGE = 100;

interface BabyHeroProps {
  baby: Baby;
  onEdit: () => void;
  scrollY?: SharedValue<number>;
}

export function BabyHero({ baby, onEdit, scrollY }: BabyHeroProps) {
  const insets = useSafeAreaInsets();

  const heroAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      paddingBottom: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [28, 14],
        Extrapolation.CLAMP
      ),
      shadowColor: "#000",
      shadowOpacity: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [0.04, 0.08],
        Extrapolation.CLAMP
      ),
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [2, 4],
        Extrapolation.CLAMP
      ),
    };
  }, [scrollY]);

  const ageAnimatedStyle = useAnimatedStyle(() => {
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

  const nameAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [1, 0.92],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  }, [scrollY]);

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [1, 0.85],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  }, [scrollY]);

  return (
    <Animated.View
      style={[
        styles.hero,
        { paddingTop: insets.top + 24 },
        heroAnimatedStyle,
      ]}
    >
      <View style={styles.heroInner}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <Animated.View style={avatarAnimatedStyle}>
            <View style={styles.avatarRing}>
              {baby.photo_url ? (
                <Image
                  key={baby.photo_url}
                  source={{ uri: baby.photo_url, cache: "reload" }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={{ fontSize: 36 }}>🌙</Text>
                </View>
              )}
            </View>
          </Animated.View>
          <View style={styles.editBadge}>
            <Text style={{ fontSize: 11 }}>✏️</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.heroText}>
          <Animated.Text
            style={[styles.heroName, nameAnimatedStyle]}
            numberOfLines={1}
          >
            {baby.name}
          </Animated.Text>
          <Animated.Text style={[styles.heroAge, ageAnimatedStyle]}>
            {calcAge(baby)}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}
