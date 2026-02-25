import { useMemo, useState, useEffect, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { Baby, Log } from "../types";
import { computeNextFeedPrediction } from "./feed/computeNextFeedPrediction";
import {
  PREDICTION_REFRESH_INTERVAL_MS,
  COUNTDOWN_TICK_MS,
} from "./feed/nextFeedPrediction";
import type { PredictionResult } from "./feed/nextFeedPrediction";

export interface UseNextFeedPredictionResult extends PredictionResult {
  minutesUntilNext: number | null;
  countdownLabel: string | null;
  isDueNow: boolean;
}

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "";
  if (minutes < 60) return `in ${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `in ${h}h`;
  return `in ${h}h ${m}m`;
}

export function useNextFeedPrediction(
  feedLogs: Log[],
  baby?: Baby | null,
): UseNextFeedPredictionResult {
  const [now, setNow] = useState(() => Date.now());

  const recomputeNow = useCallback(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const id = setInterval(recomputeNow, PREDICTION_REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [recomputeNow]);

  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") recomputeNow();
      },
    );
    return () => sub.remove();
  }, [recomputeNow]);

  useEffect(() => {
    const id = setInterval(recomputeNow, COUNTDOWN_TICK_MS);
    return () => clearInterval(id);
  }, [recomputeNow]);

  const prediction = useMemo(
    () => computeNextFeedPrediction(feedLogs, baby),
    [feedLogs, baby],
  );

  return useMemo(() => {
    const base = { ...prediction };

    if (!prediction.nextFeedTime || !prediction.lastFeedTimestamp) {
      return {
        ...base,
        minutesUntilNext: null,
        countdownLabel: null,
        isDueNow: false,
      };
    }

    const nextMs = new Date(prediction.nextFeedTime).getTime();
    const minutesUntil = Math.round((nextMs - now) / (1000 * 60));
    const isDueNow = minutesUntil <= 0;

    return {
      ...base,
      minutesUntilNext: minutesUntil,
      countdownLabel: isDueNow ? null : formatCountdown(minutesUntil),
      isDueNow,
    };
  }, [prediction, now]);
}
