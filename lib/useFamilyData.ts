import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Profile } from "../types";

export function useFamilyData(familyId: string | undefined) {
  const membersQuery = useQuery({
    queryKey: ["family-members", familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId!);
      if (error) throw error;
      return data as Profile[];
    },
  });

  const inviteQuery = useQuery({
    queryKey: ["family-invite", familyId],
    enabled: !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("families")
        .select("invite_code")
        .eq("id", familyId!)
        .single();
      if (error) throw error;
      return data?.invite_code ?? "";
    },
  });

  const members = membersQuery.data ?? [];
  const inviteCode = inviteQuery.data ?? "";
  const isLoading =
    !!familyId &&
    (membersQuery.isLoading || membersQuery.isFetching || inviteQuery.isLoading || inviteQuery.isFetching);
  const isError = membersQuery.isError || inviteQuery.isError;
  const refetch = () => {
    membersQuery.refetch();
    inviteQuery.refetch();
  };

  return { members, inviteCode, isLoading, isError, refetch };
}
