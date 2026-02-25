import type { Baby, Log } from "../../types";
import {
  MAX_GAP_MINUTES,
  MIN_GAP_MINUTES,
  MAX_FEEDS_FOR_PREDICTION,
  WEIGHT_RECENT,
  WEIGHT_MID,
  WEIGHT_OLD,
  MIN_INTERVALS_HIGH,
  MIN_INTERVALS_MEDIUM,
  getAgeBasedFeedingParams,
} from "./nextFeedPrediction";
import type {
  FeedInterval,
  FeedType,
  PredictionResult,
} from "./nextFeedPrediction";

function getFeedType(log: Log): FeedType | null {
  const ft = log.metadata?.feed_type as string | undefined;
  if (ft === "nursing") return "nursing";
  if (ft === "bottle") return "bottle";
  return null;
}

export function computeNextFeedPrediction(
  feedLogs: Log[],
  baby?: Baby | null,
): PredictionResult {
  const ageParams = getAgeBasedFeedingParams(baby);
  const feeds = feedLogs
    .filter((l) => l.type === "feed" && l.ended_at != null)
    .slice(0, MAX_FEEDS_FOR_PREDICTION)
    .sort(
      (a, b) =>
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
    );

  if (feeds.length === 0) {
    return {
      nextFeedTime: null,
      intervalMinutes: null,
      confidence: "low",
      dominantType: null,
      intervalCount: 0,
      feedCountUsed: 0,
      lastFeedTimestamp: null,
    };
  }

  const lastFeed = feeds[0];
  // Prefer ended_at — hunger cycle starts after feed ends
  const lastFeedTimestamp = lastFeed.ended_at ?? lastFeed.started_at;

  if (feeds.length < 2) {
    const nextFeedTime = new Date(
      new Date(lastFeedTimestamp).getTime() +
        ageParams.defaultMinutes * 60 * 1000,
    ).toISOString();
    return {
      nextFeedTime,
      intervalMinutes: ageParams.defaultMinutes,
      confidence: "low",
      dominantType: getFeedType(lastFeed),
      intervalCount: 0,
      feedCountUsed: 1,
      lastFeedTimestamp,
    };
  }

  const nursingCount = feeds.filter((l) => getFeedType(l) === "nursing").length;
  const bottleCount = feeds.filter((l) => getFeedType(l) === "bottle").length;
  const dominantType: FeedType | null =
    nursingCount > bottleCount
      ? "nursing"
      : bottleCount > nursingCount
        ? "bottle"
        : null;

  // Use single type intervals when exclusively one type is present
  const feedsForIntervals =
    nursingCount > 0 && bottleCount === 0
      ? feeds.filter((l) => getFeedType(l) === "nursing")
      : bottleCount > 0 && nursingCount === 0
        ? feeds.filter((l) => getFeedType(l) === "bottle")
        : feeds;

  const sorted = [...feedsForIntervals].sort(
    (a, b) =>
      new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
  );

  const intervals: FeedInterval[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const prevEnd =
      prev.ended_at != null
        ? new Date(prev.ended_at).getTime()
        : new Date(prev.started_at).getTime();
    const nextStart = new Date(sorted[i].started_at).getTime();
    const minutes = (nextStart - prevEnd) / (1000 * 60);

    if (minutes >= MIN_GAP_MINUTES && minutes <= MAX_GAP_MINUTES) {
      const indexFromEnd = sorted.length - 1 - i;
      let weight = WEIGHT_OLD;
      if (indexFromEnd < 3) weight = WEIGHT_RECENT;
      else if (indexFromEnd < 7) weight = WEIGHT_MID;

      intervals.push({
        minutes,
        earlierTimestamp: sorted[i - 1].started_at,
        laterTimestamp: sorted[i].started_at,
        weight,
      });
    }
  }

  if (intervals.length === 0) {
    const nextFeedTime = new Date(
      new Date(lastFeedTimestamp).getTime() +
        ageParams.defaultMinutes * 60 * 1000,
    ).toISOString();
    return {
      nextFeedTime,
      intervalMinutes: ageParams.defaultMinutes,
      confidence: "low",
      dominantType,
      intervalCount: 0,
      feedCountUsed: feedsForIntervals.length,
      lastFeedTimestamp,
    };
  }

  const totalWeight = intervals.reduce((s, i) => s + i.weight, 0);
  const weightedSum = intervals.reduce((s, i) => s + i.minutes * i.weight, 0);

  // Clamp to age-appropriate range
  const weightedAvgMinutes = Math.max(
    ageParams.minMinutes,
    Math.min(ageParams.maxMinutes, weightedSum / totalWeight),
  );

  const nextFeedTime = new Date(
    new Date(lastFeedTimestamp).getTime() + weightedAvgMinutes * 60 * 1000,
  ).toISOString();

  const confidence: "high" | "medium" | "low" =
    intervals.length >= MIN_INTERVALS_HIGH
      ? "high"
      : intervals.length >= MIN_INTERVALS_MEDIUM
        ? "medium"
        : "low";

  return {
    nextFeedTime,
    intervalMinutes: weightedAvgMinutes,
    confidence,
    dominantType,
    intervalCount: intervals.length,
    feedCountUsed: feedsForIntervals.length,
    lastFeedTimestamp,
  };
}
