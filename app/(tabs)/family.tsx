import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Share,
  StyleSheet,
  Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Profile } from "../../types";

export default function FamilyScreen() {
  const { profile, activeBaby } = useStore();
  const [inviteCode, setInviteCode] = useState("");

  // ── Fetch all family members ──────────────────────────────────
  const { data: members = [] } = useQuery({
    queryKey: ["family-members", profile?.family_id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", profile!.family_id);

      if (error) throw error;
      return data as Profile[];
    },
  });

  // ── Fetch family invite code ──────────────────────────────────
  useEffect(() => {
    if (!profile) return;
    supabase
      .from("families")
      .select("invite_code")
      .eq("id", profile.family_id)
      .single()
      .then(({ data }) => {
        if (data) setInviteCode(data.invite_code);
      });
  }, [profile?.family_id]);

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
      contentContainerStyle={styles.content}
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

// ── Connected state ───────────────────────────────────────────────────────────

interface ConnectedViewProps {
  members: Profile[];
}

function ConnectedView({ members }: ConnectedViewProps) {
  return (
    <>
      {/* Sync badge */}
      <View style={styles.syncBadge}>
        <View style={styles.syncDot} />
        <Text style={styles.syncText}>
          Synced live · updates in under 1 second
        </Text>
      </View>

      {/* Member cards */}
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

      {/* Stats */}
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

// ── No co-parent yet ──────────────────────────────────────────────────────────

interface InviteViewProps {
  inviteCode: string;
  babyName: string;
  onShare: () => void;
}

function InviteView({ inviteCode, babyName, onShare }: InviteViewProps) {
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const sendEmail = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setSending(true);
    // In production: call a Supabase Edge Function to send the email
    // await supabase.functions.invoke('send-invite', { body: { email, inviteCode } })
    await new Promise((r) => setTimeout(r, 1200)); // simulate
    setSending(false);
    Alert.alert("Invite sent! 🎉", `We sent an invite to ${email}`);
  };

  return (
    <>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Invite your co-parent</Text>
        <Text style={styles.heroBody}>
          Share the link and they'll join your {babyName} journal. Every feed,
          nap, and milestone stays in sync for both of you.
        </Text>
      </View>

      {/* Invite code display */}
      <View style={styles.codeCard}>
        <Text style={styles.codeCardLabel}>YOUR INVITE CODE</Text>
        <Text style={styles.codeCardValue}>{inviteCode}</Text>
        <Text style={styles.codeCardSub}>Expires in 7 days</Text>
      </View>

      {/* Share link button */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onShare}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>🔗 Share invite link</Text>
      </TouchableOpacity>

      {/* Toggle email mode */}
      <TouchableOpacity
        onPress={() => setEmailMode((v) => !v)}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>
          {emailMode ? "← Back to link sharing" : "📧  Send by email instead"}
        </Text>
      </TouchableOpacity>

      {/* Email input */}
      {emailMode && (
        <View style={styles.emailSection}>
          <Text style={styles.fieldLabel}>Their email address</Text>
          <TextInput
            style={styles.emailInput}
            placeholder="partner@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TouchableOpacity
            style={[styles.primaryBtn, sending && { opacity: 0.6 }]}
            onPress={sendEmail}
            disabled={sending}
          >
            <Text style={styles.primaryBtnText}>
              {sending ? "Sending…" : "Send invitation"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Benefits */}
      {[
        { icon: "⚡", text: "Under 1 second sync — no refreshing needed" },
        { icon: "👀", text: "Always know what happened while you were away" },
        { icon: "🤝", text: "Both parents see the full picture, less stress" },
      ].map((b) => (
        <View key={b.text} style={styles.benefitRow}>
          <Text style={{ fontSize: 18 }}>{b.icon}</Text>
          <Text style={styles.benefitText}>{b.text}</Text>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 36,
    fontWeight: "600",
    color: Colors.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
    marginBottom: 28,
  },
  // ── Connected styles
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.mossPale,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.moss,
  },
  syncText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 12,
    color: Colors.moss,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.sand,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.tealPale,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 20,
    fontWeight: "600",
    color: Colors.teal,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 3,
  },
  memberRole: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
  },
  onlineBadge: {
    backgroundColor: Colors.mossPale,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onlineText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
    color: Colors.moss,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.sand,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 26,
    fontWeight: "600",
    color: Colors.teal,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  // ── Invite styles
  hero: {
    backgroundColor: Colors.tealPale,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 26,
    fontWeight: "600",
    color: Colors.teal,
    marginBottom: 8,
  },
  heroBody: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkMid,
    lineHeight: 21,
  },
  codeCard: {
    backgroundColor: Colors.sand,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  codeCardLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.inkLight,
    marginBottom: 8,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  codeCardValue: {
    fontFamily: "DM-Mono",
    fontSize: 30,
    fontWeight: "500",
    color: Colors.teal,
    letterSpacing: 4,
    marginBottom: 6,
  },
  codeCardSub: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
    fontStyle: "italic",
  },
  primaryBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  secondaryBtnText: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.teal,
  },
  emailSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.inkLight,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  emailInput: {
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 16,
    padding: 15,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sandDark,
  },
  benefitText: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkMid,
    flex: 1,
    lineHeight: 18,
  },
});
