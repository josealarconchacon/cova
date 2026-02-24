import React from "react";
import { View, Text, Share } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../store/useStore";
import { useFamilyData } from "../../lib/useFamilyData";
import { ConnectedView, InviteView } from "../../components/family";
import { Colors } from "../../constants/theme";
import { styles } from "./family.styles";

const SCROLL_RANGE = 100;

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });
  const { profile, activeBaby } = useStore();
  const { members, inviteCode } = useFamilyData(profile?.family_id);

  const hasCoParent = members.length > 1;

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    marginBottom: interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [28, 14],
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
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, SCROLL_RANGE * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_RANGE],
      [1, 0.92],
      Extrapolation.CLAMP
    );
    return { transform: [{ scale }] };
  });

  const shareInvite = async () => {
    const link = `https://cova.app/join/${inviteCode}`;
    await Share.share({
      message: `Join me on Cova to track ${activeBaby?.name}'s journey together!\n\n${link}`,
      url: link,
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: insets.top + 24,
          paddingHorizontal: 24,
          backgroundColor: Colors.cream,
        }}
      >
        <Animated.View style={headerAnimatedStyle}>
          <Animated.Text style={[styles.title, titleAnimatedStyle]}>
            Family
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
            {hasCoParent
              ? `${members.length} members connected`
              : "Invite your co-parent to share the journal"}
          </Animated.Text>
        </Animated.View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {hasCoParent ? (
          <ConnectedView members={members} />
        ) : (
          <InviteView
            inviteCode={inviteCode}
            babyName={activeBaby?.name ?? "your baby"}
            onShare={shareInvite}
          />
        )}
      </Animated.ScrollView>
    </View>
  );
}
