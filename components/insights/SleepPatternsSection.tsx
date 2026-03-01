import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { computeNapArchitecture } from "../../lib/insights/napArchitecture";
import type { InsightCard } from "../../lib/insights";
import type { Log } from "../../types";
import type { Baby } from "../../types";

const SLEEP_ACCENT = "#2C3E6B";

const CONSISTENCY_LABELS: Record<string, string> = {
  "90-100": "Very consistent",
  "70-89": "Mostly on schedule",
  "50-69": "Some variation",
  "below-50": "Irregular pattern",
};

function getConsistencyLabel(score: number): string {
  if (score >= 90) return CONSISTENCY_LABELS["90-100"];
  if (score >= 70) return CONSISTENCY_LABELS["70-89"];
  if (score >= 50) return CONSISTENCY_LABELS["50-69"];
  return CONSISTENCY_LABELS["below-50"];
}

function formatStretch(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

interface SleepPatternsSectionProps {
  ribbonText: string;
  ribbonEmoji: string;
  sleepInsightCards: InsightCard[];
  sleepQualityScore: number | null;
  currentWeekLogs: Log[];
  baby: Baby | null;
}

function BoldRibbonText({ text, emoji }: { text: string; emoji: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\d+\.?\d*\s*h(?:ours?|r)?|up\s*\d+%|down\s*\d+%|\d+h\s*\d+m)/gi;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</Text>,
      );
    }
    parts.push(
      <Text
        key={`b-${key++}`}
        style={{ fontWeight: "700", color: Colors.ink }}
      >
        {match[0]}
      </Text>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Text key={`t-${key++}`}>{text.slice(lastIndex)}</Text>);
  }

  return (
    <Text style={styles.progressRibbonText}>
      {parts.length > 0 ? parts : text}
      {emoji ? ` ${emoji}` : ""}
    </Text>
  );
}

function SleepConsistencyScore({
  score,
  onWhatIsThis,
}: {
  score: number;
  onWhatIsThis: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const r = 32;
  const stroke = 4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.insightCard, { borderLeftColor: SLEEP_ACCENT }]}>
      <View style={styles.insightHeader}>
        <View
          style={[
            styles.insightIcon,
            { backgroundColor: SLEEP_ACCENT + "15" },
          ]}
        >
          <Text style={{ fontSize: 16 }}>😴</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ position: "relative", width: 72, height: 72 }}>
            <Svg
              width={72}
              height={72}
              style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
            >
              <Circle
                cx={36}
                cy={36}
                r={r}
                stroke={Colors.sandDark + "40"}
                strokeWidth={stroke}
                fill="none"
              />
              <Circle
                cx={36}
                cy={36}
                r={r}
                stroke={SLEEP_ACCENT}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </Svg>
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={[styles.feedsRhythmScore, { color: SLEEP_ACCENT }]}
              >
                {score}
              </Text>
            </View>
          </View>
          <Text style={styles.feedsRhythmLabel}>
            {getConsistencyLabel(score)}
          </Text>
          <Pressable
            onPress={() => setShowTooltip(!showTooltip)}
            hitSlop={8}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={[styles.feedsWhatIsThis, { color: SLEEP_ACCENT }]}>
              What is this?
            </Text>
          </Pressable>
          {showTooltip && (
            <Text
              style={[styles.insightText, { marginTop: 8, paddingLeft: 0 }]}
            >
              Based on night wakings, sleep block length, and daily totals.
              Higher scores mean more consistent sleep patterns.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function LongestStreakChip({
  longestStretchMin,
  longestStretchDay,
}: {
  longestStretchMin: number;
  longestStretchDay: string | null;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: SLEEP_ACCENT + "12",
        borderRadius: 12,
        marginBottom: 16,
        minHeight: 44,
      }}
    >
      <Text style={{ fontSize: 16, marginRight: 8 }}>🌙</Text>
      <Text
        style={{
          fontFamily: "DM-Sans",
          fontSize: 13,
          fontWeight: "600",
          color: Colors.ink,
        }}
      >
        {formatStretch(longestStretchMin)} uninterrupted
        {longestStretchDay
          ? ` · ${longestStretchDay.split(",")[0]?.trim() ?? longestStretchDay}`
          : ""}
      </Text>
    </View>
  );
}

export function SleepPatternsSection({
  ribbonText,
  ribbonEmoji,
  sleepInsightCards,
  sleepQualityScore,
  currentWeekLogs,
  baby,
}: SleepPatternsSectionProps) {
  const sleepLogs = currentWeekLogs.filter((l) => l.type === "sleep");
  const napArch = computeNapArchitecture(sleepLogs, baby);

  const scoreCard = sleepInsightCards.find(
    (c) => c.title === "Sleep Quality Score",
  );
  const otherCards = sleepInsightCards.filter(
    (c) =>
      c.title !== "Sleep Quality Score" &&
      c.title !== "Sleep Debt Tracker" &&
      c.title !== "Sleep Debt Indicator",
  );

  return (
    <>
      <Text style={styles.sectionLabel}>Patterns</Text>
      <View style={styles.progressRibbon}>
        <BoldRibbonText text={ribbonText} emoji={ribbonEmoji} />
      </View>
      {sleepQualityScore != null && (
        <>
          <SleepConsistencyScore score={sleepQualityScore} onWhatIsThis={() => {}} />
          {napArch && napArch.longestStretchMin > 0 && (
            <LongestStreakChip
              longestStretchMin={napArch.longestStretchMin}
              longestStretchDay={napArch.longestStretchDay}
            />
          )}
        </>
      )}
      {otherCards.map((item) => (
        <View
          key={item.title}
          style={[styles.insightCard, { borderLeftColor: item.color }]}
        >
          <View style={styles.insightHeader}>
            <View
              style={[styles.insightIcon, { backgroundColor: item.color + "15" }]}
            >
              {item.IconComponent ? (
                <item.IconComponent size={20} color={item.color} />
              ) : (
                <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>{item.title}</Text>
            </View>
          </View>
          <Text style={styles.insightText}>{item.text}</Text>
        </View>
      ))}
    </>
  );
}
