import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import { computeDiaperHealthScore } from "../../lib/insights/diaperHealthScore";
import type { InsightCard } from "../../lib/insights";
import type { Log } from "../../types";
import type { Baby } from "../../types";
import type { WeeklyStats } from "../../lib/useWeeklyStats";

const DIAPER_ACCENT = "#8B5E3C";

interface DiapersPatternsSectionProps {
  ribbonText: string;
  ribbonEmoji: string;
  diaperInsightCards: InsightCard[];
  stats: WeeklyStats;
  currentWeekLogs: Log[];
  baby: Baby | null;
}

function BoldRibbonText({ text, emoji }: { text: string; emoji: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\d+\s*(?:wet|dirty|changes?|diapers?)|healthy|strong)/gi;
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

function WetHealthAlert() {
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: Colors.goldPale,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.gold + "80",
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "DM-Sans",
          fontSize: 13,
          color: Colors.ink,
          lineHeight: 20,
        }}
      >
        <Text style={{ fontWeight: "600" }}>⚠️ Fewer wet diapers than usual</Text>
        {" "}
        this week. If this continues, consult your pediatrician.
      </Text>
    </View>
  );
}

function DiaperHealthScoreCard({
  score,
  label,
}: {
  score: number;
  label: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const r = 32;
  const stroke = 4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.insightCard, { borderLeftColor: DIAPER_ACCENT }]}>
      <View style={styles.insightHeader}>
        <View
          style={[styles.insightIcon, { backgroundColor: DIAPER_ACCENT + "15" }]}
        >
          <Text style={{ fontSize: 16 }}>🧷</Text>
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
                stroke={DIAPER_ACCENT}
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
                style={[styles.feedsRhythmScore, { color: DIAPER_ACCENT }]}
              >
                {score}
              </Text>
            </View>
          </View>
          <Text style={styles.feedsRhythmLabel}>{label}</Text>
          <Pressable
            onPress={() => setShowTooltip(!showTooltip)}
            hitSlop={8}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={[styles.feedsWhatIsThis, { color: DIAPER_ACCENT }]}>
              What is this?
            </Text>
          </Pressable>
          {showTooltip && (
            <Text
              style={[styles.insightText, { marginTop: 8, paddingLeft: 0 }]}
            >
              Based on wet diaper frequency, stool patterns, and age-typical
              expectations. Helps flag when to check in with your pediatrician.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function DiapersPatternsSection({
  ribbonText,
  ribbonEmoji,
  diaperInsightCards,
  stats,
  currentWeekLogs,
  baby,
}: DiapersPatternsSectionProps) {
  const diaperLogs = currentWeekLogs.filter((l) => l.type === "diaper");
  const healthScore = computeDiaperHealthScore(stats, baby, diaperLogs);

  const totalWet = stats.diaperInsights.wetTotal + stats.diaperInsights.bothTotal;
  const avgWetPerDay = totalWet / 7;
  const showWetAlert = stats.totalDiapers > 0 && avgWetPerDay < 6;

  const otherCards = diaperInsightCards;

  return (
    <>
      <Text style={styles.sectionLabel}>Patterns</Text>
      {showWetAlert && <WetHealthAlert />}
      <View style={styles.progressRibbon}>
        <BoldRibbonText text={ribbonText} emoji={ribbonEmoji} />
      </View>
      {healthScore != null && (
        <DiaperHealthScoreCard
          score={healthScore.score}
          label={healthScore.label}
        />
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
