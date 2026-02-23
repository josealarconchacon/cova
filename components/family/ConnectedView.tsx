import React from "react";
import { View, Text } from "react-native";
import type { Profile } from "../../types";
import { styles } from "../../app/(tabs)/family.styles";

interface ConnectedViewProps {
  members: Profile[];
}

export function ConnectedView({ members }: ConnectedViewProps) {
  return (
    <>
      <View style={styles.syncBadge}>
        <View style={styles.syncDot} />
        <Text style={styles.syncText}>
          Synced live · updates in under 1 second
        </Text>
      </View>

      {members.map((m) => (
        <View key={m.id} style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {m.display_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{m.display_name}</Text>
            <Text style={styles.memberRole}>
              {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
            </Text>
          </View>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>● Online</Text>
          </View>
        </View>
      ))}

      <View style={styles.statsRow}>
        {[
          { value: members.length.toString(), label: "Co-parents" },
          { value: "<1s", label: "Sync time" },
          { value: "Live", label: "Updates" },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
