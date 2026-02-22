import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "../../constants/theme";

const ACTIONS = [
  { id: "feed",      icon: "🍼", label: "Feed",   color: Colors.dusk,  hasTimer: true  },
  { id: "sleep",     icon: "💤", label: "Sleep",  color: "#5A8FC9",    hasTimer: true  },
  { id: "diaper",    icon: "🩲", label: "Diaper", color: Colors.moss,  hasTimer: false },
  { id: "milestone", icon: "⭐", label: "Moment", color: "#C9961A",    hasTimer: false },
  { id: "health",    icon: "🏥", label: "Health", color: "#8B7EC8",    hasTimer: false },
] as const;

type ActionId = (typeof ACTIONS)[number]["id"];

export interface BottleFeedData {
  milk_type: "breast_milk" | "formula" | "other";
  amount_ml: number;
  amount_unit: "ml" | "oz";
  notes: string;
  started_at: string;
  ended_at: string | null;
}

interface Props {
  activeTimerType: string | null;
  onTimerAction: (type: "feed" | "sleep", startedAt?: string) => void;
  onInstantLog: (
    type: "diaper" | "health" | "milestone",
    note: string,
    metadata?: Record<string, unknown>,
  ) => void;
  onFeedLog: (data: BottleFeedData) => void;
}

export function QuickActions({
  activeTimerType,
  onTimerAction,
  onInstantLog,
  onFeedLog,
}: Props) {
  const [modal, setModal] = useState<ActionId | null>(null);

  const handlePress = async (action: (typeof ACTIONS)[number]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (action.id === "feed") {
      // If nursing timer already running, TimerBar handles stop — don't open modal
      if (activeTimerType === "feed") return;
      setModal("feed");
    } else if (action.id === "sleep") {
      onTimerAction("sleep");
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

      {/* ── Feed modal ── */}
      {modal === "feed" && (
        <FeedModal
          onClose={() => setModal(null)}
          onStartNursing={(startedAt) => {
            onTimerAction("feed", startedAt);
            setModal(null);
          }}
          onSaveBottle={(data) => {
            onFeedLog(data);
            setModal(null);
          }}
        />
      )}

      {/* ── Diaper modal ── */}
      {modal === "diaper" && (
        <DiaperModal
          onClose={() => setModal(null)}
          onSave={(type, note) => {
            onInstantLog("diaper", note, { diaper_type: type });
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const ML_PER_OZ = 29.5735;

function formatTime(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = String(date.getMinutes()).padStart(2, "0");
  const ap = date.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ap}`;
}

function parseTime(text: string, base: Date): Date | null {
  const match = text.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1]);
  const min = parseInt(match[2]);
  const ap = match[3]?.toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  const d = new Date(base);
  d.setHours(h, min, 0, 0);
  return d;
}

// ── Custom slider (no external packages needed) ───────────────────────────────

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  onChange: (v: number) => void;
}

function AmountSlider({ value, min, max, step, color, onChange }: SliderProps) {
  const trackWidthRef = useRef(1);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const slide = (locationX: number) => {
    const ratio = Math.max(0, Math.min(1, locationX / trackWidthRef.current));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    onChangeRef.current(Math.max(min, Math.min(max, snapped)));
  };

  const fillPct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <View
      onLayout={(e) => {
        trackWidthRef.current = e.nativeEvent.layout.width;
      }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => slide(e.nativeEvent.locationX)}
      onResponderMove={(e) => slide(e.nativeEvent.locationX)}
      style={{ height: 44, justifyContent: "center" }}
    >
      {/* Track */}
      <View
        style={{
          height: 6,
          backgroundColor: Colors.sandDark,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${fillPct}%`,
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>

      {/* Thumb */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: `${fillPct}%`,
          top: 11,
          marginLeft: -11,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: "white",
          borderWidth: 3,
          borderColor: color,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          elevation: 3,
        }}
      />
    </View>
  );
}

// ── Feed modal ────────────────────────────────────────────────────────────────

interface FeedModalProps {
  onClose: () => void;
  onStartNursing: (startedAt: string) => void;
  onSaveBottle: (data: BottleFeedData) => void;
}

function FeedModal({ onClose, onStartNursing, onSaveBottle }: FeedModalProps) {
  const now = new Date();
  const [tab, setTab] = useState<"nursing" | "bottle">("nursing");

  // Nursing state
  const [nursingStart, setNursingStart] = useState(formatTime(now));

  // Bottle state
  const [milkType, setMilkType] = useState<
    "breast_milk" | "formula" | "other" | null
  >(null);
  const [amountMl, setAmountMl] = useState(120);
  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [notes, setNotes] = useState("");
  const [bottleStart, setBottleStart] = useState(formatTime(now));
  const [bottleEnd, setBottleEnd] = useState("");

  // ── Nursing ──
  const handleStartNursing = () => {
    const parsed = parseTime(nursingStart, new Date());
    const startedAt = parsed ? parsed.toISOString() : new Date().toISOString();
    onStartNursing(startedAt);
  };

  // ── Bottle / slider ──
  const sliderMax = unit === "oz" ? 12 : 350;
  const sliderStep = unit === "oz" ? 0.5 : 5;
  const sliderValue = unit === "oz" ? amountMl / ML_PER_OZ : amountMl;

  const handleSlide = (v: number) => {
    if (unit === "oz") {
      setAmountMl(Math.round(v * ML_PER_OZ / 5) * 5);
    } else {
      setAmountMl(Math.round(v / 5) * 5);
    }
  };

  const stepAmount = (dir: 1 | -1) => {
    if (unit === "oz") {
      const newOz = Math.max(0, Math.min(sliderMax, sliderValue + dir * sliderStep));
      setAmountMl(Math.round(newOz * ML_PER_OZ / 5) * 5);
    } else {
      setAmountMl((prev) => Math.max(0, Math.min(sliderMax, prev + dir * sliderStep)));
    }
  };

  const displayAmount =
    unit === "oz"
      ? `${(Math.round((amountMl / ML_PER_OZ) * 10) / 10).toFixed(1)} oz`
      : `${amountMl} ml`;

  // ── Bottle save ──
  const handleSaveBottle = () => {
    if (!milkType) return;
    const base = new Date();
    const parsedStart = parseTime(bottleStart, base);
    const parsedEnd = bottleEnd.trim() ? parseTime(bottleEnd, base) : null;
    onSaveBottle({
      milk_type: milkType,
      amount_ml: amountMl,
      amount_unit: unit,
      notes,
      started_at: parsedStart ? parsedStart.toISOString() : new Date().toISOString(),
      ended_at: parsedEnd ? parsedEnd.toISOString() : null,
    });
  };

  const MILK_OPTIONS = [
    { id: "breast_milk" as const, icon: "🤱", label: "Breast\nMilk" },
    { id: "formula"    as const, icon: "🥛", label: "Formula"     },
    { id: "other"      as const, icon: "💧", label: "Other"       },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.sheet}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Feed 🍼</Text>

            {/* ── Tab selector ── */}
            <View style={fs.tabRow}>
              {(["nursing", "bottle"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[fs.tab, tab === t && fs.tabActive]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[fs.tabText, tab === t && fs.tabTextActive]}>
                    {t === "nursing" ? "🤱 Nursing" : "🍼 Bottle"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Nursing pane ── */}
            {tab === "nursing" && (
              <View>
                <Text style={fs.label}>Start time</Text>
                <TextInput
                  style={fs.timeInput}
                  value={nursingStart}
                  onChangeText={setNursingStart}
                  placeholder="e.g. 10:30 AM"
                  placeholderTextColor={Colors.inkLight}
                />
                <Text style={fs.hint}>
                  Adjust if nursing started a few minutes ago
                </Text>
                <TouchableOpacity
                  style={[fs.actionBtn, { backgroundColor: Colors.dusk }]}
                  onPress={handleStartNursing}
                >
                  <Text style={fs.actionBtnText}>▶  Start Nursing Timer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Bottle pane ── */}
            {tab === "bottle" && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 460 }}
              >
                {/* Milk type */}
                <Text style={fs.label}>Milk type</Text>
                <View style={fs.milkRow}>
                  {MILK_OPTIONS.map((o) => (
                    <TouchableOpacity
                      key={o.id}
                      style={[
                        fs.milkBtn,
                        milkType === o.id && fs.milkBtnActive,
                      ]}
                      onPress={() => setMilkType(o.id)}
                    >
                      <Text style={{ fontSize: 22, marginBottom: 4 }}>
                        {o.icon}
                      </Text>
                      <Text
                        style={[
                          fs.milkLabel,
                          milkType === o.id && fs.milkLabelActive,
                        ]}
                      >
                        {o.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Amount header + unit toggle */}
                <View style={fs.amountHeader}>
                  <Text style={fs.label}>Amount</Text>
                  <View style={fs.unitRow}>
                    {(["ml", "oz"] as const).map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[fs.unitBtn, unit === u && fs.unitBtnActive]}
                        onPress={() => setUnit(u)}
                      >
                        <Text
                          style={[
                            fs.unitText,
                            unit === u && fs.unitTextActive,
                          ]}
                        >
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Stepper display */}
                <View style={fs.stepRow}>
                  <TouchableOpacity
                    style={fs.stepBtn}
                    onPress={() => stepAmount(-1)}
                  >
                    <Text style={fs.stepBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={fs.amountVal}>{displayAmount}</Text>
                  <TouchableOpacity
                    style={fs.stepBtn}
                    onPress={() => stepAmount(1)}
                  >
                    <Text style={fs.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Slider */}
                <AmountSlider
                  value={sliderValue}
                  min={0}
                  max={sliderMax}
                  step={sliderStep}
                  color={Colors.dusk}
                  onChange={handleSlide}
                />
                <View style={fs.sliderLabels}>
                  <Text style={fs.sliderLabel}>0 {unit}</Text>
                  <Text style={fs.sliderLabel}>{sliderMax} {unit}</Text>
                </View>

                {/* Notes */}
                <Text style={[fs.label, { marginTop: 16 }]}>Notes</Text>
                <TextInput
                  style={fs.noteInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any notes (optional)"
                  placeholderTextColor={Colors.inkLight}
                  multiline
                  textAlignVertical="top"
                />

                {/* Start / end time */}
                <View style={fs.timeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={fs.label}>Start time</Text>
                    <TextInput
                      style={fs.timeInput}
                      value={bottleStart}
                      onChangeText={setBottleStart}
                      placeholder="10:30 AM"
                      placeholderTextColor={Colors.inkLight}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={fs.label}>End time</Text>
                    <TextInput
                      style={fs.timeInput}
                      value={bottleEnd}
                      onChangeText={setBottleEnd}
                      placeholder="10:45 AM"
                      placeholderTextColor={Colors.inkLight}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    fs.actionBtn,
                    { backgroundColor: Colors.dusk },
                    !milkType && fs.actionBtnDisabled,
                  ]}
                  onPress={handleSaveBottle}
                  disabled={!milkType}
                >
                  <Text style={fs.actionBtnText}>Save Bottle Feed</Text>
                </TouchableOpacity>

                <View style={{ height: 16 }} />
              </ScrollView>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Diaper modal ──────────────────────────────────────────────────────────────

interface DiaperProps {
  onClose: () => void;
  onSave: (type: string, note: string) => void;
}

function DiaperModal({ onClose, onSave }: DiaperProps) {
  const [type, setType] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const options = [
    { label: "Wet 💧", value: "wet" },
    { label: "Dirty 💩", value: "dirty" },
    { label: "Both 🌊", value: "both" },
  ];

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
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

          {/* Notice / note field */}
          <Text style={styles.noteLabel}>Notice anything? (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Unusual colour, rash, blood — anything worth flagging"
            placeholderTextColor={Colors.inkLight}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: Colors.moss },
              !type && styles.saveBtnDisabled,
            ]}
            onPress={() => type && onSave(type, note.trim())}
            disabled={!type}
          >
            <Text style={styles.saveBtnText}>Log Diaper</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Note modal (milestone + health) ──────────────────────────────────────────

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
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
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

// ── Styles ────────────────────────────────────────────────────────────────────

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
  noteLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
    color: Colors.inkLight,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
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
    minHeight: 90,
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

// Feed-modal-specific styles
const fs = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.sand,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.inkLight,
  },
  tabTextActive: {
    color: Colors.dusk,
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
  hint: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    color: Colors.inkLight,
    textAlign: "center",
    marginBottom: 20,
  },
  timeInput: {
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    marginBottom: 10,
  },
  actionBtn: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: "white",
  },
  milkRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  milkBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  milkBtnActive: {
    borderColor: Colors.dusk,
    backgroundColor: "#F8EDE9",
  },
  milkLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 11,
    color: Colors.inkMid,
    textAlign: "center",
  },
  milkLabelActive: {
    color: Colors.dusk,
  },
  amountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  unitRow: {
    flexDirection: "row",
    backgroundColor: Colors.sand,
    borderRadius: 10,
    padding: 3,
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  unitBtnActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  unitText: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 12,
    color: Colors.inkLight,
  },
  unitTextActive: {
    color: Colors.dusk,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 4,
    marginTop: 8,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
  },
  stepBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 22,
    color: Colors.dusk,
    lineHeight: 26,
  },
  amountVal: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 26,
    color: Colors.ink,
    minWidth: 110,
    textAlign: "center",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 4,
  },
  sliderLabel: {
    fontFamily: "DM-Sans",
    fontSize: 11,
    color: Colors.inkLight,
  },
  noteInput: {
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    padding: 12,
    fontFamily: "DM-Sans",
    fontSize: 14,
    color: Colors.ink,
    minHeight: 68,
    marginBottom: 16,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  timeRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
});
