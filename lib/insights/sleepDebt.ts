import type { Baby } from "../../types";
import type { DailyStats } from "../useWeeklyStats";

export interface SleepDebtResult {
  debtHours: number;
  surplusHours: number;
  targetHoursPerDay: number;
  daysLogged: number;
  actualTotalHours: number;
  status: "debt" | "on_track" | "ahead";
  message: string;
  color: string;
}

const TYPICAL_COLORS = {
  teal: "#3D7A6E",
  gold: "#C9961A",
  dusk: "#B07D6C",
  inkLight: "#9A8C7C",
} as const;

function getTargetHoursPerDay(baby: Baby | null): number {
  if (!baby?.date_of_birth) return 15.5;
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());

  if (ageMonths < 3) return 15.5;
  if (ageMonths < 6) return 13.5;
  if (ageMonths < 12) return 13;
  return 12.5;
}

export function computeSleepDebt(
  days: DailyStats[],
  totalSleepHours: number,
  baby: Baby | null,
): SleepDebtResult | null {
  const daysWithSleep = days.filter((d) => d.sleepHours > 0).length;
  if (daysWithSleep === 0) return null;

  const targetPerDay = getTargetHoursPerDay(baby);
  const expectedTotal = targetPerDay * daysWithSleep;
  const diff = expectedTotal - totalSleepHours;

  let status: SleepDebtResult["status"];
  let message: string;
  let color: string;

  if (diff > 2) {
    status = "debt";
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);
    message = `Sleep debt this week: ${h}h ${m}m behind target`;
    color = TYPICAL_COLORS.gold;
  } else if (diff >= -2) {
    status = "on_track";
    const absDiff = Math.abs(diff);
    const h = Math.floor(absDiff);
    const m = Math.round((absDiff - h) * 60);
    message =
      diff >= 0
        ? `On track — within ${h}h ${m}m of weekly sleep target`
        : `On track — within ${h}h ${m}m of weekly sleep target`;
    color = TYPICAL_COLORS.teal;
  } else {
    status = "ahead";
    const surplus = -diff;
    const h = Math.floor(surplus);
    const m = Math.round((surplus - h) * 60);
    message = `Above target by ${h}h ${m}m this week`;
    color = TYPICAL_COLORS.teal;
  }

  return {
    debtHours: diff > 0 ? diff : 0,
    surplusHours: diff < 0 ? -diff : 0,
    targetHoursPerDay: targetPerDay,
    daysLogged: daysWithSleep,
    actualTotalHours: totalSleepHours,
    status,
    message,
    color,
  };
}
