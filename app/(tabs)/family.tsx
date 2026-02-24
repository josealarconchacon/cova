import React from "react";
import { Text, ScrollView, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../../store/useStore";
import { useFamilyData } from "../../lib/useFamilyData";
import { ConnectedView, InviteView } from "../../components/family";
import { styles } from "./family.styles";

export default function FamilyScreen() {
  const insets = useSafeAreaInsets();
  const { profile, activeBaby } = useStore();
  const { members, inviteCode } = useFamilyData(profile?.family_id);

  const hasCoParent = members.length > 1;

  const shareInvite = async () => {
    const link = `https://cova.app/join/${inviteCode}`;
    await Share.share({
      message: `Join me on Cova to track ${activeBaby?.name}'s journey together!\n\n${link}`,
      url: link,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Family</Text>
      <Text style={styles.subtitle}>
        {hasCoParent
          ? `${members.length} members connected`
          : "Invite your co-parent to share the journal"}
      </Text>

      {hasCoParent ? (
        <ConnectedView members={members} />
      ) : (
        <InviteView
          inviteCode={inviteCode}
          babyName={activeBaby?.name ?? "your baby"}
          onShare={shareInvite}
        />
      )}
    </ScrollView>
  );
}
