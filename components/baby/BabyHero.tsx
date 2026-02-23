import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import type { Baby } from "../../types";
import { calcAge } from "../../lib/babyUtils";
import { styles } from "../../app/(tabs)/baby.styles";

interface BabyHeroProps {
  baby: Baby;
  onEdit: () => void;
}

export function BabyHero({ baby, onEdit }: BabyHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroInner}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={onEdit}
          activeOpacity={0.85}
        >
          <View style={styles.avatarRing}>
            {baby.photo_url ? (
              <Image
                key={baby.photo_url}
                source={{ uri: baby.photo_url, cache: "reload" }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ fontSize: 36 }}>🌙</Text>
              </View>
            )}
          </View>
          <View style={styles.editBadge}>
            <Text style={{ fontSize: 11 }}>✏️</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.heroText}>
          <Text style={styles.heroName} numberOfLines={1}>
            {baby.name}
          </Text>
          <Text style={styles.heroAge}>{calcAge(baby)}</Text>
        </View>
      </View>
    </View>
  );
}
