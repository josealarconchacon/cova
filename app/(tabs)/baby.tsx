import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Colors } from "../../constants/theme";
import type { Baby } from "../../types";
import { ensureBucket, PHOTO_BUCKET } from "../../lib/babyUtils";
import { useBabyData } from "../../lib/useBabyData";
import {
  BabyHero,
  BabyInfoGrid,
  BabyStatsCard,
  BabyMilestones,
  EditProfileModal,
  MilestoneModal,
} from "../../components/baby";
import { styles } from "./baby.styles";

export default function BabyScreen() {
  const { profile, activeBaby, setActiveBaby } = useStore();
  const queryClient = useQueryClient();
  const { milestones, stats } = useBabyData(activeBaby?.id);

  // Edit profile state
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhotoUri, setEditPhotoUri] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Milestone modal state
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);

  const openEditProfile = useCallback(() => {
    setEditName(activeBaby?.name ?? "");
    setEditPhotoUri(null);
    setEditProfileModal(true);
  }, [activeBaby?.name]);

  const pickEditPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo access to add a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setEditPhotoUri(result.assets[0].uri);
  };

  const saveProfile = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      Alert.alert("Name required", "Please enter a name for your baby.");
      return;
    }
    if (!activeBaby) return;

    setSavingProfile(true);
    try {
      const updates: Partial<Baby> = {};
      const nameChanged = trimmedName !== activeBaby.name;
      const photoChanged = !!editPhotoUri;

      if (nameChanged) updates.name = trimmedName;

      if (photoChanged) {
        await ensureBucket();
        const ext = editPhotoUri!.split(".").pop() ?? "jpg";
        const contentType = ext === "png" ? "image/png" : "image/jpeg";
        const path = `${activeBaby.id}/avatar.${ext}`;

        const response = await fetch(editPhotoUri!);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, arrayBuffer, { contentType, upsert: true });

        if (uploadError) {
          Alert.alert("Upload failed", uploadError.message);
          setSavingProfile(false);
          return;
        }

        const { data } = supabase.storage
          .from(PHOTO_BUCKET)
          .getPublicUrl(path);
        updates.photo_url = `${data.publicUrl}?t=${Date.now()}`;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("babies")
          .update(updates)
          .eq("id", activeBaby.id);
        if (error) throw error;

        setActiveBaby({ ...activeBaby, ...updates });
        queryClient.invalidateQueries({ queryKey: ["baby", activeBaby.id] });
      }

      setEditProfileModal(false);
    } catch (err: unknown) {
      Alert.alert("Error", (err as Error).message ?? "Something went wrong.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveMilestone = async () => {
    if (!milestoneTitle.trim()) {
      Alert.alert("Missing title", "Please enter a milestone title.");
      return;
    }
    if (!activeBaby || !profile) return;

    setSavingMilestone(true);
    const { error } = await supabase.from("milestones").insert({
      baby_id: activeBaby.id,
      family_id: profile.family_id,
      logged_by: profile.id,
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
    queryClient.invalidateQueries({ queryKey: ["milestones", activeBaby.id] });
  };

  if (!activeBaby) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.cream,
        }}
      >
        <ActivityIndicator size="large" color={Colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BabyHero baby={activeBaby} onEdit={openEditProfile} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BabyInfoGrid baby={activeBaby} />
        <BabyStatsCard stats={stats} milestoneCount={milestones.length} />
        <BabyMilestones
          milestones={milestones}
          onAddMilestone={() => setMilestoneModal(true)}
        />

      </ScrollView>

      <EditProfileModal
        visible={editProfileModal}
        baby={activeBaby}
        editName={editName}
        editPhotoUri={editPhotoUri}
        saving={savingProfile}
        onNameChange={setEditName}
        onPickPhoto={pickEditPhoto}
        onSave={saveProfile}
        onClose={() => setEditProfileModal(false)}
      />

      <MilestoneModal
        visible={milestoneModal}
        title={milestoneTitle}
        description={milestoneDesc}
        saving={savingMilestone}
        onTitleChange={setMilestoneTitle}
        onDescriptionChange={setMilestoneDesc}
        onSave={saveMilestone}
        onClose={() => setMilestoneModal(false)}
      />
    </View>
  );
}
