import type { Log } from "../../types";
import type { DailyStats } from "../useWeeklyStats";
import { formatDayName } from "./constants";

const WET_THRESHOLD = 4;
const TYPICAL_POO_TYPES = new Set([
  "seedy_yellow",
  "tan_brown",
  "orange",
]);

export interface HydrationSignalResult {
  status: "good" | "low_1_2" | "low_3_plus";
  lowWetDays: string[];
  message: string;
  color: string;
}

export interface StoolPatternResult {
  consecutiveNoDirtyDays: number;
  stoolFrequencyIncreased: boolean;
  unusualColorLogged: boolean;
  mostCommonPooType: string | null;
  messages: string[];
  color: string;
}

export function computeHydrationSignal(
  days: DailyStats[],
): HydrationSignalResult | null {
  const lowWetDays: string[] = [];
  for (const d of days) {
    if (d.diaperCount > 0 && d.wetCount + d.bothCount < WET_THRESHOLD) {
      lowWetDays.push(formatDayName(d.date));
    }
  }

  if (lowWetDays.length === 0) {
    return {
      status: "good",
      lowWetDays: [],
      message: "Hydration looks good all week",
      color: "#3D7A6E",
    };
  }

  if (lowWetDays.length <= 2) {
    return {
      status: "low_1_2",
      lowWetDays,
      message: `Low wet count on ${lowWetDays.join(", ")} — monitor hydration`,
      color: "#C9961A",
    };
  }

  return {
    status: "low_3_plus",
    lowWetDays,
    message:
      "Several days with low wet diapers this week — consider discussing with your pediatrician",
    color: "#C9961A",
  };
}

export function computeStoolPattern(
  days: DailyStats[],
  diaperLogs: Log[],
  prevWeekDirtyTotal: number,
): StoolPatternResult | null {
  const dirtyDays = days.filter(
    (d) => d.dirtyCount > 0 || d.bothCount > 0,
  ).length;
  if (dirtyDays === 0 && diaperLogs.length === 0) return null;

  let consecutiveNoDirty = 0;
  let maxConsecutive = 0;
  for (const d of days) {
    const hasDirty = d.dirtyCount > 0 || d.bothCount > 0;
    if (!hasDirty) {
      consecutiveNoDirty++;
    } else {
      maxConsecutive = Math.max(maxConsecutive, consecutiveNoDirty);
      consecutiveNoDirty = 0;
    }
  }
  maxConsecutive = Math.max(maxConsecutive, consecutiveNoDirty);

  const currDirtyTotal = days.reduce(
    (a, d) => a + d.dirtyCount + d.bothCount,
    0,
  );
  const stoolFrequencyIncreased =
    prevWeekDirtyTotal > 0 && currDirtyTotal > prevWeekDirtyTotal * 1.5;

  const pooTypes = diaperLogs
    .filter(
      (l) =>
        l.type === "diaper" &&
        (l.metadata?.diaper_type === "dirty" ||
          l.metadata?.diaper_type === "both") &&
        l.metadata?.poo_type,
    )
    .map((l) => l.metadata!.poo_type as string);

  const counts = new Map<string, number>();
  for (const p of pooTypes) {
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  let mostCommon: string | null = null;
  let maxCount = 0;
  for (const [k, v] of counts) {
    if (v > maxCount) {
      maxCount = v;
      mostCommon = k;
    }
  }

  const unusualColorLogged = pooTypes.some((p) => !TYPICAL_POO_TYPES.has(p));

  const messages: string[] = [];

  if (maxConsecutive >= 2) {
    messages.push(
      `No dirty diaper logged for ${maxConsecutive} days in a row — normal for some babies but worth noting`,
    );
  }
  if (stoolFrequencyIncreased) {
    messages.push("More frequent stools this week vs last week");
  }
  if (unusualColorLogged) {
    messages.push(
      "Unusual stool color logged this week — review your journal entries",
    );
  }

  return {
    consecutiveNoDirtyDays: maxConsecutive,
    stoolFrequencyIncreased,
    unusualColorLogged,
    mostCommonPooType: mostCommon,
    messages,
    color: "#6B5744",
  };
}
