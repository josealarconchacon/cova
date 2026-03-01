import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "./supabase";
import { useStore } from "../store/useStore";
import { toLocalDateKey } from "./home/dateUtils";
import type { Log } from "../types";

export interface WeekSleepPoint {
  weekIndex: number;
  totalHours: number;
  napCount: number;
}

function isNapSession(log: Log): boolean {
  const h = new Date(log.started_at).getHours();
  return h >= 6 && h < 22;
}

export function useSleepSparklineData(): WeekSleepPoint[] {
  const { activeBaby } = useStore();

  const twentyEightDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d;
  }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ["sleep-sparkline", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .eq("type", "sleep")
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

    const points: WeekSleepPoint[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = new Date(weekStart);
      start.setDate(weekStart.getDate() - 7 * w);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startKey = toLocalDateKey(start);
      const endKey = toLocalDateKey(end);

      let totalHours = 0;
      let napCount = 0;
      for (const log of logs) {
        const logDate = toLocalDateKey(new Date(log.started_at));
        if (logDate >= startKey && logDate <= endKey) {
          totalHours += (log.duration_seconds ?? 0) / 3600;
          if (isNapSession(log)) napCount++;
        }
      }
      points.push({
        weekIndex: w,
        totalHours: Math.round(totalHours * 10) / 10,
        napCount,
      });
    }
    return points;
  }, [logs]);
}
