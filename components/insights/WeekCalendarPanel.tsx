import React, { useMemo, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { formatWeekRangeSunSatSpaced } from "../../lib/insights/formatUtils";
import { TABS } from "../../lib/insights";
import type { Tab } from "../../lib/insights";
import type { Log } from "../../types";

const PANEL_BG = "#F5F0EA";
const SELECTED_BG = "#F0E0D6";
const SELECTED_TEXT = "#A06050";
const ANIM_DURATION = 200;

function getWeekBounds(offset: number) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() - 7 * offset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

function getWeekActivity(allLogs: Log[], offset: number): Record<Tab, boolean> {
  const { weekStart, weekEnd } = getWeekBounds(offset);
  const startISO = weekStart.toISOString();
  const endISO = weekEnd.toISOString();
  const weekLogs = allLogs.filter(
    (l) => l.started_at >= startISO && l.started_at <= endISO,
  );
  return {
    feeds: weekLogs.some((l) => l.type === "feed"),
    sleep: weekLogs.some((l) => l.type === "sleep"),
    diapers: weekLogs.some((l) => l.type === "diaper"),
  };
}

interface WeekCalendarPanelProps {
  visible: boolean;
  onClose: () => void;
  selectedOffset: number;
  onSelectWeek: (offset: number) => void;
  allLogs: Log[];
}

export interface WeekCalendarPanelRef {
  close: () => void;
}

export const WeekCalendarPanel = forwardRef<
  WeekCalendarPanelRef,
  WeekCalendarPanelProps
>(function WeekCalendarPanel(
  { visible, onClose, selectedOffset, onSelectWeek, allLogs },
  ref,
) {
  const weeks = useMemo(
    () => Array.from({ length: 13 }, (_, i) => i),
    [],
  );
  const translateY = useSharedValue(-400);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: ANIM_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      translateY.value = -400;
    }
  }, [visible, translateY]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const runClose = () => {
    translateY.value = withTiming(
      -400,
      {
        duration: ANIM_DURATION,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  };

  const handleSelect = (offset: number) => {
    onSelectWeek(offset);
    runClose();
  };

  const handleBackdropPress = () => {
    runClose();
  };

  useImperativeHandle(ref, () => ({
    close: () => handleBackdropPress(),
  }));

  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.panel, panelAnimatedStyle]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {weeks.map((offset) => {
            const isSelected = selectedOffset === offset;
            const activity = getWeekActivity(allLogs, offset);
            const hasAnyData =
              activity.feeds || activity.sleep || activity.diapers;
            const label =
              offset === 0 ? "This week" : formatWeekRangeSunSatSpaced(offset);

            return (
              <Pressable
                key={offset}
                style={[
                  styles.row,
                  isSelected && styles.rowSelected,
                  offset === weeks.length - 1 && styles.rowLast,
                ]}
                onPress={() => handleSelect(offset)}
              >
                <Text
                  style={[
                    styles.rowLabel,
                    isSelected && styles.rowLabelSelected,
                    !hasAnyData && !isSelected && styles.rowLabelMuted,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <View style={styles.dots}>
                  {TABS.map((t) => {
                    const hasData =
                      t.id === "feeds"
                        ? activity.feeds
                        : t.id === "sleep"
                          ? activity.sleep
                          : activity.diapers;
                    if (!hasData) return null;
                    return (
                      <View
                        key={t.id}
                        style={[styles.dot, { backgroundColor: t.color }]}
                      />
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress} />
    </>
  );
});

const styles = StyleSheet.create({
  panel: {
    backgroundColor: PANEL_BG,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    maxHeight: 340,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  scroll: {
    maxHeight: 340,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  rowSelected: {
    backgroundColor: SELECTED_BG,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: "DM-Sans",
    fontSize: 15,
    fontWeight: "500",
    color: "#2A2018",
    flex: 1,
  },
  rowLabelSelected: {
    color: SELECTED_TEXT,
    fontWeight: "700",
  },
  rowLabelMuted: {
    color: "#9A8C7C",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backdrop: {
    flex: 1,
  },
});
