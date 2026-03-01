import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors } from "../../constants/theme";
import { formatWeekRangeSunSat } from "../../lib/insights/formatUtils";

interface WeekPickerOverlayProps {
  visible: boolean;
  onClose: () => void;
  selectedOffset: number;
  onSelectWeek: (offset: number) => void;
}

export function WeekPickerOverlay({
  visible,
  onClose,
  selectedOffset,
  onSelectWeek,
}: WeekPickerOverlayProps) {
  const weeks = Array.from({ length: 12 }, (_, i) => i);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.panel}>
              <Text style={styles.title}>Select week</Text>
              {weeks.map((offset) => {
                const label =
                  offset === 0 ? "This week" : formatWeekRangeSunSat(offset);
                const isSelected = selectedOffset === offset;
                return (
                  <Pressable
                    key={offset}
                    style={[
                      styles.weekRow,
                      isSelected && styles.weekRowSelected,
                    ]}
                    onPress={() => {
                      onSelectWeek(offset);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.weekLabel,
                        isSelected && styles.weekLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  panel: {
    backgroundColor: Colors.cream,
    borderRadius: 16,
    padding: 16,
    maxHeight: 400,
  },
  title: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  weekRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  weekRowSelected: {
    backgroundColor: Colors.tealPale,
  },
  weekLabel: {
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    fontWeight: "500",
  },
  weekLabelSelected: {
    color: Colors.teal,
    fontWeight: "700",
  },
});
