import type { WeeklyStats } from "../useWeeklyStats";
import type { Baby } from "../../types";
import { computeHydrationSignal } from "./diaperHealth";
import { computeStoolPattern } from "./diaperHealth";
import type { Log } from "../../types";

function getMinWetPerDay(baby: Baby | null): number {
  if (!baby?.date_of_birth) return 6;
  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (ageMonths < 1) return 6;
  if (ageMonths < 4) return 6;
  if (ageMonths < 12) return 4;
  return 3;
}

export interface DiaperHealthScoreResult {
  score: number;
  label: string;
}

export function computeDiaperHealthScore(
  stats: WeeklyStats,
  baby: Baby | null,
  diaperLogs: Log[],
): DiaperHealthScoreResult | null {
  if (stats.totalDiapers === 0) return null;

  const minWet = getMinWetPerDay(baby);
  const totalWet = stats.diaperInsights.wetTotal + stats.diaperInsights.bothTotal;
  const avgWetPerDay = totalWet / 7;

  const hydration = computeHydrationSignal(stats.days);
  const stool = computeStoolPattern(
    stats.days,
    diaperLogs,
    stats.diaperInsights.prevDirtyTotal + stats.diaperInsights.prevBothTotal,
  );

  let score = 80;

  if (hydration) {
    if (hydration.status === "good") score += 15;
    else if (hydration.status === "low_1_2") score -= 15;
    else score -= 35;
  }

  if (stool && stool.messages.length > 0) {
    score -= Math.min(25, stool.messages.length * 10);
  }

  if (avgWetPerDay < minWet) {
    score -= 20;
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let label: string;
  if (finalScore >= 90) label = "Healthy pattern";
  else if (finalScore >= 70) label = "On track";
  else if (finalScore >= 50) label = "Monitor closely";
  else label = "Consult your pediatrician";

  return { score: finalScore, label };
}
