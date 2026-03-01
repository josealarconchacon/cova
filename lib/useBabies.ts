import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Baby } from "../types";

export function useBabies(familyId: string | undefined) {
  const query = useQuery({
    queryKey: ["babies", familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("babies")
        .select("*")
        .eq("family_id", familyId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Baby[];
    },
  });
  return {
    babies: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
