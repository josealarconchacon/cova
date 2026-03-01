import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { styles } from "../../app/(tabs)/family.styles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BENEFITS = [
  { icon: "⚡", text: "Under 1 second sync — no refreshing needed" },
  { icon: "👀", text: "Always know what happened while you were away" },
  { icon: "🤝", text: "Both parents see the full picture, less stress" },
] as const;

interface InviteViewProps {
  inviteCode: string;
  babyName: string;
  inviterName?: string;
  onShare: () => void;
}

export function InviteView({
  inviteCode,
  babyName,
  inviterName,
  onShare,
}: InviteViewProps) {
  const profile = useStore((s) => s.profile);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [didSend, setDidSend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async () => {
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const { error: fnError } = await supabase.functions.invoke("send-invite", {
        body: {
          email: trimmed,
          inviteCode,
          inviterName: inviterName ?? profile?.display_name ?? "Your co-parent",
        },
      });
      if (fnError) throw fnError;
      setDidSend(true);
    } catch {
      setError("Could not send invite. Please try sharing the link instead.");
    } finally {
      setSending(false);
    }
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
        onPress={() => {
          setEmailMode((v) => !v);
          if (emailMode) {
            setError(null);
            setDidSend(false);
          }
        }}
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
            style={[
              styles.emailInput,
              error && styles.emailInputError,
            ]}
            placeholder="partner@email.com"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!sending && !didSend}
          />
          {error && <Text style={styles.emailErrorText}>{error}</Text>}
          {didSend ? (
            <View style={styles.emailSuccessRow}>
              <Text style={styles.emailSuccessText}>✓ Invite sent to {email}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, sending && { opacity: 0.6 }]}
              onPress={sendEmail}
              disabled={sending}
            >
              <Text style={styles.primaryBtnText}>
                {sending ? "Sending…" : "Send invitation"}
              </Text>
            </TouchableOpacity>
          )}
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
