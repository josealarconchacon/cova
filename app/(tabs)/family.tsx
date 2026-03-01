import React from "react";
import {
  View,
  Text,
  Share,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStore } from "../../store/useStore";
import { useFamilyData } from "../../lib/useFamilyData";
import { signOut } from "../../lib/auth/signOut";
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
  const {
    members,
    inviteCode,
    isLoading,
    isError,
    refetch,
  } = useFamilyData(profile?.family_id);

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

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut },
      ]
    );
  };

  const shareInvite = async () => {
    const link = `https://cova.app/join/${inviteCode}`;
    await Share.share({
      message: `Join me on Cova to track ${activeBaby?.name}'s journey together!\n\n${link}`,
      url: link,
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={Colors.teal} />
        <Text style={styles.loadingText}>Loading family…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <Text style={styles.errorTitle}>Could not load family data</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => refetch()}
          activeOpacity={0.85}
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            inviterName={profile?.display_name}
            onShare={shareInvite}
          />
        )}

        <TouchableOpacity
          onPress={() => router.push("/(settings)/privacy-policy")}
          style={styles.privacyRow}
          activeOpacity={0.7}
        >
          <Text style={styles.privacyText}>Privacy Policy</Text>
          <Text style={styles.privacyChevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutRow}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Cova v{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </Animated.ScrollView>
    </View>
  );
}
