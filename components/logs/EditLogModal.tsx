import React from "react";
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Colors } from "../../constants/theme";
import type { Log } from "../../types";
import { TimePickerField } from "./TimePickerField";
import {
  BreastMilkIcon,
  FormulaIcon,
  OtherLiquidIcon,
} from "../../assets/icons/QuickActionIcons";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ML_PER_OZ = 29.5735;

// ── Constants ─────────────────────────────────────────────────────────────────

const MILK_OPTIONS = [
  { id: "breast_milk" as const, Icon: BreastMilkIcon, label: "Breast Milk", color: Colors.dusk },
  { id: "formula"    as const, Icon: FormulaIcon,     label: "Formula",     color: "#3A9ED8"  },
  { id: "other"      as const, Icon: OtherLiquidIcon, label: "Other",       color: "#7B1FA2"  },
];

const AMOUNTS = [
  { label: "Little", value: "little", icon: "🔹" },
  { label: "Medium", value: "medium", icon: "🔷" },
  { label: "Lot",    value: "lot",    icon: "💦" },
] as const;

const POO_TYPES = [
  { value: "seedy_yellow", label: "Seedy/Yellow",  icon: "🌼", badge: "Normal",     badgeColor: Colors.moss  },
  { value: "tan_brown",    label: "Tan/Brown",     icon: "🤎", badge: "Normal",     badgeColor: Colors.moss  },
  { value: "green",        label: "Green",         icon: "🟢", badge: "Monitor",    badgeColor: "#C9961A"    },
  { value: "orange",       label: "Orange",        icon: "🟠", badge: "Normal",     badgeColor: Colors.moss  },
  { value: "watery",       label: "Watery/Runny",  icon: "💧", badge: "Monitor",    badgeColor: "#C9961A"    },
  { value: "mucousy",      label: "Mucousy",       icon: "🫧", badge: "Monitor",    badgeColor: "#C9961A"    },
  { value: "black_dark",   label: "Black/Dark",    icon: "⬛", badge: "Flag",       badgeColor: Colors.dusk  },
  { value: "blood",        label: "Blood/Red",     icon: "🔴", badge: "See doctor", badgeColor: "#C0392B"    },
] as const;

type AmountValue  = "little" | "medium" | "lot";
type PooTypeValue = (typeof POO_TYPES)[number]["value"];
type MilkType     = "breast_milk" | "formula" | "other";

// ── Public types ──────────────────────────────────────────────────────────────

export type EditPayload = {
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  metadata?: Record<string, unknown> | null;
};

interface Props {
  log: Log;
  onClose: () => void;
  onSave: (payload: EditPayload) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditLogModal({ log, onClose, onSave }: Props) {
  const feedType = log.type === "feed"
    ? (log.metadata?.feed_type as string | undefined)
    : undefined;
  const isDiaper   = log.type === "diaper";
  const hasEndTime = log.type === "feed" || log.type === "sleep";

  // ── Common state ──────────────────────────────────────────────────────────
  const [startTime, setStartTime] = useState(new Date(log.started_at));
  const [endTime,   setEndTime]   = useState<Date | null>(
    log.ended_at ? new Date(log.ended_at) : null,
  );
  const [notes,     setNotes]     = useState(log.notes ?? "");

  // ── Bottle-specific state ─────────────────────────────────────────────────
  const [milkType, setMilkType] = useState<MilkType | null>(
    (log.metadata?.milk_type as MilkType) ?? null,
  );
  const [amountMl, setAmountMl] = useState<number>(
    (log.metadata?.amount_ml as number) ?? 120,
  );
  const [unit, setUnit] = useState<"ml" | "oz">(
    (log.metadata?.amount_unit as "ml" | "oz") ?? "ml",
  );

  // ── Diaper-specific state ─────────────────────────────────────────────────
  const [diaperType, setDiaperType] = useState<"wet" | "dirty" | "both" | null>(
    (log.metadata?.diaper_type as "wet" | "dirty" | "both") ?? null,
  );
  const [wetAmt,   setWetAmt]   = useState<AmountValue | null>(
    (log.metadata?.wet_amount   as AmountValue) ?? null,
  );
  const [dirtyAmt, setDirtyAmt] = useState<AmountValue | null>(
    (log.metadata?.dirty_amount as AmountValue) ?? null,
  );
  const [pooType,  setPooType]  = useState<PooTypeValue | null>(
    (log.metadata?.poo_type as PooTypeValue) ?? null,
  );

  const showWet   = diaperType === "wet"   || diaperType === "both";
  const showDirty = diaperType === "dirty" || diaperType === "both";

  // ── Bottle amount helpers ─────────────────────────────────────────────────
  const sliderMax  = unit === "oz" ? 12 : 350;
  const sliderStep = unit === "oz" ? 0.5 : 5;
  const displayAmount =
    unit === "oz"
      ? `${(Math.round((amountMl / ML_PER_OZ) * 10) / 10).toFixed(1)} oz`
      : `${amountMl} ml`;

  const stepAmount = (dir: 1 | -1) => {
    if (unit === "oz") {
      const currentOz = amountMl / ML_PER_OZ;
      const newOz = Math.max(0, Math.min(sliderMax, currentOz + dir * sliderStep));
      setAmountMl(Math.round((newOz * ML_PER_OZ) / 5) * 5);
    } else {
      setAmountMl((prev) => Math.max(0, Math.min(sliderMax, prev + dir * sliderStep)));
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const canSave = isDiaper
    ? !!diaperType &&
      (showWet   ? !!wetAmt   : true) &&
      (showDirty ? !!dirtyAmt && !!pooType : true)
    : true;

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!canSave) return;

    const duration =
      endTime != null
        ? Math.max(
            0,
            Math.floor(
              (endTime.getTime() - startTime.getTime()) / 1000,
            ),
          )
        : log.duration_seconds;

    const payload: EditPayload = {
      started_at:       startTime.toISOString(),
      ended_at:         endTime?.toISOString() ?? null,
      duration_seconds: duration,
      notes:            notes.trim() || null,
    };

    if (feedType === "bottle") {
      payload.metadata = {
        ...log.metadata,
        milk_type:   milkType,
        amount_ml:   amountMl,
        amount_unit: unit,
      };
    }

    if (isDiaper) {
      payload.metadata = {
        diaper_type: diaperType,
        ...(showWet   ? { wet_amount: wetAmt }                        : {}),
        ...(showDirty ? { dirty_amount: dirtyAmt, poo_type: pooType } : {}),
      };
    }

    onSave(payload);
  };

  // ── Label ─────────────────────────────────────────────────────────────────
  const typeLabel =
    feedType === "nursing" ? "Nursing"       :
    feedType === "bottle"  ? "Bottle Feed"   :
    isDiaper               ? "Diaper change" :
    log.type === "sleep"   ? "Sleep"         :
    log.type === "milestone" ? "Milestone"   :
    log.type === "health"  ? "Health note"   : "Entry";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} onPress={onClose} activeOpacity={1}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableOpacity style={s.sheet} activeOpacity={1} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={s.title}>Edit {typeLabel}</Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 520 }}
            >
              {/* ── Time fields ─────────────────────────────────────── */}
              {!isDiaper && (
                <View style={s.row2}>
                  <View style={{ flex: 1 }}>
                    <TimePickerField
                      label="Start time"
                      value={startTime}
                      onChange={setStartTime}
                      accentColor={log.type === "sleep" ? "#5A8FC9" : Colors.dusk}
                    />
                  </View>
                  {hasEndTime && (
                    <View style={{ flex: 1 }}>
                      <TimePickerField
                        label="End time"
                        value={endTime ?? new Date()}
                        onChange={setEndTime}
                        accentColor={log.type === "sleep" ? "#5A8FC9" : Colors.dusk}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* ── Bottle: milk type + amount ───────────────────────── */}
              {feedType === "bottle" && (
                <>
                  <Text style={s.label}>Milk type</Text>
                  <View style={s.optionRow}>
                    {MILK_OPTIONS.map((o) => (
                      <TouchableOpacity
                        key={o.id}
                        style={[s.optionBtn, milkType === o.id && s.optionBtnActive]}
                        onPress={() => setMilkType(o.id)}
                      >
                        <o.Icon size={22} color={milkType === o.id ? Colors.moss : o.color} />
                        <Text
                          style={[
                            s.optionLabel,
                            milkType === o.id && { color: Colors.moss },
                          ]}
                        >
                          {o.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={s.amountHeader}>
                    <Text style={s.label}>Amount</Text>
                    <View style={s.unitToggle}>
                      {(["ml", "oz"] as const).map((u) => (
                        <TouchableOpacity
                          key={u}
                          style={[s.unitBtn, unit === u && s.unitBtnActive]}
                          onPress={() => setUnit(u)}
                        >
                          <Text style={[s.unitLabel, unit === u && s.unitLabelActive]}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={s.stepper}>
                    <TouchableOpacity style={s.stepBtn} onPress={() => stepAmount(-1)}>
                      <Text style={s.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.amountDisplay}>{displayAmount}</Text>
                    <TouchableOpacity style={s.stepBtn} onPress={() => stepAmount(1)}>
                      <Text style={s.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── Diaper fields ─────────────────────────────────────── */}
              {isDiaper && (
                <>
                  <Text style={s.label}>Type</Text>
                  <View style={s.optionRow}>
                    {([
                      { label: "Wet 💧",  value: "wet"   },
                      { label: "Dirty 💩", value: "dirty" },
                      { label: "Both 🌊",  value: "both"  },
                    ] as const).map((o) => (
                      <TouchableOpacity
                        key={o.value}
                        style={[
                          s.optionBtn,
                          diaperType === o.value && s.optionBtnActive,
                        ]}
                        onPress={() => {
                          setDiaperType(o.value);
                          setWetAmt(null);
                          setDirtyAmt(null);
                          setPooType(null);
                        }}
                      >
                        <Text
                          style={[
                            s.optionLabel,
                            diaperType === o.value && { color: Colors.moss },
                          ]}
                        >
                          {o.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {showWet && (
                    <>
                      <Text style={s.label}>💧 Wet — how much?</Text>
                      <View style={s.amtRow}>
                        {AMOUNTS.map((a) => (
                          <TouchableOpacity
                            key={a.value}
                            style={[s.amtBtn, wetAmt === a.value && s.amtBtnActive]}
                            onPress={() => setWetAmt(a.value)}
                          >
                            <Text>{a.icon}</Text>
                            <Text
                              style={[
                                s.amtLabel,
                                wetAmt === a.value && { color: Colors.moss },
                              ]}
                            >
                              {a.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  {showDirty && (
                    <>
                      <Text style={s.label}>💩 Dirty — how much?</Text>
                      <View style={s.amtRow}>
                        {AMOUNTS.map((a) => (
                          <TouchableOpacity
                            key={a.value}
                            style={[s.amtBtn, dirtyAmt === a.value && s.amtBtnActive]}
                            onPress={() => setDirtyAmt(a.value)}
                          >
                            <Text>{a.icon}</Text>
                            <Text
                              style={[
                                s.amtLabel,
                                dirtyAmt === a.value && { color: Colors.moss },
                              ]}
                            >
                              {a.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={s.label}>What did it look like?</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 12 }}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {POO_TYPES.map((p) => (
                          <TouchableOpacity
                            key={p.value}
                            style={[s.pooBtn, pooType === p.value && s.pooBtnActive]}
                            onPress={() => setPooType(p.value)}
                          >
                            <Text style={{ fontSize: 20 }}>{p.icon}</Text>
                            <Text
                              style={[
                                s.pooLabel,
                                pooType === p.value && { color: Colors.moss },
                              ]}
                            >
                              {p.label}
                            </Text>
                            <View
                              style={[
                                s.pooBadge,
                                { backgroundColor: p.badgeColor + "22" },
                              ]}
                            >
                              <Text style={[s.pooBadgeText, { color: p.badgeColor }]}>
                                {p.badge}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}
                </>
              )}

              {/* ── Notes ─────────────────────────────────────────────── */}
              <Text style={s.label}>
                {log.type === "milestone" ? "What happened?" :
                 log.type === "health"    ? "Health note" : "Notes"}
              </Text>
              <TextInput
                style={[s.input, s.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes…"
                placeholderTextColor={Colors.inkLight}
                multiline
                textAlignVertical="top"
              />

              {/* ── Save ──────────────────────────────────────────────── */}
              <TouchableOpacity
                style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <Text style={s.saveBtnText}>Save changes</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.sandDark,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: "Cormorant-Garamond",
    fontSize: 26,
    fontWeight: "600",
    color: Colors.ink,
    marginBottom: 20,
  },
  label: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 11,
    color: Colors.inkLight,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  row2: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    padding: 12,
    fontFamily: "DM-Sans",
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  notesInput: {
    height: 90,
    paddingTop: 12,
  },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: Colors.cream,
    gap: 4,
  },
  optionBtnActive: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossPale,
  },
  optionLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 11,
    color: Colors.inkMid,
    textAlign: "center",
  },
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  unitToggle: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 10,
    overflow: "hidden",
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: Colors.cream,
  },
  unitBtnActive: {
    backgroundColor: Colors.moss,
  },
  unitLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 12,
    color: Colors.inkMid,
  },
  unitLabelActive: {
    color: "#fff",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
    backgroundColor: Colors.sand,
    borderRadius: 16,
    paddingVertical: 12,
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontFamily: "DM-Sans",
    fontSize: 22,
    color: Colors.moss,
    fontWeight: "700",
    lineHeight: 26,
  },
  amountDisplay: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 22,
    color: Colors.ink,
    minWidth: 80,
    textAlign: "center",
  },
  amtRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  amtBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: Colors.cream,
    gap: 4,
  },
  amtBtnActive: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossPale,
  },
  amtLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 12,
    color: Colors.inkMid,
  },
  pooBtn: {
    width: 90,
    borderWidth: 1.5,
    borderColor: Colors.sandDark,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: Colors.cream,
    gap: 4,
  },
  pooBtnActive: {
    borderColor: Colors.moss,
    backgroundColor: Colors.mossPale,
  },
  pooLabel: {
    fontFamily: "DM-Sans",
    fontWeight: "600",
    fontSize: 10,
    color: Colors.inkMid,
    textAlign: "center",
  },
  pooBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pooBadgeText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 8,
    letterSpacing: 0.3,
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontFamily: "DM-Sans",
    fontWeight: "700",
    fontSize: 15,
    color: "#fff",
    letterSpacing: 0.3,
  },
});
