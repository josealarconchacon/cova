import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  UIManager,
} from "react-native";
import { Colors } from "../../constants/theme";
import { useStore } from "../../store/useStore";
import { useHomeLogs } from "../../lib/useHomeLogs";
import { QuickActions } from "../../components/logs/QuickActions";
import { TimerBar } from "../../components/logs/TimerBar";
import { SummaryCards } from "../../components/logs/SummaryCards";
import { EditLogModal } from "../../components/logs/EditLogModal";
import type { EditPayload } from "../../components/logs/EditLogModal";
import { DaySection } from "../../components/logs/DaySection";
import { HomeHeader, HomeEmptyState } from "../../components/home";
import { styles } from "./index.styles";
import { toLocalDateKey } from "../../lib/home/dateUtils";
import type { Log } from "../../types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const { profile, activeBaby, activeLog } = useStore();
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<Log | null>(null);

  const {
    allLogs,
    todayLogs,
    dayGroups,
    isLoading,
    refetch,
    coParent,
    isCoParentOnline,
    scrollRef,
    startTimer,
    stopTimer,
    logBottleFeed,
    logSleep,
    logInstant,
    handleDelete,
    handleSaveEdit,
  } = useHomeLogs();

  const today = toLocalDateKey(new Date());

  const onSaveEdit = async (payload: EditPayload) => {
    if (!editingLog) return;
    await handleSaveEdit(editingLog.id, payload);
    setEditingLog(null);
  };

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
      <HomeHeader
        profile={profile}
        activeBaby={activeBaby}
        coParent={coParent}
        isCoParentOnline={isCoParentOnline}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.teal}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <SummaryCards logs={todayLogs} />

        {activeLog && <TimerBar activeLog={activeLog} onStop={stopTimer} />}

        <QuickActions
          activeTimerType={activeLog?.type ?? null}
          onTimerAction={startTimer}
          onInstantLog={logInstant}
          onFeedLog={logBottleFeed}
          onSleepLog={logSleep}
        />

        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Journal</Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDotSmall} />
            <Text style={styles.syncText}>Synced</Text>
          </View>
        </View>

        {dayGroups.map((day) => (
          <DaySection
            key={day.key}
            day={day}
            defaultExpanded={day.key === today}
            swipeOpenId={swipeOpenId}
            onSwipeOpen={setSwipeOpenId}
            onSwipeClose={() => setSwipeOpenId(null)}
            onEdit={setEditingLog}
            onDelete={handleDelete}
          />
        ))}

        {allLogs.length === 0 && !isLoading && <HomeEmptyState />}
      </ScrollView>

      {editingLog && (
        <EditLogModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={onSaveEdit}
        />
      )}
    </View>
  );
}
