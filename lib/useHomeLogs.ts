import { useRef, useMemo } from "react";
import type { RefObject } from "react";
import { ScrollView } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { supabase } from "./supabase";
import { useStore } from "../store/useStore";
import { useRealtimeSync } from "./useRealtimeSync";
import { usePresence } from "./usePresence";
import { DAYS_TO_FETCH, toLocalDateKey, groupLogsByDay } from "./home/dateUtils";
import type { Log, Profile } from "../types";
import type { BottleFeedData, SleepLogData } from "../components/logs/QuickActions";
import type { EditPayload } from "../components/logs/EditLogModal";
import type { NursingSideValue } from "../components/logs/QuickActions";

export interface UseHomeLogsResult {
  allLogs: Log[];
  todayLogs: Log[];
  dayGroups: ReturnType<typeof groupLogsByDay>;
  isLoading: boolean;
  refetch: () => void;
  members: Profile[];
  coParent: Profile | undefined;
  isCoParentOnline: (userId: string) => boolean;
  logsQueryKey: readonly unknown[];
  scrollRef: RefObject<ScrollView | null>;
  startTimer: (
    type: "feed" | "sleep",
    startedAt?: string,
    nursingSide?: NursingSideValue,
  ) => Promise<void>;
  stopTimer: (durationSeconds: number) => Promise<void>;
  switchNursingSide: (elapsedSeconds: number) => Promise<void>;
  logBottleFeed: (data: BottleFeedData) => Promise<void>;
  logSleep: (data: SleepLogData) => Promise<void>;
  logInstant: (
    type: "diaper" | "health" | "milestone",
    note: string,
    metadata?: Record<string, unknown>,
  ) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleSaveEdit: (logId: string, payload: EditPayload) => Promise<void>;
  updateTimerStartTime: (logId: string, newStartedAt: string) => Promise<void>;
}

export function useHomeLogs(): UseHomeLogsResult {
  const { profile, activeBaby, activeLog, setActiveLog } = useStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView | null>(null);

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
  const { isCoParentOnline } = usePresence(profile?.family_id, profile);

  useRealtimeSync({
    familyId: profile?.family_id ?? "",
    babyId: activeBaby?.id ?? "",
    table: "logs",
    queryKey: logsQueryKey,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: logsQueryKey });
    queryClient.invalidateQueries({ queryKey: ["insights-logs", activeBaby?.id] });
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const startTimer = async (
    type: "feed" | "sleep",
    startedAt?: string,
    nursingSide?: NursingSideValue,
  ) => {
    if (activeLog) return;
    const started = startedAt ?? new Date().toISOString();

    const metadata =
      type === "feed" && nursingSide
        ? { feed_type: "nursing" as const, side: nursingSide }
        : type === "feed"
          ? { feed_type: "nursing" as const }
          : null;

    const { data, error } = await supabase
      .from("logs")
      .insert({
        type,
        baby_id: activeBaby!.id,
        family_id: profile!.family_id,
        logged_by: profile!.id,
        started_at: started,
        ended_at: null,
        metadata,
      })
      .select()
      .single();

    if (!error && data) {
      setActiveLog({
        id: data.id,
        type,
        started_at: started,
        baby_id: activeBaby!.id,
        ...(type === "feed" &&
          nursingSide && {
            side: nursingSide,
            leftDuration: 0,
            rightDuration: 0,
          }),
      });
    }
  };

  const logBottleFeed = async (data: BottleFeedData) => {
    const durationSeconds = data.ended_at
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

    invalidateQueries();
  };

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

    invalidateQueries();
    scrollToTop();
  };

  const stopTimer = async (durationSeconds: number) => {
    if (!activeLog) return;

    const isNursingWithSide =
      activeLog.type === "feed" && activeLog.side != null;
    let updatePayload: Record<string, unknown> = {
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
    };

    if (isNursingWithSide) {
      const leftDur = activeLog.leftDuration ?? 0;
      const rightDur = activeLog.rightDuration ?? 0;
      const timeOnCurrentSide = durationSeconds - leftDur - rightDur;

      const leftDurationFinal =
        activeLog.side === "left" ? leftDur + timeOnCurrentSide : leftDur;
      const rightDurationFinal =
        activeLog.side === "right" ? rightDur + timeOnCurrentSide : rightDur;

      const { data: current } = await supabase
        .from("logs")
        .select("metadata")
        .eq("id", activeLog.id)
        .single();

      const existingMeta = (current as { metadata?: Record<string, unknown> } | null)?.metadata ?? {};
      updatePayload.metadata = {
        ...(typeof existingMeta === "object" && existingMeta !== null ? existingMeta : {}),
        feed_type: "nursing",
        side: activeLog.side,
        leftDuration: leftDurationFinal,
        rightDuration: rightDurationFinal,
      };
    }

    await supabase.from("logs").update(updatePayload).eq("id", activeLog.id);

    setActiveLog(null);
    invalidateQueries();
    scrollToTop();
  };

  const switchNursingSide = async (elapsedSeconds: number) => {
    if (!activeLog || activeLog.type !== "feed" || !activeLog.side) return;

    const leftDur = activeLog.leftDuration ?? 0;
    const rightDur = activeLog.rightDuration ?? 0;
    const timeOnCurrentSide = elapsedSeconds - leftDur - rightDur;

    const leftDurationNew =
      activeLog.side === "left" ? leftDur + timeOnCurrentSide : leftDur;
    const rightDurationNew =
      activeLog.side === "right" ? rightDur + timeOnCurrentSide : rightDur;
    const newSide = activeLog.side === "left" ? "right" : "left";

    const { data: current } = await supabase
      .from("logs")
      .select("metadata")
      .eq("id", activeLog.id)
      .single();

    const existingMeta = (current as { metadata?: Record<string, unknown> } | null)?.metadata ?? {};
    const sideHistory = Array.isArray(existingMeta.sideHistory)
      ? [...(existingMeta.sideHistory as Array<{ side: string; startedAt: string }>)]
      : [];
    sideHistory.push({ side: newSide, startedAt: new Date().toISOString() });

    await supabase
      .from("logs")
      .update({
        metadata: {
          ...existingMeta,
          feed_type: "nursing",
          side: newSide,
          leftDuration: leftDurationNew,
          rightDuration: rightDurationNew,
          sideHistory,
        },
      })
      .eq("id", activeLog.id);

    setActiveLog({
      ...activeLog,
      side: newSide as "left" | "right",
      leftDuration: leftDurationNew,
      rightDuration: rightDurationNew,
    });
  };

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
    queryClient.invalidateQueries({ queryKey: ["insights-logs", activeBaby?.id] });
  };

  const handleDelete = async (id: string) => {
    const previous = queryClient.getQueryData<Log[]>(logsQueryKey);

    queryClient.setQueryData<Log[]>(logsQueryKey, (old) =>
      old ? old.filter((l) => l.id !== id) : [],
    );

    try {
      const { data, error } = await supabase
        .from("logs")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        queryClient.setQueryData(logsQueryKey, previous);
        Alert.alert("Error", "Could not delete the entry. Please try again.");
        return;
      }

      if (!data || data.length === 0) {
        queryClient.setQueryData(logsQueryKey, previous);
        Alert.alert(
          "Delete failed",
          "You may not have permission to delete this entry.",
        );
        return;
      }

      invalidateQueries();
    } catch (e: unknown) {
      queryClient.setQueryData(logsQueryKey, previous);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleSaveEdit = async (logId: string, payload: EditPayload) => {
    const { error } = await supabase
      .from("logs")
      .update(payload)
      .eq("id", logId);

    if (error) {
      Alert.alert("Error", "Could not save your changes. Please try again.");
      return;
    }
    invalidateQueries();
  };

  const updateTimerStartTime = async (
    logId: string,
    newStartedAt: string,
  ) => {
    if (!activeLog || activeLog.id !== logId) return;

    const { error } = await supabase
      .from("logs")
      .update({ started_at: newStartedAt })
      .eq("id", logId);

    if (error) {
      Alert.alert("Error", "Could not update start time. Please try again.");
      return;
    }

    setActiveLog({ ...activeLog, started_at: newStartedAt });
  };

  return {
    allLogs,
    todayLogs,
    dayGroups,
    isLoading,
    refetch,
    members,
    coParent,
    isCoParentOnline,
    logsQueryKey,
    scrollRef,
    startTimer,
    stopTimer,
    switchNursingSide,
    logBottleFeed,
    logSleep,
    logInstant,
    handleDelete,
    handleSaveEdit,
    updateTimerStartTime,
  };
}
