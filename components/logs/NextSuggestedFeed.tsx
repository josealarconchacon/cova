import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "../../constants/theme";
import type { UseNextFeedPredictionResult } from "../../lib/useNextFeedPrediction";

function formatIntervalMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0 && m > 0) return `~${h}h ${m}m`;
  if (h > 0) return `~${h}h`;
  return `~${m}m`;
}

function formatClockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Props {
  prediction: UseNextFeedPredictionResult;
}

export function NextSuggestedFeed({ prediction }: Props) {
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (prediction.isDueNow) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [prediction.isDueNow, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isEmpty = !prediction.lastFeedTimestamp;

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerLabel}>NEXT SUGGESTED FEED</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No feed history yet — log your first feed
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>NEXT SUGGESTED FEED</Text>

      <View style={styles.timeSection}>
        {prediction.isDueNow ? (
          <Animated.Text
            style={[styles.dueNowText, pulseStyle]}
          >
            Feed due now
          </Animated.Text>
        ) : prediction.nextFeedTime ? (
          <>
            <Text style={styles.clockTime}>
              {formatClockTime(prediction.nextFeedTime)}
            </Text>
            {prediction.countdownLabel && (
              <Text style={styles.countdownSub}>{prediction.countdownLabel}</Text>
            )}
            {prediction.confidence === "low" && (
              <Text style={styles.lowConfidenceNote}>
                Estimate — log more feeds to improve accuracy
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.noPredictionText}>
            Log more feeds to see a prediction
          </Text>
        )}
      </View>

      {prediction.intervalMinutes != null && prediction.intervalMinutes > 0 ? (
        <Text style={styles.intervalTag}>
          Every {formatIntervalMinutes(prediction.intervalMinutes)}
          {prediction.confidence === "low"
            ? ` · based on ${prediction.feedCountUsed} feeds (limited data)`
            : ` · based on last ${prediction.feedCountUsed} feeds`}
        </Text>
      ) : (
        <Text style={styles.intervalTag}>
          {prediction.feedCountUsed === 0
            ? "No feed history yet — log your first feed"
            : `Based on ${prediction.feedCountUsed} feed${prediction.feedCountUsed === 1 ? "" : "s"}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerLabel: {
    fontFamily: "DM-Sans",
    fontSize: 9,
    color: Colors.inkLight,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  timeSection: {
    marginBottom: 8,
  },
  clockTime: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 22,
    fontWeight: "600",
    color: Colors.ink,
    lineHeight: 26,
  },
  countdownSub: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
    marginTop: 1,
  },
  dueNowText: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dusk,
    lineHeight: 24,
  },
  lowConfidenceNote: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    fontStyle: "italic",
    marginTop: 2,
  },
  noPredictionText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
  },
  intervalTag: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    textAlign: "left",
  },
});
