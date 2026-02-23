import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { styles } from "../../app/(tabs)/family.styles";

const BENEFITS = [
  { icon: "⚡", text: "Under 1 second sync — no refreshing needed" },
  { icon: "👀", text: "Always know what happened while you were away" },
  { icon: "🤝", text: "Both parents see the full picture, less stress" },
] as const;

interface InviteViewProps {
  inviteCode: string;
  babyName: string;
  onShare: () => void;
}

export function InviteView({ inviteCode, babyName, onShare }: InviteViewProps) {
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
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Invite your co-parent</Text>
        <Text style={styles.heroBody}>
          Share the link and they'll join your {babyName} journal. Every feed,
          nap, and milestone stays in sync for both of you.
        </Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeCardLabel}>YOUR INVITE CODE</Text>
        <Text style={styles.codeCardValue}>{inviteCode}</Text>
        <Text style={styles.codeCardSub}>Expires in 7 days</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onShare}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>🔗 Share invite link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setEmailMode((v) => !v)}
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>
          {emailMode ? "← Back to link sharing" : "📧  Send by email instead"}
        </Text>
      </TouchableOpacity>

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

      {BENEFITS.map((b) => (
        <View key={b.text} style={styles.benefitRow}>
          <Text style={{ fontSize: 18 }}>{b.icon}</Text>
          <Text style={styles.benefitText}>{b.text}</Text>
        </View>
      ))}
    </>
  );
}
