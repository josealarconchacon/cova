import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import type { Milestone } from "../../types";
import { styles } from "../../app/(tabs)/baby.styles";

interface BabyMilestonesProps {
  milestones: Milestone[];
  onAddMilestone: () => void;
}

export function BabyMilestones({ milestones, onAddMilestone }: BabyMilestonesProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>Milestones</Text>

      {milestones.map((m) => (
        <View key={m.id} style={styles.milestoneCard}>
          <View style={styles.milestoneIcon}>
            <Text style={{ fontSize: 22 }}>⭐</Text>
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>{m.title}</Text>
            <Text style={styles.milestoneDate}>
              {new Date(m.happened_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            {m.description ? (
              <Text style={styles.milestoneDesc}>{m.description}</Text>
            ) : null}
          </View>
        </View>
      ))}

      {milestones.length === 0 && (
        <View style={styles.emptyMilestones}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>⭐</Text>
          <Text style={styles.emptyTitle}>No milestones yet</Text>
          <Text style={styles.emptyBody}>
            Tap ⭐ on the home screen to capture one
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addMilestoneBtn}
        onPress={onAddMilestone}
      >
        <Text style={styles.addMilestoneBtnText}>+ Add milestone</Text>
      </TouchableOpacity>
    </>
  );
}
