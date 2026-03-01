import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import type { Baby } from "../../types";

const SCROLL_FADE = 40;

interface InsightsHeaderProps {
  weekRange: string;
  babyName: string;
  scrollY?: SharedValue<number>;
  onDatePress?: () => void;
  babies?: Baby[];
  activeBaby?: Baby | null;
  onSelectBaby?: (baby: Baby) => void;
  showChildSwitcher?: boolean;
  onShare?: () => void;
}

export function InsightsHeader({
  weekRange,
  babyName,
  scrollY,
  onDatePress,
  babies = [],
  activeBaby,
  onSelectBaby,
  showChildSwitcher = false,
  onShare,
}: InsightsHeaderProps) {
  const [childDropdownVisible, setChildDropdownVisible] = useState(false);

  const titleOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(
        scrollY.value,
        [0, SCROLL_FADE],
        [1, 0],
        Extrapolation.CLAMP,
      ),
    };
  }, [scrollY]);

  const collapsedOpacity = useAnimatedStyle(() => {
    if (!scrollY) return {};
    return {
      opacity: interpolate(
        scrollY.value,
        [0, SCROLL_FADE],
        [0, 1],
        Extrapolation.CLAMP,
      ),
    };
  }, [scrollY]);

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  const handleChildPress = () => {
    if (showChildSwitcher) {
      setChildDropdownVisible(true);
    }
  };

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Animated.Text style={[styles.title, titleOpacity]}>
            Weekly Insights
          </Animated.Text>
          <Animated.View style={[styles.subtitleRow, titleOpacity]}>
            <Pressable
              onPress={onDatePress}
              style={styles.datePill}
              hitSlop={8}
            >
              <Text style={styles.subtitle}>{weekRange}</Text>
            </Pressable>
            <Text style={styles.subtitleDot}>·</Text>
            <Pressable
              onPress={handleChildPress}
              style={[
                styles.childPill,
                !showChildSwitcher && styles.childPillStatic,
              ]}
              hitSlop={8}
              disabled={!showChildSwitcher}
            >
              <Text style={styles.subtitle}>{babyName}</Text>
            </Pressable>
          </Animated.View>
          <Animated.View
            style={[styles.collapsedBar, collapsedOpacity]}
            pointerEvents="none"
          >
            <Text style={styles.collapsedText}>
              {weekRange} · {babyName}
            </Text>
          </Animated.View>
        </View>
        {onShare && (
          <Pressable
            onPress={handleShare}
            style={styles.shareBtn}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={22} color={Colors.inkLight} />
          </Pressable>
        )}
      </View>

      <Modal
        visible={childDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChildDropdownVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setChildDropdownVisible(false)}
        >
          <View style={childStyles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={childStyles.panel}>
                {babies.map((b) => (
                  <Pressable
                    key={b.id}
                    style={[
                      childStyles.option,
                      activeBaby?.id === b.id && childStyles.optionSelected,
                    ]}
                    onPress={() => {
                      onSelectBaby?.(b);
                      setChildDropdownVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        childStyles.optionText,
                        activeBaby?.id === b.id && childStyles.optionTextSelected,
                      ]}
                    >
                      {b.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 32,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  datePill: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 4,
  },
  childPill: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 4,
  },
  childPillStatic: {
    opacity: 1,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
  },
  subtitleDot: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginHorizontal: 4,
  },
  collapsedBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
  },
  collapsedText: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
  },
  shareBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});

const childStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    paddingTop: 120,
    paddingHorizontal: 20,
  },
  panel: {
    backgroundColor: Colors.cream,
    borderRadius: 16,
    padding: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  optionSelected: {
    backgroundColor: Colors.tealPale,
  },
  optionText: {
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: Colors.teal,
    fontWeight: "700",
  },
});
