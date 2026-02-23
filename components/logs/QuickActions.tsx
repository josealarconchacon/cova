import React from "react";
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
import { TimePickerField } from "./TimePickerField";
import {
  FeedIcon,
  SleepIcon,
  DiaperIcon,
  MomentIcon,
  HealthIcon,
} from "../../assets/icons/QuickActionIcons";

const ACTION_ICON_SIZE = 30;

const ACTIONS = [
  { id: "feed",      Icon: FeedIcon,   label: "Feed",   color: Colors.dusk,  hasTimer: true  },
  { id: "sleep",     Icon: SleepIcon,  label: "Sleep",  color: "#5A8FC9",    hasTimer: true  },
  { id: "diaper",    Icon: DiaperIcon, label: "Diaper", color: Colors.moss,  hasTimer: false },
  { id: "milestone", Icon: MomentIcon, label: "Moment", color: "#C9961A",    hasTimer: false },
  { id: "health",    Icon: HealthIcon, label: "Health", color: "#8B7EC8",    hasTimer: false },
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

export interface SleepLogData {
  started_at: string;
  ended_at: string;
  notes: string;
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
  onSleepLog: (data: SleepLogData) => void;
}

export function QuickActions({
  activeTimerType,
  onTimerAction,
  onInstantLog,
  onFeedLog,
  onSleepLog,
}: Props) {
  const [modal, setModal] = useState<ActionId | null>(null);

  const handlePress = async (action: (typeof ACTIONS)[number]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (action.id === "feed") {
      // If nursing timer already running, TimerBar handles stop — don't open modal
      if (activeTimerType === "feed") return;
      setModal("feed");
    } else if (action.id === "sleep") {
      if (activeTimerType === "sleep") return;
      setModal("sleep");
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
              <action.Icon
                size={ACTION_ICON_SIZE}
                color={isActive ? "white" : action.color}
              />
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

      {/* ── Sleep modal ── */}
      {modal === "sleep" && (
        <SleepModal
          onClose={() => setModal(null)}
          onStartTimer={(startedAt) => {
            onTimerAction("sleep", startedAt);
            setModal(null);
          }}
          onSavePastSleep={(data) => {
            onSleepLog(data);
            setModal(null);
          }}
        />
      )}

      {/* ── Diaper modal ── */}
      {modal === "diaper" && (
        <DiaperModal
          onClose={() => setModal(null)}
          onSave={(type, note, meta) => {
            onInstantLog("diaper", note, meta);
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
  const [nursingStart, setNursingStart] = useState(now);

  // Bottle state
  const [milkType, setMilkType] = useState<
    "breast_milk" | "formula" | "other" | null
  >(null);
  const [amountMl, setAmountMl] = useState(120);
  const [unit, setUnit] = useState<"ml" | "oz">("ml");
  const [notes, setNotes] = useState("");
  const [bottleStart, setBottleStart] = useState(now);
  const [bottleEnd, setBottleEnd] = useState<Date | null>(null);

  // ── Nursing ──
  const handleStartNursing = () => {
    onStartNursing(nursingStart.toISOString());
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
    onSaveBottle({
      milk_type: milkType,
      amount_ml: amountMl,
      amount_unit: unit,
      notes,
      started_at: bottleStart.toISOString(),
      ended_at: bottleEnd ? bottleEnd.toISOString() : null,
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
                <TimePickerField
                  label="Start time"
                  value={nursingStart}
                  onChange={setNursingStart}
                  accentColor={Colors.dusk}
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
                    <TimePickerField
                      label="Start time"
                      value={bottleStart}
                      onChange={setBottleStart}
                      accentColor={Colors.dusk}
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <TimePickerField
                      label="End time"
                      value={bottleEnd ?? new Date()}
                      onChange={setBottleEnd}
                      accentColor={Colors.dusk}
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

// ── Sleep modal ──────────────────────────────────────────────────────────────

const SLEEP_COLOR = "#5A8FC9";

interface SleepModalProps {
  onClose: () => void;
  onStartTimer: (startedAt: string) => void;
  onSavePastSleep: (data: SleepLogData) => void;
}

function SleepModal({ onClose, onStartTimer, onSavePastSleep }: SleepModalProps) {
  const now = new Date();
  const [tab, setTab] = useState<"timer" | "log">("timer");

  const [timerStart, setTimerStart] = useState(now);
  const defaultLogStart = new Date(now.getTime() - 60 * 60 * 1000);
  const [logStart, setLogStart] = useState(defaultLogStart);
  const [logEnd, setLogEnd] = useState(now);
  const [notes, setNotes] = useState("");

  const handleStartTimer = () => {
    onStartTimer(timerStart.toISOString());
  };

  const handleSavePast = () => {
    if (!canSavePast) return;
    onSavePastSleep({
      started_at: logStart.toISOString(),
      ended_at: logEnd.toISOString(),
      notes: notes.trim(),
    });
  };

  const canSavePast = logEnd.getTime() > logStart.getTime();

  const durationPreview = (() => {
    const diffMin = Math.round((logEnd.getTime() - logStart.getTime()) / 60000);
    if (diffMin <= 0) return null;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  })();

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Sleep 💤</Text>

            {/* Tab selector */}
            <View style={ss.tabRow}>
              {(["timer", "log"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[ss.tab, tab === t && ss.tabActive]}
                  onPress={() => setTab(t)}
                >
                  <Text style={[ss.tabText, tab === t && ss.tabTextActive]}>
                    {t === "timer" ? "⏱️ Start Timer" : "📝 Log Past Sleep"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Timer tab */}
            {tab === "timer" && (
              <View>
                <TimePickerField
                  label="Start time"
                  value={timerStart}
                  onChange={setTimerStart}
                  accentColor={SLEEP_COLOR}
                />
                <Text style={ss.hint}>
                  Adjust if baby fell asleep a few minutes ago
                </Text>
                <TouchableOpacity
                  style={[ss.actionBtn, { backgroundColor: SLEEP_COLOR }]}
                  onPress={handleStartTimer}
                >
                  <Text style={ss.actionBtnText}>▶  Start Sleep Timer</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Log past sleep tab */}
            {tab === "log" && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 400 }}
              >
                <TimePickerField
                  label="Fell asleep at"
                  value={logStart}
                  onChange={setLogStart}
                  accentColor={SLEEP_COLOR}
                />

                <TimePickerField
                  label="Woke up at"
                  value={logEnd}
                  onChange={setLogEnd}
                  accentColor={SLEEP_COLOR}
                />

                {durationPreview && (
                  <View style={ss.durationRow}>
                    <Text style={ss.durationIcon}>⏱</Text>
                    <Text style={ss.durationText}>
                      Duration: {durationPreview}
                    </Text>
                  </View>
                )}

                <Text style={ss.label}>Notes (optional)</Text>
                <TextInput
                  style={ss.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Fussy before nap, slept well…"
                  placeholderTextColor={Colors.inkLight}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    ss.actionBtn,
                    { backgroundColor: SLEEP_COLOR },
                    !canSavePast && ss.actionBtnDisabled,
                  ]}
                  onPress={handleSavePast}
                  disabled={!canSavePast}
                >
                  <Text style={ss.actionBtnText}>Save Sleep Log</Text>
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
  onSave: (type: string, note: string, meta: Record<string, unknown>) => void;
}

const AMOUNTS = [
  { label: "Little",  value: "little", icon: "🔹" },
  { label: "Medium",  value: "medium", icon: "🔷" },
  { label: "Lot",     value: "lot",    icon: "💦" },
] as const;

const POO_TYPES = [
  { value: "seedy_yellow",  label: "Seedy / Yellow",   icon: "🌼", badge: "Normal",   badgeColor: Colors.moss  },
  { value: "tan_brown",     label: "Tan / Brown",      icon: "🤎", badge: "Normal",   badgeColor: Colors.moss  },
  { value: "green",         label: "Green",            icon: "🟢", badge: "Monitor",  badgeColor: "#C9961A"    },
  { value: "orange",        label: "Orange",           icon: "🟠", badge: "Normal",   badgeColor: Colors.moss  },
  { value: "watery",        label: "Watery / Runny",   icon: "💧", badge: "Monitor",  badgeColor: "#C9961A"    },
  { value: "mucousy",       label: "Mucousy",          icon: "🫧", badge: "Monitor",  badgeColor: "#C9961A"    },
  { value: "black_dark",    label: "Black / Dark",     icon: "⬛", badge: "Flag",     badgeColor: Colors.dusk  },
  { value: "blood",         label: "Blood / Red",      icon: "🔴", badge: "See doctor", badgeColor: "#C0392B"  },
] as const;

type AmountValue  = (typeof AMOUNTS)[number]["value"];
type PooTypeValue = (typeof POO_TYPES)[number]["value"];

function DiaperModal({ onClose, onSave }: DiaperProps) {
  const [type,       setType]       = useState<"wet" | "dirty" | "both" | null>(null);
  const [wetAmt,     setWetAmt]     = useState<AmountValue | null>(null);
  const [dirtyAmt,   setDirtyAmt]   = useState<AmountValue | null>(null);
  const [pooType,    setPooType]    = useState<PooTypeValue | null>(null);
  const [note,       setNote]       = useState("");

  const showWet   = type === "wet"   || type === "both";
  const showDirty = type === "dirty" || type === "both";
  const canSave   = !!type &&
    (showWet   ? !!wetAmt   : true) &&
    (showDirty ? !!dirtyAmt && !!pooType : true);

  const handleSave = () => {
    if (!type || !canSave) return;
    const meta: Record<string, unknown> = { diaper_type: type };
    if (showWet)   meta.wet_amount  = wetAmt;
    if (showDirty) { meta.dirty_amount = dirtyAmt; meta.poo_type = pooType; }
    onSave(type, note.trim(), meta);
  };

  const selectedPoo = POO_TYPES.find((p) => p.value === pooType);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Diaper change 🩲</Text>

          {/* ── Type selector ── */}
          <Text style={styles.noteLabel}>What kind?</Text>
          <View style={styles.optionRow}>
            {([
              { label: "Wet 💧",   value: "wet"   },
              { label: "Dirty 💩", value: "dirty" },
              { label: "Both 🌊",  value: "both"  },
            ] as const).map((o) => (
              <TouchableOpacity
                key={o.value}
                onPress={() => { setType(o.value); setWetAmt(null); setDirtyAmt(null); setPooType(null); }}
                style={[
                  styles.optionBtn,
                  type === o.value && { borderColor: Colors.moss, backgroundColor: Colors.mossPale },
                ]}
              >
                <Text style={[styles.optionText, type === o.value && { color: Colors.moss }]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Wet amount ── */}
          {showWet && (
            <View style={ds.section}>
              <Text style={styles.noteLabel}>💧 Wet — how much?</Text>
              <View style={ds.amtRow}>
                {AMOUNTS.map((a) => (
                  <TouchableOpacity
                    key={a.value}
                    style={[ds.amtBtn, wetAmt === a.value && ds.amtBtnActive]}
                    onPress={() => setWetAmt(a.value)}
                  >
                    <Text style={ds.amtIcon}>{a.icon}</Text>
                    <Text style={[ds.amtLabel, wetAmt === a.value && ds.amtLabelActive]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Dirty amount ── */}
          {showDirty && (
            <View style={ds.section}>
              <Text style={styles.noteLabel}>💩 Dirty — how much?</Text>
              <View style={ds.amtRow}>
                {AMOUNTS.map((a) => (
                  <TouchableOpacity
                    key={a.value}
                    style={[ds.amtBtn, dirtyAmt === a.value && ds.amtBtnActive]}
                    onPress={() => setDirtyAmt(a.value)}
                  >
                    <Text style={ds.amtIcon}>{a.icon}</Text>
                    <Text style={[ds.amtLabel, dirtyAmt === a.value && ds.amtLabelActive]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Poo type */}
              <Text style={[styles.noteLabel, { marginTop: 14 }]}>What did it look like?</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={ds.pooScroll}
                contentContainerStyle={ds.pooScrollContent}
              >
                {POO_TYPES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[ds.pooBtn, pooType === p.value && { borderColor: Colors.moss, backgroundColor: Colors.mossPale }]}
                    onPress={() => setPooType(p.value)}
                  >
                    <Text style={ds.pooIcon}>{p.icon}</Text>
                    <Text style={[ds.pooLabel, pooType === p.value && { color: Colors.moss }]}>
                      {p.label}
                    </Text>
                    <View style={[ds.pooBadge, { backgroundColor: p.badgeColor + "22" }]}>
                      <Text style={[ds.pooBadgeText, { color: p.badgeColor }]}>{p.badge}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Alert hint for flagged poo types */}
              {selectedPoo && (selectedPoo.badge === "Flag" || selectedPoo.badge === "See doctor") && (
                <View style={[ds.alert, { borderColor: selectedPoo.badgeColor }]}>
                  <Text style={[ds.alertText, { color: selectedPoo.badgeColor }]}>
                    {selectedPoo.badge === "See doctor"
                      ? "🚨 Blood in stool — contact your paediatrician promptly."
                      : "⚠️ Dark/black stool after day 5 may need checking. In newborns it can be normal (meconium)."}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── Notice / note ── */}
          {type && (
            <View style={ds.section}>
              <Text style={styles.noteLabel}>Notice anything? (optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Rash, unusual smell, skin irritation…"
                placeholderTextColor={Colors.inkLight}
                multiline
                textAlignVertical="top"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: Colors.moss }, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>Log Diaper</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// Diaper-specific styles
const ds = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  amtRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  amtBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  amtBtnActive: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossPale,
  },
  amtIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  amtLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 12,
    color: Colors.inkMid,
  },
  amtLabelActive: {
    color: Colors.moss,
  },
  pooScroll: {
    marginBottom: 8,
  },
  pooScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  pooBtn: {
    width: 110,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    backgroundColor: Colors.cream,
  },
  pooIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  pooLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 11,
    color: Colors.inkMid,
    textAlign: "center",
    marginBottom: 6,
  },
  pooBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pooBadgeText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 9,
    letterSpacing: 0.3,
  },
  alert: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  alertText: {
    fontFamily: "DM-Sans",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});

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

// Sleep-modal-specific styles
const ss = StyleSheet.create({
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
    color: "#5A8FC9",
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
    marginBottom: 14,
  },
  notesInput: {
    backgroundColor: Colors.sand,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    minHeight: 70,
    marginBottom: 20,
    lineHeight: 22,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EAF1F9",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  durationIcon: {
    fontSize: 16,
  },
  durationText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 14,
    color: "#5A8FC9",
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
