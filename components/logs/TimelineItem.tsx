import React from "react";
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  Alert,
} from "react-native";
import { Colors } from "../../constants/theme";
import type { Log } from "../../types";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
  MomentIcon,
  HealthIcon,
  BreastMilkIcon,
} from "../../assets/icons/QuickActionIcons";
import {
  WetIcon,
  DirtyIcon,
  BothIcon,
  SeedyYellowIcon,
  TanBrownIcon,
  GreenIcon,
  OrangeIcon,
  WateryRunnyIcon,
  MucousyIcon,
  BlackDarkIcon,
  BloodRedIcon,
} from "../../assets/icons/DiaperIcons";

const ACTION_WIDTH = 140;

const TYPE_CONFIG: Record<string, { color: string; Icon: React.FC<{ size?: number; color?: string }>; label: string }> = {
  feed:      { color: Colors.dusk,  Icon: FeedIcon,   label: "Feeding"       },
  sleep:     { color: "#5A8FC9",    Icon: SleepIcon,  label: "Sleep"         },
  diaper:    { color: Colors.moss,  Icon: DiaperIcon, label: "Diaper change" },
  milestone: { color: "#C9961A",    Icon: MomentIcon, label: "Milestone"     },
  health:    { color: "#8B7EC8",    Icon: HealthIcon, label: "Health note"   },
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
  /** true when this row is the currently open swipe item */
  isSwipeOpen: boolean;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onEdit: (log: Log) => void;
  onDelete: (id: string) => void;
}

export function TimelineItem({
  log,
  index,
  isSwipeOpen,
  onSwipeOpen,
  onSwipeClose,
  onEdit,
  onDelete,
}: Props) {
  // ── Entrance animation ────────────────────────────────────────────────────
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceX       = useRef(new Animated.Value(-20)).current;

  // ── Swipe animation ───────────────────────────────────────────────────────
  const swipeX    = useRef(new Animated.Value(0)).current;
  // Ref tracks open state without causing re-renders
  const isOpenRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 350,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.spring(entranceX, {
        toValue: 0,
        delay: index * 40,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Close this row whenever another row opens
  useEffect(() => {
    if (!isSwipeOpen && isOpenRef.current) {
      isOpenRef.current = false;
      Animated.spring(swipeX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }).start();
    }
  }, [isSwipeOpen]);

  // ── PanResponder ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Only claim horizontal gestures that are more horizontal than vertical
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 6 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderMove: (_, gs) => {
        // Offset by current open position so movement feels continuous
        const base = isOpenRef.current ? -ACTION_WIDTH : 0;
        const next = Math.max(-ACTION_WIDTH, Math.min(0, base + gs.dx));
        swipeX.setValue(next);
      },

      onPanResponderRelease: (_, gs) => {
        const base        = isOpenRef.current ? -ACTION_WIDTH : 0;
        const finalOffset = base + gs.dx;

        if (finalOffset < -(ACTION_WIDTH / 2)) {
          // Snap open
          isOpenRef.current = true;
          onSwipeOpen();
          Animated.spring(swipeX, {
            toValue: -ACTION_WIDTH,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        } else {
          // Snap closed
          isOpenRef.current = false;
          onSwipeClose();
          Animated.spring(swipeX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        }
      },
    }),
  ).current;

  // ── Action handlers ───────────────────────────────────────────────────────
  const closeSwipe = () => {
    isOpenRef.current = false;
    onSwipeClose();
    Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start();
  };

  const handleEdit = () => {
    closeSwipe();
    onEdit(log);
  };

  const handleDelete = () => {
    console.log("[TimelineItem] delete tapped for:", log.id);
    closeSwipe();
    setTimeout(() => {
      Alert.alert(
        "Delete entry",
        "Are you sure you want to delete this log? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(log.id),
          },
        ],
      );
    }, 100);
  };

  // ── Display logic ─────────────────────────────────────────────────────────
  const cfg = TYPE_CONFIG[log.type] ?? {
    color: Colors.teal,
    icon: "📝",
    label: log.type,
  };

  // Feed sub-type
  const feedType = log.type === "feed"
    ? (log.metadata?.feed_type as string | undefined)
    : undefined;
  const feedLabel =
    feedType === "nursing" ? "Nursing"    :
    feedType === "bottle"  ? "Bottle Feed" :
    cfg.label;

  const nursingSide = feedType === "nursing"
    ? (log.metadata?.side as "left" | "right" | undefined)
    : undefined;

  const bottleAmountMl = feedType === "bottle"
    ? (log.metadata?.amount_ml as number | undefined)
    : undefined;
  const bottleUnit    = (log.metadata?.amount_unit as string | undefined) ?? "ml";
  const bottleDisplay = bottleAmountMl != null
    ? bottleUnit === "oz"
      ? `${(Math.round((bottleAmountMl / 29.5735) * 10) / 10).toFixed(1)} oz`
      : `${bottleAmountMl} ml`
    : undefined;

  // Diaper sub-details
  const diaperType = log.type === "diaper"
    ? (log.metadata?.diaper_type as string | undefined)
    : undefined;
  const wetAmt   = log.metadata?.wet_amount   as string | undefined;
  const dirtyAmt = log.metadata?.dirty_amount as string | undefined;
  const pooType  = log.metadata?.poo_type     as string | undefined;

  const DIAPER_TYPE_ICON: Record<string, React.FC<{ size?: number; color?: string }>> = {
    wet: WetIcon, dirty: DirtyIcon, both: BothIcon,
  };
  const POO_ICON: Record<string, React.FC<{ size?: number; color?: string }>> = {
    seedy_yellow: SeedyYellowIcon, tan_brown: TanBrownIcon, green: GreenIcon,
    orange: OrangeIcon, watery: WateryRunnyIcon, mucousy: MucousyIcon,
    black_dark: BlackDarkIcon, blood: BloodRedIcon,
  };
  const POO_LABEL: Record<string, string> = {
    seedy_yellow: "Seedy/Yellow", tan_brown: "Tan/Brown", green: "Green",
    orange: "Orange", watery: "Watery", mucousy: "Mucousy",
    black_dark: "Black/Dark", blood: "Blood",
  };
  const AMOUNT_LABEL: Record<string, string> = {
    little: "Little", medium: "Medium", lot: "Lot",
  };

  const DiaperTypeIcon = diaperType ? DIAPER_TYPE_ICON[diaperType] : null;

  const actionScale = swipeX.interpolate({
    inputRange: [-ACTION_WIDTH, -ACTION_WIDTH * 0.3, 0],
    outputRange: [1, 0.6, 0.4],
    extrapolate: "clamp",
  });
  const actionOpacity = swipeX.interpolate({
    inputRange: [-ACTION_WIDTH, -ACTION_WIDTH * 0.4, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={{
        opacity: entranceOpacity,
        transform: [{ translateX: entranceX }],
      }}
    >
      <View style={styles.container}>

        <View style={styles.actions}>
          <Animated.View
            style={[
              styles.actionButtonWrapper,
              { opacity: actionOpacity, transform: [{ scale: actionScale }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.editAction,
                pressed && styles.actionPressed,
              ]}
              onPress={handleEdit}
            >
              <View style={styles.actionIconCircle}>
                <Text style={styles.actionIconText}>✎</Text>
              </View>
              <Text style={styles.actionLabel}>Edit</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              styles.actionButtonWrapper,
              { opacity: actionOpacity, transform: [{ scale: actionScale }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.deleteAction,
                pressed && styles.actionPressed,
              ]}
              onPress={handleDelete}
            >
              <View style={styles.deleteIconCircle}>
                <Text style={styles.actionIconText}>✕</Text>
              </View>
              <Text style={styles.deleteLabel}>Delete</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* ── Swipeable content row ── */}
        <Animated.View
          style={[styles.row, { transform: [{ translateX: swipeX }] }]}
          {...panResponder.panHandlers}
        >
          {/* Color dot */}
          <View style={[styles.dot, { backgroundColor: cfg.color }]} />

          {/* Content */}
          <View style={styles.content}>
            {/* Top row: icon + label + badges */}
            <View style={styles.topRow}>
              {log.type === "diaper" && DiaperTypeIcon ? (
                <DiaperTypeIcon size={20} color={cfg.color} />
              ) : feedType === "nursing" ? (
                <BreastMilkIcon size={22} color={cfg.color} />
              ) : (
                <cfg.Icon size={22} color={cfg.color} />
              )}
              <Text style={styles.label}>
                {log.type === "diaper" ? cfg.label : feedLabel}
              </Text>

              {/* Duration badge */}
              {log.duration_seconds != null && log.duration_seconds > 0 && (
                <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>
                    {formatDuration(log.duration_seconds)}
                  </Text>
                </View>
              )}

              {/* Nursing side badge (L/R) */}
              {nursingSide && (
                <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>
                    {nursingSide === "left" ? "L" : "R"}
                  </Text>
                </View>
              )}

              {/* Bottle amount badge */}
              {bottleDisplay && (
                <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>
                    {bottleDisplay}
                  </Text>
                </View>
              )}
            </View>

            {/* Diaper detail badges */}
            {log.type === "diaper" && (wetAmt || dirtyAmt) && (
              <View style={styles.topRow}>
                {wetAmt && (
                  <View style={[styles.badge, { backgroundColor: "#3D7A6E22", flexDirection: "row", alignItems: "center", gap: 3 }]}>
                    <WetIcon size={12} color={Colors.moss} />
                    <Text style={[styles.badgeText, { color: Colors.moss }]}>
                      {AMOUNT_LABEL[wetAmt] ?? wetAmt}
                    </Text>
                  </View>
                )}
                {dirtyAmt && (
                  <View style={[styles.badge, { backgroundColor: "#3D7A6E22", flexDirection: "row", alignItems: "center", gap: 3 }]}>
                    <DirtyIcon size={12} color={Colors.moss} />
                    <Text style={[styles.badgeText, { color: Colors.moss }]}>
                      {AMOUNT_LABEL[dirtyAmt] ?? dirtyAmt}
                    </Text>
                  </View>
                )}
                {pooType && (() => {
                  const PooIconComponent = POO_ICON[pooType];
                  return (
                    <View style={[styles.badge, { backgroundColor: "#3D7A6E22", flexDirection: "row", alignItems: "center", gap: 3 }]}>
                      {PooIconComponent && <PooIconComponent size={12} />}
                      <Text style={[styles.badgeText, { color: Colors.moss }]}>
                        {POO_LABEL[pooType] ?? pooType}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            )}

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
      </View>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: Colors.sandDark,
  },
  actions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
    backgroundColor: Colors.cream,
  },
  actionButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editAction: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  deleteAction: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D4534A",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "700",
  },
  actionLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 11,
    color: Colors.teal,
    letterSpacing: 0.3,
  },
  deleteLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 11,
    color: "#D4534A",
    letterSpacing: 0.3,
  },
  // ── Swipeable row ───────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    backgroundColor: Colors.cream,
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
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
  },
  separator: {
    color: Colors.sandDark,
    fontSize: 11,
  },
});
