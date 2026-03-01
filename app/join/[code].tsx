import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import { setPendingInviteCode } from "../../lib/family/pendingInvite";

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { profile } = useStore();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [familyName, setFamilyName] = useState("");

  // ── Verify the code exists on mount ──────────────────────────
  useEffect(() => {
    if (!code) return;
    supabase
      .from("families")
      .select("id, family_name")
      .eq("invite_code", code.toUpperCase())
      .single()
      .then(async ({ data, error }) => {
        if (data && !error) {
          setVerified(true);
          setFamilyName(data.family_name ?? "a family");
          await setPendingInviteCode(code);
        }
      });
  }, [code]);

  const handleJoin = async () => {
    // Not logged in — go sign up first (invite code already stored in SecureStore)
    if (!profile) {
      router.push({
        pathname: "/(auth)/signup",
        params: { invite_code: code ?? undefined },
      });
      return;
    }

    setLoading(true);

    // 1. Find family by invite code
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id")
      .eq("invite_code", code.toUpperCase())
      .single();

    if (familyError || !family) {
      setLoading(false);
      Alert.alert(
        "Invalid invite",
        "This link is invalid or has expired. Ask for a new one.",
      );
      return;
    }

    // 2. Join — update profile's family_id
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ family_id: family.id })
      .eq("id", profile.id);

    setLoading(false);

    if (updateError) {
      Alert.alert("Error joining", updateError.message);
      return;
    }

    // 3. Navigate home — realtime sync starts automatically
    router.replace("/(tabs)/");
  };

  if (!verified) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.teal} />
        <Text style={styles.verifyText}>Checking invite…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 56, textAlign: "center", marginBottom: 20 }}>
        🌿
      </Text>

      <Text style={styles.title}>You've been invited!</Text>
      <Text style={styles.body}>
        Join{" "}
        <Text style={{ fontWeight: "700", color: Colors.ink }}>
          {familyName}
        </Text>{" "}
        on Cova. You'll see every feed, nap, and milestone in real time.
      </Text>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>INVITE CODE</Text>
        <Text style={styles.codeValue}>{code?.toUpperCase()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleJoin}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>
          {loading ? "Joining…" : "Join family →"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Not now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  verifyText: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: 28,
    paddingTop: 100,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 38,
    fontWeight: "600",
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.inkLight,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 36,
  },
  codeCard: {
    backgroundColor: Colors.tealPale,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
  },
  codeLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.inkLight,
    marginBottom: 10,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  codeValue: {
    fontFamily: "DM-Mono",
    fontSize: 30,
    color: Colors.teal,
    letterSpacing: 4,
  },
  btn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
  },
});
