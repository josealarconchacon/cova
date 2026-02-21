import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Colors } from "../../constants/theme";
import type { Log } from "../../types";

const TYPE_CONFIG: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  feed: { color: Colors.dusk, icon: "🍼", label: "Feeding" },
  sleep: { color: "#5A8FC9", icon: "💤", label: "Sleep" },
  diaper: { color: Colors.moss, icon: "🩲", label: "Diaper change" },
  milestone: { color: "#C9961A", icon: "⭐", label: "Milestone" },
  health: { color: "#8B7EC8", icon: "🏥", label: "Health note" },
};

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  log: Log;
  index: number;
}

export function TimelineItem({ log, index }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        delay: index * 40,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const cfg = TYPE_CONFIG[log.type] ?? {
    color: Colors.teal,
    icon: "📝",
    label: log.type,
  };

  return (
    <Animated.View
      style={[styles.row, { opacity, transform: [{ translateX }] }]}
    >
      {/* Color dot */}
      <View style={[styles.dot, { backgroundColor: cfg.color }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Top row: icon + label + duration badge */}
        <View style={styles.topRow}>
          <Text style={{ fontSize: 18 }}>{cfg.icon}</Text>
          <Text style={styles.label}>{cfg.label}</Text>

          {log.duration_seconds != null && log.duration_seconds > 0 && (
            <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
              <Text style={[styles.badgeText, { color: cfg.color }]}>
                {formatDuration(log.duration_seconds)}
              </Text>
            </View>
          )}
        </View>

        {/* Note */}
        {log.notes ? <Text style={styles.note}>{log.notes}</Text> : null}

        {/* Meta: time · by whom */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatTime(log.started_at)}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.meta}>
            by {log.profile?.display_name ?? "You"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sandDark,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
    color: Colors.ink,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
  },
  note: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkMid,
    lineHeight: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meta: {
    fontFamily: "DM-Mono",
    fontSize: 11,
    color: Colors.inkLight,
  },
  separator: {
    color: Colors.sandDark,
    fontSize: 11,
  },
});
