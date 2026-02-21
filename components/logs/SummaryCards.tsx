import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/theme";
import type { Log } from "../../types";

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  logs: Log[];
}

export function SummaryCards({ logs }: Props) {
  const feeds = logs.filter((l) => l.type === "feed");
  const sleeps = logs.filter((l) => l.type === "sleep");
  const diapers = logs.filter((l) => l.type === "diaper");

  const totalSleepSecs = sleeps.reduce(
    (acc, l) => acc + (l.duration_seconds ?? 0),
    0,
  );

  const lastFeed = feeds[0];
  const lastDiaper = diapers[0];

  const cards = [
    {
      icon: "🍼",
      label: "Feeds today",
      value: feeds.length > 0 ? `${feeds.length}x` : "—",
      sub: lastFeed ? `Last: ${formatTime(lastFeed.started_at)}` : "None yet",
      color: Colors.dusk,
      pale: "#F8EDE9",
    },
    {
      icon: "💤",
      label: "Sleep today",
      value: totalSleepSecs > 0 ? formatDuration(totalSleepSecs) : "—",
      sub:
        sleeps.length > 0
          ? `${sleeps.length} session${sleeps.length > 1 ? "s" : ""}`
          : "No sleep logged",
      color: "#5A8FC9",
      pale: "#EBF2FB",
    },
    {
      icon: "🩲",
      label: "Last diaper",
      value: lastDiaper?.notes ?? "—",
      sub: lastDiaper ? formatTime(lastDiaper.started_at) : "None today",
      color: Colors.moss,
      pale: Colors.mossPale,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {cards.map((card) => (
        <View
          key={card.label}
          style={[styles.card, { backgroundColor: card.pale }]}
        >
          <Text style={styles.cardIcon}>{card.icon}</Text>
          <Text style={[styles.cardValue, { color: card.color }]}>
            {card.value}
          </Text>
          <Text style={styles.cardLabel}>{card.label}</Text>
          <Text style={styles.cardSub}>{card.sub}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 20,
  },
  container: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 130,
    borderRadius: 18,
    padding: 16,
  },
  cardIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  cardValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 2,
  },
  cardLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    fontStyle: "italic",
  },
});
