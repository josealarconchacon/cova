import React from "react";
import { View, Text, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import { getGreeting, formatBabyAge } from "../../lib/home/formatUtils";
import type { Baby, Profile } from "../../types";
import { styles } from "../../app/(tabs)/index.styles";

const SCROLL_RANGE = 100;

interface HomeHeaderProps {
  profile: Profile | null;
  activeBaby: Baby;
  coParent: Profile | undefined;
  isCoParentOnline: (userId: string) => boolean;
  scrollY?: SharedValue<number>;
}

export function HomeHeader({
  profile,
  activeBaby,
  coParent,
  isCoParentOnline,
  scrollY,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      paddingBottom: interpolate(
        scrollY.value,
        [0, SCROLL_RANGE],
        [16, 8],
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

  const greetingAnimatedStyle = useAnimatedStyle(() => {
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

  return (
    <Animated.View
      style={[
        styles.header,
        { paddingTop: insets.top + 24 },
        headerAnimatedStyle,
      ]}
    >
      <View>
        <Animated.Text style={[styles.greeting, greetingAnimatedStyle]}>
          {getGreeting()}, {profile?.display_name} 👋
        </Animated.Text>
        <Animated.View style={nameAnimatedStyle}>
          <Text style={styles.babyName}>{activeBaby.name}</Text>
          <Text style={styles.babyAge}>{formatBabyAge(activeBaby)}</Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.avatarWrap, avatarAnimatedStyle]}>
        {activeBaby.photo_url ? (
          <Image
            key={activeBaby.photo_url}
            source={{ uri: activeBaby.photo_url, cache: "reload" }}
            style={styles.avatarImg}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 24 }}>🌙</Text>
          </View>
        )}
        <View
          style={[
            styles.syncDot,
            {
              backgroundColor:
                coParent && isCoParentOnline(coParent.id)
                  ? Colors.moss
                  : Colors.sandDark,
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}
