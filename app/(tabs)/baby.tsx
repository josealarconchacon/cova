import React from "react";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Baby, Milestone } from "../../types";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
  MomentIcon,
} from "../../assets/icons/QuickActionIcons";

export default function BabyScreen() {
  const { profile, activeBaby, setActiveBaby } = useStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(activeBaby?.name ?? "");
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);

  // ── Fetch milestones ──────────────────────────────────────────
  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .order("happened_at", { ascending: false });
      if (error) throw error;
      return data as Milestone[];
    },
  });

  // ── Fetch all-time log counts ─────────────────────────────────
  const { data: stats } = useQuery({
    queryKey: ["baby-stats", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data } = await supabase
        .from("logs")
        .select("type")
        .eq("baby_id", activeBaby!.id);

      const counts = { feed: 0, sleep: 0, diaper: 0, milestone: 0 };
      data?.forEach((l) => {
        if (l.type in counts) counts[l.type as keyof typeof counts]++;
      });
      return counts;
    },
  });

  // ── Update baby name ──────────────────────────────────────────
  const updateName = useMutation({
    mutationFn: async (newName: string) => {
      const { error } = await supabase
        .from("babies")
        .update({ name: newName.trim() })
        .eq("id", activeBaby!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setActiveBaby({ ...activeBaby!, name: name.trim() });
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["baby", activeBaby!.id] });
    },
  });

  // ── Upload profile photo ──────────────────────────────────────
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to add a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const file = result.assets[0];
    const ext = file.uri.split(".").pop() ?? "jpg";
    const path = `${activeBaby!.id}/avatar.${ext}`;

    // Upload to Supabase Storage bucket 'baby-photos'
    const { error: uploadError } = await supabase.storage
      .from("baby-photos")
      .upload(
        path,
        { uri: file.uri, type: `image/${ext}`, name: path } as any,
        { upsert: true },
      );

    if (uploadError) {
      Alert.alert("Upload failed", uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("baby-photos").getPublicUrl(path);

    await supabase
      .from("babies")
      .update({ photo_url: data.publicUrl })
      .eq("id", activeBaby!.id);

    setActiveBaby({ ...activeBaby!, photo_url: data.publicUrl });
  };

  const saveMilestone = async () => {
    if (!milestoneTitle.trim()) {
      Alert.alert("Missing title", "Please enter a milestone title.");
      return;
    }
    setSavingMilestone(true);
    const { error } = await supabase.from("milestones").insert({
      baby_id: activeBaby!.id,
      family_id: profile!.family_id,
      logged_by: profile!.id,
      title: milestoneTitle.trim(),
      description: milestoneDesc.trim() || null,
      happened_at: new Date().toISOString(),
    });
    setSavingMilestone(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setMilestoneTitle("");
    setMilestoneDesc("");
    setMilestoneModal(false);
    queryClient.invalidateQueries({ queryKey: ["milestones", activeBaby!.id] });
  };

  const calcAge = () => {
    if (!activeBaby?.date_of_birth) return "";
    const dob = new Date(activeBaby.date_of_birth);
    const now = new Date();
    const months =
      (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth());
    const weeks = Math.floor(
      ((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 7)) % 4.33,
    );
    return `${months} months · ${weeks} weeks old`;
  };

  if (!activeBaby) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.cream }}>
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={pickPhoto} style={styles.avatarWrap}>
          {activeBaby.photo_url ? (
            <Image
              source={{ uri: activeBaby.photo_url }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ fontSize: 44 }}>🌙</Text>
            </View>
          )}
          <View style={styles.editPhotoBadge}>
            <Text style={{ fontSize: 12 }}>📷</Text>
          </View>
        </TouchableOpacity>

        {editing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={styles.heroName}>{activeBaby.name}</Text>
        )}

        <Text style={styles.heroAge}>{calcAge()}</Text>

        <View style={styles.heroBtnRow}>
          {editing ? (
            <>
              <TouchableOpacity
                style={styles.heroBtnPrimary}
                onPress={() => updateName.mutate(name)}
                disabled={updateName.isPending}
              >
                <Text style={styles.heroBtnText}>
                  {updateName.isPending ? "Saving…" : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroBtnGhost}
                onPress={() => {
                  setEditing(false);
                  setName(activeBaby.name);
                }}
              >
                <Text style={styles.heroBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.heroBtnGhost}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.heroBtnText}>Edit profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Info grid ── */}
      <View style={styles.grid}>
        {[
          {
            label: "Date of birth",
            value: new Date(activeBaby.date_of_birth).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              },
            ),
            icon: "🎂",
            color: Colors.dusk,
          },
          {
            label: "Sex",
            value:
              activeBaby.sex === "girl"
                ? "Girl"
                : activeBaby.sex === "boy"
                  ? "Boy"
                  : "—",
            icon: "🌸",
            color: Colors.lav,
          },
          {
            label: "Age",
            value: calcAge().split(" ·")[0],
            icon: "🌱",
            color: Colors.moss,
          },
          {
            label: "Journal since",
            value: "Day 1",
            icon: "📖",
            color: Colors.sky,
          },
        ].map((c) => (
          <View
            key={c.label}
            style={[styles.infoCard, { borderColor: c.color + "22" }]}
          >
            <Text style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</Text>
            <Text style={[styles.infoValue, { color: c.color }]}>
              {c.value}
            </Text>
            <Text style={styles.infoLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* ── All-time stats ── */}
      <Text style={styles.sectionLabel}>All-time stats</Text>
      <View style={styles.statsCard}>
        {([
          {
            Icon: FeedIcon,
            label: "Total feeds",
            value: stats?.feed.toLocaleString() ?? "—",
            color: Colors.dusk,
          },
          { Icon: SleepIcon, label: "Total sleep", value: "—", color: Colors.sky },
          {
            Icon: DiaperIcon,
            label: "Diaper changes",
            value: stats?.diaper.toLocaleString() ?? "—",
            color: Colors.moss,
          },
          {
            Icon: MomentIcon,
            label: "Milestones",
            value: milestones.length.toString(),
            color: Colors.gold,
          },
        ] as const).map((s, i, arr) => (
          <View
            key={s.label}
            style={[styles.statRow, i < arr.length - 1 && styles.statRowBorder]}
          >
            <View
              style={[styles.statIcon, { backgroundColor: s.color + "18" }]}
            >
              <s.Icon size={20} color={s.color} />
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>
              {s.value}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Milestones ── */}
      <Text style={styles.sectionLabel}>Milestones</Text>

      {milestones.map((m) => (
        <View key={m.id} style={styles.milestoneCard}>
          <View style={styles.milestoneIcon}>
            <Text style={{ fontSize: 22 }}>⭐</Text>
          </View>
          <View style={styles.milestoneInfo}>
            <Text style={styles.milestoneTitle}>{m.title}</Text>
            <Text style={styles.milestoneDate}>
              {new Date(m.happened_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            {m.description ? (
              <Text style={styles.milestoneDesc}>{m.description}</Text>
            ) : null}
          </View>
        </View>
      ))}

      {milestones.length === 0 && (
        <View style={styles.emptyMilestones}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>⭐</Text>
          <Text style={styles.emptyTitle}>No milestones yet</Text>
          <Text style={styles.emptyBody}>
            Tap ⭐ on the home screen to capture one
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addMilestoneBtn}
        onPress={() => setMilestoneModal(true)}
      >
        <Text style={styles.addMilestoneBtnText}>+ Add milestone</Text>
      </TouchableOpacity>

      {/* Milestone modal */}
      <Modal
        visible={milestoneModal}
        transparent
        animationType="slide"
        onRequestClose={() => setMilestoneModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(42,32,24,0.45)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setMilestoneModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{ backgroundColor: Colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 }}
          >
            <View style={{ width: 40, height: 4, backgroundColor: Colors.sandDark, borderRadius: 2, alignSelf: "center", marginBottom: 20 }} />
            <Text style={{ fontFamily: "Cormorant-Garamond", fontSize: 24, fontWeight: "600", color: Colors.ink, textAlign: "center", marginBottom: 20 }}>
              ⭐ New milestone
            </Text>
            <Text style={styles.addMilestoneBtnText}>Title</Text>
            <TextInput
              style={{ backgroundColor: Colors.sand, borderWidth: 1.5, borderColor: Colors.sandDark, borderRadius: 14, padding: 14, fontFamily: "DM-Sans", fontSize: 15, color: Colors.ink, marginBottom: 12, marginTop: 6 }}
              placeholder="e.g. First smile!"
              placeholderTextColor={Colors.inkLight}
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
              autoFocus
            />
            <Text style={styles.addMilestoneBtnText}>Notes (optional)</Text>
            <TextInput
              style={{ backgroundColor: Colors.sand, borderWidth: 1.5, borderColor: Colors.sandDark, borderRadius: 14, padding: 14, fontFamily: "DM-Sans", fontSize: 15, color: Colors.ink, marginBottom: 20, marginTop: 6, minHeight: 80, textAlignVertical: "top" }}
              placeholder="Any details to remember…"
              placeholderTextColor={Colors.inkLight}
              value={milestoneDesc}
              onChangeText={setMilestoneDesc}
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: Colors.gold, borderRadius: 18, padding: 17, alignItems: "center", opacity: savingMilestone ? 0.6 : 1 }}
              onPress={saveMilestone}
              disabled={savingMilestone}
            >
              <Text style={{ fontFamily: "DM-Sans", fontWeight: "700", fontSize: 16, color: "white" }}>
                {savingMilestone ? "Saving…" : "Save milestone ⭐"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    paddingBottom: 100,
  },
  // ── Hero
  hero: {
    backgroundColor: Colors.teal,
    padding: 48,
    paddingTop: 60,
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  editPhotoBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  nameInput: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 34,
    fontWeight: "600",
    color: "white",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 6,
  },
  heroName: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 36,
    fontWeight: "600",
    color: "white",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroAge: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 16,
  },
  heroBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  heroBtnPrimary: {
    backgroundColor: Colors.moss,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  heroBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 13,
    color: "white",
  },
  // ── Info grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 20,
    paddingBottom: 0,
  },
  infoCard: {
    width: "47%",
    backgroundColor: Colors.sand,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  infoValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
    lineHeight: 20,
  },
  infoLabel: {
    fontFamily: "DM-Sans",
    fontSize: 10,
    color: Colors.inkLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  // ── Section label
  sectionLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.inkLight,
    margin: 20,
    marginBottom: 12,
    fontWeight: "600",
  },
  // ── Stats
  statsCard: {
    backgroundColor: Colors.sand,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 4,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.sandDark,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkMid,
    flex: 1,
  },
  statValue: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 22,
    fontWeight: "600",
  },
  // ── Milestones
  milestoneCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    backgroundColor: Colors.cream,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gold + "22",
  },
  milestoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.gold + "18",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  milestoneInfo: { flex: 1 },
  milestoneTitle: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 2,
  },
  milestoneDate: {
    fontFamily: "DM-Mono",
    fontSize: 11,
    color: Colors.inkLight,
  },
  milestoneDesc: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkMid,
    marginTop: 4,
    lineHeight: 17,
  },
  emptyMilestones: {
    alignItems: "center",
    paddingVertical: 32,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 20,
    color: Colors.inkLight,
    marginBottom: 4,
  },
  emptyBody: {
    fontFamily: "DM-Sans",
    fontSize: 13,
    color: Colors.inkLight,
    textAlign: "center",
  },
  addMilestoneBtn: {
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderStyle: "dashed",
    borderRadius: 18,
    margin: 20,
    marginTop: 10,
    padding: 16,
    alignItems: "center",
  },
  addMilestoneBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.inkLight,
  },
});
