import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRealtimeSync } from "../../lib/useRealtimeSync";
import { usePresence } from "../../lib/usePresence";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Log, Profile } from "../../types";

import { QuickActions } from "../../components/logs/QuickActions";
import { TimerBar } from "../../components/logs/TimerBar";
import { TimelineItem } from "../../components/logs/TimelineItem";
import { SummaryCards } from "../../components/logs/SummaryCards";

export default function HomeScreen() {
  const { profile, activeBaby, activeLog, setActiveLog } = useStore();
  const scrollRef = useRef<ScrollView>(null);

  const today = new Date().toISOString().split("T")[0];

  // ── Fetch today's logs ──────────────────────────────────────────
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logs", activeBaby?.id, today],
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
        .gte("started_at", today + "T00:00:00")
        .order("started_at", { ascending: false });

      if (error) throw error;
      return data as Log[];
    },
  });

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
    queryKey: ["logs", activeBaby?.id, today],
  });

  // ── Start a timed log ───────────────────────────────────────────
  const startTimer = async (type: "feed" | "sleep") => {
    if (activeLog) return; // one timer at a time

    const { data, error } = await supabase
      .from("logs")
      .insert({
        type,
        baby_id: activeBaby!.id,
        family_id: profile!.family_id,
        logged_by: profile!.id,
        started_at: new Date().toISOString(),
        ended_at: null,
      })
      .select()
      .single();

    if (!error && data) {
      setActiveLog({
        id: data.id,
        type,
        started_at: data.started_at,
        baby_id: activeBaby!.id,
      });
    }
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

  if (!activeBaby) return null;

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
          <View style={styles.avatar}>
            <Text style={{ fontSize: 24 }}>🌙</Text>
          </View>
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
        {/* Summary cards */}
        <SummaryCards logs={logs} />

        {/* Active timer bar */}
        {activeLog && <TimerBar activeLog={activeLog} onStop={stopTimer} />}

        {/* Quick action buttons */}
        <QuickActions
          activeTimerType={activeLog?.type ?? null}
          onTimerAction={startTimer}
          onInstantLog={logInstant}
        />

        {/* Timeline header */}
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Today's Journal</Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDotSmall} />
            <Text style={styles.syncText}>Synced</Text>
          </View>
        </View>

        {/* Timeline entries */}
        {logs.map((log, i) => (
          <TimelineItem key={log.id} log={log} index={i} />
        ))}

        {/* Empty state */}
        {logs.length === 0 && !isLoading && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🌱</Text>
            <Text style={styles.emptyTitle}>No entries yet today</Text>
            <Text style={styles.emptyBody}>
              Tap an action above to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
