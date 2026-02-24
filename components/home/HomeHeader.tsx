import React from "react";
import { View, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { getGreeting, formatBabyAge } from "../../lib/home/formatUtils";
import type { Baby, Profile } from "../../types";
import { styles } from "../../app/(tabs)/index.styles";

interface HomeHeaderProps {
  profile: Profile | null;
  activeBaby: Baby;
  coParent: Profile | undefined;
  isCoParentOnline: (userId: string) => boolean;
}

export function HomeHeader({
  profile,
  activeBaby,
  coParent,
  isCoParentOnline,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
      <View>
        <Text style={styles.greeting}>
          {getGreeting()}, {profile?.display_name} 👋
        </Text>
        <Text style={styles.babyName}>{activeBaby.name}</Text>
        <Text style={styles.babyAge}>{formatBabyAge(activeBaby)}</Text>
      </View>
      <View style={styles.avatarWrap}>
        {activeBaby.photo_url ? (
          <Image
            key={activeBaby.photo_url}
            source={{ uri: activeBaby.photo_url, cache: "reload" }}
            style={styles.avatarImg}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={{ fontSize: 24 }}>🌙</Text>
          </View>
        )}
        <View
          style={[
            styles.syncDot,
            {
              backgroundColor:
                coParent && isCoParentOnline(coParent.id)
                  ? Colors.moss
                  : Colors.sandDark,
            },
          ]}
        />
      </View>
    </View>
  );
}
