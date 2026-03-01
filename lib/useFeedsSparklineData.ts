import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "./supabase";
import { useStore } from "../store/useStore";
import { toLocalDateKey } from "./home/dateUtils";
import type { Log } from "../types";

/** Weekly totals for the last 4 weeks (oldest first). */
export interface WeekSparklinePoint {
  weekIndex: number;
  nursing: number;
  bottle: number;
  total: number;
}

export function useFeedsSparklineData(): WeekSparklinePoint[] {
  const { activeBaby } = useStore();

  const twentyEightDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d;
  }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ["feeds-sparkline", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .eq("type", "feed")
        .gte("started_at", twentyEightDaysAgo.toISOString())
        .order("started_at", { ascending: true });
      if (error) throw error;
      return data as Log[];
    },
  });

  return useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const points: WeekSparklinePoint[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = new Date(weekStart);
      start.setDate(weekStart.getDate() - 7 * w);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startKey = toLocalDateKey(start);
      const endKey = toLocalDateKey(end);

      let nursing = 0;
      let bottle = 0;
      for (const log of logs) {
        const logDate = toLocalDateKey(new Date(log.started_at));
        if (logDate >= startKey && logDate <= endKey) {
          const ft = (log.metadata?.feed_type as string) ?? "";
          if (ft === "bottle") bottle++;
          else nursing++;
        }
      }
      points.push({
        weekIndex: w,
        nursing,
        bottle,
        total: nursing + bottle,
      });
    }
    return points;
  }, [logs]);
}
