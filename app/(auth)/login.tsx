import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { supabase, withTimeout } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Baby } from "../../types";

export default function LoginScreen() {
  const setProfile = useStore((s) => s.setProfile);
  const setActiveBaby = useStore((s) => s.setActiveBaby);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      console.log("[login] signing in…");
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert("Sign in failed", error.message);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        Alert.alert("Sign in failed", "Could not retrieve user info.");
        return;
      }

      console.log("[login] auth OK, fetching profile…");
      const { data: profile, error: profileError } = await withTimeout(
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single(),
      );

      if (profileError || !profile) {
        console.warn("[login] profile fetch failed:", profileError?.message);
        await supabase.auth.signOut();
        Alert.alert(
          "Account not found",
          "No profile found. Please sign up first.",
        );
        return;
      }

      setProfile(profile);

      console.log("[login] profile OK, fetching baby…");
      const { data: babies } = await withTimeout(
        supabase
          .from("babies")
          .select("*")
          .eq("family_id", profile.family_id)
          .order("created_at", { ascending: true })
          .limit(1),
      );

      const baby = (babies?.[0] as Baby) ?? null;
      setActiveBaby(baby);

      console.log("[login] navigating to app");
      router.replace(baby ? "/(tabs)/" : "/onboarding");
    } catch (e: any) {
      console.error("[login] error:", e?.message ?? e);
      const msg = typeof e?.message === "string" ? e.message : "";
      const isTimeout =
        e?.name === "AbortError" ||
        msg.includes("timed out") ||
        msg.includes("Query timed out");
      Alert.alert(
        "Sign in failed",
        isTimeout
          ? "The server is taking too long to respond. Please check your connection and try again."
          : e?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Text style={styles.logo}>Cova</Text>
        <Text style={styles.tagline}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your family's Cova</Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor={Colors.inkLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrap}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Your password"
            placeholderTextColor={Colors.inkLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoComplete="current-password"
            textContentType="password"
          />
          <TouchableOpacity
            onPress={() => setShowPass((v) => !v)}
            style={styles.eyeBtn}
          >
            <Text style={{ fontSize: 18 }}>{showPass ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot")}
          style={{ alignSelf: "flex-end", marginBottom: 28 }}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign in button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {loading ? "Signing in…" : "Sign in to Cova"}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple Sign In */}
        <TouchableOpacity style={styles.appleBtn} activeOpacity={0.85}>
          <Text style={styles.appleBtnText}>🍎 Sign in with Apple</Text>
        </TouchableOpacity>

        {/* Switch to Sign Up */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>New to Cova? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.switchLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.cream,
    padding: 28,
    paddingTop: 80,
  },
  logo: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 48,
    fontWeight: "600",
    color: Colors.teal,
    textAlign: "center",
    marginBottom: 4,
  },
  tagline: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 26,
    fontStyle: "italic",
    fontWeight: "300",
    color: Colors.inkMid,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
    textAlign: "center",
    marginBottom: 44,
  },
  label: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.inkLight,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 16,
    padding: 15,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 16,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 16,
    paddingRight: 12,
    marginBottom: 12,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotLink: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.teal,
    fontWeight: "600",
  },
  btn: {
    backgroundColor: Colors.teal,
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.sandDark,
  },
  dividerText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
  },
  appleBtn: {
    backgroundColor: "#2A2018",
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appleBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  switchText: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
  },
  switchLink: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.teal,
  },
});
