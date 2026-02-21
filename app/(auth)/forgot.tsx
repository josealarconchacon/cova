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
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../constants/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "cova://reset-password",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 56, textAlign: "center", marginBottom: 24 }}>
          📬
        </Text>
        <Text style={styles.title}>Check your inbox</Text>
        <Text style={styles.body}>
          We sent a password reset link to{"\n"}
          <Text style={{ fontWeight: "700", color: Colors.ink }}>{email}</Text>
          {"\n\n"}
          Check your spam folder if you don't see it within a minute.
        </Text>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.outlineBtnText}>← Back to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.body}>
          Enter your email and we'll send a reset link straight to your inbox.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={Colors.inkLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleReset}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? "Sending…" : "Send reset link"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignItems: "center", marginTop: 20 }}
        >
          <Text style={styles.backLink}>← Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 14,
    color: Colors.inkLight,
    textAlign: "center",
    lineHeight: 22,
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
    marginBottom: 20,
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
  btnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.teal,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  outlineBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 15,
    color: Colors.teal,
  },
  backLink: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "600",
    color: Colors.teal,
  },
});
