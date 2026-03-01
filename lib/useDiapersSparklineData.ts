import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "./supabase";
import { useStore } from "../store/useStore";
import { toLocalDateKey } from "./home/dateUtils";
import type { Log } from "../types";

export interface WeekDiaperPoint {
  weekIndex: number;
  wetTotal: number;
  dirtyTotal: number;
  bothTotal: number;
  total: number;
}

function getDiaperType(log: Log): "wet" | "dirty" | "both" {
  const dt = (log.metadata?.diaper_type as string) ?? "";
  if (dt === "both") return "both";
  if (dt === "dirty") return "dirty";
  return "wet";
}

export function useDiapersSparklineData(): WeekDiaperPoint[] {
  const { activeBaby } = useStore();

  const twentyEightDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 28);
    return d;
  }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ["diapers-sparkline", activeBaby?.id],
    enabled: !!activeBaby,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .eq("baby_id", activeBaby!.id)
        .eq("type", "diaper")
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

    const points: WeekDiaperPoint[] = [];
    for (let w = 3; w >= 0; w--) {
      const start = new Date(weekStart);
      start.setDate(weekStart.getDate() - 7 * w);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const startKey = toLocalDateKey(start);
      const endKey = toLocalDateKey(end);

      let wetTotal = 0;
      let dirtyTotal = 0;
      let bothTotal = 0;
      for (const log of logs) {
        const logDate = toLocalDateKey(new Date(log.started_at));
        if (logDate >= startKey && logDate <= endKey) {
          const t = getDiaperType(log);
          if (t === "wet") wetTotal++;
          else if (t === "dirty") dirtyTotal++;
          else bothTotal++;
        }
      }
      points.push({
        weekIndex: w,
        wetTotal,
        dirtyTotal,
        bothTotal,
        total: wetTotal + dirtyTotal + bothTotal,
      });
    }
    return points;
  }, [logs]);
}
