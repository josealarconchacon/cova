export const MAX_GAP_MINUTES = 360;
export const MIN_GAP_MINUTES = 45;
export const PREDICTION_REFRESH_INTERVAL_MS = 300000;
export const COUNTDOWN_TICK_MS = 60000;
export const MAX_FEEDS_FOR_PREDICTION = 14;
export const WEIGHT_RECENT = 3;
export const WEIGHT_MID = 2;
export const WEIGHT_OLD = 1;
export const MIN_INTERVALS_HIGH = 7;
export const MIN_INTERVALS_MEDIUM = 3;

export type FeedType = "nursing" | "bottle";

export interface FeedInterval {
  minutes: number;
  earlierTimestamp: string;
  laterTimestamp: string;
  weight: number;
}

export interface AgeBasedFeedingParams {
  minMinutes: number;
  maxMinutes: number;
  defaultMinutes: number;
}

// Ranges: <14d → 1.5–3h, 1–2mo → 2–3.5h, 2–4mo → 2.5–4h, 4–6mo → 3–4.5h, 6–12mo → 3.5–5h, 12mo+ → 4–6h
export function getAgeBasedFeedingParams(
  baby: { date_of_birth: string } | null | undefined,
): AgeBasedFeedingParams {
  const defaultParams: AgeBasedFeedingParams = {
    minMinutes: 120,
    maxMinutes: 180,
    defaultMinutes: 150,
  };
  if (!baby?.date_of_birth) return defaultParams;

  const dob = new Date(baby.date_of_birth);
  const now = new Date();
  const totalDays = Math.floor(
    (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays < 14)
    return { minMinutes: 90, maxMinutes: 180, defaultMinutes: 135 };
  if (totalDays < 60)
    return { minMinutes: 120, maxMinutes: 210, defaultMinutes: 165 };
  if (totalDays < 120)
    return { minMinutes: 150, maxMinutes: 240, defaultMinutes: 195 };
  if (totalDays < 180)
    return { minMinutes: 180, maxMinutes: 270, defaultMinutes: 225 };
  if (totalDays < 365)
    return { minMinutes: 210, maxMinutes: 300, defaultMinutes: 255 };
  return { minMinutes: 240, maxMinutes: 360, defaultMinutes: 300 };
}

export interface PredictionResult {
  nextFeedTime: string | null;
  intervalMinutes: number | null;
  confidence: "high" | "medium" | "low";
  dominantType: FeedType | null;
  intervalCount: number;
  feedCountUsed: number;
  lastFeedTimestamp: string | null;
}
