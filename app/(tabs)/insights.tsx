import React, { useState, useRef, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  RefreshControl,
  Share,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { captureRef } from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useStore } from "../../store/useStore";
import { useInsights } from "../../lib/useInsights";
import { useBabies } from "../../lib/useBabies";
import { TABS } from "../../lib/insights";
import {
  InsightsHeader,
  TabPills,
  WeekPickerOverlay,
  InsightsEmptyState,
  FeedsTabContent,
  SleepTabContent,
  DiapersTabContent,
} from "../../components/insights";
import { styles } from "./insights.styles";
import type { Tab } from "../../lib/insights";

function hasTabData(
  tab: Tab,
  currentWeekLogs: { type: string }[],
): boolean {
  const typeMap: Record<Tab, string> = {
    feeds: "feed",
    sleep: "sleep",
    diapers: "diaper",
  };
  return currentWeekLogs.some((l) => l.type === typeMap[tab]);
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const insightCardRef = useRef<View>(null);

  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPickerVisible, setWeekPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { profile, activeBaby, setActiveBaby } = useStore();
  const { babies } = useBabies(profile?.family_id);

  const {
    stats,
    insights,
    chartData,
    maxVal,
    weekRange,
    activeTab,
    setActiveTab,
    ribbonText,
    ribbonEmoji,
    currentWeekLogs,
    previousWeekLogs,
    refetch,
  } = useInsights(weekOffset);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleShare = useCallback(async () => {
    const view = insightCardRef.current;
    if (!view) return;
    try {
      const uri = await captureRef(view, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Share.share({
        url: Platform.OS === "ios" ? uri : `file://${uri}`,
        message: `${activeBaby?.name ?? "Baby"} — Weekly Insights (${weekRange})`,
        title: "Weekly Insights",
      });
    } catch (err) {
      // User cancelled or error
    }
  }, [activeBaby?.name, weekRange]);

  const showChildSwitcher = (babies?.length ?? 0) > 1;
  const isEmpty = !hasTabData(activeTab, currentWeekLogs);

  if (!activeBaby) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.cream,
        }}
      >
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop: insets.top + 24,
            paddingHorizontal: 20,
          },
        ]}
      >
        <InsightsHeader
          weekRange={weekRange}
          babyName={activeBaby.name}
          scrollY={scrollY}
          onDatePress={() => setWeekPickerVisible(true)}
          babies={babies}
          activeBaby={activeBaby}
          onSelectBaby={setActiveBaby}
          showChildSwitcher={showChildSwitcher}
          onShare={!isEmpty ? handleShare : undefined}
        />
      </View>

      <View style={styles.stickyTabBar}>
        <TabPills
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isEmpty && styles.contentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.teal}
          />
        }
      >
        {isEmpty ? (
          <InsightsEmptyState tab={activeTab} />
        ) : (
          <View ref={insightCardRef} collapsable={false}>
            {activeTab === "feeds" ? (
              <FeedsTabContent
                stats={stats}
                chartData={chartData}
                maxVal={maxVal}
                insights={insights}
                ribbonText={ribbonText}
                ribbonEmoji={ribbonEmoji}
                currentWeekLogs={currentWeekLogs}
                previousWeekLogs={previousWeekLogs}
                weekRange={weekRange}
                baby={activeBaby}
                scrollY={scrollY}
              />
            ) : activeTab === "sleep" ? (
              <SleepTabContent
                stats={stats}
                chartData={chartData}
                maxVal={maxVal}
                insights={insights}
                ribbonText={ribbonText}
                ribbonEmoji={ribbonEmoji}
                currentWeekLogs={currentWeekLogs}
                previousWeekLogs={previousWeekLogs}
                weekRange={weekRange}
                baby={activeBaby}
                scrollY={scrollY}
              />
            ) : (
              <DiapersTabContent
                stats={stats}
                chartData={chartData}
                maxVal={maxVal}
                insights={insights}
                ribbonText={ribbonText}
                ribbonEmoji={ribbonEmoji}
                currentWeekLogs={currentWeekLogs}
                previousWeekLogs={previousWeekLogs}
                weekRange={weekRange}
                baby={activeBaby}
                scrollY={scrollY}
              />
            )}
          </View>
        )}
      </Animated.ScrollView>

      <WeekPickerOverlay
        visible={weekPickerVisible}
        onClose={() => setWeekPickerVisible(false)}
        selectedOffset={weekOffset}
        onSelectWeek={(offset) => {
          setWeekOffset(offset);
          setWeekPickerVisible(false);
        }}
      />
    </View>
  );
}
