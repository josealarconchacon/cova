import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Colors } from "../../constants/theme";
import { styles } from "../../app/(tabs)/baby.styles";

interface MilestoneModalProps {
  visible: boolean;
  title: string;
  description: string;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function MilestoneModal({
  visible,
  title,
  description,
  saving,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onClose,
}: MilestoneModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.milestoneModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.milestoneModalSheet}
        >
          <View style={styles.milestoneModalHandle} />
          <Text style={styles.milestoneModalTitle}>⭐ New milestone</Text>
          <Text style={styles.addMilestoneBtnText}>Title</Text>
          <TextInput
            style={styles.milestoneInput}
            placeholder="e.g. First smile!"
            placeholderTextColor={Colors.inkLight}
            value={title}
            onChangeText={onTitleChange}
            autoFocus
          />
          <Text style={styles.addMilestoneBtnText}>Notes (optional)</Text>
          <TextInput
            style={styles.milestoneInputMultiline}
            placeholder="Any details to remember…"
            placeholderTextColor={Colors.inkLight}
            value={description}
            onChangeText={onDescriptionChange}
            multiline
          />
          <TouchableOpacity
            style={[styles.saveMilestoneBtn, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={styles.saveMilestoneBtnText}>
              {saving ? "Saving…" : "Save milestone ⭐"}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
