import { useState } from "react";
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
import { router } from "expo-router";
import { supabase } from "../lib/supabase";
import { useStore } from "../store/useStore";
import { Colors } from "../constants/theme";
import type { Baby } from "../types";

const SEX_OPTIONS = [
  { id: "girl", icon: "🌸", label: "Girl" },
  { id: "boy", icon: "💙", label: "Boy" },
  { id: null, icon: "🌟", label: "Prefer not to say" },
] as const;

export default function OnboardingScreen() {
  const { profile, setActiveBaby } = useStore();
  const [babyName, setBabyName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [sex, setSex] = useState<"girl" | "boy" | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Format raw digits into MM/DD/YYYY as user types
  const handleDobChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setDob(formatted);
  };

  // Convert MM/DD/YYYY → YYYY-MM-DD for Supabase
  const parseDob = (): string | null => {
    const parts = dob.split("/");
    if (parts.length !== 3 || parts[2].length !== 4) return null;
    const [mm, dd, yyyy] = parts;
    const date = new Date(`${yyyy}-${mm}-${dd}`);
    if (isNaN(date.getTime())) return null;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (!babyName.trim()) {
      Alert.alert("Missing name", "Please enter your baby's name.");
      return;
    }
    if (!dob || dob.length < 10) {
      Alert.alert("Missing date", "Please enter your baby's date of birth.");
      return;
    }
    const parsedDob = parseDob();
    if (!parsedDob) {
      Alert.alert("Invalid date", "Please use MM/DD/YYYY format.");
      return;
    }
    if (sex === undefined) {
      Alert.alert("Missing selection", "Please select an option for sex.");
      return;
    }
    if (!profile) {
      Alert.alert("Error", "Profile not loaded. Please restart the app.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.rpc("create_baby", {
      p_family_id: profile.family_id,
      p_name: babyName.trim(),
      p_date_of_birth: parsedDob,
      p_sex: sex ?? null,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    setActiveBaby(data as Baby);
    router.replace("/(tabs)/");
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
        <Text style={styles.logo}>Cova 🌿</Text>
        <Text style={styles.tagline}>Meet your baby</Text>
        <Text style={styles.subtitle}>
          Let's set up your little one's journal
        </Text>

        {/* Baby name */}
        <Text style={styles.label}>Baby's name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Luna"
          placeholderTextColor={Colors.inkLight}
          value={babyName}
          onChangeText={setBabyName}
          autoCapitalize="words"
          autoFocus
        />

        {/* Date of birth */}
        <Text style={styles.label}>Date of birth</Text>
        <TextInput
          style={styles.input}
          placeholder="MM/DD/YYYY"
          placeholderTextColor={Colors.inkLight}
          value={dob}
          onChangeText={handleDobChange}
          keyboardType="number-pad"
        />

        {/* Sex */}
        <Text style={styles.label}>Sex</Text>
        <View style={styles.sexRow}>
          {SEX_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={String(opt.id)}
              style={[styles.sexBtn, sex === opt.id && styles.sexBtnActive]}
              onPress={() => setSex(opt.id as typeof sex)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 26, marginBottom: 6 }}>{opt.icon}</Text>
              <Text
                style={[
                  styles.sexLabel,
                  sex === opt.id && styles.sexLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? "Creating journal…" : "Start our journal 🌿"}
          </Text>
        </TouchableOpacity>

        <View style={styles.legalRow}>
          <Text style={styles.legalText}>By continuing you agree to our </Text>
          <TouchableOpacity
            onPress={() => router.push("/(settings)/privacy-policy")}
            activeOpacity={0.7}
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
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
    paddingTop: 72,
    paddingBottom: 48,
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
    marginBottom: 40,
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
  sexRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  sexBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  sexBtnActive: {
    borderColor: Colors.teal,
    backgroundColor: Colors.tealPale,
  },
  sexLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 12,
    color: Colors.inkMid,
    textAlign: "center",
  },
  sexLabelActive: {
    color: Colors.teal,
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
  },
  legalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 14,
  },
  legalText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
  },
  legalLink: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.teal,
  },
});
