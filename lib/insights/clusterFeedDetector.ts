import type { Log } from "../../types";

export interface ClusterEvent {
  date: string;
  startTime: string;
  endTime: string;
  feedCount: number;
  windowHours: number;
}

const WINDOW_MINUTES = 180; // 3 hours
const MIN_FEEDS_IN_WINDOW = 3;

function toLocalDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function detectClusterFeeding(feedLogs: Log[]): ClusterEvent[] {
  const sorted = feedLogs
    .filter((l) => l.type === "feed")
    .sort(
      (a, b) =>
        new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    );

  if (sorted.length < MIN_FEEDS_IN_WINDOW) return [];

  const clusters: Array<{ start: number; end: number; count: number }> = [];
  const timestamps = sorted.map((l) => new Date(l.started_at).getTime());

  for (let i = 0; i < timestamps.length; i++) {
    const windowStart = timestamps[i];
    const windowEnd = windowStart + WINDOW_MINUTES * 60 * 1000;
    let count = 0;
    for (const t of timestamps) {
      if (t >= windowStart && t <= windowEnd) count++;
    }
    if (count >= MIN_FEEDS_IN_WINDOW) {
      const lastInWindow = timestamps
        .filter((t) => t >= windowStart && t <= windowEnd)
        .pop()!;
      clusters.push({
        start: windowStart,
        end: lastInWindow,
        count,
      });
    }
  }

  if (clusters.length === 0) return [];

  // Merge overlapping windows
  clusters.sort((a, b) => a.start - b.start);
  const merged: typeof clusters = [];
  for (const c of clusters) {
    const last = merged[merged.length - 1];
    if (last && c.start <= last.end + 60000) {
      last.end = Math.max(last.end, c.end);
      last.count = Math.max(last.count, c.count);
    } else {
      merged.push({ ...c });
    }
  }

  return merged.map((c) => {
    const startIso = new Date(c.start).toISOString();
    const endIso = new Date(c.end).toISOString();
    const durationMs = c.end - c.start;
    const windowHours = Math.round((durationMs / (60 * 60 * 1000)) * 10) / 10;
    return {
      date: toLocalDateKey(startIso),
      startTime: formatTime(startIso),
      endTime: formatTime(endIso),
      feedCount: c.count,
      windowHours,
    };
  });
}
