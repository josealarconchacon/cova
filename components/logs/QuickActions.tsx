import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/theme";

const ACTIONS = [
  { id: "feed", icon: "🍼", label: "Feed", color: Colors.dusk, hasTimer: true },
  { id: "sleep", icon: "💤", label: "Sleep", color: "#5A8FC9", hasTimer: true },
  {
    id: "diaper",
    icon: "🩲",
    label: "Diaper",
    color: Colors.moss,
    hasTimer: false,
  },
  {
    id: "milestone",
    icon: "⭐",
    label: "Moment",
    color: "#C9961A",
    hasTimer: false,
  },
  {
    id: "health",
    icon: "🏥",
    label: "Health",
    color: "#8B7EC8",
    hasTimer: false,
  },
] as const;

type ActionId = (typeof ACTIONS)[number]["id"];

interface Props {
  activeTimerType: string | null;
  onTimerAction: (type: "feed" | "sleep") => void;
  onInstantLog: (
    type: "diaper" | "health" | "milestone",
    note: string,
    metadata?: Record<string, unknown>,
  ) => void;
}

export function QuickActions({
  activeTimerType,
  onTimerAction,
  onInstantLog,
}: Props) {
  const [modal, setModal] = useState<ActionId | null>(null);

  const handlePress = async (action: (typeof ACTIONS)[number]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (action.hasTimer) {
      onTimerAction(action.id as "feed" | "sleep");
    } else {
      setModal(action.id);
    }
  };

  return (
    <>
      <View style={styles.row}>
        {ACTIONS.map((action) => {
          const isActive = activeTimerType === action.id;
          return (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.btn,
                isActive && {
                  backgroundColor: action.color,
                  shadowColor: action.color,
                  shadowOpacity: 0.4,
                  shadowOffset: { width: 0, height: 6 },
                  shadowRadius: 12,
                  elevation: 8,
                  transform: [{ scale: 1.06 }],
                },
              ]}
              onPress={() => handlePress(action)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>{action.icon}</Text>
              <Text style={[styles.label, isActive && { color: "white" }]}>
                {action.label}
              </Text>
              {action.hasTimer && (
                <Text
                  style={[
                    styles.timerHint,
                    isActive && { color: "rgba(255,255,255,0.7)" },
                  ]}
                >
                  {isActive ? "● stop" : "timer"}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Diaper modal ── */}
      {modal === "diaper" && (
        <DiaperModal
          onClose={() => setModal(null)}
          onSave={(type) => {
            onInstantLog("diaper", type, { diaper_type: type });
            setModal(null);
          }}
        />
      )}

      {/* ── Milestone modal ── */}
      {modal === "milestone" && (
        <NoteModal
          title="Capture a moment ⭐"
          placeholder="What just happened? e.g. First smile!"
          color="#C9961A"
          onClose={() => setModal(null)}
          onSave={(note) => {
            onInstantLog("milestone", note);
            setModal(null);
          }}
        />
      )}

      {/* ── Health modal ── */}
      {modal === "health" && (
        <NoteModal
          title="Health note 🏥"
          placeholder="Temperature, symptoms, doctor visit notes…"
          color="#8B7EC8"
          onClose={() => setModal(null)}
          onSave={(note) => {
            onInstantLog("health", note);
            setModal(null);
          }}
        />
      )}
    </>
  );
}

// ── Diaper bottom sheet ──────────────────────────────────────────────────────

interface DiaperProps {
  onClose: () => void;
  onSave: (type: string) => void;
}

function DiaperModal({ onClose, onSave }: DiaperProps) {
  const [type, setType] = useState<string | null>(null);

  const options = [
    { label: "Wet 💧", value: "wet" },
    { label: "Dirty 💩", value: "dirty" },
    { label: "Both 🌊", value: "both" },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {}} // prevent close on sheet tap
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Diaper change 🩲</Text>
          <Text style={styles.sheetSub}>What kind?</Text>

          <View style={styles.optionRow}>
            {options.map((o) => (
              <TouchableOpacity
                key={o.value}
                onPress={() => setType(o.value)}
                style={[
                  styles.optionBtn,
                  type === o.value && {
                    borderColor: Colors.moss,
                    backgroundColor: Colors.mossPale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    type === o.value && { color: Colors.moss },
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: Colors.moss },
              !type && styles.saveBtnDisabled,
            ]}
            onPress={() => type && onSave(type)}
            disabled={!type}
          >
            <Text style={styles.saveBtnText}>Log Diaper</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Note bottom sheet (milestone + health) ───────────────────────────────────

interface NoteProps {
  title: string;
  placeholder: string;
  color: string;
  onClose: () => void;
  onSave: (note: string) => void;
}

function NoteModal({ title, placeholder, color, onClose, onSave }: NoteProps) {
  const [note, setNote] = useState("");

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.sheet}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>

          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={placeholder}
            placeholderTextColor={Colors.inkLight}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: color },
              !note.trim() && styles.saveBtnDisabled,
            ]}
            onPress={() => note.trim() && onSave(note.trim())}
            disabled={!note.trim()}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    fontSize: 26,
    marginBottom: 5,
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
    color: Colors.inkLight,
    letterSpacing: 0.3,
  },
  timerHint: {
    fontFamily: "DM-Sans",
    fontSize: 9,
    color: Colors.sandDark,
    marginTop: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(42,32,24,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.sandDark,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 24,
    fontWeight: "600",
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  sheetSub: {
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.inkLight,
    textAlign: "center",
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  optionText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 13,
    color: Colors.inkMid,
  },
  noteInput: {
    backgroundColor: Colors.sand,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    padding: 16,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    minHeight: 110,
    marginBottom: 20,
    lineHeight: 22,
  },
  saveBtn: {
    borderRadius: 18,
    padding: 17,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
});
