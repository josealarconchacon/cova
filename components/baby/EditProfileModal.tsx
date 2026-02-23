import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "../../constants/theme";
import type { Baby } from "../../types";
import { styles } from "../../app/(tabs)/baby.styles";

interface EditProfileModalProps {
  visible: boolean;
  baby: Baby;
  editName: string;
  editPhotoUri: string | null;
  saving: boolean;
  onNameChange: (name: string) => void;
  onPickPhoto: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditProfileModal({
  visible,
  baby,
  editName,
  editPhotoUri,
  saving,
  onNameChange,
  onPickPhoto,
  onSave,
  onClose,
}: EditProfileModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => !saving && onClose()}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !saving && onClose()}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalSheet}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Edit profile</Text>

            <TouchableOpacity
              style={styles.editAvatarWrap}
              onPress={onPickPhoto}
              activeOpacity={0.75}
            >
              {(editPhotoUri || baby.photo_url) ? (
                <Image
                  key={editPhotoUri ?? baby.photo_url}
                  source={{
                    uri: editPhotoUri ?? baby.photo_url!,
                    cache: "reload",
                  }}
                  style={styles.editAvatarImg}
                />
              ) : (
                <View style={styles.editAvatarPlaceholder}>
                  <Text style={{ fontSize: 38 }}>🌙</Text>
                </View>
              )}
              <View style={styles.editAvatarBadge}>
                <Text style={{ fontSize: 14, color: "white" }}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.editAvatarHint}>Tap photo to change</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={editName}
              onChangeText={onNameChange}
              placeholder="Baby's name"
              placeholderTextColor={Colors.inkLight}
              autoFocus
              selectTextOnFocus
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Save changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
