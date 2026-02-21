import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

interface Options {
  familyId: string;
  babyId: string;
  table: "logs" | "milestones";
  queryKey: unknown[];
}

export function useRealtimeSync({
  familyId,
  babyId,
  table,
  queryKey,
}: Options) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!familyId || !babyId) return;

    const channelName = `${table}-${babyId}-${familyId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table,
          filter: `family_id=eq.${familyId}`,
        },
        (payload) => {
          console.log(`[Realtime] ${table} ${payload.eventType}`);
          // Invalidate the query — TanStack Query refetches automatically
          queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${channelName} status:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, babyId, table]);
}
