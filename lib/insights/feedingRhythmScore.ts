import type { Log } from "../../types";

export interface RhythmScoreResult {
  score: number;
  tier: "excellent" | "good" | "building" | "irregular";
  label: string;
  color: string;
  explanation: string;
  avgIntervalMin: number | null;
}

const COLORS = {
  excellent: "#3D7A6E", // teal
  good: "#5A9E90", // tealLight
  building: "#C9961A", // gold
  irregular: "#9A8C7C", // inkLight
} as const;

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance =
    squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function formatInterval(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function computeFeedingRhythmScore(
  feedLogs: Log[],
): RhythmScoreResult | null {
  const sorted = feedLogs
    .filter((l) => l.type === "feed")
    .sort(
      (a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    );

  if (sorted.length < 2) return null;

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd =
      new Date(sorted[i - 1].started_at).getTime() +
      (sorted[i - 1].duration_seconds ?? 0) * 1000;
    const nextStart = new Date(sorted[i].started_at).getTime();
    const gapMin = (nextStart - prevEnd) / 60000;
    if (gapMin > 0 && gapMin < 24 * 60) intervals.push(gapMin);
  }

  if (intervals.length < 2) return null;

  const dev = stdDev(intervals);
  const rawScore = Math.max(0, 100 - dev / 10);
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));
  const avgInterval =
    intervals.reduce((a, b) => a + b, 0) / intervals.length;

  let tier: RhythmScoreResult["tier"];
  if (score >= 80) tier = "excellent";
  else if (score >= 60) tier = "good";
  else if (score >= 40) tier = "building";
  else tier = "irregular";

  const labels: Record<RhythmScoreResult["tier"], string> = {
    excellent: "Excellent rhythm",
    good: "Good rhythm",
    building: "Building rhythm",
    irregular: "Irregular — that's okay for this age",
  };

  const explanation =
    tier === "irregular"
      ? "Feeding times varied quite a bit this week — common in early months."
      : `Feeds were spaced consistently around every ${formatInterval(avgInterval)} this week`;

  return {
    score,
    tier,
    label: labels[tier],
    color: COLORS[tier],
    explanation,
    avgIntervalMin: avgInterval,
  };
}
