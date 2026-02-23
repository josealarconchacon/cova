import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors } from "../../constants/theme";

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  accentColor?: string;
}

function formatDisplay(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = String(date.getMinutes()).padStart(2, "0");
  const ap = date.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ap}`;
}

export function TimePickerField({
  label,
  value,
  onChange,
  accentColor = Colors.teal,
}: Props) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const handleOpen = () => {
    setTempDate(value);
    setShow(true);
  };

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (_event.type === "set" && selected) {
        onChange(selected);
      }
      return;
    }
    if (selected) {
      setTempDate(selected);
    }
  };

  const handleConfirmIOS = () => {
    onChange(tempDate);
    setShow(false);
  };

  if (Platform.OS === "android") {
    return (
      <View style={localStyles.container}>
        <Text style={localStyles.label}>{label}</Text>
        <TouchableOpacity
          style={[localStyles.field, { borderColor: accentColor + "40" }]}
          onPress={handleOpen}
          activeOpacity={0.7}
        >
          <Text style={localStyles.timeText}>{formatDisplay(value)}</Text>
          <Text style={[localStyles.chevron, { color: accentColor }]}>▼</Text>
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={handleChange}
          />
        )}
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[localStyles.field, { borderColor: accentColor + "40" }]}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <Text style={localStyles.timeText}>{formatDisplay(value)}</Text>
        <Text style={[localStyles.chevron, { color: accentColor }]}>▼</Text>
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={show}>
        <TouchableOpacity
          style={localStyles.backdrop}
          activeOpacity={1}
          onPress={() => setShow(false)}
        >
          <View style={localStyles.pickerSheet}>
            <View style={localStyles.pickerHeader}>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Text style={localStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={localStyles.pickerTitle}>{label}</Text>
              <TouchableOpacity onPress={handleConfirmIOS}>
                <Text
                  style={[localStyles.doneText, { color: accentColor }]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleChange}
              style={localStyles.picker}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
    color: Colors.inkLight,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 17,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 10,
    marginLeft: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(42,32,24,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pickerTitle: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: Colors.ink,
  },
  cancelText: {
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.inkLight,
  },
  doneText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
  },
  picker: {
    height: 200,
  },
});
