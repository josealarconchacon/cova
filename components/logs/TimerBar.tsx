import React from "react";
import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/theme";
import { FeedIcon, SleepIcon } from "../../assets/icons/QuickActionIcons";

const CONFIG: Record<string, { color: string; Icon: React.FC<{ size?: number; color?: string }>; label: string }> = {
  feed: { color: Colors.dusk, Icon: FeedIcon, label: "Feeding" },
  sleep: { color: "#5A8FC9", Icon: SleepIcon, label: "Sleep" },
};

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

interface ActiveLog {
  id: string;
  type: "feed" | "sleep";
  started_at: string;
  baby_id: string;
}

interface Props {
  activeLog: ActiveLog;
  onStop: (durationSeconds: number) => void;
}

export function TimerBar({ activeLog, onStop }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    // Calculate from real start time — survives hot reload & app backgrounding
    const startMs = new Date(activeLog.started_at).getTime();

    const tick = () => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    };

    tick(); // run immediately
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [activeLog.started_at]);

  const formatElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const handleStop = async () => {
    clearInterval(intervalRef.current);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onStop(elapsed);
  };

  const cfg = CONFIG[activeLog.type] ?? {
    color: Colors.teal,
    Icon: FeedIcon,
    label: "Timer",
  };

  return (
    <View style={[styles.container, { borderLeftColor: cfg.color }]}>
      <cfg.Icon size={28} color={cfg.color} />

      <View style={styles.info}>
        <Text style={[styles.label, { color: cfg.color }]}>
          {cfg.label} in progress
        </Text>
        <Text style={styles.elapsed}>{formatElapsed()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.stopBtn, { backgroundColor: cfg.color }]}
        onPress={handleStop}
        activeOpacity={0.85}
      >
        <Text style={styles.stopText}>Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    marginRight: 2,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  elapsed: {
    fontFamily: "DM-Mono",
    fontSize: 30,
    fontWeight: "500",
    color: Colors.ink,
    letterSpacing: 1,
  },
  stopBtn: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
    color: "white",
  },
});
