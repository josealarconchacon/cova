import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/theme";
import { FeedIcon, SleepIcon } from "../../assets/icons/QuickActionIcons";
import { TimePickerField } from "./TimePickerField";

const CONFIG: Record<string, { color: string; Icon: React.FC<{ size?: number; color?: string }>; label: string }> = {
  feed: { color: Colors.dusk, Icon: FeedIcon, label: "Feeding" },
  sleep: { color: "#5A8FC9", Icon: SleepIcon, label: "Sleep" },
};

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatStartTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ActiveLog {
  id: string;
  type: "feed" | "sleep";
  started_at: string;
  baby_id: string;
  side?: "left" | "right";
}

interface Props {
  activeLog: ActiveLog;
  onStop: (durationSeconds: number) => void;
  onSwitchSide?: (elapsedSeconds: number) => void;
  onEditStartTime?: (logId: string, newStartedAt: string) => Promise<void>;
}

function mergeDateTime(dateStr: string, timeDate: Date): Date {
  const d = new Date(dateStr);
  d.setHours(
    timeDate.getHours(),
    timeDate.getMinutes(),
    timeDate.getSeconds(),
    0,
  );
  return d;
}

export function TimerBar({
  activeLog,
  onStop,
  onSwitchSide,
  onEditStartTime,
}: Props) {
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

  const displayLabel =
    activeLog.type === "feed" && activeLog.side
      ? `Nursing — ${activeLog.side === "left" ? "Left" : "Right"}`
      : cfg.label;

  const [showEditTime, setShowEditTime] = useState(false);
  const [editTimeValue, setEditTimeValue] = useState(
    () => new Date(activeLog.started_at),
  );

  const handleEditTimeOpen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditTimeValue(new Date(activeLog.started_at));
    setShowEditTime(true);
  };

  const handleEditTimeSave = async () => {
    const merged = mergeDateTime(activeLog.started_at, editTimeValue);
    await onEditStartTime?.(activeLog.id, merged.toISOString());
    setShowEditTime(false);
  };

  return (
    <>
    <View style={[styles.container, { borderLeftColor: cfg.color }]}>
      <View style={styles.leftBlock}>
        <View style={styles.iconWrap}>
          <cfg.Icon size={28} color={cfg.color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.label, { color: cfg.color }]}>
            {displayLabel} in progress
          </Text>
          {onEditStartTime ? (
            <TouchableOpacity
              onPress={handleEditTimeOpen}
              activeOpacity={0.7}
              style={styles.startTimeTouchable}
            >
              <Text style={styles.startTime}>
                Started at {formatStartTime(activeLog.started_at)}
              </Text>
              <Text style={[styles.editHint, { color: cfg.color }]}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.startTime}>
              Started at {formatStartTime(activeLog.started_at)}
            </Text>
          )}
          <Text
            style={styles.elapsed}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatElapsed()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onSwitchSide && activeLog.type === "feed" && activeLog.side && (
          <TouchableOpacity
            style={[styles.switchBtn, { borderColor: cfg.color }]}
            onPress={() => onSwitchSide(elapsed)}
            activeOpacity={0.8}
          >
            <Text style={[styles.switchBtnText, { color: cfg.color }]}>
              Switch Side
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.stopBtn, { backgroundColor: cfg.color }]}
          onPress={handleStop}
          activeOpacity={0.85}
        >
          <Text style={styles.stopText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>

    {onEditStartTime && (
      <Modal transparent animationType="fade" visible={showEditTime}>
        <TouchableOpacity
          style={styles.editBackdrop}
          activeOpacity={1}
          onPress={() => setShowEditTime(false)}
        >
          <View
            style={styles.editSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.editSheetInner}>
              <Text style={styles.editSheetTitle}>Edit start time</Text>
              <Text style={styles.editSheetHint}>
                Adjust if baby fell asleep or started feeding earlier
              </Text>
              <TimePickerField
                label="Started at"
                value={editTimeValue}
                onChange={setEditTimeValue}
                accentColor={cfg.color}
              />
              <View style={styles.editSheetActions}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => setShowEditTime(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editSaveBtn, { backgroundColor: cfg.color }]}
                  onPress={handleEditTimeSave}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    )}
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  leftBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    marginRight: 8,
  },
  iconWrap: {
    justifyContent: "center",
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  startTimeTouchable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  startTime: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
    marginBottom: 2,
  },
  editHint: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  elapsed: {
    fontFamily: "DM-Mono",
    fontSize: 28,
    fontWeight: "500",
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  switchBtn: {
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  switchBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 12,
  },
  stopBtn: {
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 16,
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
  editBackdrop: {
    flex: 1,
    backgroundColor: "rgba(42,32,24,0.45)",
    justifyContent: "flex-end",
  },
  editSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  editSheetInner: {
    marginBottom: 8,
  },
  editSheetTitle: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 18,
    color: Colors.ink,
    marginBottom: 4,
  },
  editSheetHint: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    marginBottom: 16,
  },
  editSheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.sand,
    alignItems: "center",
  },
  editCancelText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.ink,
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  editSaveText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: "white",
  },
});
