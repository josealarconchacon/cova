import { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeSync } from "../../lib/useRealtimeSync";
import { usePresence } from "../../lib/usePresence";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Log, Profile } from "../../types";

import { QuickActions } from "../../components/logs/QuickActions";
import type { BottleFeedData, SleepLogData } from "../../components/logs/QuickActions";
import { TimerBar } from "../../components/logs/TimerBar";
import { TimelineItem } from "../../components/logs/TimelineItem";
import { SummaryCards } from "../../components/logs/SummaryCards";
import { EditLogModal } from "../../components/logs/EditLogModal";
import type { EditPayload } from "../../components/logs/EditLogModal";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Day helpers ──────────────────────────────────────────────────────────────

const DAYS_TO_FETCH = 30;

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayLabel(dateKey: string): string {
  const d = new Date(dateKey + "T12:00:00");
  const now = new Date();
  const todayKey = toLocalDateKey(now);

  if (dateKey === todayKey) return "Today";

  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (dateKey === toLocalDateKey(y)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

interface DayGroup {
  key: string;
  label: string;
  logs: Log[];
}

function groupLogsByDay(logs: Log[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const log of logs) {
    const key = toLocalDateKey(new Date(log.started_at));
    if (!groups.has(key)) {
      groups.set(key, { key, label: dayLabel(key), logs: [] });
    }
    groups.get(key)!.logs.push(log);
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.key.localeCompare(a.key),
  );
}

export default function HomeScreen() {
  const { profile, activeBaby, activeLog, setActiveLog } = useStore();
  const queryClient = useQueryClient();
  const scrollRef   = useRef<ScrollView>(null);

  // ── CRUD state ──────────────────────────────────────────────────────────
  const [swipeOpenId, setSwipeOpenId] = useState<string | null>(null);
  const [editingLog,  setEditingLog]  = useState<Log | null>(null);

  const today = toLocalDateKey(new Date());

  const sinceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - DAYS_TO_FETCH);
    return toLocalDateKey(d);
  }, []);

  const logsQueryKey = useMemo(
    () => ["logs", activeBaby?.id, sinceDate],
    [activeBaby?.id, sinceDate],
  );

  // ── Fetch recent logs ───────────────────────────────────────────
  const {
    data: allLogs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: logsQueryKey,
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select(
          `
          *,
          profile:profiles(display_name, role)
        `,
        )
        .eq("baby_id", activeBaby!.id)
        .gte("started_at", sinceDate + "T00:00:00")
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as Log[];
    },
  });

  const todayLogs = useMemo(
    () => allLogs.filter((l) => toLocalDateKey(new Date(l.started_at)) === today),
    [allLogs, today],
  );

  const dayGroups = useMemo(() => groupLogsByDay(allLogs), [allLogs]);

  // ── Family members (for co-parent presence dot) ─────────────────
  const { data: members = [] } = useQuery<Profile[]>({
    queryKey: ["members", profile?.family_id],
    enabled: !!profile?.family_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile!.family_id);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const coParent = members.find((m) => m.id !== profile?.id);

  // ── Co-parent presence ──────────────────────────────────────────
  const { isCoParentOnline } = usePresence(profile?.family_id, profile);

  // ── Realtime subscription ───────────────────────────────────────
  useRealtimeSync({
    familyId: profile?.family_id ?? "",
    babyId: activeBaby?.id ?? "",
    table: "logs",
    queryKey: logsQueryKey,
  });

  // ── Start a timed log ───────────────────────────────────────────
  // startedAt is optional — nursing can supply a backdated start time
  const startTimer = async (type: "feed" | "sleep", startedAt?: string) => {
    if (activeLog) return; // one timer at a time

    const started = startedAt ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("logs")
      .insert({
        type,
        baby_id: activeBaby!.id,
        family_id: profile!.family_id,
        logged_by: profile!.id,
        started_at: started,
        ended_at: null,
        metadata: type === "feed" ? { feed_type: "nursing" } : null,
      })
      .select()
      .single();

    if (!error && data) {
      setActiveLog({
        id: data.id,
        type,
        started_at: started,
        baby_id: activeBaby!.id,
      });
    }
  };

  // ── Log a bottle feed (instant, no timer) ───────────────────────
  const logBottleFeed = async (data: BottleFeedData) => {
    const durationSeconds =
      data.ended_at
        ? Math.max(
            0,
            Math.floor(
              (new Date(data.ended_at).getTime() -
                new Date(data.started_at).getTime()) /
                1000,
            ),
          )
        : null;

    await supabase.from("logs").insert({
      type: "feed",
      baby_id: activeBaby!.id,
      family_id: profile!.family_id,
      logged_by: profile!.id,
      started_at: data.started_at,
      ended_at: data.ended_at,
      duration_seconds: durationSeconds,
      notes: data.notes || null,
      metadata: {
        feed_type: "bottle",
        milk_type: data.milk_type,
        amount_ml: data.amount_ml,
        amount_unit: data.amount_unit,
      },
    });
  };

  // ── Log a completed sleep (past sleep with start + end) ─────────
  const logSleep = async (data: SleepLogData) => {
    const durationSeconds = Math.max(
      0,
      Math.floor(
        (new Date(data.ended_at).getTime() -
          new Date(data.started_at).getTime()) /
          1000,
      ),
    );

    await supabase.from("logs").insert({
      type: "sleep",
      baby_id: activeBaby!.id,
      family_id: profile!.family_id,
      logged_by: profile!.id,
      started_at: data.started_at,
      ended_at: data.ended_at,
      duration_seconds: durationSeconds,
      notes: data.notes || null,
    });

    queryClient.invalidateQueries({ queryKey: logsQueryKey });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ── Stop a timed log ────────────────────────────────────────────
  const stopTimer = async (durationSeconds: number) => {
    if (!activeLog) return;

    await supabase
      .from("logs")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", activeLog.id);

    setActiveLog(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ── Log an instant event ────────────────────────────────────────
  const logInstant = async (
    type: "diaper" | "health" | "milestone",
    note: string,
    metadata?: Record<string, unknown>,
  ) => {
    await supabase.from("logs").insert({
      type,
      baby_id: activeBaby!.id,
      family_id: profile!.family_id,
      logged_by: profile!.id,
      started_at: new Date().toISOString(),
      notes: note,
      metadata,
    });
  };

  // ── Delete a log ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const previous = queryClient.getQueryData<Log[]>(logsQueryKey);

    queryClient.setQueryData<Log[]>(logsQueryKey, (old) =>
      old ? old.filter((l) => l.id !== id) : [],
    );

    try {
      console.log("[delete] deleting log:", id);
      const { data, error } = await supabase
        .from("logs")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        console.warn("[delete] error:", error.message);
        queryClient.setQueryData(logsQueryKey, previous);
        Alert.alert("Error", "Could not delete the entry. Please try again.");
        return;
      }

      if (!data || data.length === 0) {
        console.warn("[delete] no rows deleted (RLS or row not found)");
        queryClient.setQueryData(logsQueryKey, previous);
        Alert.alert(
          "Delete failed",
          "You may not have permission to delete this entry.",
        );
        return;
      }

      console.log("[delete] success");
      queryClient.invalidateQueries({ queryKey: logsQueryKey });
    } catch (e: any) {
      console.error("[delete] unexpected error:", e?.message);
      queryClient.setQueryData(logsQueryKey, previous);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // ── Save edits to a log ──────────────────────────────────────────────────
  const handleSaveEdit = async (payload: EditPayload) => {
    if (!editingLog) return;
    const { error } = await supabase
      .from("logs")
      .update(payload)
      .eq("id", editingLog.id);
    if (error) {
      Alert.alert("Error", "Could not save your changes. Please try again.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: logsQueryKey });
    setEditingLog(null);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const babyAge = () => {
    if (!activeBaby?.date_of_birth) return "";
    const dob = new Date(activeBaby.date_of_birth);
    const now = new Date();
    const months = Math.floor(
      (now.getFullYear() - dob.getFullYear()) * 12 +
        (now.getMonth() - dob.getMonth()),
    );
    const weeks = Math.floor(
      ((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7)) % 4,
    );
    return `${months} months · ${weeks} weeks old`;
  };

  if (!activeBaby) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {greeting()}, {profile?.display_name} 👋
          </Text>
          <Text style={styles.babyName}>{activeBaby.name}</Text>
          <Text style={styles.babyAge}>{babyAge()}</Text>
        </View>
        <View style={styles.avatarWrap}>
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
          {/* Green = co-parent online, grey = offline */}
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
        </View>
      </View>

      {/* ── Scrollable body ── */}
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
        {/* Summary cards (today only) */}
        <SummaryCards logs={todayLogs} />

        {/* Active timer bar */}
        {activeLog && <TimerBar activeLog={activeLog} onStop={stopTimer} />}

        {/* Quick action buttons */}
        <QuickActions
          activeTimerType={activeLog?.type ?? null}
          onTimerAction={startTimer}
          onInstantLog={logInstant}
          onFeedLog={logBottleFeed}
          onSleepLog={logSleep}
        />

        {/* Timeline header */}
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Journal</Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDotSmall} />
            <Text style={styles.syncText}>Synced</Text>
          </View>
        </View>

        {/* Daily grouped timeline */}
        {dayGroups.map((day) => (
          <DaySection
            key={day.key}
            day={day}
            defaultExpanded={day.key === today}
            swipeOpenId={swipeOpenId}
            onSwipeOpen={setSwipeOpenId}
            onSwipeClose={() => setSwipeOpenId(null)}
            onEdit={(l) => setEditingLog(l)}
            onDelete={handleDelete}
          />
        ))}

        {/* Empty state */}
        {allLogs.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🌱</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyBody}>
              Tap an action above to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Edit modal ── */}
      {editingLog && (
        <EditLogModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSave={handleSaveEdit}
        />
      )}
    </View>
  );
}

// ── Collapsible day section ──────────────────────────────────────────────────

interface DaySectionProps {
  day: DayGroup;
  defaultExpanded: boolean;
  swipeOpenId: string | null;
  onSwipeOpen: (id: string) => void;
  onSwipeClose: () => void;
  onEdit: (log: Log) => void;
  onDelete: (id: string) => void;
}

function DaySection({
  day,
  defaultExpanded,
  swipeOpenId,
  onSwipeOpen,
  onSwipeClose,
  onEdit,
  onDelete,
}: DaySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={ds.container}>
      <TouchableOpacity
        style={ds.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <View style={ds.headerLeft}>
          <Text style={ds.chevron}>{expanded ? "▼" : "▶"}</Text>
          <Text style={ds.title}>{day.label}</Text>
        </View>
        <View style={ds.badge}>
          <Text style={ds.badgeText}>
            {day.logs.length} {day.logs.length === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={ds.body}>
          {day.logs.map((log, i) => (
            <TimelineItem
              key={log.id}
              log={log}
              index={i}
              isSwipeOpen={swipeOpenId === log.id}
              onSwipeOpen={() => onSwipeOpen(log.id)}
              onSwipeClose={onSwipeClose}
              onEdit={(l) => onEdit(l)}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const ds = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chevron: {
    fontSize: 10,
    color: Colors.ink,
  },
  title: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.ink,
  },
  badge: {
    backgroundColor: Colors.tealPale,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    fontWeight: "600",
    color: Colors.teal,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginBottom: 2,
  },
  babyName: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 32,
    fontWeight: "600",
    color: Colors.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  babyAge: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.teal,
    fontWeight: "600",
    marginTop: 4,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.tealPale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  syncDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.moss,
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 120,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  timelineTitle: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: Colors.ink,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  syncDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.moss,
  },
  syncText: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.moss,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 22,
    color: Colors.inkLight,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
  },
});
