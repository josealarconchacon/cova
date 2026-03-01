import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import {
  getPendingInviteCode,
  clearPendingInviteCode,
} from "../../lib/family/pendingInvite";
import { joinFamily } from "../../lib/family/joinFamily";
import { signInWithApple } from "../../lib/auth/appleAuth";

const ROLES = [
  { id: "mom", icon: "💛", label: "Mom" },
  { id: "dad", icon: "💙", label: "Dad" },
  { id: "grandparent", icon: "🤍", label: "Grandparent" },
  { id: "caregiver", icon: "💚", label: "Caregiver" },
];

export default function SignUpScreen() {
  const { invite_code: inviteCodeParam } = useLocalSearchParams<{
    invite_code?: string;
  }>();
  const { setProfile, setActiveBaby } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      const fromParam = inviteCodeParam?.trim();
      if (fromParam) {
        setInviteCode(fromParam.toUpperCase());
        return;
      }
      const fromStore = await getPendingInviteCode();
      if (fromStore) setInviteCode(fromStore);
    };
    resolve();
  }, [inviteCodeParam]);

  // ── Step 1 validation ──
  const validateStep1 = () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirm) {
      Alert.alert(
        "Passwords don't match",
        "Please make sure both passwords are the same.",
      );
      return false;
    }
    return true;
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 8)
      return { label: "Too short", color: Colors.error, bars: 1 };
    if (password.length < 12)
      return { label: "Good", color: Colors.teal, bars: 2 };
    if (password.length < 16)
      return { label: "Strong", color: Colors.moss, bars: 3 };
    return { label: "Very strong", color: Colors.moss, bars: 4 };
  };

  // ── Sign up handler ──
  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter your first name.");
      return;
    }
    if (!role) {
      Alert.alert("Missing role", "Please select your role.");
      return;
    }

    setLoading(true);

    // 1. Create Supabase auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (authError || !data.user) {
      setLoading(false);
      Alert.alert("Sign up failed", authError?.message ?? "Unknown error");
      return;
    }

    const resolvedInviteCode = inviteCode ?? (await getPendingInviteCode());

    if (resolvedInviteCode) {
      // Join existing family (invite flow)
      try {
        await joinFamily(resolvedInviteCode, data.user.id, name.trim(), role);
        await clearPendingInviteCode();
      } catch (err: unknown) {
        setLoading(false);
        Alert.alert("Couldn't join family", (err as Error).message);
        return;
      }
    } else {
      // Create new family and profile (default flow)
      const { error: setupError } = await supabase.rpc(
        "create_family_and_profile",
        {
          p_user_id: data.user.id,
          p_display_name: name.trim(),
          p_role: role,
        },
      );

      if (setupError) {
        setLoading(false);
        Alert.alert("Setup failed", setupError.message);
        return;
      }
    }

    setLoading(false);

    // Fetch and cache the new profile so the store is populated before
    // we navigate — _layout.tsx won't re-route because we go there directly.
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (profile) setProfile(profile);

    // Navigate immediately — don't wait for onAuthStateChange, which fires
    // before the profile exists and would otherwise route back to login.
    // For invite flow: go to tabs (layout will redirect to onboarding if no baby).
    // For new family: go to onboarding to create first baby.
    router.replace(resolvedInviteCode ? "/(tabs)/" : "/onboarding");
  };

  const strength = passwordStrength();

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const { userId, fullName } = await signInWithApple();
      const displayName = fullName?.trim() || "User";

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        const resolvedInviteCode = inviteCode ?? (await getPendingInviteCode());
        if (resolvedInviteCode) {
          await joinFamily(
            resolvedInviteCode,
            userId,
            displayName,
            "caregiver",
          );
          await clearPendingInviteCode();
        } else {
          const { error: setupError } = await supabase.rpc(
            "create_family_and_profile",
            {
              p_user_id: userId,
              p_display_name: displayName,
              p_role: "caregiver",
            },
          );
          if (setupError) throw setupError;
        }

        const { data: newProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (!newProfile) throw new Error("Profile not created");
        setProfile(newProfile);

        const { data: babies } = await supabase
          .from("babies")
          .select("*")
          .eq("family_id", newProfile.family_id)
          .order("created_at", { ascending: true })
          .limit(1);
        setActiveBaby(babies?.[0] ?? null);

        router.replace(resolvedInviteCode ? "/(tabs)/" : "/onboarding");
        return;
      } else {
        setProfile(profile);
        const { data: babies } = await supabase
          .from("babies")
          .select("*")
          .eq("family_id", profile.family_id)
          .order("created_at", { ascending: true })
          .limit(1);
        const baby = babies?.[0] ?? null;
        setActiveBaby(baby);
        router.replace(baby ? "/(tabs)/" : "/onboarding");
      }
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code === "ERR_REQUEST_CANCELED") return;
      Alert.alert("Sign up failed", (e as Error).message);
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
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {[1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === step ? 28 : 8,
                  backgroundColor: i <= step ? Colors.teal : Colors.sandDark,
                },
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <Text style={styles.logo}>Cova</Text>
        <Text style={styles.tagline}>
          {step === 1 ? "Create your account" : "Tell us about yourself"}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1
            ? "Step 1 of 2 — Your credentials"
            : "Step 2 of 2 — Your profile"}
        </Text>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
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
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="At least 8 characters"
                placeholderTextColor={Colors.inkLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                onPress={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
              >
                <Text style={{ fontSize: 18 }}>{showPass ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Password strength bar */}
            {strength && (
              <View style={{ marginBottom: 16, marginTop: -8 }}>
                <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        backgroundColor:
                          i <= strength.bars ? strength.color : Colors.sandDark,
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={{
                    fontFamily: "DM-Sans",
                    fontSize: 11,
                    color: strength.color,
                  }}
                >
                  {strength.label}
                </Text>
              </View>
            )}

            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={[
                styles.input,
                confirm.length > 0 &&
                  confirm !== password && { borderColor: Colors.error },
              ]}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.inkLight}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            {confirm.length > 0 && confirm !== password && (
              <Text style={styles.errorText}>⚠ Passwords don't match</Text>
            )}

            <TouchableOpacity
              style={[styles.btn, { marginTop: 12 }]}
              onPress={() => validateStep1() && setStep(2)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>

            {/* Divider + Apple (iOS only) */}
            {Platform.OS === "ios" && (
              <>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                  }
                  buttonStyle={
                    AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={12}
                  style={styles.appleNativeBtn}
                  onPress={handleAppleSignIn}
                />
              </>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <Text style={styles.label}>Your first name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sarah"
              placeholderTextColor={Colors.inkLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Your role</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setRole(r.id)}
                  style={[
                    styles.roleBtn,
                    role === r.id && styles.roleBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 28, marginBottom: 6 }}>
                    {r.icon}
                  </Text>
                  <Text
                    style={[
                      styles.roleText,
                      role === r.id && styles.roleTextActive,
                    ]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.btn,
                loading && styles.btnDisabled,
                { marginTop: 8 },
              ]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading
                  ? inviteCode
                    ? "Joining family…"
                    : "Creating your Cova…"
                  : inviteCode
                    ? "Join family 🌿"
                    : "Create my Cova 🌿"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep(1)}
              style={{ alignItems: "center", marginTop: 16 }}
            >
              <Text style={styles.switchLink}>← Back</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.cream,
    padding: 28,
    paddingTop: 60,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 32,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  logo: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 44,
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    textAlign: "center",
    marginBottom: 36,
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
    marginBottom: 8,
  },
  eyeBtn: { padding: 8 },
  errorText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.error,
    marginTop: -8,
    marginBottom: 12,
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
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.sandDark },
  dividerText: { fontFamily: "DM-Sans", fontSize: 12, color: Colors.inkLight },
  appleNativeBtn: {
    width: "100%",
    height: 48,
    marginBottom: 4,
  },
  appleBtn: {
    backgroundColor: Colors.ink,
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
  },
  appleBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  roleBtn: {
    width: "47%",
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  roleBtnActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.tealPale,
  },
  roleText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.inkMid,
  },
  roleTextActive: { color: Colors.teal },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  switchText: { fontFamily: "DM-Sans", fontSize: 14, color: Colors.inkLight },
  switchLink: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.teal,
  },
});
