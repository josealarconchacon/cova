import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Milestone } from "../types";

export interface BabyStats {
  feed: number;
  sleep: number;
  diaper: number;
  milestone: number;
}

export function useBabyData(babyId: string | undefined) {
  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("baby_id", babyId!)
        .order("happened_at", { ascending: false });
      if (error) throw error;
      return data as Milestone[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["baby-stats", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("logs")
        .select("type")
        .eq("baby_id", babyId!);

      const counts: BabyStats = { feed: 0, sleep: 0, diaper: 0, milestone: 0 };
      data?.forEach((l) => {
        if (l.type in counts) counts[l.type as keyof BabyStats]++;
      });
      return counts;
    },
  });

  return { milestones, stats };
}
