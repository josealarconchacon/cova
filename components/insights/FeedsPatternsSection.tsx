import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/insights.styles";
import type { InsightCard } from "../../lib/insights";

const RHYTHM_LABELS: Record<string, string> = {
  "90-100": "Excellent consistency",
  "70-89": "Good rhythm",
  "50-69": "Some irregularity",
  "below-50": "Needs attention",
};

function getRhythmLabel(score: number): string {
  if (score >= 90) return RHYTHM_LABELS["90-100"];
  if (score >= 70) return RHYTHM_LABELS["70-89"];
  if (score >= 50) return RHYTHM_LABELS["50-69"];
  return RHYTHM_LABELS["below-50"];
}

interface FeedsPatternsSectionProps {
  ribbonText: string;
  ribbonEmoji: string;
  feedInsightCards: InsightCard[];
  accentColor: string;
}

/** Bold key metrics in ribbon text: "12 feeds", "+300%", etc. */
function BoldRibbonText({
  text,
  emoji,
}: {
  text: string;
  emoji: string;
}) {
  const parts: React.ReactNode[] = [];
  const regex = /(\d+\s*feeds?|up\s*\d+%|down\s*\d+%|\+\d+%|\d+%)/gi;
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

function RhythmScoreRing({
  score,
  color,
  label,
  onWhatIsThis,
}: {
  score: number;
  color: string;
  label: string;
  onWhatIsThis: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const r = 32;
  const stroke = 4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <View style={[styles.insightCard, { borderLeftColor: color }]}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: color + "15" }]}>
          <Text style={{ fontSize: 16 }}>🎵</Text>
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
                stroke={color}
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
              <Text style={[styles.feedsRhythmScore, { color }]}>{score}</Text>
            </View>
          </View>
          <Text style={styles.feedsRhythmLabel}>{label}</Text>
          <Pressable
            onPress={() => setShowTooltip(!showTooltip)}
            hitSlop={8}
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text style={styles.feedsWhatIsThis}>What is this?</Text>
          </Pressable>
          {showTooltip && (
            <Text
              style={[
                styles.insightText,
                { marginTop: 8, paddingLeft: 0 },
              ]}
            >
              Measures how consistent feeding times are. Higher scores mean feeds
              happen at more regular intervals.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function FeedsPatternsSection({
  ribbonText,
  ribbonEmoji,
  feedInsightCards,
  accentColor,
}: FeedsPatternsSectionProps) {
  const rhythmCard = feedInsightCards.find(
    (c) => c.title === "Feeding Rhythm Score",
  );
  const otherCards = feedInsightCards.filter(
    (c) => c.title !== "Feeding Rhythm Score",
  );

  return (
    <>
      <Text style={styles.sectionLabel}>Patterns</Text>
      <View style={styles.progressRibbon}>
        <BoldRibbonText text={ribbonText} emoji={ribbonEmoji} />
      </View>
      {rhythmCard?.scoreBar != null && (
        <RhythmScoreRing
          score={rhythmCard.scoreBar.score}
          color={rhythmCard.color}
          label={getRhythmLabel(rhythmCard.scoreBar.score)}
          onWhatIsThis={() => {}}
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
          {item.balanceBar != null && item.scoreBar == null && (
            <View style={styles.balanceBarTrack}>
              <View
                style={[
                  styles.balanceBarLeft,
                  {
                    flex: item.balanceBar.leftPct / 100,
                    backgroundColor: item.color + "40",
                  },
                ]}
              />
              <View
                style={[
                  styles.balanceBarRight,
                  {
                    flex: item.balanceBar.rightPct / 100,
                    backgroundColor: Colors.sandDark + "80",
                  },
                ]}
              />
            </View>
          )}
        </View>
      ))}
    </>
  );
}
