import React from "react";
import { View, Text } from "react-native";
import { Colors } from "../../constants/theme";
import type { Baby } from "../../types";
import { calcAge } from "../../lib/babyUtils";
import {
  DobIcon,
  BoyIcon,
  GirlIcon,
  AgeIcon,
  JournalSinceIcon,
} from "../../assets/icons/BabyInfoIcons";
import { styles } from "../../app/(tabs)/baby.styles";

interface BabyInfoGridProps {
  baby: Baby;
}

function getInfoItems(baby: Baby) {
  return [
    {
      label: "Date of birth",
      value: new Date(baby.date_of_birth).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      Icon: DobIcon,
      color: Colors.dusk,
    },
    {
      label: "Sex",
      value:
        baby.sex === "girl" ? "Girl" : baby.sex === "boy" ? "Boy" : "—",
      Icon: baby.sex === "girl" ? GirlIcon : BoyIcon,
      color: baby.sex === "girl" ? "#E060A0" : baby.sex === "boy" ? "#1976D2" : Colors.inkLight,
    },
    {
      label: "Age",
      value: calcAge(baby).split(" ·")[0],
      Icon: AgeIcon,
      color: Colors.moss,
    },
    {
      label: "Journal since",
      value: "Day 1",
      Icon: JournalSinceIcon,
      color: Colors.sky,
    },
  ] as const;
}

export function BabyInfoGrid({ baby }: BabyInfoGridProps) {
  const items = getInfoItems(baby);
  return (
    <View style={styles.grid}>
      {items.map((c) => (
        <View
          key={c.label}
          style={[styles.infoCard, { borderColor: c.color + "22" }]}
        >
          <c.Icon size={26} color={c.color} />
          <Text style={[styles.infoValue, { color: c.color }]}>{c.value}</Text>
          <Text style={styles.infoLabel}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}
